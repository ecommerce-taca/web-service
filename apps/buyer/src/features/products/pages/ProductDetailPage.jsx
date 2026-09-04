import { useParams } from 'react-router-dom';
import ProductPurchase from '../components/ProductPurchase';
import ProductShopCard from '../components/ProductShopCard';
import ProductContentTabs from '../components/ProductContentTabs';
import ProductReviews from '../components/ProductReviews';

// Giả lập lấy dữ liệu từ mock API
import productsMock from '../../../../mocks/products.json';

const ProductDetailPage = () => {
  const { id } = useParams();
  
  // Thông thường sẽ gọi API thông qua custom hook ở đây
  // VD: const { data: product, loading, error } = useProductDetail(id);
  // Tạm thời dùng mock data luôn:
  const product = productsMock.find(p => p.id === parseInt(id)) || productsMock[0]; 

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="text-[14px] text-muted">
        Trang chủ / Điện thoại / iPhone / {product.name}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Gallery */}
        <div className="lg:col-span-5 bg-white p-4 border border-border flex flex-col gap-4">
          <div className="w-full aspect-square bg-surface flex items-center justify-center text-muted">
            [Product Image Main]
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images && product.images.map((img, i) => (
              <div key={i} className="w-[60px] h-[60px] flex-shrink-0 bg-surface border border-transparent hover:border-primary cursor-pointer flex items-center justify-center text-[10px]">
                Thumb {i+1}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info & Purchase, Shop, Tabs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ProductPurchase product={product} />
          
          {product.shop && <ProductShopCard shop={product.shop} />}
        </div>
      </div>
      
      {/* Content Tabs */}
      <ProductContentTabs 
        description={product.description} 
        reviewCount={product.reviewCount} 
      />

      {/* Ratings & Comments */}
      <ProductReviews 
        rating={product.rating} 
        reviewCount={product.reviewCount} 
      />
    </div>
  );
};

export default ProductDetailPage;
