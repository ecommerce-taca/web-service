import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const Header = () => {
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar - Primary background #4f46e5 */}
      <div className="bg-taca-primary h-[78px]">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-6">
          {/* Logo */}
          <h1 className="text-white text-[30px] font-extrabold leading-none m-0 flex-shrink-0">
            taca
          </h1>

          {/* Search Bar - 620px wide */}
          <div className="relative w-[620px] h-[44px] flex-shrink-0">
            <div className="flex items-center bg-white h-full w-full">
              <input
                type="text"
                placeholder="⌕  Bạn tìm gì hôm nay? (iPhone, Anker, Lock&Lock, Sách…)"
                className="flex-1 h-full px-4 border-none outline-none text-[12px] font-normal text-gray-400 bg-transparent placeholder:text-gray-400"
              />
              <button className="h-[36px] px-5 mx-1 bg-taca-primary text-white border-none text-[11px] font-extrabold cursor-pointer hover:bg-taca-primary-hover transition-colors">
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="flex items-center cursor-pointer text-white flex-shrink-0 ml-auto">
            <div className="flex flex-col text-[11px] font-semibold leading-snug">
              <span>⌖  Giao đến:</span>
              <span className="font-bold">Quận 1, TP.HCM</span>
            </div>
          </div>

          {/* User */}
          <div
            className="flex items-center cursor-pointer text-white flex-shrink-0"
            onClick={() => user ? logout() : openAuthModal()}
          >
            <span className="text-[12px] font-bold">
              {user ? `♙  ${user.name}  ▾` : '♙  Đăng nhập'}
            </span>
          </div>

          {/* Cart */}
          <Link to="/cart" className="flex items-center text-white no-underline flex-shrink-0">
            <span className="text-[12px] font-bold">▣  Giỏ hàng  2</span>
          </Link>
        </div>
      </div>

      {/* Category Navigation Bar - White background */}
      <div className="bg-white border-b border-taca-border h-[42px]">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-0">
          <button className="bg-transparent border-none text-[11px] font-extrabold text-taca-text-main cursor-pointer hover:text-taca-primary transition-colors py-2 mr-12 flex items-center gap-1">
            ☰  DANH MỤC SẢN PHẨM
          </button>
          <nav className="flex items-center">
            {['Điện thoại', 'Laptop', 'Nhà sách', 'Gia dụng', 'Làm đẹp', 'Thời trang', 'Voucher'].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[11px] font-semibold text-taca-text-muted py-2 hover:text-taca-primary transition-colors no-underline"
                style={{ width: '92px' }}
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
