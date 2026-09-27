import { useState } from 'react';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function SettingsPage() {
  const { shop } = SELLER_MOCK_DATA;
  const [activeSubTab, setActiveSubTab] = useState('info');

  const [shopName, setShopName] = useState(shop.name);
  const [shortName, setShortName] = useState(shop.short_name);
  const [email, setEmail] = useState(shop.email);
  const [phone, setPhone] = useState(shop.phone);
  const [desc, setDesc] = useState(shop.description);

  const [warehouseName, setWarehouseName] = useState(shop.warehouse.name);
  const [warehouseContact, setWarehouseContact] = useState(shop.warehouse.contact);
  const [warehousePhone, setWarehousePhone] = useState(shop.warehouse.phone);
  const [warehouseAddress, setWarehouseAddress] = useState(shop.warehouse.address);

  const [savedNotification, setSavedNotification] = useState(false);

  const subTabs = [
    { id: 'info', label: 'Thông tin cửa hàng' },
    { id: 'branding', label: 'Nhận diện' },
    { id: 'warehouse', label: 'Địa chỉ kho' },
    { id: 'shipping', label: 'Vận chuyển' },
    { id: 'payment', label: 'Thanh toán' },
    { id: 'notifications', label: 'Thông báo' },
    { id: 'permissions', label: 'Phân quyền nhân viên' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Cài đặt gian hàng
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Cập nhật nhận diện, vận hành, địa chỉ kho và cài đặt thông báo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedNotification && (
            <span className="text-[12px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              ✓ Đã lưu thay đổi thành công!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

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
          {activeSubTab === 'info' && (
            <form onSubmit={handleSave} className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  THÔNG TIN CỬA HÀNG
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Tên, mô tả và thông tin hiển thị công khai với người mua.
                </p>
              </div>

              {/* Logo section */}
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-[#4F46E5] text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
                  🍎
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => alert('Chọn file ảnh logo từ máy tính')}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-[12px] font-semibold transition-colors shadow-2xs"
                  >
                    Tải logo
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    PNG/JPG, tối đa 2MB · Tỉ lệ vuông 1:1
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tên cửa hàng *
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tên hiển thị ngắn *
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Email hỗ trợ *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Hotline chăm sóc khách hàng *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Mô tả gian hàng
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
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'warehouse' && (
            <form onSubmit={handleSave} className="space-y-6 text-[13px]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
                  ĐỊA CHỈ KHO HÀNG & LẤY HÀNG
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">
                  Đơn vị vận chuyển sẽ căn cứ theo địa chỉ này để đến lấy hàng.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tên kho
                  </label>
                  <input
                    type="text"
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Người phụ trách kho
                  </label>
                  <input
                    type="text"
                    value={warehouseContact}
                    onChange={(e) => setWarehouseContact(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Số điện thoại liên hệ kho
                  </label>
                  <input
                    type="text"
                    value={warehousePhone}
                    onChange={(e) => setWarehousePhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Địa chỉ chi tiết kho
                  </label>
                  <input
                    type="text"
                    value={warehouseAddress}
                    onChange={(e) => setWarehouseAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors"
                >
                  Lưu thay đổi kho
                </button>
              </div>
            </form>
          )}

          {activeSubTab !== 'info' && activeSubTab !== 'warehouse' && (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <span className="text-3xl">⚙️</span>
              <p className="font-semibold text-slate-700">
                Mục cấu hình: {subTabs.find(t => t.id === activeSubTab)?.label}
              </p>
              <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
                Tính năng đang hoạt động bình thường theo chính sách mặc định của sàn Taca.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
