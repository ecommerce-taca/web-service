import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, User as UserIcon, ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCart } from '../../features/cart/hooks/useCart';
import { getSellerRegistrationStatus } from '../../features/account/services/seller-register.api';
import MegaMenu from './MegaMenu';

const getSellerUrl = (path = '/seller') => {
  if (typeof window !== 'undefined' && window.location.port === '5174') {
    return `http://${window.location.hostname}:5173${path}`;
  }
  return path;
};

const Header = () => {
  const { user, openAuthModal } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [sellerStatus, setSellerStatus] = useState(() => getSellerRegistrationStatus(user?.id));
  const navigate = useNavigate();

  useEffect(() => {
    setSellerStatus(getSellerRegistrationStatus(user?.id));
    const handleUpdate = () => {
      setSellerStatus(getSellerRegistrationStatus(user?.id));
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('taca:kyc_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('taca:kyc_updated', handleUpdate);
    };
  }, [user]);

  // Kiểm tra trạng thái Shop để định tuyến thông minh (Khớp yêu cầu)
  const sellerNav = useMemo(() => {
    if (!user) {
      return {
        title: 'Kênh Người Bán',
        subText: 'Bán hàng cùng Taca',
        url: '/account/seller-register',
        badge: null
      };
    }
    const { hasShop, kycStatus } = sellerStatus;
    if (!hasShop || kycStatus === 'NOT_REGISTERED') {
      return {
        title: 'Kênh Người Bán',
        subText: 'Đăng ký mở gian hàng',
        url: '/account/seller-register',
        badge: 'Đăng ký'
      };
    }
    if (kycStatus === 'PENDING') {
      return {
        title: 'Kênh Người Bán',
        subText: 'Hồ sơ đang chờ Admin xét duyệt',
        url: '/seller',
        badge: 'Đang duyệt'
      };
    }
    if (kycStatus === 'DRAFT' || kycStatus === 'NEEDS_INFO' || kycStatus === 'REJECTED') {
      return {
        title: 'Kênh Người Bán',
        subText: 'Hoàn thiện hồ sơ Onboarding',
        url: '/seller/onboarding',
        badge: kycStatus === 'REJECTED' ? 'Cần sửa' : 'Tiếp tục'
      };
    }
    // APPROVED hoặc ACTIVE
    return {
      title: 'Kênh Người Bán',
      subText: 'Truy cập Kênh Quản Trị Gian Hàng',
      url: '/seller',
      badge: 'Đang bán'
    };
  }, [user, sellerStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar - Primary background #4f46e5 */}
      <div className="bg-taca-primary min-h-[64px] sm:h-[78px] py-2 sm:py-0">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-4 sm:px-6 lg:px-[80px] gap-2.5 sm:gap-6 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="no-underline flex-shrink-0">
            <h1 className="text-white text-[24px] sm:text-[30px] font-black tracking-tight leading-none m-0 hover:opacity-95 transition-opacity">
              TACA
            </h1>
          </Link>

          {/* Search Bar - Responsive, centered & balanced */}
          <div className="flex-1 min-w-0 max-w-[640px] h-[38px] sm:h-[44px]">
            <form onSubmit={handleSearch} className="flex items-center bg-white h-full w-full rounded-xl border border-transparent focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-white/30 overflow-hidden shadow-xs transition-all">
              <div className="pl-3 sm:pl-3.5 pr-1 flex items-center text-slate-400">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </div>
              <input
                id="header-search-input"
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn tìm gì hôm nay? (iPhone, Laptop, Sách…)"
                aria-label="Tìm kiếm sản phẩm"
                className="flex-1 min-w-0 h-full px-2 sm:px-2.5 border-none outline-none text-[12px] sm:text-[13px] font-normal text-taca-text-main bg-transparent placeholder:text-gray-400"
              />
              <button type="submit" className="h-[30px] sm:h-[36px] px-3 sm:px-5 mr-1 bg-taca-primary text-white border-none text-[11px] sm:text-[12px] font-bold cursor-pointer hover:bg-taca-primary-hover transition-colors rounded-lg shrink-0 flex items-center justify-center">
                <span className="hidden sm:inline">Tìm kiếm</span>
                <Search className="w-3.5 h-3.5 sm:hidden" />
              </button>
            </form>
          </div>

          {/* Right Action Group - Căn phải chuẩn đẹp */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            {/* Smart Seller Portal Link */}
            <a
              href={getSellerUrl(sellerNav.url)}
              title={sellerNav.subText}
              className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-white hover:bg-white/10 transition-all no-underline group cursor-pointer border border-transparent hover:border-white/15"
            >
              <Store className="w-4 h-4 text-white shrink-0" />
              <span className="hidden lg:inline text-[13px] font-bold text-white group-hover:text-amber-200 transition-colors whitespace-nowrap">
                {sellerNav.title}
              </span>
              {sellerNav.badge && (
                <span
                  className={`hidden md:inline px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-2xs whitespace-nowrap ${
                    sellerNav.badge === 'Đang bán'
                      ? 'bg-emerald-400 text-slate-950'
                      : sellerNav.badge === 'Đang duyệt'
                      ? 'bg-amber-400 text-slate-950'
                      : sellerNav.badge === 'Cần sửa'
                      ? 'bg-rose-400 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {sellerNav.badge}
                </span>
              )}
            </a>

            <span className="hidden sm:block h-5 w-px bg-white/20" />

            {/* User / Đăng nhập */}
            {user ? (
              <Link
                to="/account"
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-white hover:bg-white/10 transition-all no-underline cursor-pointer group border border-transparent hover:border-white/15"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-[12px] sm:text-[13px] font-extrabold text-white border border-white/30 shadow-xs shrink-0">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-white" />}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-white/70 font-medium">Tài khoản</span>
                  <span className="text-[12px] font-bold text-white max-w-[120px] truncate group-hover:text-amber-200 transition-colors flex items-center gap-1">
                    <span>{user.full_name || user.name || 'Người dùng'}</span>
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </span>
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-white hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-white/15 bg-transparent"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-xs shrink-0">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-white/70 font-medium">Xin chào</span>
                  <span className="text-[12px] font-bold text-white group-hover:text-amber-200 transition-colors whitespace-nowrap">
                    Đăng nhập
                  </span>
                </div>
              </button>
            )}

            <span className="hidden sm:block h-5 w-px bg-white/20" />

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-white hover:bg-white/10 transition-all no-underline flex-shrink-0 group cursor-pointer border border-transparent hover:border-white/15"
            >
              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/25 group-hover:bg-white/25 transition-colors shrink-0">
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-taca-sale text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center border-2 border-taca-primary shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[13px] font-bold text-white group-hover:text-amber-200 transition-colors whitespace-nowrap">
                Giỏ hàng
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar - White background */}
      <div className="bg-white border-b border-taca-border h-[42px] relative z-40">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-4 sm:px-6 lg:px-[80px] gap-2 overflow-hidden">
          <div 
            className="relative h-full flex items-center mr-2 sm:mr-8 shrink-0"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button className="bg-transparent border-none text-[11px] font-extrabold text-taca-text-main cursor-pointer hover:text-taca-primary transition-colors py-2 flex items-center gap-1.5 whitespace-nowrap">
              <Menu className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span className="hidden xs:inline">DANH MỤC</span>
              <span className="hidden md:inline">SẢN PHẨM</span>
            </button>
            <MegaMenu isOpen={isMegaMenuOpen} />
          </div>
          
          <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            {['Điện thoại', 'Laptop', 'Nhà sách', 'Gia dụng', 'Làm đẹp', 'Thời trang', 'Voucher'].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[12px] font-medium text-slate-600 px-2.5 sm:px-3.5 py-1 rounded-lg hover:text-taca-primary hover:bg-slate-50 transition-colors no-underline whitespace-nowrap shrink-0"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </div>

    </header>
  );
};

export default Header;
