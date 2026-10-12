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

// Subcomponents
import SettingsSidebarNav from '../components/SettingsSidebarNav';
import ShopInfoTab from '../components/tabs/ShopInfoTab';
import BrandingTab from '../components/tabs/BrandingTab';
import WarehouseTab from '../components/tabs/WarehouseTab';
import ShippingTab from '../components/tabs/ShippingTab';
import PaymentTab from '../components/tabs/PaymentTab';
import NotificationsTab from '../components/tabs/NotificationsTab';
import PermissionsTab from '../components/tabs/PermissionsTab';

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
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
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
        <SettingsSidebarNav
          subTabs={subTabs}
          activeSubTab={activeSubTab}
          onSelectTab={setActiveSubTab}
        />

        {/* Content Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          {activeSubTab === 'info' && (
            <ShopInfoTab
              shopName={shopName}
              setShopName={setShopName}
              slug={slug}
              businessName={businessName}
              taxCodeMasked={taxCodeMasked}
              desc={desc}
              setDesc={setDesc}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              saving={saving}
              onSaveInfo={handleSaveInfo}
            />
          )}

          {activeSubTab === 'branding' && (
            <BrandingTab
              shopId={shopId}
              shopName={shopName}
              slug={slug}
              logoUrl={logoUrl}
              isShell={isShell}
            />
          )}

          {activeSubTab === 'warehouse' && (
            <WarehouseTab
              warehouseName={warehouseName}
              setWarehouseName={setWarehouseName}
              warehouseContact={warehouseContact}
              setWarehouseContact={setWarehouseContact}
              warehousePhone={warehousePhone}
              setWarehousePhone={setWarehousePhone}
              warehouseProvince={warehouseProvince}
              setWarehouseProvince={setWarehouseProvince}
              warehouseDistrict={warehouseDistrict}
              setWarehouseDistrict={setWarehouseDistrict}
              warehouseWard={warehouseWard}
              setWarehouseWard={setWarehouseWard}
              warehousePostalCode={warehousePostalCode}
              setWarehousePostalCode={setWarehousePostalCode}
              warehouseAddressLine1={warehouseAddressLine1}
              setWarehouseAddressLine1={setWarehouseAddressLine1}
              saving={saving}
              onSaveWarehouse={handleSaveWarehouse}
            />
          )}

          {activeSubTab === 'shipping' && (
            <ShippingTab
              codEnabled={codEnabled}
              setCodEnabled={setCodEnabled}
              carrierPreferences={carrierPreferences}
              setCarrierPreferences={setCarrierPreferences}
            />
          )}

          {activeSubTab === 'payment' && (
            <PaymentTab
              bankSummary={bankSummary}
              bankForm={bankForm}
              setBankForm={setBankForm}
              saving={saving}
              onSaveBank={handleSaveBank}
            />
          )}

          {activeSubTab === 'notifications' && <NotificationsTab />}

          {activeSubTab === 'permissions' && <PermissionsTab />}
        </div>
      </div>
    </div>
  );
}
