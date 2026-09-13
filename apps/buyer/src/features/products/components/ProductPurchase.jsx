import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';

const ProductPurchase = ({ product }) => {
  return (
    <div className="bg-white p-6 rounded-[12px] border border-taca-border flex flex-col md:flex-row gap-8">
      {/* Left: Gallery */}
      <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col gap-4">
        <div className="w-full aspect-square bg-taca-surface rounded-[8px] flex items-center justify-center text-taca-text-muted overflow-hidden">
          <img src={product.image || "https://placehold.co/400"} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {product.images ? product.images.map((img, i) => (
            <div key={i} className="w-[70px] h-[70px] flex-shrink-0 bg-taca-surface rounded-[6px] border border-transparent hover:border-taca-primary cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
              <img src={img || "https://placehold.co/70"} alt={`Thumb ${i+1}`} className="w-full h-full object-cover" />
            </div>
          )) : (
            // Mock thumbnails
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-[70px] h-[70px] flex-shrink-0 bg-taca-surface rounded-[6px] border border-transparent hover:border-taca-primary cursor-pointer flex items-center justify-center overflow-hidden transition-colors">
                <img src={`https://placehold.co/70?text=${i}`} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Title & Brand */}
        <div>
          {product.isOfficial && <span className="inline-block text-[10px] font-bold text-white bg-taca-primary px-2 py-1 rounded-[4px] mr-2 align-middle">CHÍNH HÃNG</span>}
          <h1 className="text-[20px] md:text-[24px] font-bold text-taca-text-main inline align-middle">{product.name}</h1>
          <div className="flex items-center gap-3 text-[14px] text-taca-text-muted mt-3">
            <div className="flex items-center text-taca-warning text-[14px]">
              ★★★★★ <span className="text-taca-text-main ml-1">{product.rating}</span>
            </div>
            <div className="w-[1px] h-3 bg-taca-border"></div>
            <div>{product.reviewCount} đánh giá</div>
            <div className="w-[1px] h-3 bg-taca-border"></div>
            <div>Đã bán 1.2k</div>
          </div>
        </div>

        {/* Price Area */}
        <div className="bg-[#fafafa] rounded-[8px] p-4 flex flex-col gap-2">
          {product.isFlashSale && (
            <div className="text-[#ff424e] text-[12px] font-bold flex items-center gap-1">
              ⚡ FLASH SALE · Kết thúc trong 02:45:18
            </div>
          )}
          <div className="flex items-end gap-3">
            <span className="text-[32px] font-bold text-[#ff424e] leading-none">{product.price.toLocaleString('vi-VN')} ₫</span>
            {product.originalPrice && (
              <span className="text-[14px] text-taca-text-muted line-through mb-1">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
            )}
            {product.discount && (
              <span className="text-[12px] font-bold text-[#ff424e] bg-[#ff424e]/10 px-1 py-0.5 rounded-[2px] mb-1">-{product.discount}%</span>
            )}
          </div>
        </div>

        {/* Promo Strip / Voucher strip */}
        {product.vouchers && product.vouchers.length > 0 && (
          <div className="flex items-center justify-between border border-taca-border rounded-[8px] p-3">
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-taca-text-main font-semibold">Mã giảm giá</span>
              <div className="bg-[#e8f1ff] text-taca-primary border border-[#a6c8ff] text-[12px] font-medium px-2 py-0.5 rounded-[4px]">
                {product.vouchers[0].offer}
              </div>
            </div>
            <button className="text-taca-primary text-[13px] font-bold cursor-pointer bg-transparent border-none">Xem thêm</button>
          </div>
        )}

        {/* Variants */}
        <div className="flex flex-col gap-4">
          {product.variants && product.variants.map((v, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-taca-text-main">
                {v.type === 'storage' ? 'Chọn phiên bản / SKU' : 'Màu sắc'}
              </span>
              <div className="flex flex-wrap gap-3">
                {v.options.map((opt, idx) => {
                  const isActive = idx === 0;
                  return (
                    <button 
                      key={opt} 
                      className={`px-4 py-2 text-[14px] transition-colors rounded-[8px] border cursor-pointer ${
                        isActive 
                          ? 'bg-[#f4f7ff] border-taca-primary text-taca-primary font-semibold' 
                          : 'bg-white border-taca-border text-taca-text-main hover:border-taca-primary hover:text-taca-primary'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-[13px] font-medium text-taca-text-main bg-[#f5f5f5] rounded-[6px] px-3 py-2 w-fit">
          SKU đã chọn: {product.sku || 'IP16PM-256-NAT'}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-[48px] text-[16px] font-semibold rounded-[8px] border-2 border-taca-primary text-taca-primary bg-white hover:bg-indigo-50"
          >
            Thêm vào giỏ
          </Button>
          <Button 
            variant="primary" 
            className="flex-[2] h-[48px] text-[16px] font-semibold rounded-[8px]"
          >
            Mua ngay
          </Button>
        </div>
        
        <div className="text-[13px] text-taca-text-muted mt-2 flex items-center gap-6">
          <span className="flex items-center gap-1">✓ Thanh toán an toàn</span>
          <span className="flex items-center gap-1">✓ Hỗ trợ đổi trả 7 ngày</span>
        </div>
      </div>
    </div>
  );
};

ProductPurchase.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isOfficial: PropTypes.bool,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    discount: PropTypes.number,
    isFlashSale: PropTypes.bool,
    sku: PropTypes.string,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    vouchers: PropTypes.arrayOf(PropTypes.shape({
      offer: PropTypes.string
    })),
    variants: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string)
    }))
  }).isRequired
};

export default ProductPurchase;
