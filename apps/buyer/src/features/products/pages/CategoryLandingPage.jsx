import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../../search/components/FilterSidebar';
import productsMock from '../../../mocks/products.json';

const USE_CASES = [
  'Chụp ảnh đẹp', 'Gaming', 'Pin trâu', 'Giá tốt', '5G', 'Gập'
];

const BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'OPPO', 'vivo'
];

const CHIPS = ['Phổ biến', 'Bán chạy', 'Mới nhất', 'Giá thấp → cao'];

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  
  // Fake repeat the mock product to create a grid of 10 items (2 rows of 5)
  const products = Array(10).fill(productsMock[0]).map((p, i) => ({ ...p, id: i + 1 }));

  return (
    <div className="max-w-[1440px] mx-auto px-[80px] py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[13px] text-taca-text-muted">
        <Link to="/" className="text-taca-text-muted hover:text-taca-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-taca-text-main font-semibold capitalize">
          {categorySlug || 'Điện thoại'}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Category Hero */}
          <div className="w-full h-[190px] bg-[#4f46e5] rounded-[16px] flex items-center justify-center overflow-hidden">
            <h1 className="text-white text-[32px] font-extrabold uppercase tracking-wide">
              {categorySlug || 'ĐIỆN THOẠI'} CHÍNH HÃNG
            </h1>
          </div>

          {/* Khám phá theo nhu cầu */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-extrabold text-taca-text-main m-0">Khám phá theo nhu cầu</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {USE_CASES.map((uc, idx) => (
                <div key={idx} className="flex-shrink-0 w-[148px] h-[74px] bg-taca-surface rounded-lg border border-taca-border/50 flex items-center justify-center font-bold text-[14px] text-taca-text-main hover:border-taca-primary cursor-pointer transition-colors">
                  {uc}
                </div>
              ))}
            </div>
          </div>

          {/* Thương hiệu nổi bật */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-extrabold text-taca-text-main m-0">Thương hiệu nổi bật</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {BRANDS.map((brand, idx) => (
                <div key={idx} className="flex-shrink-0 w-[176px] h-[54px] bg-white rounded-lg border border-taca-border/80 flex items-center justify-center font-bold text-[15px] text-taca-text-main hover:shadow-md cursor-pointer transition-all">
                  {brand}
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm nổi bật */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[20px] font-extrabold text-taca-text-main m-0">Sản phẩm nổi bật</h2>
            
            <div className="flex gap-3">
              {CHIPS.map((chip, idx) => (
                <button key={idx} className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-colors ${idx === 0 ? 'bg-taca-primary text-white border-taca-primary' : 'bg-white text-taca-text-main border-taca-border hover:border-taca-primary'}`}>
                  {chip}
                </button>
              ))}
            </div>

            {/* Product Grid - 5 columns as per Penpot (1038px width / 202px = 5. Gap = 2) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
                />
              ))}
            </div>
          </div>
          
          {/* Deal theo thương hiệu */}
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-[20px] font-extrabold text-taca-text-main m-0">Deal theo thương hiệu</h2>
            <div className="flex gap-4">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="flex-1 h-[74px] bg-red-50 rounded-lg border border-red-100 flex items-center justify-center font-bold text-red-600 cursor-pointer hover:bg-red-100 transition-colors">
                  Giảm đến 50%
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage;
