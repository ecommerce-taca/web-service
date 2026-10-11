import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getShopProfile,
  updateShopProfile,
  updateOnboardingWarehouse,
  updateOnboardingBank,
  VIETNAM_BANK_CATALOG,
} from '../../../services/seller-shop.api';
import { formatPhoneDisplay } from '../../../../../../shared/utils/phone';

export default function SettingsPage() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  const [activeSubTab, setActiveSubTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Shop Profile State (§2.27 & §2.28)
  const [shopId, setShopId] = useState('');
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxCodeMasked, setTaxCodeMasked] = useState('');
  const [desc, setDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [shopStatus, setShopStatus] = useState('ACTIVE');
  const [kycStatus, setKycStatus] = useState('APPROVED');

  // Warehouse State (§2.22)
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseContact, setWarehouseContact] = useState('');
  const [warehousePhone, setWarehousePhone] = useState('');
  const [warehouseAddressLine1, setWarehouseAddressLine1] = useState('');
  const [warehouseAddressLine2, setWarehouseAddressLine2] = useState('');
  const [warehouseWard, setWarehouseWard] = useState('');
  const [warehouseDistrict, setWarehouseDistrict] = useState('');
  const [warehouseProvince, setWarehouseProvince] = useState('');
  const [warehousePostalCode, setWarehousePostalCode] = useState('700000');
  const [carrierPreferences, setCarrierPreferences] = useState(['GHTK', 'GHN', 'SPX']);
  const [codEnabled, setCodEnabled] = useState(true);

  // Bank State (§2.26)
  const [bankSummary, setBankSummary] = useState(null);
  const [bankForm, setBankForm] = useState({
    bank_code: 'VCB',
    bank_name: 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank)',
    account_name: '',
    account_number: '',
  });

  const subTabs = [
    { id: 'info', label: 'Thông tin cửa hàng' },
    { id: 'branding', label: 'Nhận diện thương hiệu' },
    { id: 'warehouse', label: 'Địa chỉ kho & Lấy hàng' },
    { id: 'shipping', label: 'Vận chuyển & ĐVVC' },
    { id: 'payment', label: 'Tài khoản ngân hàng' },
    { id: 'notifications', label: 'Cài đặt thông báo' },
    { id: 'permissions', label: 'Phân quyền nhân viên' },
  ];

  const applyShopData = (data) => {
    if (data) {
      setShopId(data.id || '');
      setShopName(data.name || '');
      setSlug(data.slug || '');
      setBusinessName(data.business_name || '');
      setTaxCodeMasked(data.tax_code_masked || data.tax_code || '031*****78');
      setDesc(data.description || '');
      setLogoUrl(data.logo_url || '');
      setShopStatus(data.status || 'ACTIVE');
      setKycStatus(data.kyc_status || 'APPROVED');

      if (data.warehouse_summary) {
        setWarehouseName(data.warehouse_summary.warehouse_name || '');
        setWarehouseContact(data.warehouse_summary.contact_name || '');
        setWarehousePhone(formatPhoneDisplay(data.warehouse_summary.contact_phone || ''));
        setWarehouseAddressLine1(data.warehouse_summary.line1 || '');
        setWarehouseAddressLine2(data.warehouse_summary.line2 || '');
        setWarehouseWard(data.warehouse_summary.ward || '');
        setWarehouseDistrict(data.warehouse_summary.district || '');
        setWarehouseProvince(data.warehouse_summary.province || '');
        setWarehousePostalCode(data.warehouse_summary.postal_code || '700000');
        setCarrierPreferences(data.warehouse_summary.carrier_preferences || ['GHTK', 'GHN', 'SPX']);
        setCodEnabled(data.warehouse_summary.cod_enabled !== false);
      }

      if (data.bank_summary) {
        setBankSummary(data.bank_summary);
        setBankForm((prev) => ({
          ...prev,
          bank_code: data.bank_summary.bank_code || 'VCB',
          bank_name: data.bank_summary.bank_name || 'Vietcombank',
          account_name: data.bank_summary.account_name || '',
        }));
      }
    }
  };

  useEffect(() => {
    let ignore = false;
    getShopProfile()
      .then((data) => {
        if (!ignore) {
          applyShopData(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Lỗi nạp thông tin cửa hàng:', err);
          setErrorMessage(err?.response?.data?.error?.message || 'Không thể tải thông tin gian hàng.');
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
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(''), 3500);
  };

  // Cập nhật hồ sơ shop (PUT /seller/shop - §2.28)
  const handleSaveInfo = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await updateShopProfile({
        name: shopName,
        description: desc,
        logo_object_key: logoUrl,
      });
      if (res?.name) setShopName(res.name);
      notifySuccess('✓ Đã lưu thay đổi hồ sơ gian hàng thành công!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi lưu thông tin cửa hàng.');
    } finally {
      setSaving(false);
    }
  };

  // Cập nhật địa chỉ kho (PUT /seller/onboarding/warehouse - §2.22)
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await updateOnboardingWarehouse({
        warehouse_name: warehouseName,
        contact_name: warehouseContact,
        contact_phone: warehousePhone,
        address: {
          line1: warehouseAddressLine1,
          line2: warehouseAddressLine2,
          ward: warehouseWard,
          district: warehouseDistrict,
          province: warehouseProvince,
          postal_code: warehousePostalCode,
        },
        carrier_preferences: carrierPreferences,
        cod_enabled: codEnabled,
      });
      notifySuccess('✓ Đã cập nhật địa chỉ kho hàng và lấy hàng!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi lưu địa chỉ kho.');
    } finally {
      setSaving(false);
    }
  };

  // Cập nhật tài khoản ngân hàng (PUT /seller/onboarding/bank - §2.26)
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
      setBankSummary({
        bank_code: bankForm.bank_code,
        bank_name: selectedBank ? selectedBank.name : bankForm.bank_name,
        account_name: bankForm.account_name.toUpperCase(),
        account_number_masked: res.account_number_masked,
        verified: true,
      });
      setBankForm((prev) => ({ ...prev, account_number: '' }));
      notifySuccess('✓ Đã cập nhật tài khoản ngân hàng nhận tiền đối soát!');
    } catch (err) {
      setErrorMessage(err?.response?.data?.error?.message || 'Lỗi khi lưu tài khoản ngân hàng.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-[13px] font-semibold text-slate-500">Đang tải cấu hình gian hàng...</p>
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
              SELLER SETTINGS
            </span>
            <span
              className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                kycStatus === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              KYC: {kycStatus}
            </span>
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              TRẠNG THÁI: {shopStatus}
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Cài đặt gian hàng
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Quản lý nhận diện thương hiệu, thông tin pháp lý, địa chỉ kho và tài khoản ngân hàng nhận tiền.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotification && (
            <span className="text-[12px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              {savedNotification}
            </span>
          )}
          <Link
            to={`${basePath}/onboarding`}
            className="px-4 py-2 border border-indigo-200 hover:bg-indigo-50 text-[#4F46E5] rounded-lg font-semibold text-[13px] shadow-2xs transition-colors"
          >
            📋 Tiến độ Onboarding & KYC
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={activeSubTab === 'warehouse' ? handleSaveWarehouse : activeSubTab === 'payment' ? handleSaveBank : handleSaveInfo}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700 text-sm">✕</button>
        </div>
      )}

      {/* Main Settings Section with Sidebar Sub-Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sub-nav sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1">
          {subTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-between ${
                activeSubTab === t.id
                  ? 'bg-indigo-50 text-[#4F46E5]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{t.label}</span>
              {activeSubTab === t.id && <span className="text-xs">›</span>}
            </button>
          ))}
        </div>

        {/* Content Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          {/* TAB 1: INFO */}
          {activeSubTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  THÔNG TIN GIAN HÀNG & PHÁP LÝ (GET /seller/shop & PUT /seller/shop)
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Thông tin thương hiệu hiển thị công khai với khách hàng và tài liệu pháp lý định danh.
                </p>
              </div>

              {/* Logo section */}
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-[#4F46E5] text-white font-extrabold flex items-center justify-center text-2xl shadow-sm overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                  ) : (
                    <span>🍎</span>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Nhập URL ảnh logo hoặc tải từ máy"
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-full max-w-md"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PNG/JPG/WEBP, tỉ lệ vuông 1:1, tối đa 2MB (logo_object_key).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tên gian hàng * (name)
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Đường dẫn cửa hàng (slug)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={slug}
                    className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tên công ty / Doanh nghiệp đăng ký (business_name)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={businessName}
                    className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Mã số thuế đã mã hóa (tax_code_masked)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={taxCodeMasked}
                    className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Mô tả gian hàng (description)
                </label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu hồ sơ gian hàng'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BRANDING */}
          {activeSubTab === 'branding' && (
            <div className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  NHẬN DIỆN THƯƠNG HIỆU & GIAO DIỆN CỬA HÀNG
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Cách gian hàng xuất hiện trên trang Người mua (Taca Buyer / Shop - §2.45).
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🍎</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{shopName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Slug: /{slug || 'taca-apple-store'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        ✓ Chính hãng Official
                      </span>
                      <span className="text-xs text-slate-400">· 1.284 người theo dõi</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Xem thử trang gian hàng công khai của bạn:</span>
                  <a
                    href={isShell ? `/shop/${shopId || 'shop_apple_001'}` : `http://localhost:5173/shop/${shopId || 'shop_apple_001'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Mở trang Người Mua ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WAREHOUSE */}
          {activeSubTab === 'warehouse' && (
            <form onSubmit={handleSaveWarehouse} className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  ĐỊA CHỈ KHO HÀNG & LẤY HÀNG (PUT /seller/onboarding/warehouse - §2.22)
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Đơn vị vận chuyển sẽ căn cứ theo địa chỉ này để đến lấy hàng. Hotline tự động chuyển chuẩn E.164 khi lưu.
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
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Người phụ trách kho * (contact_name)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseContact}
                    onChange={(e) => setWarehouseContact(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Số điện thoại liên hệ kho * (contact_phone)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehousePhone}
                    onChange={(e) => setWarehousePhone(e.target.value)}
                    placeholder="VD: 0901234567"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tỉnh / Thành phố * (province)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseProvince}
                    onChange={(e) => setWarehouseProvince(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Quận / Huyện * (district)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseDistrict}
                    onChange={(e) => setWarehouseDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Phường / Xã * (ward)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseWard}
                    onChange={(e) => setWarehouseWard(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Mã bưu chính (postal_code)
                  </label>
                  <input
                    type="text"
                    value={warehousePostalCode}
                    onChange={(e) => setWarehousePostalCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Địa chỉ chi tiết kho * (line1)
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseAddressLine1}
                    onChange={(e) => setWarehouseAddressLine1(e.target.value)}
                    placeholder="Số nhà, tên đường, khu vực..."
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi kho hàng'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SHIPPING */}
          {activeSubTab === 'shipping' && (
            <div className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  ĐỐI TÁC VẬN CHUYỂN & HÌNH THỨC COD
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Cấu hình các đơn vị vận chuyển được ưu tiên lấy hàng và phương thức giao hàng thanh toán COD.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Cho phép người mua thanh toán tiền mặt khi Shipper giao hàng.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={codEnabled}
                      onChange={(e) => setCodEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 space-y-3">
                  <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Đơn vị vận chuyển liên kết</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['GHTK', 'GHN', 'SPX', 'Viettel Post', 'J&T Express'].map((carrier) => {
                      const isSelected = carrierPreferences.includes(carrier);
                      return (
                        <button
                          key={carrier}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCarrierPreferences(carrierPreferences.filter((c) => c !== carrier));
                            } else {
                              setCarrierPreferences([...carrierPreferences, carrier]);
                            }
                          }}
                          className={`p-3 rounded-lg border text-left font-semibold text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{carrier}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT */}
          {activeSubTab === 'payment' && (
            <form onSubmit={handleSaveBank} className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT & RÚT TIỀN (PUT /seller/onboarding/bank - §2.26)
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Doanh thu bán hàng từ ví số dư sẽ được đối soát tự động về tài khoản ngân hàng chính chủ này.
                </p>
              </div>

              {bankSummary && (
                <div className="p-5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Tài khoản liên kết hiện tại
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-white text-emerald-700 border border-emerald-200 rounded">
                      ✓ Đã xác thực KYC
                    </span>
                  </div>
                  <p className="text-[15px] font-extrabold text-slate-900">{bankSummary.bank_name}</p>
                  <p className="text-xs text-slate-600 font-mono">
                    Chủ tài khoản: <strong className="text-slate-800">{bankSummary.account_name}</strong> · Số TK: <strong className="text-slate-800">{bankSummary.account_number_masked}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-slate-800 text-[14px]">Cập nhật tài khoản thụ hưởng mới</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Ngân hàng * (bank_code / bank_name)
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
                      Số tài khoản ngân hàng * (account_number)
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.account_number}
                      onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="Nhập 8–20 chữ số"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Tên chủ tài khoản * (account_name: VIẾT HOA)
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.account_name}
                      onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value.toUpperCase() })}
                      placeholder="VD: NGUYEN MINH ANH"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu tài khoản ngân hàng'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeSubTab === 'notifications' && (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <span className="text-3xl">🔔</span>
              <p className="font-semibold text-slate-700">Cài đặt thông báo đơn hàng & ví tiền</p>
              <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
                Hệ thống tự động thông báo qua Email và App Seller Center khi phát sinh đơn hàng mới hoặc có thay đổi số dư ví.
              </p>
            </div>
          )}

          {/* TAB 7: PERMISSIONS */}
          {activeSubTab === 'permissions' && (
            <div className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  PHÂN QUYỀN NHÂN VIÊN GIAN HÀNG (SELLER_STAFF - §2.32 / §2.33)
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Quản lý quyền hạn truy cập của các thành viên vận hành thuộc gian hàng.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                <div className="p-4 flex items-center justify-between bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-900">Minh Anh (Chủ sở hữu)</p>
                    <p className="text-xs text-slate-500">minhanh@example.com · Vai trò: OWNER / ADMIN</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-[#4F46E5] border border-indigo-200 rounded-lg">
                    Toàn quyền
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Trần Quốc Bảo (Vận hành kho)</p>
                    <p className="text-xs text-slate-500">bao.tran@example.com · Vai trò: SELLER_STAFF</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SHOP_READ</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">ORDER_FULFILL</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Được cấp: 2026-08-30</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
