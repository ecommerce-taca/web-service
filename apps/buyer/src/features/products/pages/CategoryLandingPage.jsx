import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Sparkles,
  ArrowUp,
  Smartphone,
  Laptop,
  Utensils,
  Shirt,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Star,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../../search/components/FilterSidebar';
import { productApi } from '../services/product.api';
import { useFavorites } from '../hooks/useFavorites';

const PRICE_MAP = {
  'under-5m': { minPrice: 0, maxPrice: 5000000 },
  '5m-15m': { minPrice: 5000000, maxPrice: 15000000 },
  'over-15m': { minPrice: 15000000, maxPrice: 999999999 },
};

const USE_CASES = [
  'Chụp ảnh đẹp', 'Gaming & Đồ họa', 'Pin trâu', 'Học tập & Văn phòng', '5G Siêu tốc', 'Gập cao cấp'
];

const BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo', 'Sony', 'Anker'
];

const CHIPS = [
  { id: 'popular', label: 'Phổ biến', icon: Flame },
  { id: 'sales', label: 'Bán chạy', icon: Zap },
  { id: 'newest', label: 'Mới nhất', icon: Sparkles },
  { id: 'price-asc', label: 'Giá thấp → cao', icon: ArrowUp },
];

const CATEGORY_THEMES = {
  'dien-thoai': {
    title: 'ĐIỆN THOẠI & PHỤ KIỆN CHÍNH HÃNG',
    subtitle: 'Apple, Samsung, Xiaomi, OPPO · Trả góp 0% · Giao nhanh 2H',
    bgGradient: 'from-[#F4F8FF] via-[#EEF5FF] to-white',
    icon: Smartphone,
  },
  'laptop': {
    title: 'LAPTOP & MÁY TÍNH XÁCH TAY',
    subtitle: 'MacBook, Dell, Asus, Lenovo · Hiệu năng vượt trội · Bảo hành 24T',
    bgGradient: 'from-[#F4F8FF] via-[#EEF5FF] to-white',
    icon: Laptop,
  },
  'gia-dung': {
    title: 'GIA DỤNG & NHÀ BẾP THÔNG MINH',
    subtitle: 'Lock&Lock, Philips, Tefal · Tiện nghi cuộc sống gia đình',
    bgGradient: 'from-[#F4F8FF] via-[#F7FBFA] to-white',
    icon: Utensils,
  },
  'thoi-trang': {
    title: 'THỜI TRANG & PHỤ KIỆN XUÂN HÈ',
    subtitle: 'Quần áo, Giày dép, Túi xách · Xu hướng mới nhất 2026',
    bgGradient: 'from-[#FFF7F8] via-[#FFF9F7] to-white',
    icon: Shirt,
  },
  'nha-sach': {
    title: 'NHÀ SÁCH & VĂN PHÒNG PHẨM',
    subtitle: 'Sách kinh tế, Kỹ năng sống, Văn học · Tuyển chọn tinh hoa tri thức',
    bgGradient: 'from-[#FFF9ED] via-[#FFFBF4] to-white',
    icon: BookOpen,
  },
};

const CategoryLandingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const brand = searchParams.get('brand') || '';
  const priceRange = searchParams.get('priceRange') || 'all';
  const isOfficial = searchParams.get('official') === 'true';
  const minRating = Number(searchParams.get('rating')) || 0;

  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('popular');

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === '' || value === 'all' || value === false || value === 0) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleCategoryChange = (newCatId) => {
    if (newCatId === 'all') {
      navigate('/search');
    } else {
      navigate(`/category/${newCatId}`);
    }
  };

  const currentTheme = CATEGORY_THEMES[categorySlug] || {
    title: `${(categorySlug || 'DANH MỤC').replace(/-/g, ' ').toUpperCase()} CHÍNH HÃNG`,
    subtitle: 'Cam kết 100% hàng thật · Ưu đãi độc quyền hôm nay',
    bgGradient: 'from-[#F4F8FF] via-[#EEF5FF] to-white',
    icon: Layers,
  };
  const ThemeIcon = currentTheme.icon;

  useEffect(() => {
    let isMounted = true;
    const targetCatId = subCategorySlug || categorySlug || 'dien-thoai';
    productApi.getCategoryById(targetCatId)
      .then(res => {
        if (!isMounted) return;
        setCategoryInfo(res?.data || null);
      })
      .catch(err => {
        console.warn('[CategoryLandingPage] Lỗi lấy thông tin danh mục:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const priceBounds = PRICE_MAP[priceRange] || {};
    const targetCatId = subCategorySlug || categorySlug || 'dien-thoai';

    productApi.getProducts({ 
      category: targetCatId !== 'all' ? targetCatId : undefined,
      brand: brand || undefined,
      minPrice: priceBounds.minPrice,
      maxPrice: priceBounds.maxPrice,
      isOfficial: isOfficial || undefined,
      rating: minRating || undefined,
      sort: activeChip,
      size: 16
    })
      .then(res => {
        if (isMounted) {
          setProducts(res.data?.items || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to load category products', err);
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, subCategorySlug, brand, priceRange, isOfficial, minRating, activeChip]);
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="py-4 sm:py-6 flex flex-col gap-brand-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-taca-text-muted">
        <Link to="/" className="text-taca-text-muted no-underline hover:text-taca-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/category" className="text-taca-text-muted no-underline hover:text-taca-primary transition-colors">
          Danh mục
        </Link>
        <span>/</span>
        <span className="text-taca-text-main font-bold capitalize">
          {categoryInfo?.name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Điện thoại')} {subCategorySlug ? `- ${subCategorySlug.replace(/-/g, ' ')}` : ''}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <FilterSidebar 
            selectedCategory={categorySlug || 'dien-thoai'}
            onCategoryChange={handleCategoryChange}
            selectedBrand={brand}
            onBrandChange={(val) => updateParam('brand', val)}
            selectedPriceRange={priceRange}
            onPriceRangeChange={(val) => updateParam('priceRange', val)}
            isOfficialOnly={isOfficial}
            onOfficialChange={(val) => updateParam('official', val)}
            minRating={minRating}
            onRatingChange={(val) => updateParam('rating', val)}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
          {/* Category Hero Banner */}
          <div className={`w-full min-h-[220px] bg-gradient-to-r ${currentTheme.bgGradient} rounded-panel p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative shadow-brand border border-taca-border`}>
            <div className="flex flex-col gap-2.5 z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-pill bg-white text-taca-primary text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-taca-border">
                  <ShieldCheck className="w-3.5 h-3.5 text-taca-primary" />
                  CHÍNH HÃNG 100%
                </span>
                <span className="px-2.5 py-1 rounded-pill bg-taca-warning text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  FREESHIP 0Đ
                </span>
              </div>

              <h1 className="text-taca-text-main text-[26px] sm:text-[32px] font-black uppercase m-0 leading-tight tracking-tight">
                {categoryInfo?.name || currentTheme.title}
              </h1>

              <p className="text-taca-text-muted text-[13px] font-medium leading-relaxed m-0">
                {currentTheme.subtitle}
              </p>

              <div className="pt-2">
                <Link
                  to="/search?q=deal"
                  className="inline-flex items-center gap-2 bg-taca-primary text-white font-extrabold text-[12px] px-6 py-2.5 rounded-control hover:bg-taca-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 transition-colors shadow-brand no-underline w-fit cursor-pointer group"
                >
                  <span>Khám phá Deal Hôm Nay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Icon Graphic */}
            <div className="hidden md:flex w-28 h-28 rounded-panel bg-white/80 border border-taca-border items-center justify-center shadow-brand text-taca-primary">
              <ThemeIcon className="w-14 h-14 text-taca-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Nhu cầu sử dụng & Thương hiệu (Quick Filter Chips) */}
          <div className="bg-white p-4 sm:p-5 rounded-card border border-taca-border shadow-brand space-y-4">
            {/* Nhu cầu sử dụng */}
            <div>
              <div className="text-[12px] font-extrabold text-taca-text-muted uppercase tracking-wider mb-2">
                Nhu cầu sử dụng nổi bật
              </div>
              <div className="flex flex-wrap gap-2">
                {USE_CASES.map(useCase => (
                  <Link
                    key={useCase}
                    to={`/search?q=${encodeURIComponent(useCase)}`}
                    className="px-3.5 py-1.5 bg-taca-surface hover:bg-taca-primary-light border border-taca-border hover:border-taca-primary/40 rounded-control text-[12px] text-taca-text-main hover:text-taca-primary font-semibold transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
                  >
                    {useCase}
                  </Link>
                ))}
              </div>
            </div>

            {/* Thương hiệu */}
            <div>
              <div className="text-[12px] font-extrabold text-taca-text-muted uppercase tracking-wider mb-2">
                Thương hiệu hàng đầu
              </div>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map(brand => (
                  <Link
                    key={brand}
                    to={`/search?brand=${brand}`}
                    className="px-4 py-1.5 bg-white hover:bg-taca-primary-light border border-taca-border hover:border-taca-primary/40 rounded-control text-[12px] font-bold text-taca-text-main hover:text-taca-primary transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Danh sách sản phẩm */}
          <div className="space-y-4">
            {/* Header: Sắp xếp theo chip & Nút mở lọc trên mobile */}
            <div className="bg-white p-3 sm:p-4 rounded-card border border-taca-border shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-extrabold text-taca-text-main">
                  Sản phẩm trong ngành ({products.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 text-[12px] rounded-control font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-taca-primary-light text-taca-primary hover:bg-taca-primary/10 border border-taca-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Bộ lọc</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CHIPS.map(chip => {
                  const ChipIcon = chip.icon;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActiveChip(chip.id)}
                      className={`px-3 py-1.5 text-[12px] rounded-control font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 ${
                        activeChip === chip.id 
                          ? 'bg-taca-primary text-white shadow-xs' 
                          : 'bg-taca-surface text-taca-text-muted hover:bg-taca-primary-light hover:text-taca-primary border border-transparent hover:border-taca-primary/20'
                      }`}
                    >
                      <ChipIcon className={`w-3.5 h-3.5 ${activeChip === chip.id ? 'text-white' : 'text-taca-text-muted'}`} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Badges */}
            {(brand || priceRange !== 'all' || isOfficial || minRating > 0) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-control border border-taca-border shadow-brand">
                <span className="text-[12px] font-bold text-taca-text-muted">Đang lọc:</span>
                {brand && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-taca-primary-light text-taca-primary border border-taca-primary/20 px-3 py-1 rounded-pill">
                    <span>Hãng: {brand}</span>
                    <button type="button" onClick={() => updateParam('brand', '')} className="hover:text-rose-600 cursor-pointer flex items-center bg-transparent border-none p-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                    <span>Giá: {priceRange}</span>
                    <button type="button" onClick={() => updateParam('priceRange', 'all')} className="hover:text-rose-600 cursor-pointer flex items-center bg-transparent border-none p-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {isOfficial && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-taca-primary-light text-taca-primary border border-taca-primary/20 px-3 py-1 rounded-pill">
                    <ShieldCheck className="w-3.5 h-3.5 text-taca-primary" />
                    <span>Mall Chính hãng</span>
                    <button type="button" onClick={() => updateParam('official', false)} className="hover:text-rose-600 cursor-pointer flex items-center bg-transparent border-none p-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Từ {minRating} sao</span>
                    <button type="button" onClick={() => updateParam('rating', 0)} className="hover:text-rose-600 cursor-pointer flex items-center bg-transparent border-none p-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[12px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-1 cursor-pointer transition-colors bg-transparent border-none p-0"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white border border-taca-border rounded-card p-4 flex flex-col gap-3 shadow-brand">
                    <div className="w-full aspect-square bg-taca-surface rounded-control"></div>
                    <div className="h-4 bg-taca-surface rounded w-3/4"></div>
                    <div className="h-4 bg-taca-surface rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    discount={product.discount}
                    isOfficial={product.isOfficial}
                    image={product.image}
                    rating={product.rating}
                    soldCount={product.soldCount}
                    tags={product.tags}
                    isFavorite={isFavorite(product.id)}
                    onToggleFavorite={() => toggleFavorite(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-taca-text-muted bg-white rounded-card border border-dashed border-taca-border">
                Chưa có sản phẩm nào trong danh mục này
              </div>
            )}
          </div>
          
          {/* Deal theo thương hiệu */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[16px] font-black text-taca-text-main m-0 uppercase tracking-tight">
              ƯU ĐÃI THƯƠNG HIỆU HÀNG ĐẦU
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/search?brand=Apple"
                className="min-h-[128px] p-4 rounded-card bg-white text-taca-text-main flex flex-col justify-between shadow-brand hover:shadow-brand-md transition-shadow no-underline group border border-taca-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill bg-taca-primary-light text-taca-primary">
                    APPLE WEEK
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-taca-primary transition-colors">
                    Giảm Đến 5 Triệu Đồng
                  </div>
                </div>
                <span className="text-[11px] font-bold text-taca-text-muted mt-3 flex items-center gap-1 group-hover:text-taca-primary transition-colors">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/search?brand=Samsung"
                className="min-h-[128px] p-4 rounded-card bg-white text-taca-text-main flex flex-col justify-between shadow-brand hover:shadow-brand-md transition-shadow no-underline group border border-taca-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill bg-taca-primary-light text-taca-primary">
                    SAMSUNG GALAXY AI
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-taca-primary transition-colors">
                    Tặng Quà Lên Đến 3 Triệu
                  </div>
                </div>
                <span className="text-[11px] font-bold text-taca-text-muted mt-3 flex items-center gap-1 group-hover:text-taca-primary transition-colors">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/search?brand=Anker"
                className="min-h-[128px] p-4 rounded-card bg-white text-taca-text-main flex flex-col justify-between shadow-brand hover:shadow-brand-md transition-shadow no-underline group border border-taca-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill bg-taca-primary-light text-taca-primary">
                    ANKER GANPRIME
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-taca-primary transition-colors">
                    Sạc Siêu Nhanh Freeship 0Đ
                  </div>
                </div>
                <span className="text-[11px] font-bold text-taca-text-muted mt-3 flex items-center gap-1 group-hover:text-taca-primary transition-colors">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-taca-text-main/35 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-[min(320px,calc(100vw-24px))] bg-white h-full shadow-brand-lg p-5 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-taca-border mb-4">
              <h3 className="text-[16px] font-bold text-taca-text-main m-0 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-taca-primary" />
                <span>Bộ lọc tìm kiếm</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-taca-text-muted hover:text-taca-primary hover:bg-taca-primary-light transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <FilterSidebar 
                selectedCategory={categorySlug || 'dien-thoai'}
                onCategoryChange={(val) => {
                  handleCategoryChange(val);
                  setIsMobileFilterOpen(false);
                }}
                selectedBrand={brand}
                onBrandChange={(val) => updateParam('brand', val)}
                selectedPriceRange={priceRange}
                onPriceRangeChange={(val) => updateParam('priceRange', val)}
                isOfficialOnly={isOfficial}
                onOfficialChange={(val) => updateParam('official', val)}
                minRating={minRating}
                onRatingChange={(val) => updateParam('rating', val)}
                onResetFilters={handleResetFilters}
              />
            </div>
            <div className="pt-4 border-t border-taca-border mt-4">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-control bg-taca-primary text-white font-bold text-[13px] shadow-brand hover:bg-taca-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 transition-colors cursor-pointer"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryLandingPage;
