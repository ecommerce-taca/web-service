import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getOnboardingProgress,
  updateOnboardingProfile,
  updateOnboardingWarehouse,
  presignKycDocument,
  completeKycDocument,
  submitKyc,
  getKycDocuments,
  updateOnboardingBank,
  getShopProfile,
  registerSeller,
  VIETNAM_BANK_CATALOG,
} from '../../../services/seller-shop.api';
import { formatPhoneDisplay } from '../../../../../../shared/utils/phone';

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

  // Step 4: Bank State
  const [bankForm, setBankForm] = useState({
    bank_code: 'VCB',
    bank_name: 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank)',
    account_name: '',
    account_number: '',
    confirm_account_name: true,
  });
  const [bankSummary, setBankSummary] = useState(null);

  // New Shop Registration (cho trường hợp đăng ký shop mới)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    business_name: '',
    tax_code: '',
    slug: '',
    description: '',
  });

  const applyData = (progress, shop, docs) => {
    if (progress) {
      setKycStatus(progress.kyc_status || 'DRAFT');
      setShopStatus(progress.shop_status || 'DRAFT');
      setBlockers(progress.blockers || []);

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
      setProfileForm({
        name: shop.name || '',
        business_name: shop.business_name || '',
        tax_code: shop.tax_code || '',
        description: shop.description || '',
      });

      if (shop.warehouse_summary) {
        setWarehouseForm({
          warehouse_name: shop.warehouse_summary.warehouse_name || '',
          contact_name: shop.warehouse_summary.contact_name || '',
          contact_phone: formatPhoneDisplay(shop.warehouse_summary.contact_phone || ''),
          line1: shop.warehouse_summary.line1 || '',
          line2: shop.warehouse_summary.line2 || '',
          ward: shop.warehouse_summary.ward || '',
          district: shop.warehouse_summary.district || '',
          province: shop.warehouse_summary.province || '',
          postal_code: shop.warehouse_summary.postal_code || '700000',
          carrier_preferences: shop.warehouse_summary.carrier_preferences || ['GHTK', 'GHN', 'SPX'],
          cod_enabled: shop.warehouse_summary.cod_enabled !== false,
        });
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

    return () => {
      ignore = true;
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

  // Step 2: Submit KYC
  const handleSubmitKyc = async () => {
    if (kycDocs.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất một tài liệu pháp lý trước khi nộp xét duyệt.');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      await submitKyc();
      setKycStatus('PENDING');
      setStepStatuses((prev) => ({ ...prev, KYC: true }));
      notifySuccess('✓ Đã nộp hồ sơ KYC thành công! Hồ sơ đang chờ BQT phê duyệt.');
      setCurrentStep('WAREHOUSE');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi nộp xét duyệt KYC.');
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Submit Warehouse
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await updateOnboardingWarehouse({
        warehouse_name: warehouseForm.warehouse_name,
        contact_name: warehouseForm.contact_name,
        contact_phone: warehouseForm.contact_phone,
        address: {
          line1: warehouseForm.line1,
          line2: warehouseForm.line2,
          ward: warehouseForm.ward,
          district: warehouseForm.district,
          province: warehouseForm.province,
          postal_code: warehouseForm.postal_code,
        },
        carrier_preferences: warehouseForm.carrier_preferences,
        cod_enabled: warehouseForm.cod_enabled,
      });
      setStepStatuses((prev) => ({ ...prev, WAREHOUSE: true }));
      notifySuccess('✓ Đã cập nhật địa chỉ kho hàng thành công!');
      setCurrentStep('BANK');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi lưu kho hàng.');
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

  // Register New Seller
  const handleRegisterNewSeller = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await registerSeller(registerForm);
      notifySuccess('✓ Khởi tạo gian hàng thành công! Vui lòng hoàn tất 4 bước thông tin.');
      setIsRegisterMode(false);
      const [p, s, d] = await Promise.all([
        getOnboardingProgress(),
        getShopProfile(),
        getKycDocuments(),
      ]);
      applyData(p, s, d);
      setCurrentStep('PROFILE');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi tạo gian hàng.');
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
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-[13px] transition-colors shadow-2xs"
          >
            {isRegisterMode ? 'Quay lại các bước' : '+ Khởi tạo gian hàng mới'}
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
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700 text-sm">✕</button>
        </div>
      )}

      {/* Modal / Form Khởi tạo gian hàng mới */}
      {isRegisterMode ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto">
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">Đăng ký gian hàng mới (POST /users/register-seller)</h2>
          <p className="text-[13px] text-slate-500 mb-6">
            Bắt đầu mở gian hàng kinh doanh trên hệ thống Taca. Sau khi tạo, bạn sẽ tiếp tục hoàn thiện hồ sơ KYC.
          </p>

          <form onSubmit={handleRegisterNewSeller} className="space-y-5 text-[13px]">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tên cửa hàng * (name)
              </label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="VD: Taca Official Store"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tên doanh nghiệp / Hộ kinh doanh * (business_name)
              </label>
              <input
                type="text"
                required
                value={registerForm.business_name}
                onChange={(e) => setRegisterForm({ ...registerForm, business_name: e.target.value })}
                placeholder="VD: Công ty TNHH Bán lẻ Taca Việt Nam"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mã số thuế doanh nghiệp * (tax_code: 10–14 số)
              </label>
              <input
                type="text"
                required
                value={registerForm.tax_code}
                onChange={(e) => setRegisterForm({ ...registerForm, tax_code: e.target.value })}
                placeholder="VD: 0312345678"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Đường dẫn slug (tùy chọn)
              </label>
              <input
                type="text"
                value={registerForm.slug}
                onChange={(e) => setRegisterForm({ ...registerForm, slug: e.target.value })}
                placeholder="VD: taca-official-store"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Giới thiệu gian hàng
              </label>
              <textarea
                rows={3}
                value={registerForm.description}
                onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                placeholder="Mô tả ngành hàng, điểm mạnh kinh doanh..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang khởi tạo...' : 'Tạo gian hàng'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
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

          {/* Blockers alert if any */}
          {blockers.length > 0 && (
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
                    Upload tài liệu thông qua cơ chế Presigned URL S3 (POST /seller/onboarding/kyc/documents/presign & complete).
                  </p>
                </div>

                {/* Upload box */}
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-800 text-[14px]">Tải lên tài liệu mới</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Loại tài liệu
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        <option value="BUSINESS_REGISTRATION">Giấy chứng nhận đăng ký kinh doanh (ĐKKD)</option>
                        <option value="CITIZEN_ID">Căn cước công dân (CCCD) / Hộ chiếu đại diện</option>
                        <option value="TAX_CERTIFICATE">Chứng nhận đăng ký thuế</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Chọn file (PDF, PNG, JPG - Tối đa 10MB)
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

                {/* Documents table */}
                <div>
                  <h3 className="font-bold text-slate-800 text-[14px] mb-3">Tài liệu đã nộp ({kycDocs.length})</h3>
                  {kycDocs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Chưa có tài liệu nào. Vui lòng tải lên ĐKKD hoặc CCCD để tiến hành xét duyệt.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                      {kycDocs.map((doc) => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                              <p className="font-bold text-slate-800 text-[13px]">{doc.original_file_name}</p>
                              <p className="text-[11px] text-slate-400">
                                {doc.document_type} · {(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {doc.status || 'VERIFIED'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('PROFILE')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    ← Quay lại bước 1
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('WAREHOUSE')}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                    >
                      Bỏ qua sang bước 3 →
                    </button>
                    <button
                      type="button"
                      disabled={saving || kycDocs.length === 0}
                      onClick={handleSubmitKyc}
                      className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Đang nộp...' : 'Nộp xét duyệt KYC (POST /submit)'}
                    </button>
                  </div>
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
                    Cấu hình điểm giao nhận hàng để đối tác vận chuyển đến lấy kiện hàng (PUT /seller/onboarding/warehouse).
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
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Hotline liên hệ kho * (contact_phone: chuẩn hóa E.164 khi gửi)
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

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tỉnh / Thành phố * (province)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.province}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, province: e.target.value })}
                      placeholder="VD: TP. Hồ Chí Minh"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Quận / Huyện * (district)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.district}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, district: e.target.value })}
                      placeholder="VD: TP Thủ Đức"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Phường / Xã * (ward)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.ward}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, ward: e.target.value })}
                      placeholder="VD: Hiệp Phú"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Mã bưu chính (postal_code)
                    </label>
                    <input
                      type="text"
                      value={warehouseForm.postal_code}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, postal_code: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Địa chỉ cụ thể * (line1)
                    </label>
                    <input
                      type="text"
                      required
                      value={warehouseForm.line1}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, line1: e.target.value })}
                      placeholder="Số nhà, đường, tòa nhà..."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
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
                    className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu & Sang bước Ngân hàng →'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: BANK */}
            {currentStep === 'BANK' && (
              <form onSubmit={handleSaveBank} className="space-y-6 text-[13px] max-w-3xl">
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

                  <div className="flex items-center gap-3">
                    <Link
                      to={`${basePath}/`}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                    >
                      Hoàn thành & Về Dashboard
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu tài khoản ngân hàng'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
