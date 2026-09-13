import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const WhiteHeader = () => {
  const { user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col shadow-sm">
      {/* Trust Strip - Top Blue Banner */}
      <div className="bg-taca-primary h-[32px] flex items-center">
        <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center px-[80px]">
          <span className="text-white text-[11px] font-bold uppercase tracking-wider">
            100% HÀNG THẬT · FREESHIP MỌI ĐƠN · HOÀN 200% NẾU HÀNG GIẢ · ĐỔI TRẢ 30 NGÀY
          </span>
          <span className="text-white text-[11px] font-semibold flex items-center gap-4">
            <span className="cursor-pointer hover:text-gray-200">Trung tâm hỗ trợ</span>
            <span className="cursor-pointer hover:text-gray-200">Kênh người bán</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar - White background */}
      <div className="bg-white h-[78px] border-b border-taca-border">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-6">
          {/* Logo */}
          <Link to="/" className="text-taca-primary text-[30px] font-extrabold leading-none m-0 flex-shrink-0 no-underline">
            taca
          </Link>

          {/* Search Bar - 620px wide */}
          <div className="relative w-[620px] h-[44px] flex-shrink-0 ml-8">
            <form onSubmit={handleSearch} className="flex items-center bg-white h-full w-full border-2 border-taca-primary rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-taca-primary/20 transition-shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="⌕  Tìm sản phẩm, thương hiệu và cửa hàng"
                className="flex-1 h-full px-4 border-none outline-none text-[12px] font-normal text-taca-text-main placeholder:text-gray-400"
              />
              <button type="submit" className="h-[36px] px-6 mx-1 bg-taca-primary text-white border-none text-[12px] font-extrabold cursor-pointer hover:bg-taca-primary-hover transition-colors rounded-[6px]">
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Delivery Location */}
          <div className="flex items-center cursor-pointer text-taca-text-main flex-shrink-0 ml-auto">
            <div className="flex flex-col text-[11px] font-semibold leading-snug">
              <span className="text-taca-text-muted">Giao đến</span>
              <span className="font-bold">Quận 1, TP.HCM</span>
            </div>
          </div>

          {/* User */}
          <div
            className="flex flex-col cursor-pointer text-taca-text-main flex-shrink-0"
            onClick={() => user ? logout() : openAuthModal()}
          >
            <span className="text-[11px] font-semibold text-taca-text-muted leading-snug">
              Tài khoản
            </span>
            <span className="text-[12px] font-bold leading-snug">
              {user ? `${user.name} ▾` : 'Đăng nhập'}
            </span>
          </div>

          {/* Cart */}
          <Link to="/cart" className="flex items-center h-[40px] px-4 border border-taca-border rounded-lg text-taca-primary hover:border-taca-primary transition-colors no-underline flex-shrink-0">
            <span className="text-[13px] font-bold">Giỏ hàng 2</span>
          </Link>
        </div>
      </div>

      {/* Category Navigation Bar - White background */}
      <div className="bg-white border-b border-taca-border h-[42px]">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-0">
          <button className="bg-transparent border-none text-[12px] font-bold text-taca-text-main cursor-pointer hover:text-taca-primary transition-colors py-2 mr-12 flex items-center gap-2">
            ☰  Danh mục
          </button>
          <nav className="flex items-center">
            {['Điện thoại', 'Laptop', 'Nhà sách', 'Gia dụng', 'Làm đẹp', 'Thời trang', 'Voucher'].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[12px] font-semibold text-taca-text-muted py-2 hover:text-taca-primary transition-colors no-underline"
                style={{ width: '100px' }}
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

export default WhiteHeader;
