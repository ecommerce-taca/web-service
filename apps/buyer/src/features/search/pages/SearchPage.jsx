import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    <div className="max-w-[1440px] mx-auto px-4 lg:px-[80px] py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] font-semibold text-taca-text-muted mb-6">
        <Link to="/" className="text-taca-text-muted no-underline hover:text-taca-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-taca-text-main">Tìm kiếm sản phẩm</span>
      </div>

      {/* Page Title & Stats */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-taca-text-main m-0 mb-1">
            {query ? (
              <>Kết quả tìm kiếm cho <span className="text-taca-primary">"{query}"</span></>
            ) : (
              'Tất cả sản phẩm'
            )}
          </h1>
          <div className="text-[13px] text-taca-text-muted">
            Tìm thấy <span className="font-semibold text-taca-text-main">{totalCount}</span> sản phẩm phù hợp
          </div>
        </div>

        {/* Active Filters Pills */}
        {(brand || category !== 'all' || priceRange !== 'all' || isOfficial) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-taca-text-muted">Đang lọc theo:</span>
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-taca-text-main px-2.5 py-1 rounded-full">
                Danh mục: {category}
                <button type="button" onClick={() => updateParam('category', 'all')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-taca-text-main px-2.5 py-1 rounded-full">
                Thương hiệu: {brand}
                <button type="button" onClick={() => updateParam('brand', '')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-taca-text-main px-2.5 py-1 rounded-full">
                Mức giá: {priceRange}
                <button type="button" onClick={() => updateParam('priceRange', 'all')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {isOfficial && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-taca-primary/10 text-taca-primary px-2.5 py-1 rounded-full font-medium">
                Chính hãng 100%
                <button type="button" onClick={() => updateParam('official', false)} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-taca-primary hover:underline ml-1 font-medium"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-[240px] flex-shrink-0">
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
          />
          
          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-[12px] p-3 flex flex-col gap-3">
                  <div className="w-full aspect-square bg-gray-200 rounded-[8px]"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Products Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center my-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="text-[16px] font-bold text-taca-text-main mb-1">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="text-[13px] text-taca-text-muted max-w-md mb-6">
                Hãy thử kiểm tra lỗi chính tả hoặc loại bỏ bớt các bộ lọc để có thêm kết quả tìm kiếm.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-taca-primary text-white rounded-lg text-[13px] font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
