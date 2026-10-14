import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../../search/components/FilterSidebar';
import { productApi } from '../services/product.api';
import { useFavorites } from '../hooks/useFavorites';

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
    bgGradient: 'from-slate-950 via-indigo-950 to-blue-900',
    icon: Smartphone,
  },
  'laptop': {
    title: 'LAPTOP & MÁY TÍNH XÁCH TAY',
    subtitle: 'MacBook, Dell, Asus, Lenovo · Hiệu năng vượt trội · Bảo hành 24T',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    icon: Laptop,
  },
  'gia-dung': {
    title: 'GIA DỤNG & NHÀ BẾP THÔNG MINH',
    subtitle: 'Lock&Lock, Philips, Tefal · Tiện nghi cuộc sống gia đình',
    bgGradient: 'from-teal-950 via-emerald-950 to-slate-900',
    icon: Utensils,
  },
  'thoi-trang': {
    title: 'THỜI TRANG & PHỤ KIỆN XUÂN HÈ',
    subtitle: 'Quần áo, Giày dép, Túi xách · Xu hướng mới nhất 2026',
    bgGradient: 'from-rose-950 via-pink-950 to-slate-900',
    icon: Shirt,
  },
  'nha-sach': {
    title: 'NHÀ SÁCH & VĂN PHÒNG PHẨM',
    subtitle: 'Sách kinh tế, Kỹ năng sống, Văn học · Tuyển chọn tinh hoa tri thức',
    bgGradient: 'from-amber-950 via-yellow-950 to-slate-900',
    icon: BookOpen,
  },
};

const CategoryLandingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('popular');

  const currentTheme = CATEGORY_THEMES[categorySlug] || {
    title: `${(categorySlug || 'DANH MỤC').replace(/-/g, ' ').toUpperCase()} CHÍNH HÃNG`,
    subtitle: 'Cam kết 100% hàng thật · Ưu đãi độc quyền hôm nay',
    bgGradient: 'from-slate-950 via-indigo-950 to-blue-900',
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

    productApi.getProducts({ 
      category: categorySlug || 'dien-thoai',
      sort: activeChip,
      size: 12
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
  }, [categorySlug, activeChip]);
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="py-2 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
        <Link to="/" className="text-slate-500 no-underline hover:text-indigo-600 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/category" className="text-slate-500 no-underline hover:text-indigo-600 transition-colors">
          Danh mục
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold capitalize">
          {categoryInfo?.name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Điện thoại')} {subCategorySlug ? `- ${subCategorySlug.replace(/-/g, ' ')}` : ''}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <FilterSidebar selectedCategory={categorySlug || 'dien-thoai'} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
          {/* Category Hero Banner */}
          <div className={`w-full min-h-[220px] bg-gradient-to-r ${currentTheme.bgGradient} rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative shadow-sm border border-white/10`}>
            {/* Ambient blur glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-2.5 z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  CHÍNH HÃNG 100%
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  FREESHIP 0Đ
                </span>
              </div>

              <h1 className="text-white text-[28px] sm:text-[32px] font-black uppercase m-0 leading-tight tracking-tight drop-shadow-sm">
                {categoryInfo?.name || currentTheme.title}
              </h1>

              <p className="text-white/85 text-[13px] font-medium leading-relaxed m-0">
                {currentTheme.subtitle}
              </p>

              <div className="pt-2">
                <Link
                  to="/search?q=deal"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-extrabold text-[12px] px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-all shadow-md no-underline w-fit cursor-pointer group"
                >
                  <span>Khám phá Deal Hôm Nay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Icon Graphic */}
            <div className="hidden md:flex w-28 h-28 rounded-3xl bg-white/10 border border-white/20 items-center justify-center shadow-2xl backdrop-blur-xs transform hover:rotate-6 hover:scale-105 transition-transform duration-300 text-white">
              <ThemeIcon className="w-14 h-14 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Nhu cầu sử dụng & Thương hiệu (Quick Filter Chips) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            {/* Nhu cầu sử dụng */}
            <div>
              <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Nhu cầu sử dụng nổi bật
              </div>
              <div className="flex flex-wrap gap-2">
                {USE_CASES.map(useCase => (
                  <Link
                    key={useCase}
                    to={`/search?q=${encodeURIComponent(useCase)}`}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-[12px] text-slate-700 hover:text-indigo-600 font-semibold transition-all no-underline shadow-2xs"
                  >
                    {useCase}
                  </Link>
                ))}
              </div>
            </div>

            {/* Thương hiệu */}
            <div>
              <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Thương hiệu hàng đầu
              </div>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map(brand => (
                  <Link
                    key={brand}
                    to={`/search?brand=${brand}`}
                    className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-xl text-[12px] font-bold text-slate-800 hover:text-indigo-600 transition-all no-underline shadow-2xs"
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-extrabold text-slate-900">
                  Sản phẩm trong ngành ({products.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 text-[12px] rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-indigo-50 text-taca-primary hover:bg-indigo-100 border border-indigo-200"
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
                      className={`px-3 py-1.5 text-[12px] rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeChip === chip.id 
                          ? 'bg-taca-primary text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      <ChipIcon className={`w-3.5 h-3.5 ${activeChip === chip.id ? 'text-white' : 'text-slate-500'}`} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
                    <div className="w-full aspect-square bg-slate-100 rounded-xl"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
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
              <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                Chưa có sản phẩm nào trong danh mục này
              </div>
            )}
          </div>
          
          {/* Deal theo thương hiệu */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[16px] font-black text-slate-900 m-0 uppercase tracking-tight">
              ƯU ĐÃI THƯƠNG HIỆU HÀNG ĐẦU
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/search?brand=Apple"
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all no-underline group border border-white/10"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    APPLE WEEK
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-amber-300 transition-colors">
                    Giảm Đến 5 Triệu Đồng
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/80 mt-3 flex items-center gap-1 group-hover:text-amber-200 transition-colors">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/search?brand=Samsung"
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 text-white flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all no-underline group border border-white/10"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    SAMSUNG GALAXY AI
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-amber-300 transition-colors">
                    Tặng Quà Lên Đến 3 Triệu
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/80 mt-3 flex items-center gap-1 group-hover:text-amber-200 transition-colors">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/search?brand=Anker"
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-900 text-white flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all no-underline group border border-white/10"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    ANKER GANPRIME
                  </span>
                  <div className="text-[15px] font-black mt-2 group-hover:text-amber-300 transition-colors">
                    Sạc Siêu Nhanh Freeship 0Đ
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/80 mt-3 flex items-center gap-1 group-hover:text-amber-200 transition-colors">
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-[16px] font-bold text-slate-900 m-0 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-taca-primary" />
                <span>Bộ lọc tìm kiếm</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <FilterSidebar selectedCategory={categorySlug || 'dien-thoai'} />
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-taca-primary text-white font-bold text-[13px] shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
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
