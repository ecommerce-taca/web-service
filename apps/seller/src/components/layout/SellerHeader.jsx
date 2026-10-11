import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getSellerUser, signoutSeller } from '../../services/seller-auth.api';
import SellerLoginModal from '../common/SellerLoginModal';

export default function SellerHeader({ shopName = 'Taca Apple Flagship Store', userName: initialUserName = 'Minh Anh' }) {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [user, setUser] = useState(() => getSellerUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getSellerUser());
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  const currentUserName = user?.full_name || initialUserName;
  const isLoggedIn = Boolean(user);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signoutSeller();
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-[68px] px-6 lg:px-12 flex items-center justify-between">
        {/* Left branding & store selector */}
        <div className="flex items-center gap-4">
          <Link to={`${basePath}/`} className="flex items-center gap-2 group text-decoration-none">
            <span className="text-[26px] font-extrabold tracking-tight text-[#4F46E5] font-sans">
              taca
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-100">
              SELLER CENTER
            </span>
          </Link>

          {/* Store Switcher */}
          <div className="relative ml-2 hidden sm:block">
            <button
              type="button"
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{shopName}</span>
              <span className="text-slate-400 text-[10px]">▾</span>
            </button>

            {isStoreMenuOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-[12px]">
                <div className="px-3 py-2 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  Gian hàng của bạn
                </div>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 font-semibold text-slate-800 bg-indigo-50/50 flex items-center justify-between"
                >
                  <span>{shopName}</span>
                  <span className="text-[#4F46E5]">✓</span>
                </button>
                <Link
                  to={`${basePath}/onboarding`}
                  className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors block text-decoration-none"
                  onClick={() => setIsStoreMenuOpen(false)}
                >
                  + Đăng ký gian hàng mới / KYC
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right navigation links & user info */}
        <div className="flex items-center gap-5">
          <a
            href={isShell ? "/shop/shop_apple_001" : "http://localhost:5173/shop/shop_apple_001"}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-medium text-slate-600 hover:text-[#4F46E5] flex items-center gap-1 transition-colors"
          >
            <span>Xem cửa hàng</span>
            <span className="text-[13px]">↗</span>
          </a>

          <a
            href={isShell ? "/" : "http://localhost:5173/"}
            className="text-[12px] font-medium text-slate-600 hover:text-[#4F46E5] flex items-center gap-1 transition-colors"
          >
            <span>← Kênh người mua</span>
          </a>

          {/* User Auth Info or Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-[12px] font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUserName.charAt(0)}
                </div>
                <span>{currentUserName}</span>
                <span className="text-slate-400 text-[10px]">▾</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-[12px]">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{currentUserName}</p>
                    <p className="text-[11px] text-slate-400">{user?.email || 'minhanh@example.com'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      Chủ gian hàng (Admin)
                    </span>
                  </div>
                  <Link
                    to={`${basePath}/onboarding`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Tiến độ Onboarding & KYC
                  </Link>
                  <Link
                    to={`${basePath}/settings`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cài đặt gian hàng
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Đăng nhập Người bán
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <SellerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setUser(getSellerUser());
          setIsLoginModalOpen(false);
        }}
      />
    </>
  );
}

SellerHeader.propTypes = {
  shopName: PropTypes.string,
  userName: PropTypes.string,
};
