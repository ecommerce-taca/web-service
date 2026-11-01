import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import searchApi from '../../features/search/services/search.api';
import SearchSuggestDropdown from '../../features/search/components/SearchSuggestDropdown';
import { BrandLogo } from '@taca/ui-components';

const WhiteHeader = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ keywords: [], categories: [], topProducts: [] });
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounce 250ms gọi API gợi ý tức thì GET /search/suggest?q=... (MISS-001)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions({ keywords: [], categories: [], topProducts: [] });
      setIsSuggestOpen(false);
      setIsSuggestLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsSuggestLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.getSuggestions(trimmed, { signal: controller.signal });
        const data = res?.data || res;
        if (data) {
          setSuggestions(data);
          setIsSuggestOpen(true);
        }
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          console.warn('Failed to fetch search suggestions', err);
        }
      } finally {
        setIsSuggestLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Đóng Search Suggest Dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isSuggestOpen) return;

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSuggestOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSuggestOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSuggestOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSuggestOpen(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col shadow-sm">
      {/* Trust Strip - Top Blue Banner */}
      <div className="hidden bg-taca-primary h-[32px] items-center md:flex">
        <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center px-4 sm:px-6 lg:px-[80px]">
          <span className="truncate text-white text-[11px] font-bold uppercase tracking-wider">
            100% HÀNG THẬT · FREESHIP MỌI ĐƠN · HOÀN 200% NẾU HÀNG GIẢ · ĐỔI TRẢ 30 NGÀY
          </span>
          <span className="text-white text-[11px] font-semibold flex items-center gap-4">
            <span className="cursor-pointer hover:text-gray-200">Trung tâm hỗ trợ</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar - White background */}
      <div className="bg-white min-h-[64px] sm:h-[78px] border-b border-taca-border">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-4 sm:px-6 lg:px-[80px] gap-2.5 sm:gap-5 lg:gap-6">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Taca - Trang chủ"
            className="flex-shrink-0 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
          >
            <BrandLogo
              alt=""
              decorative
              width={204}
              height={46}
              className="w-[88px] sm:w-[112px] lg:w-[128px] max-h-[36px] object-contain"
            />
          </Link>

          {/* Search Bar - 620px wide with auto-suggest dropdown */}
          <div className="relative flex-1 min-w-0 max-w-[620px] h-[40px] sm:h-[44px] sm:ml-3 lg:ml-8" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="flex items-center bg-white h-full w-full border-2 border-taca-primary rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-taca-primary/20 transition-shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) {
                    setIsSuggestOpen(true);
                  }
                }}
                placeholder="Tìm sản phẩm, thương hiệu và cửa hàng"
                autoComplete="off"
                className="flex-1 min-w-0 h-full px-3 sm:px-4 border-none outline-none text-[12px] sm:text-[13px] font-normal text-taca-text-main placeholder:text-gray-400"
              />
              <button type="submit" aria-label="Tìm kiếm" className="h-[32px] sm:h-[36px] px-3 sm:px-6 mx-1 bg-taca-primary text-white border-none text-[11px] sm:text-[12px] font-extrabold cursor-pointer hover:bg-taca-primary-hover transition-colors rounded-[6px] flex items-center justify-center shrink-0">
                <span className="hidden sm:inline">Tìm kiếm</span>
                <Search className="w-4 h-4 sm:hidden" />
              </button>
            </form>

            <SearchSuggestDropdown
              query={searchQuery}
              suggestions={suggestions}
              loading={isSuggestLoading}
              isOpen={isSuggestOpen}
              onSelectKeyword={(kw) => {
                setSearchQuery(kw);
                setIsSuggestOpen(false);
                navigate(`/search?q=${encodeURIComponent(kw)}`);
              }}
              onSelectCategory={(cat) => {
                setIsSuggestOpen(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery || cat.name)}&category=${encodeURIComponent(cat.id || cat.slug)}`);
              }}
              onSelectProduct={(prd) => {
                setIsSuggestOpen(false);
                navigate(`/product/${prd.id}`);
              }}
            />
          </div>

          {/* Delivery Location */}
          <div className="hidden xl:flex items-center cursor-pointer text-taca-text-main flex-shrink-0 ml-auto">
            <div className="flex flex-col text-[11px] font-semibold leading-snug">
              <span className="text-taca-text-muted">Giao đến</span>
              <span className="font-bold">Quận 1, TP.HCM</span>
            </div>
          </div>

          {/* User */}
          <button
            type="button"
            aria-label={user ? 'Tài khoản' : 'Đăng nhập'}
            className="hidden md:flex flex-col cursor-pointer text-taca-text-main flex-shrink-0 bg-transparent border-none p-1.5 rounded-lg hover:bg-taca-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
            onClick={() => user ? navigate('/account/overview') : openAuthModal()}
          >
            <span className="text-[11px] font-semibold text-taca-text-muted leading-snug">
              Tài khoản
            </span>
            <span className="text-[12px] font-bold leading-snug">
              {user ? `${user.full_name || 'Người dùng'} ▾` : 'Đăng nhập'}
            </span>
          </button>

          {/* Cart */}
          <Link to="/cart" aria-label="Giỏ hàng 2" className="flex items-center justify-center h-[40px] px-2 sm:px-3 border border-taca-border rounded-lg text-taca-primary hover:border-taca-primary hover:bg-taca-primary-light transition-colors no-underline flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30">
            <ShoppingCart className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline text-[13px] font-bold">Giỏ hàng 2</span>
          </Link>
        </div>
      </div>

      {/* Category Navigation Bar - White background */}
      <div className="bg-white border-b border-taca-border h-[42px]">
        <div className="max-w-[1440px] mx-auto h-full flex items-center px-4 sm:px-6 lg:px-[80px] gap-0">
          <button className="bg-transparent border-none text-[12px] font-bold text-taca-text-main cursor-pointer hover:text-taca-primary transition-colors py-2 mr-12 flex items-center gap-2">
            <Menu className="w-4 h-4 text-taca-text-muted" />
            <span>Danh mục</span>
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
