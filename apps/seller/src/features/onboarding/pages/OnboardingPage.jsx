import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  VIETNAM_BANK_CATALOG,
} from '../../../services/seller-shop.api';
import { formatPhoneDisplay, isValidVietnamesePhone } from '../../../../../../shared/utils/phone';
import {
  ALL_PROVINCES,
  getWardsByProvince,
  findProvinceByCode,
  findWardByCode,
  findProvinceByName,
  findWardByName,
} from '../../../../../../shared/utils/location';

export default function OnboardingPage() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    description: '',
  });

  // Step 2: KYC Documents State
  const [kycDocs, setKycDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocType, setNewDocType] = useState('BUSINESS_REGISTRATION');

  // Kiểm tra 3 loại tài liệu bắt buộc theo yêu cầu sàn
  const hasBusinessReg = kycDocs.some((d) => d.document_type === 'BUSINESS_REGISTRATION');
  const hasIdFront = kycDocs.some((d) => d.document_type === 'CITIZEN_ID_FRONT' || d.document_type === 'CITIZEN_ID');
  const hasIdBack = kycDocs.some((d) => d.document_type === 'CITIZEN_ID_BACK');
  const kycCompleteCount = [hasBusinessReg, hasIdFront, hasIdBack].filter(Boolean).length;
  const isKycComplete = kycCompleteCount === 3;

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

  // Step 4: Bank State
  const [bankForm, setBankForm] = useState({
    bank_code: 'VCB',
    bank_name: 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank)',
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
      setProfileForm({
        name: shop.name || '',
        business_name: shop.business_name || '',
        tax_code: shop.tax_code || '',
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

        // Đồng bộ mã Tỉnh / Thành phố
        let pCode = ws.province_code || '';
        if (!pCode && ws.province) {
          const matchedP = findProvinceByName(ws.province);
          if (matchedP) pCode = matchedP.code;
        }
        setSelectedProvinceCode(pCode);

        // Nạp danh sách Phường / Xã tương ứng
        if (pCode) {
          const wList = getWardsByProvince(pCode);
          setWards(wList);

          let wCode = ws.ward_code || '';
          if (!wCode && ws.ward) {
            const matchedW = findWardByName(pCode, ws.ward);
            if (matchedW) wCode = matchedW.code;
          }
          setSelectedWardCode(wCode);
        }
      }

      if (shop.bank_summary) {
        setBankSummary(shop.bank_summary);
        setBankForm((prev) => ({
          ...prev,
          bank_code: shop.bank_summary.bank_code || 'VCB',
          bank_name: shop.bank_summary.bank_name || 'Vietcombank',
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
      await updateOnboardingProfile(profileForm);
      setStepStatuses((prev) => ({ ...prev, PROFILE: true }));
      notifySuccess('✓ Đã cập nhật hồ sơ gian hàng thành công!');
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

    setUploadingDoc(true);
    setErrorMessage('');
    try {
      // 1. Presign
      const presign = await presignKycDocument({
        document_type: newDocType,
        file_name: file.name,
        content_type: file.type || 'application/pdf',
        size_bytes: file.size,
        sha256: 'mock-sha256-hash-value-for-kyc-document',
      });

      // 2. Complete upload
      await completeKycDocument({
        document_id: presign.document_id,
        object_key: presign.object_key,
        size_bytes: file.size,
        content_type: file.type || 'application/pdf',
        sha256: 'mock-sha256-hash-value-for-kyc-document',
        document_type: newDocType,
        file_name: file.name,
      });

      // Refresh doc list
      const docs = await getKycDocuments();
      setKycDocs(docs);
      notifySuccess('✓ Tải lên tài liệu KYC thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi tải tài liệu lên.');
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
      notifySuccess('✓ Đã xóa tài liệu thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi xóa tài liệu.');
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Chuyển sang Bước 3 (Bắt buộc đủ 3 loại tài liệu)
  const handleContinueToWarehouse = () => {
    if (!isKycComplete) {
      const missing = [];
      if (!hasBusinessReg) missing.push('Giấy phép ĐKKD');
      if (!hasIdFront) missing.push('CCCD mặt trước');
      if (!hasIdBack) missing.push('CCCD mặt sau');
      setErrorMessage(`Vui lòng tải lên đầy đủ cả 3 tài liệu bắt buộc trước khi chuyển sang Bước 3. Còn thiếu: ${missing.join(', ')}.`);
      return;
    }
    setStepStatuses((prev) => ({ ...prev, KYC: true }));
    notifySuccess('✓ Đã xác nhận đầy đủ 3 tài liệu KYC!');
    setCurrentStep('WAREHOUSE');
  };

  // Step 3: Submit Warehouse
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client Validations cho Bước 3
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
      notifySuccess('✓ Đã cập nhật địa chỉ kho hàng thành công!');
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
      notifySuccess('✓ Đã liên kết tài khoản ngân hàng nhận tiền thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi liên kết ngân hàng.');
    } finally {
      setSaving(false);
    }
  };

  // Nộp toàn bộ hồ sơ Onboarding cho Admin thẩm định (§2.25)
  const handleSubmitKyc = async () => {
    // 1. Kiểm tra Step 1: Profile
    if (!profileForm.name || !profileForm.tax_code) {
      setErrorMessage('Thông tin gian hàng chưa đầy đủ. Vui lòng hoàn thiện Bước 1.');
      setCurrentStep('PROFILE');
      return;
    }
    // 2. Kiểm tra Step 2: KYC
    if (!isKycComplete) {
      setErrorMessage('Chưa hoàn tất tải lên đủ 3 tài liệu pháp lý (ĐKKD, CCCD mặt trước, CCCD mặt sau). Vui lòng kiểm tra Bước 2.');
      setCurrentStep('KYC');
      return;
    }
    // 3. Kiểm tra Step 3: Warehouse
    if (!warehouseForm.warehouse_name || !warehouseForm.contact_name || !warehouseForm.contact_phone || !warehouseForm.province || !warehouseForm.ward || !warehouseForm.line1) {
      setErrorMessage('Thông tin kho lấy hàng chưa đầy đủ. Vui lòng kiểm tra lại Bước 3.');
      setCurrentStep('WAREHOUSE');
      return;
    }
    // 4. Kiểm tra Step 4: Bank
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
      notifySuccess('✓ Toàn bộ hồ sơ gian hàng đã được gửi thành công tới Ban Quản Trị để thẩm định!');
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
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700 text-sm">✕</button>
        </div>
      )}

      {/* Stepper Header (4 Steps) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stepsList.map((step) => {
                const isCompleted = stepStatuses[step.key];
                const isActive = currentStep === step.key;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setCurrentStep(step.key)}
                    className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isActive
                        ? 'bg-indigo-50/70 border-[#4F46E5] shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-80'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-[#4F46E5] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{step.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cảnh báo khi bị từ chối hoặc cần bổ sung thông tin */}
          {(kycStatus === 'REJECTED' || kycStatus === 'NEEDS_INFO') && (
            <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
              kycStatus === 'NEEDS_INFO' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span className="text-2xl mt-0.5">{kycStatus === 'NEEDS_INFO' ? '⚠️' : '✕'}</span>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[14px]">
                    {kycStatus === 'NEEDS_INFO' ? 'Hồ sơ cần bổ sung thông tin theo yêu cầu của Ban Quản Trị' : 'Hồ sơ thẩm định chưa được phê duyệt (Đã giữ nguyên bản nháp)'}
                  </h3>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    kycStatus === 'NEEDS_INFO' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {kycStatus}
                  </span>
                </div>
                <p className="text-[12px] opacity-90 leading-relaxed">
                  Toàn bộ thông tin bạn đã nhập ở cả 4 bước vẫn được lưu trữ nguyên vẹn dưới dạng <strong>Bản nháp (Draft)</strong>. Vui lòng kiểm tra lý do bên dưới, chỉnh sửa các mục cần cập nhật và nhấn <strong>"Cập nhật & Gửi lại thẩm định"</strong> ở cuối trang.
                </p>
                {(rejectReason || blockers[0]) && (
                  <div className="mt-2 p-3 bg-white/90 rounded-xl border border-rose-200/80 text-[12px] font-medium text-slate-800">
                    <span className="font-bold text-rose-700 block mb-0.5">Lý do từ Ban Quản Trị:</span>
                    <span className="italic">"{rejectReason || blockers[0]}"</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blockers alert if any */}
          {blockers.length > 0 && kycStatus !== 'REJECTED' && kycStatus !== 'NEEDS_INFO' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-800 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-bold">Các mục cần bổ sung để hoàn tất xét duyệt:</p>
                <ul className="list-disc list-inside text-[12px] mt-1 space-y-0.5">
                  {blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* STEP CONTENT PANELS */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
            {/* STEP 1: PROFILE */}
            {currentStep === 'PROFILE' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 text-[13px] max-w-3xl">
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
                    BƯỚC 1: THÔNG TIN HỒ SƠ GIAN HÀNG
                  </h2>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Cập nhật tên thương hiệu, tên pháp lý doanh nghiệp và mã số thuế (PUT /seller/onboarding/profile).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tên gian hàng *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tên công ty / Hộ kinh doanh *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Mã số thuế doanh nghiệp * (10–14 chữ số)
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.tax_code}
                      onChange={(e) => setProfileForm({ ...profileForm, tax_code: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Mô tả gian hàng
                  </label>
                  <textarea
                    rows={4}
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu & Tiếp tục sang KYC →'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: KYC */}
            {currentStep === 'KYC' && (
              <div className="space-y-6 text-[13px] max-w-4xl">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
                      BƯỚC 2: HỒ SƠ PHÁP LÝ & ĐỊNH DANH (KYC)
                    </h2>
                    <span
                      className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                        kycStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : kycStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Trạng thái: {kycStatus}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Bắt buộc tải lên đầy đủ cả 3 loại giấy tờ pháp lý để đảm bảo điều kiện kinh doanh hợp lệ trên sàn Taca.
                  </p>
                </div>

                {/* 3 Mandatory Documents Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-xl border transition-all ${hasBusinessReg ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[12px] text-slate-800">1. Giấy phép ĐKKD</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasBusinessReg ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {hasBusinessReg ? '✓ ĐÃ TẢI' : 'CHƯA TẢI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Giấy ĐKKD hoặc Giấy chứng nhận hộ kinh doanh</p>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${hasIdFront ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[12px] text-slate-800">2. CCCD Mặt trước</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasIdFront ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {hasIdFront ? '✓ ĐÃ TẢI' : 'CHƯA TẢI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Ảnh chụp rõ mặt trước CCCD người đại diện</p>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${hasIdBack ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[12px] text-slate-800">3. CCCD Mặt sau</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasIdBack ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {hasIdBack ? '✓ ĐÃ TẢI' : 'CHƯA TẢI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Ảnh chụp rõ mặt sau có chip CCCD</p>
                  </div>
                </div>

                {/* Upload box */}
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-800 text-[14px]">Tải lên tài liệu mới</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Chọn loại tài liệu cần tải *
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="BUSINESS_REGISTRATION">1. Giấy chứng nhận ĐKKD / Đăng ký hộ kinh doanh</option>
                        <option value="CITIZEN_ID_FRONT">2. CCCD / Hộ chiếu đại diện (Mặt trước)</option>
                        <option value="CITIZEN_ID_BACK">3. CCCD / Hộ chiếu đại diện (Mặt sau)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Chọn tệp (PDF, PNG, JPG - Tối đa 10MB) *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={uploadingDoc}
                        onChange={handleUploadKycDoc}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#4F46E5] hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                  {uploadingDoc && (
                    <p className="text-xs text-[#4F46E5] font-semibold animate-pulse">
                      Đang mã hóa SHA256 và tải lên bộ nhớ an toàn...
                    </p>
                  )}
                </div>

                {/* Documents table with Delete action */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-[14px]">
                      Danh sách tài liệu đã tải ({kycDocs.length}/3 yêu cầu)
                    </h3>
                    <span className={`text-[12px] font-bold ${isKycComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isKycComplete ? '✓ Đã đủ 3 loại giấy tờ bắt buộc' : `Cần tải thêm ${3 - kycCompleteCount} loại giấy tờ`}
                    </span>
                  </div>

                  {kycDocs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Chưa có tài liệu nào. Vui lòng tải lên ĐKKD, CCCD mặt trước và CCCD mặt sau.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                      {kycDocs.map((doc) => {
                        const typeLabel =
                          doc.document_type === 'BUSINESS_REGISTRATION'
                            ? 'Giấy phép ĐKKD'
                            : doc.document_type === 'CITIZEN_ID_FRONT' || doc.document_type === 'CITIZEN_ID'
                            ? 'CCCD Mặt trước'
                            : doc.document_type === 'CITIZEN_ID_BACK'
                            ? 'CCCD Mặt sau'
                            : doc.document_type;

                        return (
                          <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">📄</span>
                              <div>
                                <p className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                                  <span>{doc.original_file_name || doc.file_name}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {typeLabel}
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {(doc.size_bytes ? doc.size_bytes / (1024 * 1024) : 1.5).toFixed(2)} MB · {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('vi-VN') : 'Mới tải'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {doc.status || 'VERIFIED'}
                              </span>
                              {/* Nút Xóa tài liệu nếu bấm nhầm */}
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDeleteKycDoc(doc.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                title="Xóa tài liệu nếu tải nhầm"
                              >
                                ✕ Xóa
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Navigation actions */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('PROFILE')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    ← Quay lại bước 1
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueToWarehouse}
                    className={`px-6 py-2.5 rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 ${
                      isKycComplete
                        ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Xác nhận 3 tài liệu & Tiếp tục sang Kho hàng ({kycCompleteCount}/3) →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: WAREHOUSE */}
            {currentStep === 'WAREHOUSE' && (
              <form onSubmit={handleSaveWarehouse} className="space-y-6 text-[13px] max-w-3xl">
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
                    BƯỚC 3: ĐỊA CHỈ KHO HÀNG & LẤY HÀNG
                  </h2>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Chọn địa chỉ lấy hàng chuẩn hóa để đối tác vận chuyển đến lấy kiện hàng (PUT /seller/onboarding/warehouse).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tên kho lấy hàng * (warehouse_name)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.warehouse_name}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouse_name: e.target.value })}
                      placeholder="VD: Kho Tổng Quận 1, Kho Hàng Thủ Đức..."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Người phụ trách kho * (contact_name)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.contact_name}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, contact_name: e.target.value })}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Hotline liên hệ lấy hàng * (contact_phone)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.contact_phone}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, contact_phone: e.target.value })}
                      placeholder="VD: 0901234567"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  {/* Dropdown Tỉnh / Thành phố */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tỉnh / Thành phố *
                    </label>
                    <select
                      value={selectedProvinceCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedProvinceCode(code);
                        setSelectedWardCode('');
                        const p = findProvinceByCode(code);
                        const wList = getWardsByProvince(code);
                        setWards(wList);
                        setWarehouseForm((prev) => ({
                          ...prev,
                          province: p ? p.name : '',
                          ward: '',
                          district: '',
                        }));
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    >
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
                      {ALL_PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Phường / Xã */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Phường / Xã *
                    </label>
                    <select
                      value={selectedWardCode}
                      onChange={(e) => {
                        const wCode = e.target.value;
                        setSelectedWardCode(wCode);
                        const w = findWardByCode(selectedProvinceCode, wCode);
                        setWarehouseForm((prev) => ({
                          ...prev,
                          ward: w ? w.name : '',
                          district: '',
                        }));
                      }}
                      disabled={!selectedProvinceCode}
                      required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5] disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">{selectedProvinceCode ? '-- Chọn Phường / Xã --' : 'Vui lòng chọn Tỉnh/Thành trước'}</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Địa chỉ cụ thể * (line1: Số nhà, tên đường, tòa nhà...)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.line1}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, line1: e.target.value })}
                      placeholder="VD: Số 28 Đường Nguyễn Huệ, Tòa nhà Bitexco..."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Preview địa chỉ kho hàng */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 flex items-start gap-2.5">
                  <span className="text-base text-[#4F46E5]">📍</span>
                  <div>
                    <span className="font-bold">Địa chỉ lấy hàng hoàn chỉnh: </span>
                    <span className="font-medium text-slate-900">
                      {warehouseForm.line1 ? `${warehouseForm.line1}, ` : ''}
                      {warehouseForm.ward ? `${warehouseForm.ward}, ` : ''}
                      {warehouseForm.province || 'Chưa hoàn tất chọn địa chỉ'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('KYC')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    ← Quay lại bước 2
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu địa chỉ kho & Sang bước Ngân hàng →'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: BANK */}
            {currentStep === 'BANK' && (
              <div className="space-y-8 max-w-3xl">
                <form onSubmit={handleSaveBank} className="space-y-6 text-[13px]">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
                      BƯỚC 4: TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT & RÚT TIỀN
                    </h2>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Hệ thống Taca chuyển doanh thu bán hàng định kỳ vào tài khoản này (PUT /seller/onboarding/bank).
                    </p>
                  </div>

                  {bankSummary && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tài khoản hiện tại</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-1">
                          {bankSummary.bank_name}
                        </p>
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          {bankSummary.account_name} · {bankSummary.account_number_masked}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-lg">
                        ✓ Đã xác thực
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                        Ngân hàng thụ hưởng * (bank_code / bank_name)
                      </label>
                      <select
                        value={bankForm.bank_code}
                        onChange={(e) => {
                          const b = VIETNAM_BANK_CATALOG.find((x) => x.code === e.target.value);
                          setBankForm({
                            ...bankForm,
                            bank_code: e.target.value,
                            bank_name: b ? b.name : '',
                          });
                        }}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                      >
                        {VIETNAM_BANK_CATALOG.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                        Số tài khoản ngân hàng * (account_number: 8–20 số)
                      </label>
                      <input
                        type="text"
                        required
                        value={bankForm.account_number}
                        onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '') })}
                        placeholder="VD: 1012345678"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                        Tên chủ tài khoản * (account_name: VIẾT HOA KHÔNG DẤU)
                      </label>
                      <input
                        type="text"
                        required
                        value={bankForm.account_name}
                        onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value.toUpperCase() })}
                        placeholder="VD: NGUYEN MINH ANH"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('WAREHOUSE')}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      ← Quay lại bước 3
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thông tin ngân hàng'}
                    </button>
                  </div>
                </form>

                {/* KHỐI TỔNG KẾT & NỘP XÉT DUYỆT ADMIN CHÍNH THỨC */}
                <div className="p-6 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h3 className="text-[15px] font-extrabold text-slate-900 uppercase tracking-tight">
                        TỔNG KẾT HỒ SƠ & GỬI THẨM ĐỊNH (FINAL SUBMISSION)
                      </h3>
                      <p className="text-[12px] text-slate-600">
                        Kiểm tra lại toàn bộ 4 bước trước khi gửi hồ sơ cho Ban Quản Trị xét duyệt.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                    <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">1. Hồ sơ gian hàng</span>
                      <p className="font-bold text-slate-900">{profileForm.name || '---'}</p>
                      <p className="text-slate-500">MST: {profileForm.tax_code || '---'}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">2. Giấy tờ KYC</span>
                      <p className={`font-bold ${isKycComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isKycComplete ? '✓ Đủ 3/3 tài liệu bắt buộc' : `⚠️ Còn thiếu (${kycCompleteCount}/3)`}
                      </p>
                      <p className="text-slate-500">ĐKKD, CCCD mặt trước & mặt sau</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">3. Kho lấy hàng</span>
                      <p className="font-bold text-slate-900">{warehouseForm.warehouse_name || 'Chưa lưu kho'}</p>
                      <p className="text-slate-500 truncate">{warehouseForm.province ? `${warehouseForm.ward}, ${warehouseForm.province}` : '---'}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">4. Tài khoản ngân hàng</span>
                      <p className="font-bold text-slate-900">{bankSummary ? bankSummary.bank_name : (bankForm.account_number ? bankForm.bank_name : 'Chưa lưu ngân hàng')}</p>
                      <p className="text-slate-500 font-mono">{bankSummary ? bankSummary.account_number_masked : (bankForm.account_number ? `STK: ${bankForm.account_number}` : '---')}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 italic">
                      * Sau khi bấm gửi, hồ sơ sẽ chuyển sang hàng đợi Admin để thẩm định.
                    </span>

                    <button
                      type="button"
                      disabled={saving || kycStatus === 'PENDING'}
                      onClick={handleSubmitKyc}
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 ${
                        kycStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                          : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-indigo-500/20'
                      }`}
                    >
                      {kycStatus === 'PENDING' ? (
                        <span>⏳ Đang chờ Admin phê duyệt</span>
                      ) : saving ? (
                        <span>Đang gửi hồ sơ...</span>
                      ) : kycStatus === 'REJECTED' || kycStatus === 'NEEDS_INFO' ? (
                        <span>CẬP NHẬT & GỬI LẠI HỒ SƠ THẨM ĐỊNH (POST /submit) →</span>
                      ) : (
                        <span>GỬI TOÀN BỘ HỒ SƠ THẨM ĐỊNH (POST /submit) →</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
