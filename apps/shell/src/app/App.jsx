import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, Settings, X, Check, Pin, ChevronUp, ChevronDown } from 'lucide-react';
import ScrollToTop from '../components/common/ScrollToTop';
import RemoteErrorBoundary from '../components/common/RemoteErrorBoundary';

const BuyerApp = lazy(() => import('buyer/App'));
const SellerApp = lazy(() => import('seller/App'));
const AdminApp = lazy(() => import('admin/App'));

const Loading = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-[13px] font-medium text-slate-500">Đang tải Micro-App...</span>
  </div>
);

function ShellContent() {
  const location = useLocation();
  // Mặc định ẩn trong chế độ người dùng thực tế; có thể bật bằng toggle hoặc cờ localStorage
  const [isDevNavVisible, setIsDevNavVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('taca_dev_nav_visible') === 'true';
  });
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const toggleDevNav = (visible) => {
    setIsDevNavVisible(visible);
    try {
      localStorage.setItem('taca_dev_nav_visible', visible ? 'true' : 'false');
    } catch {
      // ignore
    }
  };

  const isSeller = location.pathname.startsWith('/seller');
  const isAdmin = location.pathname.startsWith('/admin');
  const currentApp = isSeller
    ? { name: 'Seller Dashboard', tag: 'Seller', color: 'bg-indigo-600', Icon: Store }
    : isAdmin
    ? { name: 'Admin Portal', tag: 'Admin', color: 'bg-emerald-600', Icon: Settings }
    : { name: 'Buyer Storefront', tag: 'Buyer', color: 'bg-[#0A68FF]', Icon: ShoppingBag };

  return (
    <>
      <ScrollToTop />

      {/* Top Host Nav: Chỉ hiển thị khi bật cờ Host Nav (Dev / QA Tester mode) */}
      {isDevNavVisible ? (
        <nav className="bg-slate-950 text-white px-3 sm:px-6 py-2 flex items-center justify-between sticky top-0 z-[100] border-b border-slate-800 text-[12px] shadow-sm animate-in slide-in-from-top-2 duration-150 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-extrabold text-[#0A68FF] text-[13px] tracking-tight">TACA HOST</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hidden xs:inline">Micro-Frontends</span>
            <span className="text-[11px] text-amber-400 font-medium hidden md:inline">
              (Thanh công cụ QA / Developer)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline shrink-0 ${
                  isActive ? 'bg-[#0A68FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Buyer Storefront</span>
              <span className="sm:hidden text-[11px]">Buyer</span>
            </NavLink>
            <NavLink
              to="/seller"
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline shrink-0 ${
                  isActive ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Seller Dashboard</span>
              <span className="sm:hidden text-[11px]">Seller</span>
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline shrink-0 ${
                  isActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Settings className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden text-[11px]">Admin</span>
            </NavLink>

            <button
              type="button"
              onClick={() => toggleDevNav(false)}
              title="Ẩn thanh Host Nav để xem giao diện thực tế của người dùng"
              className="ml-1 sm:ml-2 px-2 sm:px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 transition-colors border border-slate-700 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Ẩn thanh Dev</span>
            </button>
          </div>
        </nav>
      ) : (
        /* Floating QA / Dev Quick Switcher Widget khi thanh top ẩn (Chế độ người dùng thực tế) */
        <aside
          aria-label="Developer QA Quick Switcher"
          className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 font-sans select-none"
        >
          {isQuickMenuOpen && (
            <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 text-[12px] min-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Dev / QA Switcher</span>
                <span className="text-[9px] px-1 bg-slate-800 rounded text-slate-300">Port 5173</span>
              </div>

              <NavLink
                to="/"
                end
                onClick={() => setIsQuickMenuOpen(false)}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between no-underline transition-colors ${
                    isActive ? 'bg-[#0A68FF] text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Buyer Storefront</span>
                </span>
                {location.pathname === '/' && (
                  <span className="text-[10px] text-blue-200 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    <span>Hiện tại</span>
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/seller"
                onClick={() => setIsQuickMenuOpen(false)}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between no-underline transition-colors ${
                    isActive ? 'bg-[#4F46E5] text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4" aria-hidden="true" />
                  <span>Seller Portal</span>
                </span>
                {location.pathname.startsWith('/seller') && (
                  <span className="text-[10px] text-indigo-200 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    <span>Hiện tại</span>
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/admin"
                onClick={() => setIsQuickMenuOpen(false)}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between no-underline transition-colors ${
                    isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span>Admin Portal</span>
                </span>
                {location.pathname.startsWith('/admin') && (
                  <span className="text-[10px] text-emerald-200 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    <span>Hiện tại</span>
                  </span>
                )}
              </NavLink>

              <div className="pt-1.5 mt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    toggleDevNav(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11px] text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hiện thanh Host Nav trên Top</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            title="Công cụ chuyển đổi nhanh Micro-Frontends cho Developer & QA"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-full border border-slate-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
          >
            <span className={`w-2 h-2 rounded-full ${currentApp.color} animate-pulse`} />
            <span className="text-slate-300 group-hover:text-white flex items-center gap-1.5">
              <currentApp.Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="font-bold">{currentApp.tag}</span>
            </span>
            <span className="text-slate-500 text-[10px] group-hover:text-slate-300">
              {isQuickMenuOpen ? (
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-3 h-3" aria-hidden="true" />
              )}
            </span>
          </button>
        </aside>
      )}

      <main className="w-full">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/seller/*"
              element={
                <RemoteErrorBoundary appName="Kênh Người Bán (Seller Portal)">
                  <SellerApp />
                </RemoteErrorBoundary>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RemoteErrorBoundary appName="Cổng Quản Trị (Admin Portal)">
                  <AdminApp />
                </RemoteErrorBoundary>
              }
            />
            <Route
              path="/*"
              element={
                <RemoteErrorBoundary appName="Cửa Hàng (Buyer Storefront)">
                  <BuyerApp />
                </RemoteErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ShellContent />
    </BrowserRouter>
  );
}

export default App;
