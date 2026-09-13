import { useParams, Link } from 'react-router-dom';
import ProductPurchase from '../components/ProductPurchase';
import ProductShopCard from '../components/ProductShopCard';
import ProductContentTabs from '../components/ProductContentTabs';
import ProductReviews from '../components/ProductReviews';

// Giả lập lấy dữ liệu từ mock API
import productsMock from '../../../mocks/products.json';

const ProductDetailPage = () => {
  const { id } = useParams();
  
  // Thông thường sẽ gọi API thông qua custom hook ở đây
  // VD: const { data: product, loading, error } = useProductDetail(id);
  // Tạm thời dùng mock data luôn:
  const product = productsMock.find(p => p.id === parseInt(id)) || productsMock[0]; 

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-[80px] py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[13px] text-taca-text-muted">
        <Link to="/" className="text-taca-text-muted hover:text-taca-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/category/dien-thoai" className="text-taca-text-muted hover:text-taca-primary transition-colors">Điện thoại</Link>
        <span>/</span>
        <span className="text-taca-text-main font-semibold">{product.name}</span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Product Purchase (Gallery & Info) */}
        <ProductPurchase product={product} />
        
        {/* Shop Card */}
        {product.shop && <ProductShopCard shop={product.shop} />}
        
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
    </div>
  );
};

export default ProductDetailPage;
