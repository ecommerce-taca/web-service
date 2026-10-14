import { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, Search, AlertTriangle, Bell, ChevronDown } from 'lucide-react';

export default function AdminHeader({
  title = 'Shops / KYC',
  subtitle = 'Xác minh người bán, hồ sơ pháp lý và tín hiệu rủi ro.',
  onSearch,
  searchValue = '',
  onToggleSidebar,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-[76px] bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-3">
      {/* Title & Subtitle + Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate m-0">
            {title}
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium line-clamp-1 sm:line-clamp-none m-0">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Search & Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search Input */}
        <div className="relative w-36 sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <input
            id="admin-global-search"
            name="adminGlobalSearch"
            type="text"
            value={searchValue}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            placeholder="Tìm hệ thống..."
            aria-label="Tìm kiếm trong hệ thống quản trị"
            className="w-full pl-8 pr-3.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A68FF] focus:bg-white transition-colors"
          />
        </div>

        {/* Action Button: Quy tắc rủi ro */}
        <button
          type="button"
          onClick={() => alert('Quy tắc rủi ro hệ thống: Tự động gắn nhãn HIGH khi trùng IP, trùng thiết bị hoặc nghi vấn sao kê ngân hàng.')}
          className="hidden md:flex px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[12px] transition-colors cursor-pointer items-center gap-1.5 shadow-2xs"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Quy tắc rủi ro</span>
        </button>

        {/* Notifications & Admin Status */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[12px] flex items-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              12
            </span>
            <span className="text-slate-600 text-[11px] font-semibold flex items-center gap-1">
              <span>Trần Hoàng</span>
              <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-[12px] animate-in fade-in duration-150">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                <span>Thông báo hệ thống</span>
                <span className="text-[10px] text-blue-600 font-medium">Đánh dấu đã đọc</span>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="font-semibold text-blue-900">12 hồ sơ KYC mới cần duyệt</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Vừa nhận 5 phút trước</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="font-semibold text-amber-900">Phát hiện 1 gian hàng trùng IP khả nghi</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Taca Digital Store (HIGH RISK)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

AdminHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onSearch: PropTypes.func,
  searchValue: PropTypes.string,
};
