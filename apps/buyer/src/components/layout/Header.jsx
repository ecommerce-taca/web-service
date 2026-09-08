import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import MegaMenu from './MegaMenu';

const Header = () => {
  const { user, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar - Primary background #4f46e5 */}
      <div className="bg-taca-primary h-[78px]">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-6">
          {/* Logo */}
          <Link to="/" className="no-underline">
            <h1 className="text-white text-[30px] font-extrabold leading-none m-0 flex-shrink-0 hover:opacity-90 transition-opacity">
              TACA
            </h1>
          </Link>

          {/* Search Bar - 620px wide */}
          <div className="relative w-[620px] h-[44px] flex-shrink-0">
            <form onSubmit={handleSearch} className="flex items-center bg-white h-full w-full rounded-[8px] border border-transparent focus-within:border-taca-border overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="⌕  Bạn tìm gì hôm nay? (iPhone, Anker, Lock&Lock, Sách…)"
                className="flex-1 h-full px-4 border-none outline-none text-[12px] font-normal text-taca-text-main bg-transparent placeholder:text-gray-400"
              />
              <button type="submit" className="h-[36px] px-5 mx-1 bg-taca-primary text-white border-none text-[11px] font-extrabold cursor-pointer hover:bg-taca-primary-hover transition-colors rounded-[6px]">
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Delivery Location */}
          <div className="flex items-center cursor-pointer text-white flex-shrink-0 ml-auto">
            <div className="flex flex-col text-[11px] font-semibold leading-snug">
              <span>⌖  Giao đến:</span>
              <span className="font-bold">Quận 1, TP.HCM</span>
            </div>
          </div>

          {/* User */}
          {user ? (
            <Link
              to="/account"
              className="flex items-center cursor-pointer text-white flex-shrink-0 no-underline hover:text-gray-200 transition-colors"
            >
              <span className="text-[12px] font-bold">
                ♙  {user.full_name || user.name}  ▾
              </span>
            </Link>
          ) : (
            <div
              className="flex items-center cursor-pointer text-white flex-shrink-0 hover:text-gray-200 transition-colors"
              onClick={() => openAuthModal()}
            >
              <span className="text-[12px] font-bold">
                ♙  Đăng nhập
              </span>
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" className="flex items-center text-white no-underline flex-shrink-0">
            <span className="text-[12px] font-bold">▣  Giỏ hàng  2</span>
          </Link>
        </div>
      </div>

      {/* Category Navigation Bar - White background */}
      <div className="bg-white border-b border-taca-border h-[42px] relative z-40">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-[80px] gap-0">
          <div 
            className="relative h-full flex items-center mr-12"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button className="bg-transparent border-none text-[11px] font-extrabold text-taca-text-main cursor-pointer hover:text-taca-primary transition-colors py-2 flex items-center gap-1">
              ☰  DANH MỤC SẢN PHẨM
            </button>
            <MegaMenu isOpen={isMegaMenuOpen} />
          </div>
          
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
