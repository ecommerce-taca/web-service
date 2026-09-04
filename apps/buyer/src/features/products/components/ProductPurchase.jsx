import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';

const ProductPurchase = ({ product }) => {
  return (
    <div className="bg-white p-6 border border-taca-border flex flex-col gap-4">
      {/* Title & Brand */}
      <div>
        {product.isOfficial && <span className="text-[12px] font-bold text-taca-primary mr-2">CHÍNH HÃNG</span>}
        <h1 className="text-[24px] font-extrabold text-taca-text-main inline">{product.name}</h1>
        <div className="text-[14px] text-taca-text-muted mt-2">
          <span className="text-taca-warning">★★★★★</span> {product.rating} · {product.reviewCount} đánh giá
        </div>
      </div>

      {/* Price Area */}
      <div className="bg-taca-surface p-4 flex flex-col gap-1">
        {product.isFlashSale && (
          <div className="text-taca-sale text-[12px] font-bold">⚡ FLASH SALE · Kết thúc trong 02:45:18</div>
        )}
        <div className="flex items-end gap-3">
          <span className="text-[32px] font-extrabold text-taca-sale leading-none">{product.price.toLocaleString('vi-VN')} ₫</span>
          {product.originalPrice && (
            <span className="text-[14px] text-taca-text-muted line-through mb-1">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
          )}
          {product.discount && (
            <span className="text-[12px] font-bold text-taca-sale bg-taca-sale/10 px-1 mb-1">-{product.discount}%</span>
          )}
        </div>
      </div>

      {/* Promo Strip / Voucher strip */}
      {product.vouchers && product.vouchers.length > 0 && (
        <div className="flex items-center justify-between border border-taca-border p-3">
          <div className="flex items-center gap-2">
            <div className="bg-taca-sale text-white text-[10px] font-bold px-2 py-1">VOUCHER</div>
            <span className="text-[14px] text-taca-text-main font-medium">{product.vouchers[0].offer}</span>
          </div>
          <button className="text-taca-primary text-[14px] font-bold">Xem voucher</button>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.map((v, i) => (
        <div key={i} className="flex flex-col gap-2">
          <span className="text-[14px] font-bold text-taca-text-main uppercase">
            {v.type === 'storage' ? 'Chọn phiên bản / SKU' : 'Màu sắc'}
          </span>
          <div className="flex flex-wrap gap-2">
            {v.options.map((opt, idx) => {
              // Mock selecting the first option to show the active state from Penpot
              const isActive = idx === 0;
              return (
                <button 
                  key={opt} 
                  className={`px-4 py-2 text-[14px] transition-colors rounded-[8px] border ${
                    isActive 
                      ? 'bg-indigo-50 border-taca-primary text-taca-primary font-bold' 
                      : 'bg-white border-taca-border text-taca-text-main hover:border-taca-primary'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="text-[12px] font-medium text-taca-text-main bg-taca-surface p-2 mt-2">
        SKU đã chọn: {product.sku || 'IP16PM-256-NAT'}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        {/* 'Thêm vào giỏ' has white bg, slate-200 border, 8px radius */}
        <Button 
          variant="outline" 
          className="flex-1 h-[48px] text-[16px] rounded-[8px] !border-taca-border !text-taca-text-main hover:!border-taca-primary hover:!text-taca-primary"
        >
          Thêm vào giỏ
        </Button>
        {/* 'Mua ngay' has primary bg, primary border, 8px radius */}
        <Button 
          variant="primary" 
          className="flex-1 h-[48px] text-[16px] rounded-[8px]"
        >
          Mua ngay
        </Button>
      </div>
      
      <div className="text-[12px] text-taca-text-muted mt-2">
        ✓ Thanh toán an toàn · ✓ Hỗ trợ đổi trả 7 ngày
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
