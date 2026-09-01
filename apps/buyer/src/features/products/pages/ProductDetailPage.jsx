import { useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';

// Giả lập lấy dữ liệu từ mock API
import productsMock from '../../../mocks/products.json';

const ProductDetailPage = () => {
  const { id } = useParams();
  
  // Thông thường sẽ gọi API thông qua custom hook ở đây
  // VD: const { data: product, loading, error } = useProductDetail(id);
  // Tạm thời dùng mock data luôn:
  const product = productsMock.find(p => p.id === parseInt(id)) || productsMock[0]; 

  if (!product) return <div>Product not found</div>;

  return (
    <div className="flex flex-col gap-6">
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
            {product.images.map((img, i) => (
              <div key={i} className="w-[60px] h-[60px] flex-shrink-0 bg-surface border border-transparent hover:border-primary cursor-pointer flex items-center justify-center text-[10px]">
                Thumb {i+1}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info & Purchase */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 border border-border flex flex-col gap-4">
            {/* Title & Brand */}
            <div>
              {product.isOfficial && <span className="text-[12px] font-bold text-primary mr-2">CHÍNH HÃNG</span>}
              <h1 className="text-[24px] font-extrabold text-main inline">{product.name}</h1>
              <div className="text-[14px] text-muted mt-2">
                <span className="text-warning">★★★★★</span> {product.rating} · {product.reviewCount} đánh giá
              </div>
            </div>

            {/* Price Area */}
            <div className="bg-surface p-4 flex flex-col gap-1">
              {product.isFlashSale && (
                <div className="text-sale text-[12px] font-bold">⚡ FLASH SALE · Kết thúc trong 02:45:18</div>
              )}
              <div className="flex items-end gap-3">
                <span className="text-[32px] font-extrabold text-sale leading-none">{product.price.toLocaleString('vi-VN')} ₫</span>
                {product.originalPrice && (
                  <span className="text-[14px] text-muted line-through mb-1">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
                )}
                {product.discount && (
                  <span className="text-[12px] font-bold text-sale bg-sale/10 px-1 mb-1">-{product.discount}%</span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants.map((v, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[14px] font-bold text-main uppercase">{v.type === 'storage' ? 'Chọn phiên bản / SKU' : 'Màu sắc'}</span>
                <div className="flex flex-wrap gap-2">
                  {v.options.map(opt => (
                    <button key={opt} className="px-4 py-2 border border-border text-[14px] hover:border-primary hover:text-primary transition-colors bg-white">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="text-[12px] font-medium text-main bg-surface p-2 mt-2">
              SKU đã chọn: IP16PM-256-NAT
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-4">
              <Button variant="outline" className="flex-1 h-[48px] text-[16px]">Thêm vào giỏ</Button>
              <Button variant="danger" className="flex-1 h-[48px] text-[16px]">Mua ngay</Button>
            </div>
            
            <div className="text-[12px] text-muted mt-2">
              ✓ Thanh toán an toàn · ✓ Hỗ trợ đổi trả 7 ngày
            </div>
          </div>
          
          {/* Shop Card */}
          <div className="bg-white p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-full bg-surface flex items-center justify-center text-[16px] font-bold text-primary">
                {product.shop.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-main">{product.shop.name}</span>
                <span className="text-[12px] text-muted">Official Store · {product.shop.rating} ★ · {product.shop.followers} theo dõi</span>
              </div>
            </div>
            <Button variant="outline">Xem cửa hàng</Button>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="bg-white border border-border mt-4">
        <div className="flex border-b border-border">
          <button className="flex-1 py-4 text-[16px] font-bold text-primary border-b-2 border-primary bg-white">Mô tả</button>
          <button className="flex-1 py-4 text-[16px] font-medium text-main hover:text-primary bg-white border-b-2 border-transparent">Thông số kỹ thuật</button>
          <button className="flex-1 py-4 text-[16px] font-medium text-main hover:text-primary bg-white border-b-2 border-transparent">Đánh giá (1.284)</button>
        </div>
        <div className="p-6 text-[14px] leading-relaxed text-main">
          {product.description}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
