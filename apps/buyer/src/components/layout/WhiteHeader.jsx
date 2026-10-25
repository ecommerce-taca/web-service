import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import searchApi from '../../features/search/services/search.api';
import SearchSuggestDropdown from '../../features/search/components/SearchSuggestDropdown';

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
      <div className="bg-taca-primary h-[32px] flex items-center">
        <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center px-[80px]">
          <span className="text-white text-[11px] font-bold uppercase tracking-wider">
            100% HÀNG THẬT · FREESHIP MỌI ĐƠN · HOÀN 200% NẾU HÀNG GIẢ · ĐỔI TRẢ 30 NGÀY
          </span>
          <span className="text-white text-[11px] font-semibold flex items-center gap-4">
            <span className="cursor-pointer hover:text-gray-200">Trung tâm hỗ trợ</span>
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

          {/* Search Bar - 620px wide with auto-suggest dropdown */}
          <div className="relative w-[620px] h-[44px] flex-shrink-0 ml-8" ref={searchContainerRef}>
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
                placeholder="⌕  Tìm sản phẩm, thương hiệu và cửa hàng"
                autoComplete="off"
                className="flex-1 h-full px-4 border-none outline-none text-[12px] font-normal text-taca-text-main placeholder:text-gray-400"
              />
              <button type="submit" className="h-[36px] px-6 mx-1 bg-taca-primary text-white border-none text-[12px] font-extrabold cursor-pointer hover:bg-taca-primary-hover transition-colors rounded-[6px]">
                Tìm kiếm
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
          <div className="flex items-center cursor-pointer text-taca-text-main flex-shrink-0 ml-auto">
            <div className="flex flex-col text-[11px] font-semibold leading-snug">
              <span className="text-taca-text-muted">Giao đến</span>
              <span className="font-bold">Quận 1, TP.HCM</span>
            </div>
          </div>

          {/* User */}
          <div
            className="flex flex-col cursor-pointer text-taca-text-main flex-shrink-0"
            onClick={() => user ? navigate('/account/overview') : openAuthModal()}
          >
            <span className="text-[11px] font-semibold text-taca-text-muted leading-snug">
              Tài khoản
            </span>
            <span className="text-[12px] font-bold leading-snug">
              {user ? `${user.full_name || 'Người dùng'} ▾` : 'Đăng nhập'}
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
