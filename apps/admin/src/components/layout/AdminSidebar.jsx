import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function AdminSidebar({ user, onSignOut, onOpen2FA }) {
  const location = useLocation();

  const isShell = location.pathname.startsWith('/admin');
  const basePath = isShell ? '/admin' : '';

  const navItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard`, icon: '▦' },
    { label: 'Campaigns', path: `${basePath}/campaigns`, icon: '▦' },
    { label: 'Categories', path: `${basePath}/categories`, icon: '▦' },
    { label: 'Shops / KYC', path: `${basePath}/shops/kyc`, icon: '▦', exact: true },
    { label: 'Products / SKU', path: `${basePath}/products`, icon: '▦' },
    { label: 'Fees / Taxes', path: `${basePath}/fees`, icon: '▦' },
    { label: 'Finance', path: `${basePath}/finance`, icon: '▦' },
    { label: 'Orders / Disputes', path: `${basePath}/orders`, icon: '▦' },
    { label: 'Vouchers', path: `${basePath}/vouchers`, icon: '▦' },
    { label: 'Users / Roles', path: `${basePath}/users/roles`, icon: '▦' },
    { label: 'Audit Logs', path: `${basePath}/audit-logs`, icon: '▦' },
    { label: 'Settings', path: `${basePath}/settings`, icon: '▦' },
  ];

  const isItemActive = (itemPath) => {
    if (location.pathname === itemPath) return true;
    if (itemPath.includes('/shops/kyc') && (location.pathname === '/admin' || location.pathname === '/admin/')) {
      return true;
    }
    return false;
  };

  return (
    <aside className="w-[260px] bg-[#0F172A] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[26px] font-black text-[#0A68FF] tracking-tight">taca</span>
          <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-950 text-[#38BDF8] border border-blue-800/50">
            ADMIN CONSOLE
          </span>
        </div>
      </div>

      {/* Nav Section Label */}
      <div className="px-6 pt-6 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
        MARKETPLACE OPERATIONS
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isItemActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                active
                  ? 'bg-[#0A68FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <span className={`text-[15px] opacity-70 ${active ? 'opacity-100' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.label === 'Shops / KYC' && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  284
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Portals Cross Links */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/40 space-y-1 text-[11px]">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          CHUYỂN ĐỔI PHÂN HỆ
        </div>
        <a
          href="/"
          className="flex items-center justify-between text-slate-400 hover:text-white transition-colors py-1 px-1 rounded-md hover:bg-slate-800/60 no-underline"
        >
          <span className="flex items-center gap-1.5">
            <span>🛍</span>
            <span>Kênh Người Mua</span>
          </span>
          <span className="text-[10px] opacity-60">↗</span>
        </a>
        <a
          href="/seller"
          className="flex items-center justify-between text-slate-400 hover:text-white transition-colors py-1 px-1 rounded-md hover:bg-slate-800/60 no-underline"
        >
          <span className="flex items-center gap-1.5">
            <span>🏪</span>
            <span>Kênh Người Bán</span>
          </span>
          <span className="text-[10px] opacity-60">↗</span>
        </a>
      </div>

      {/* Admin User Footer matching Penpot */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-2.5">
        {onOpen2FA && (
          <button
            type="button"
            onClick={onOpen2FA}
            className="w-full py-1.5 px-2.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/40 rounded-xl text-[11px] font-bold text-[#38BDF8] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>🔐</span>
              <span>Cài đặt 2FA (TOTP)</span>
            </span>
            <span className="text-[10px] bg-blue-500/20 px-1 rounded">#11, #12</span>
          </button>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-[13px] shrink-0">
              {user?.full_name ? user.full_name[0] : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[12px] font-bold text-slate-200 truncate">
                Admin · {user?.full_name || 'Trần Hoàng'}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Super Admin · 2FA ON</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Đăng xuất khỏi Admin Console"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

AdminSidebar.propTypes = {
  user: PropTypes.object,
  onSignOut: PropTypes.func.isRequired,
  onOpen2FA: PropTypes.func,
};
