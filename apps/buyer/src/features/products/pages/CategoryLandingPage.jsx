import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productsMock from '../../../mocks/products.json';

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  
  // Fake repeat the mock product to create a grid
  const products = Array(12).fill(productsMock[0]).map((p, i) => ({ ...p, id: i + 1 }));

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="text-[14px] text-muted">
        Trang chủ / {categorySlug || 'Điện thoại'}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold text-main uppercase">
          {categorySlug || 'ĐIỆN THOẠI'}
        </h1>
        <div className="flex items-center gap-2 text-[14px] text-main">
          Sắp xếp theo:
          <select className="border border-border p-2 bg-white rounded-none outline-none focus:border-primary">
            <option>Phổ biến nhất</option>
            <option>Giá thấp đến cao</option>
            <option>Giá cao xuống thấp</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="w-[240px] flex-shrink-0 bg-white p-4 border border-border hidden lg:block">
          <h3 className="font-bold text-[16px] text-main mb-4 uppercase">Bộ Lọc Tìm Kiếm</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[14px] text-main">Khoảng Giá</span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Từ" className="w-full border border-border p-2 text-[12px] bg-surface outline-none focus:border-primary" />
                <span>-</span>
                <input type="text" placeholder="Đến" className="w-full border border-border p-2 text-[12px] bg-surface outline-none focus:border-primary" />
              </div>
              <button className="bg-primary text-white font-bold text-[12px] py-2 hover:bg-primary-hover">ÁP DỤNG</button>
            </div>
            
            <div className="h-[1px] bg-border my-2"></div>
            
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[14px] text-main">Thương hiệu</span>
              <label className="flex items-center gap-2 text-[14px] text-main cursor-pointer">
                <input type="checkbox" className="accent-primary" /> Apple
              </label>
              <label className="flex items-center gap-2 text-[14px] text-main cursor-pointer">
                <input type="checkbox" className="accent-primary" /> Samsung
              </label>
              <label className="flex items-center gap-2 text-[14px] text-main cursor-pointer">
                <input type="checkbox" className="accent-primary" /> Xiaomi
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard 
              key={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              isOfficial={product.isOfficial}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage;
