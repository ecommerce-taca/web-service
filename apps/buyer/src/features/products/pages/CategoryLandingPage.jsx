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
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Category Hero */}
          <div className="w-full h-[220px] bg-taca-primary rounded-[4px] flex items-center justify-between px-10 overflow-hidden relative">
            <div className="flex flex-col gap-3 z-10">
              <h1 className="text-white text-[28px] font-bold uppercase m-0">
                {categorySlug || 'ĐIỆN THOẠI'} CHÍNH HÃNG
              </h1>
              <div className="text-white text-[14px] leading-relaxed font-medium">
                Apple - Samsung - Xiaomi - OPPO<br/>
                Ưu đãi đến 30% - Giao nhanh 2H
              </div>
              <button className="mt-2 bg-white text-taca-primary font-bold text-[14px] px-6 py-2.5 rounded-[4px] w-fit hover:bg-gray-50 transition-colors">
                Khám phá deal
              </button>
            </div>
            <div className="z-10 hidden md:block">
              <span className="text-white/90 text-[32px] font-bold uppercase tracking-wider">SMARTPHONE</span>
            </div>
          </div>

          {/* Khám phá theo nhu cầu */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-taca-text-main m-0">Khám phá theo nhu cầu</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {USE_CASES.map((uc, idx) => (
                <div key={idx} className="flex-shrink-0 w-[148px] h-[74px] bg-white rounded-[4px] border border-taca-border flex items-center justify-center font-bold text-[13px] text-taca-text-main hover:border-taca-primary cursor-pointer transition-colors shadow-sm">
                  {uc}
                </div>
              ))}
            </div>
          </div>

          {/* Thương hiệu nổi bật */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-taca-text-main m-0">Thương hiệu nổi bật</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {BRANDS.map((brand, idx) => (
                <div key={idx} className="flex-shrink-0 w-[176px] h-[54px] bg-white rounded-[4px] border border-taca-border flex items-center justify-center font-bold text-[14px] text-taca-text-main hover:border-taca-primary cursor-pointer transition-colors shadow-sm">
                  {brand}
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm nổi bật */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-taca-text-main m-0">Sản phẩm nổi bật</h2>
              <div className="flex gap-3">
                {CHIPS.map((chip, idx) => (
                  <button key={idx} className={`px-4 py-2 rounded-[24px] border text-[13px] font-semibold transition-colors ${idx === 0 ? 'bg-white text-taca-primary border-taca-primary' : 'bg-white text-taca-text-muted border-taca-border hover:border-taca-primary hover:text-taca-primary'}`}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid - 4 columns as per Penpot screenshot */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.slice(0, 8).map(product => (
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
            <h2 className="text-[16px] font-bold text-taca-text-main m-0">Deal theo thương hiệu</h2>
            <div className="flex gap-4">
              {/* Card 1 */}
              <div className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow">
                <span className="font-bold text-[14px] text-taca-primary uppercase mb-1">APPLE WEEK - giảm đến 15%</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </div>
              {/* Card 2 */}
              <div className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-border hover:border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow">
                <span className="font-bold text-[14px] text-taca-text-main uppercase mb-1">SAMSUNG AI - quà 3 triệu</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </div>
              {/* Card 3 */}
              <div className="flex-1 h-[80px] bg-white rounded-[4px] border border-taca-border hover:border-taca-primary flex flex-col justify-center px-4 cursor-pointer hover:shadow-md transition-shadow">
                <span className="font-bold text-[14px] text-taca-text-main uppercase mb-1">XIAOMI DEAL - freeship</span>
                <span className="text-[12px] text-taca-primary font-semibold">Xem sản phẩm →</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage;
