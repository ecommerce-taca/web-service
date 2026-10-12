import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Star, Search, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import SortBar from '../components/SortBar';
import ProductCard from '../../products/components/ProductCard';
import { productApi } from '../../products/services/product.api';
import { useFavorites } from '../../products/hooks/useFavorites';

const PRICE_MAP = {
  'under-5m': { minPrice: 0, maxPrice: 5000000 },
  '5m-15m': { minPrice: 5000000, maxPrice: 15000000 },
  'over-15m': { minPrice: 15000000, maxPrice: 999999999 },
};

const SUGGESTED_KEYWORDS = [
  'iPhone 16 Pro Max', 'MacBook Air M3', 'Củ sạc Anker 65W', 'Atomic Habits', 'Nồi chiên Lock&Lock', 'Tai nghe Sony WH-1000XM5'
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const brand = searchParams.get('brand') || '';
  const priceRange = searchParams.get('priceRange') || 'all';
  const sort = searchParams.get('sort') || 'popular';
  const isOfficial = searchParams.get('official') === 'true';
  const minRating = Number(searchParams.get('rating')) || 0;

  // Local state for fetched products
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Favorites hook integration
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch products whenever search params change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const priceBounds = PRICE_MAP[priceRange] || {};
    const params = {
      q: query,
      category: category !== 'all' ? category : undefined,
      brand: brand || undefined,
      minPrice: priceBounds.minPrice,
      maxPrice: priceBounds.maxPrice,
      sort,
      isOfficial: isOfficial || undefined,
      rating: minRating || undefined,
    };

    productApi.getProducts(params)
      .then(res => {
        if (isMounted) {
          const items = res.data?.items || [];
          setProducts(items);
          setTotalCount(res.data?.total || items.length);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to search products', err);
          setProducts([]);
          setTotalCount(0);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query, category, brand, priceRange, sort, isOfficial, minRating]);

  // Helper to update specific param while keeping other params intact
  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === '' || value === 'all' || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      if (prev.get('q')) next.set('q', prev.get('q'));
      return next;
    });
  };

  return (
    <div className="py-2 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
        <Link to="/" className="text-slate-500 no-underline hover:text-indigo-600 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Tìm kiếm sản phẩm</span>
        {query && (
          <>
            <span>/</span>
            <span className="text-indigo-600 font-bold">"{query}"</span>
          </>
        )}
      </div>

      {/* Page Title & Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-slate-900 m-0 mb-1 tracking-tight">
            {query ? (
              <>Kết quả tìm kiếm cho: <span className="text-indigo-600 font-extrabold">"{query}"</span></>
            ) : (
              'Tất cả sản phẩm trên Taca'
            )}
          </h1>
          <div className="text-[13px] text-slate-500 font-medium">
            Tìm thấy <span className="font-extrabold text-slate-900">{totalCount}</span> sản phẩm phù hợp
          </div>
        </div>

        {/* Active Filters Pills */}
        {(brand || category !== 'all' || priceRange !== 'all' || isOfficial || minRating > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-slate-500">Đang lọc:</span>
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full shadow-2xs">
                <span>Danh mục: {category}</span>
                <button type="button" onClick={() => updateParam('category', 'all')} className="hover:text-rose-600 cursor-pointer flex items-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
                <span>Hãng: {brand}</span>
                <button type="button" onClick={() => updateParam('brand', '')} className="hover:text-rose-600 cursor-pointer flex items-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                <span>Giá: {priceRange}</span>
                <button type="button" onClick={() => updateParam('priceRange', 'all')} className="hover:text-rose-600 cursor-pointer flex items-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isOfficial && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Mall Chính hãng</span>
                <button type="button" onClick={() => updateParam('official', false)} className="hover:text-rose-600 cursor-pointer flex items-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Từ {minRating} sao</span>
                <button type="button" onClick={() => updateParam('rating', 0)} className="hover:text-rose-600 cursor-pointer flex items-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[12px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-1 cursor-pointer transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-[250px] flex-shrink-0">
          <FilterSidebar
            selectedCategory={category}
            onCategoryChange={(val) => updateParam('category', val)}
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

        {/* Right Content */}
        <div className="flex-1 min-w-0 w-full">
          {/* Sorting Bar */}
          <SortBar
            currentSort={sort}
            onSortChange={(newSort) => updateParam('sort', newSort)}
            totalCount={totalCount}
          />
          
          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
                  <div className="w-full aspect-square bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Products Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  image={product.image}
                  rating={product.rating}
                  soldCount={product.soldCount}
                  tags={product.tags}
                  isOfficial={product.isOfficial}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center my-2 shadow-2xs">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
                <Search className="w-8 h-8 text-indigo-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-[18px] font-black text-slate-900 mb-1">
                Không tìm thấy sản phẩm phù hợp
              </h3>
              <p className="text-[13px] text-slate-500 max-w-md mb-6 leading-relaxed">
                Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
              </p>

              {/* Suggested keywords */}
              <div className="space-y-3 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Gợi ý từ khóa tìm kiếm:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => updateParam('q', kw)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[12px] font-semibold text-slate-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-taca-primary hover:bg-taca-primary-hover text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer"
              >
                Xóa tất cả bộ lọc & Xem sản phẩm hot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
