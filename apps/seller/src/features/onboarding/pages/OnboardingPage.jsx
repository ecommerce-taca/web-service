import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, PartyPopper, AlertTriangle, ClipboardList, FileText } from 'lucide-react';
import SellerPolicyModal from '../../../components/common/SellerPolicyModal';
import {
  getOnboardingProgress,
  updateOnboardingProfile,
  updateOnboardingWarehouse,
  presignKycDocument,
  completeKycDocument,
  deleteKycDocument,
  submitKyc,
  getKycDocuments,
  updateOnboardingBank,
  getShopProfile,
  calculateFileSha256,
  VIETNAM_BANK_CATALOG,
} from '../../../services/seller-shop.api';
import { formatPhoneDisplay, isValidVietnamesePhone } from '../../../../../../shared/utils/phone';

// Subcomponents
import OnboardingStepper from '../components/OnboardingStepper';
import OnboardingAlerts from '../components/OnboardingAlerts';

// Lazy-loaded step components to optimize chunk size and isolate address data
const ProfileStep = lazy(() => import('../components/steps/ProfileStep'));
const KycStep = lazy(() => import('../components/steps/KycStep'));
const WarehouseStep = lazy(() => import('../components/steps/WarehouseStep'));
const BankStep = lazy(() => import('../components/steps/BankStep'));
import { useSellerRealtimeStatus } from '../../../hooks/useSellerRealtimeStatus';

export default function OnboardingPage() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  // Hook WebSocket / SSE Realtime Status (AUD-04)
  const { notification: realtimeNotification, dismissNotification } = useSellerRealtimeStatus();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Onboarding metadata
  const [currentStep, setCurrentStep] = useState('PROFILE'); // 'PROFILE' | 'KYC' | 'WAREHOUSE' | 'BANK'
  const [stepStatuses, setStepStatuses] = useState({
    PROFILE: true,
    KYC: true,
    WAREHOUSE: true,
    BANK: true,
  });
  const [kycStatus, setKycStatus] = useState('APPROVED'); // 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [shopStatus, setShopStatus] = useState('ACTIVE');
  const [blockers, setBlockers] = useState([]);
  const [rejectReason, setRejectReason] = useState('');

  // Step 1: Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    business_name: '',
    tax_code: '',
    tax_code_masked: '',
    description: '',
  });

  // Step 2: KYC Documents State (Chỉ hỗ trợ BUSINESS_REGISTRATION theo Backend §2.23-§2.25)
  const [kycDocs, setKycDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const newDocType = 'BUSINESS_REGISTRATION';

  // Kiểm tra tài liệu KYC theo đặc tả docs/api/auth-user.md §2.25 & Backend user-auth-service
  const hasBusinessReg = kycDocs.some((d) => d.document_type === 'BUSINESS_REGISTRATION');
  const isKycComplete = hasBusinessReg;

  // Step 3: Warehouse State
  const [warehouseForm, setWarehouseForm] = useState({
    warehouse_name: '',
    contact_name: '',
    contact_phone: '',
    line1: '',
    line2: '',
    ward: '',
    district: '',
    province: '',
    postal_code: '700000',
    carrier_preferences: ['GHTK', 'GHN', 'SPX'],
    cod_enabled: true,
  });
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [wards, setWards] = useState([]);

  // Step 4: Bank State (Mặc định NCB - Chuẩn kiểm thử VNPAY Sandbox)
  const [bankForm, setBankForm] = useState({
    bank_code: 'NCB',
    bank_name: 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)',
    account_name: '',
    account_number: '',
    confirm_account_name: true,
  });
  const [bankSummary, setBankSummary] = useState(null);

  const applyData = (progress, shop, docs) => {
    if (progress) {
      setKycStatus(progress.kyc_status || 'DRAFT');
      setShopStatus(progress.shop_status || 'DRAFT');
      setBlockers(progress.blockers || []);
      if (progress.reject_reason) setRejectReason(progress.reject_reason);

      const map = {};
      (progress.steps || []).forEach((s) => {
        map[s.key] = s.completed;
      });
      setStepStatuses((prev) => ({ ...prev, ...map }));

      if (progress.current_step && progress.current_step !== 'COMPLETED') {
        setCurrentStep(progress.current_step);
      }
    }

    if (shop) {
      if (shop.reject_reason) setRejectReason(shop.reject_reason);
      const userRaw = localStorage.getItem('taca_user');
      let userId = null;
      try {
        userId = userRaw ? JSON.parse(userRaw)?.id : null;
      } catch {
        // ignore
      }

      const cachedTax = (userId && localStorage.getItem(`taca_seller_tax_code_${userId}`)) ||
                        localStorage.getItem('taca_seller_tax_code') || '';
      const resolvedTaxCode = shop.tax_code || cachedTax || '';
      const resolvedTaxMasked = shop.tax_code_masked || (resolvedTaxCode ? `${resolvedTaxCode.slice(0, 3)}*****${resolvedTaxCode.slice(-2)}` : '');

      setProfileForm({
        name: shop.name || '',
        business_name: shop.business_name || '',
        tax_code: resolvedTaxCode,
        tax_code_masked: resolvedTaxMasked,
        description: shop.description || '',
      });

      if (shop.warehouse_summary) {
        const ws = shop.warehouse_summary;
        setWarehouseForm({
          warehouse_name: ws.warehouse_name || '',
          contact_name: ws.contact_name || '',
          contact_phone: formatPhoneDisplay(ws.contact_phone || ''),
          line1: ws.line1 || '',
          line2: ws.line2 || '',
          ward: ws.ward || '',
          district: ws.district || '',
          province: ws.province || '',
          postal_code: ws.postal_code || '700000',
          carrier_preferences: ws.carrier_preferences || ['GHTK', 'GHN', 'SPX'],
          cod_enabled: ws.cod_enabled !== false,
        });

        // Đồng bộ mã Tỉnh / Phường (nếu backend trả về trực tiếp; WarehouseStep sẽ tự động phân giải nếu chỉ có tên)
        setSelectedProvinceCode(ws.province_code || '');
        setSelectedWardCode(ws.ward_code || '');
      }

      if (shop.bank_summary) {
        setBankSummary(shop.bank_summary);
        setBankForm((prev) => ({
          ...prev,
          bank_code: shop.bank_summary.bank_code || 'NCB',
          bank_name: shop.bank_summary.bank_name || 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)',
          account_name: shop.bank_summary.account_name || '',
        }));
      }
    }

    if (docs) {
      setKycDocs(docs);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadAll = () => {
      Promise.all([
        getOnboardingProgress(),
        getShopProfile(),
        getKycDocuments(),
      ])
        .then(([progress, shop, docs]) => {
          if (!ignore) {
            applyData(progress, shop, docs);
          }
        })
        .catch((err) => {
          if (!ignore) {
            console.error('Lỗi nạp dữ liệu onboarding:', err);
            setErrorMessage(err?.response?.data?.error?.message || 'Không thể tải tiến độ onboarding. Vui lòng thử lại.');
          }
        })
        .finally(() => {
          if (!ignore) {
            setLoading(false);
          }
        });
    };

    loadAll();

    const handleKycUpdated = () => {
      loadAll();
    };

    window.addEventListener('taca:kyc_updated', handleKycUpdated);
    window.addEventListener('storage', handleKycUpdated);
    window.addEventListener('auth:logout', handleKycUpdated);
    window.addEventListener('auth:login', handleKycUpdated);

    return () => {
      ignore = true;
      window.removeEventListener('taca:kyc_updated', handleKycUpdated);
      window.removeEventListener('storage', handleKycUpdated);
      window.removeEventListener('auth:logout', handleKycUpdated);
      window.removeEventListener('auth:login', handleKycUpdated);
    };
  }, []);

  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Step 1: Submit Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const cleanTax = String(profileForm.tax_code || '').replace(/\D/g, '');
      const userRaw = localStorage.getItem('taca_user');
      let userId = null;
      try {
        userId = userRaw ? JSON.parse(userRaw)?.id : null;
      } catch {
        // ignore
      }

      if (cleanTax && cleanTax.length >= 10 && cleanTax.length <= 14) {
        if (userId) localStorage.setItem(`taca_seller_tax_code_${userId}`, cleanTax);
        localStorage.setItem('taca_seller_tax_code', cleanTax);
      }

      await updateOnboardingProfile({
        name: profileForm.name,
        business_name: profileForm.business_name,
        tax_code: cleanTax || profileForm.tax_code,
        description: profileForm.description,
      });
      setStepStatuses((prev) => ({ ...prev, PROFILE: true }));
      notifySuccess('Đã cập nhật hồ sơ gian hàng thành công!');
      setCurrentStep('KYC');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Upload KYC doc simulation with presign & complete
  const handleUploadKycDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Tệp vượt quá kích thước cho phép (tối đa 10MB). Vui lòng chọn tệp khác.');
      e.target.value = '';
      return;
    }

    setUploadingDoc(true);
    setErrorMessage('');
    try {
      const sha256 = await calculateFileSha256(file);

      const presign = await presignKycDocument({
        document_type: newDocType,
        file_name: file.name,
        filename: file.name,
        content_type: file.type || 'application/pdf',
        size_bytes: file.size,
        sha256,
      });

      if (presign?.upload_url && !presign.upload_url.includes('storage.example')) {
        try {
          const uploadHeaders = {
            'Content-Type': file.type || 'application/pdf',
            ...(presign.required_headers || {}),
          };
          const s3Res = await fetch(presign.upload_url, {
            method: 'PUT',
            body: file,
            headers: uploadHeaders,
          });
          if (!s3Res.ok && s3Res.status !== 0) {
            console.warn('Cảnh báo tải file lên S3:', s3Res.status, s3Res.statusText);
          }
        } catch (s3Err) {
          console.warn('Lỗi khi PUT file lên S3 presigned URL:', s3Err);
        }
      }

      await completeKycDocument({
        document_id: presign.document_id,
        object_key: presign.object_key || presign.s3_key,
        s3_key: presign.object_key || presign.s3_key,
        size_bytes: file.size,
        content_type: file.type || 'application/pdf',
        sha256,
        document_type: newDocType,
        file_name: file.name,
        filename: file.name,
      });

      const docs = await getKycDocuments();
      setKycDocs(docs);
      notifySuccess('Tải lên tài liệu KYC thành công!');
    } catch (err) {
      console.error('Lỗi upload KYC:', err);
      const serverMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        (typeof err?.response?.data?.error === 'string' ? err.response.data.error : null) ||
        err?.message ||
        'Lỗi khi tải tài liệu lên.';
      setErrorMessage(serverMsg);
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  // Step 2: Xóa tài liệu đã tải lên
  const handleDeleteKycDoc = async (docId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này để tải lại file mới?')) return;
    setSaving(true);
    setErrorMessage('');
    try {
      await deleteKycDocument(docId);
      const docs = await getKycDocuments();
      setKycDocs(docs);
      notifySuccess('Đã xóa tài liệu thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi xóa tài liệu.');
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Chuyển sang Bước 3
  const handleContinueToWarehouse = () => {
    if (!isKycComplete) {
      setErrorMessage('Vui lòng tải lên Giấy chứng nhận ĐKKD / Hộ kinh doanh trước khi chuyển sang Bước 3.');
      return;
    }
    setStepStatuses((prev) => ({ ...prev, KYC: true }));
    notifySuccess('Đã xác nhận tài liệu KYC hợp lệ!');
    setCurrentStep('WAREHOUSE');
  };

  // Step 3: Submit Warehouse
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!warehouseForm.warehouse_name || warehouseForm.warehouse_name.trim().length < 2) {
      setErrorMessage('Vui lòng nhập Tên kho lấy hàng (tối thiểu 2 ký tự).');
      return;
    }
    if (!warehouseForm.contact_name || warehouseForm.contact_name.trim().length < 2) {
      setErrorMessage('Vui lòng nhập Tên người phụ trách kho.');
      return;
    }
    if (!warehouseForm.contact_phone || !isValidVietnamesePhone(warehouseForm.contact_phone)) {
      setErrorMessage('Số điện thoại liên hệ kho không hợp lệ. Vui lòng nhập 10 chữ số (VD: 0901234567 hoặc +84...).');
      return;
    }
    if (!warehouseForm.province) {
      setErrorMessage('Vui lòng chọn Tỉnh / Thành phố cho kho lấy hàng.');
      return;
    }
    if (!warehouseForm.ward) {
      setErrorMessage('Vui lòng chọn Phường / Xã cho kho lấy hàng.');
      return;
    }
    if (!warehouseForm.line1 || warehouseForm.line1.trim().length < 4) {
      setErrorMessage('Vui lòng nhập Địa chỉ chi tiết cụ thể (số nhà, tên đường, tòa nhà...).');
      return;
    }

    setSaving(true);
    try {
      await updateOnboardingWarehouse({
        warehouse_name: warehouseForm.warehouse_name.trim(),
        contact_name: warehouseForm.contact_name.trim(),
        contact_phone: warehouseForm.contact_phone.trim(),
        address: {
          line1: warehouseForm.line1.trim(),
          line2: warehouseForm.line2?.trim() || '',
          ward: warehouseForm.ward,
          district: warehouseForm.district || '',
          province: warehouseForm.province,
          postal_code: warehouseForm.postal_code || '700000',
        },
        carrier_preferences: warehouseForm.carrier_preferences,
        cod_enabled: warehouseForm.cod_enabled,
      });
      setStepStatuses((prev) => ({ ...prev, WAREHOUSE: true }));
      notifySuccess('Đã cập nhật địa chỉ kho hàng thành công!');
      setCurrentStep('BANK');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || err?.message || 'Lỗi khi lưu kho hàng.');
    } finally {
      setSaving(false);
    }
  };

  // Step 4: Submit Bank
  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankForm.account_number || !bankForm.account_name) {
      setErrorMessage('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản.');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      const selectedBank = VIETNAM_BANK_CATALOG.find((b) => b.code === bankForm.bank_code);
      const res = await updateOnboardingBank({
        bank_code: bankForm.bank_code,
        bank_name: selectedBank ? selectedBank.name : bankForm.bank_name,
        account_name: bankForm.account_name,
        account_number: bankForm.account_number,
        confirm_account_name: true,
      });
      setStepStatuses((prev) => ({ ...prev, BANK: true }));
      setBankSummary({
        bank_code: bankForm.bank_code,
        bank_name: selectedBank ? selectedBank.name : bankForm.bank_name,
        account_name: bankForm.account_name.toUpperCase(),
        account_number_masked: res.account_number_masked,
        verified: true,
      });
      notifySuccess('Đã liên kết tài khoản ngân hàng nhận tiền thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi liên kết ngân hàng.');
    } finally {
      setSaving(false);
    }
  };

  // Nộp toàn bộ hồ sơ Onboarding cho Admin thẩm định (§2.25)
  const handleSubmitKyc = async () => {
    if (!profileForm.name || !profileForm.tax_code) {
      setErrorMessage('Thông tin gian hàng chưa đầy đủ. Vui lòng hoàn thiện Bước 1.');
      setCurrentStep('PROFILE');
      return;
    }
    if (!isKycComplete) {
      setErrorMessage('Chưa có tài liệu pháp lý hợp lệ. Vui lòng tải lên Giấy chứng nhận ĐKKD ở Bước 2.');
      setCurrentStep('KYC');
      return;
    }
    if (!warehouseForm.warehouse_name || !warehouseForm.contact_name || !warehouseForm.contact_phone || !warehouseForm.province || !warehouseForm.ward || !warehouseForm.line1) {
      setErrorMessage('Thông tin kho lấy hàng chưa đầy đủ. Vui lòng kiểm tra lại Bước 3.');
      setCurrentStep('WAREHOUSE');
      return;
    }
    if (!bankForm.account_number || !bankForm.account_name) {
      setErrorMessage('Tài khoản ngân hàng chưa được hoàn tất. Vui lòng kiểm tra Bước 4.');
      setCurrentStep('BANK');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      await submitKyc();
      setKycStatus('PENDING');
      setStepStatuses({ PROFILE: true, KYC: true, WAREHOUSE: true, BANK: true });
      notifySuccess('Toàn bộ hồ sơ gian hàng đã được gửi thành công tới Ban Quản Trị để thẩm định!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi nộp hồ sơ thẩm định.');
    } finally {
      setSaving(false);
    }
  };

  const stepsList = [
    { key: 'PROFILE', number: 1, label: 'Hồ sơ gian hàng', desc: 'Tên, mã số thuế & mô tả' },
    { key: 'KYC', number: 2, label: 'Định danh KYC', desc: 'Giấy tờ pháp lý & ĐKKD' },
    { key: 'WAREHOUSE', number: 3, label: 'Kho & Vận chuyển', desc: 'Địa chỉ lấy hàng & ĐVVC' },
    { key: 'BANK', number: 4, label: 'Tài khoản nhận tiền', desc: 'Ngân hàng đối soát' },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-[13px] font-semibold text-slate-500">Đang tải thông tin Onboarding...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Realtime Notification Banner (AUD-04) */}
      {realtimeNotification && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-4 animate-in slide-in-from-top duration-300 shadow-sm ${
            realtimeNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : realtimeNotification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 shrink-0">
              {realtimeNotification.type === 'success' ? (
                <PartyPopper className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              ) : realtimeNotification.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" aria-hidden="true" />
              ) : (
                <ClipboardList className="w-5 h-5 text-amber-600" aria-hidden="true" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-[14px] m-0">{realtimeNotification.title}</h4>
              <p className="text-[13px] mt-0.5 opacity-90">{realtimeNotification.message}</p>
            </div>
          </div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              SELLER ONBOARDING
            </span>
            <span
              className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                kycStatus === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : kycStatus === 'PENDING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              KYC: {kycStatus === 'APPROVED' ? 'ĐÃ DUYỆT' : kycStatus === 'PENDING' ? 'CHỜ DUYỆT' : 'CHƯA NỘP'}
            </span>
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              TRẠNG THÁI: {shopStatus}
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Thiết lập gian hàng & Định danh người bán
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Hoàn thiện 4 bước theo tiêu chuẩn Sàn thương mại điện tử Taca để bắt đầu kinh doanh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {successMessage && (
            <span className="text-[12px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {successMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsPolicyOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 rounded-lg font-semibold text-[13px] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Quy chế người bán</span>
          </button>
          <Link
            to={`${basePath}/`}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-[13px] transition-colors shadow-2xs"
          >
            Về Dashboard
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} aria-label="Đóng lỗi" className="text-rose-500 hover:text-rose-700 p-1">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Stepper Header (4 Steps) */}
      <OnboardingStepper
        stepsList={stepsList}
        stepStatuses={stepStatuses}
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
      />

      {/* Cảnh báo khi bị từ chối hoặc cần bổ sung thông tin */}
      <OnboardingAlerts
        kycStatus={kycStatus}
        rejectReason={rejectReason}
        blockers={blockers}
      />

      {/* STEP CONTENT PANELS */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <Suspense fallback={<div className="py-12 text-center text-slate-400 text-sm">Đang tải biểu mẫu...</div>}>
          {currentStep === 'PROFILE' && (
            <ProfileStep
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onSaveProfile={handleSaveProfile}
              saving={saving}
            />
          )}

          {currentStep === 'KYC' && (
            <KycStep
              kycStatus={kycStatus}
              kycDocs={kycDocs}
              uploadingDoc={uploadingDoc}
              saving={saving}
              hasBusinessReg={hasBusinessReg}
              isKycComplete={isKycComplete}
              onUploadKycDoc={handleUploadKycDoc}
              onDeleteKycDoc={handleDeleteKycDoc}
              onBackToProfile={() => setCurrentStep('PROFILE')}
              onContinueToWarehouse={handleContinueToWarehouse}
            />
          )}

          {currentStep === 'WAREHOUSE' && (
            <WarehouseStep
              warehouseForm={warehouseForm}
              setWarehouseForm={setWarehouseForm}
              selectedProvinceCode={selectedProvinceCode}
              setSelectedProvinceCode={setSelectedProvinceCode}
              selectedWardCode={selectedWardCode}
              setSelectedWardCode={setSelectedWardCode}
              wards={wards}
              setWards={setWards}
              saving={saving}
              onSaveWarehouse={handleSaveWarehouse}
              onBackToKyc={() => setCurrentStep('KYC')}
            />
          )}

          {currentStep === 'BANK' && (
            <BankStep
              bankForm={bankForm}
              setBankForm={setBankForm}
              bankSummary={bankSummary}
              saving={saving}
              kycStatus={kycStatus}
              profileForm={profileForm}
              isKycComplete={isKycComplete}
              warehouseForm={warehouseForm}
              onSaveBank={handleSaveBank}
              onBackToWarehouse={() => setCurrentStep('WAREHOUSE')}
              onSubmitKyc={handleSubmitKyc}
            />
          )}
        </Suspense>
      </div>

      {/* Modal Toàn văn Quy chế hoạt động Người Bán */}
      <SellerPolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />
    </div>
  );
}
