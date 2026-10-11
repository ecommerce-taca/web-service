import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../../search/components/FilterSidebar';
import { productApi } from '../services/product.api';
import { useFavorites } from '../hooks/useFavorites';

const USE_CASES = [
  'Chụp ảnh đẹp', 'Gaming', 'Pin trâu', 'Giá tốt', '5G', 'Gập'
];

const BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo'
];

const CHIPS = ['Phổ biến', 'Bán chạy', 'Mới nhất', 'Giá thấp → cao'];

const CategoryLandingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('Phổ biến');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const sortMap = {
      'Phổ biến': 'popular',
      'Bán chạy': 'sales',
      'Mới nhất': 'newest',
      'Giá thấp → cao': 'price-asc'
    };

    productApi.getProducts({ 
      category: categorySlug || 'dien-thoai',
      sort: sortMap[activeChip] || 'popular',
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
  
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[13px] text-taca-text-muted">
        <Link to="/" className="text-taca-text-muted hover:text-taca-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-taca-text-main font-semibold capitalize">
          {categorySlug ? categorySlug.replace(/-/g, ' ') : 'Điện thoại'} {subCategorySlug ? `- ${subCategorySlug.replace(/-/g, ' ')}` : ''}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
          <FilterSidebar selectedCategory={categorySlug || 'dien-thoai'} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Category Hero */}
          <div className="w-full h-[220px] bg-taca-primary rounded-[4px] flex items-center justify-between px-10 overflow-hidden relative">
            <div className="flex flex-col gap-3 z-10">
              <h1 className="text-white text-[28px] font-bold uppercase m-0">
                {subCategorySlug ? subCategorySlug.replace(/-/g, ' ') : (categorySlug ? categorySlug.replace(/-/g, ' ') : 'ĐIỆN THOẠI')} CHÍNH HÃNG
              </h1>
              <div className="text-white text-[14px] leading-relaxed font-medium">
                Apple - Samsung - Xiaomi - OPPO<br/>
                Ưu đãi đến 30% - Giao nhanh 2H
              </div>
              <Link to="/search" className="mt-2 inline-flex items-center justify-center bg-white text-taca-primary font-bold text-[14px] px-6 py-2.5 rounded-[4px] w-fit hover:bg-gray-50 transition-colors no-underline">
                Khám phá deal
              </Link>
            </div>
            {/* Visual background decoration */}
            <div className="absolute right-[-20px] top-[-20px] w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Nhu cầu sử dụng (Tags filter) */}
          <div className="flex flex-col gap-3">
            <div className="text-[13px] font-bold text-taca-text-main uppercase tracking-wider">
              Nhu cầu sử dụng
            </div>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map(useCase => (
                <Link
                  key={useCase}
                  to={`/search?q=${encodeURIComponent(useCase)}`}
                  className="px-4 py-1.5 bg-white border border-taca-border rounded-full text-[13px] text-taca-text-main font-medium hover:border-taca-primary hover:text-taca-primary transition-colors no-underline"
                >
                  {useCase}
                </Link>
              ))}
            </div>
          </div>

          {/* Thương hiệu nổi bật */}
          <div className="flex flex-col gap-3">
            <div className="text-[13px] font-bold text-taca-text-main uppercase tracking-wider">
              Thương hiệu
            </div>
            <div className="flex flex-wrap gap-3">
              {BRANDS.map(brand => (
                <Link
                  key={brand}
                  to={`/search?brand=${brand}`}
                  className="px-5 py-2 bg-white border border-taca-border rounded-[4px] text-[13px] font-bold text-taca-text-main hover:border-taca-primary hover:text-taca-primary transition-colors no-underline"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Danh sách sản phẩm */}
          <div className="flex flex-col gap-4">
            {/* Header: Sắp xếp theo chip */}
            <div className="flex items-center justify-between pb-2 border-b border-taca-border">
              <span className="text-[16px] font-bold text-taca-text-main">
                Danh sách sản phẩm ({products.length})
              </span>
              <div className="flex items-center gap-2">
                {CHIPS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveChip(chip)}
                    className={`px-3 py-1 text-[13px] rounded-full border transition-colors cursor-pointer ${
                      activeChip === chip 
                        ? 'border-taca-primary bg-[#f4f7ff] text-taca-primary font-bold' 
                        : 'border-taca-border text-taca-text-muted hover:border-taca-primary'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-[12px] p-3 flex flex-col gap-3">
                    <div className="w-full aspect-square bg-gray-200 rounded-[8px]"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có sản phẩm nào trong danh mục này
              </div>
            )}
          </div>
          
          {/* Deal theo thương hiệu */}
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-[16px] font-bold text-taca-text-main m-0">Deal theo thương hiệu</h2>
            <div className="flex gap-4">
              <Link to="/search?brand=Apple" className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow no-underline">
                <span className="font-bold text-[14px] text-taca-primary uppercase mb-1">APPLE WEEK - giảm đến 15%</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </Link>
              <Link to="/search?brand=Samsung" className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-border hover:border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow no-underline">
                <span className="font-bold text-[14px] text-taca-text-main uppercase mb-1">SAMSUNG AI - quà 3 triệu</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </Link>
              <Link to="/search?brand=Xiaomi" className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-border hover:border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow no-underline">
                <span className="font-bold text-[14px] text-taca-text-main uppercase mb-1">XIAOMI DEAL - freeship</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage;
