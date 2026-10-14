import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Star, Zap, Check } from 'lucide-react';
import { Button } from '@taca/ui-components';
import { useCart } from '../../cart/hooks/useCart';
import FavoriteButton from './FavoriteButton';

const ProductPurchase = ({ product, isFavorite = false, onToggleFavorite }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 1. Chuẩn hóa Attribute Definitions từ API backend hoặc mock variants
  const attributeDefinitions = useMemo(() => {
    if (product.attribute_definitions && product.attribute_definitions.length > 0) {
      return product.attribute_definitions;
    }
    // Fallback nếu dữ liệu dạng cũ variants
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => ({
        name: v.type === 'storage' ? 'Dung lượng' : v.type === 'ram' ? 'RAM' : 'Màu sắc',
        display_as: v.type === 'color' ? 'COLOR_SWATCH' : 'PLAIN',
        values: v.options,
        value_meta: {}
      }));
    }
    return [];
  }, [product]);

  // 2. Khởi tạo thuộc tính đã chọn mặc định (lấy option đầu tiên của mỗi nhóm)
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const initial = {};
    attributeDefinitions.forEach(attr => {
      if (attr.values && attr.values.length > 0) {
        initial[attr.name] = attr.values[0];
      }
    });
    return initial;
  });

  // 3. Tìm SKU phù hợp nhất với tổ hợp thuộc tính đang chọn
  const activeSku = useMemo(() => {
    if (!product.skus || product.skus.length === 0) return null;
    return product.skus.find(sku => {
      if (!sku.attributes) return false;
      return Object.entries(selectedAttributes).every(
        ([key, val]) => String(sku.attributes[key]) === String(val)
      );
    }) || product.skus[0];
  }, [product.skus, selectedAttributes]);

  // 4. Tính toán giá và tồn kho hiển thị
  const currentPrice = activeSku?.price?.sale_price || activeSku?.price?.base_price || product.price;
  const currentOriginalPrice = activeSku?.price?.base_price || product.originalPrice;
  const currentStock = activeSku?.stock_display ?? product.stock_display ?? 38;
  const currentSkuCode = activeSku?.sku_code || product.sku || 'SPU-DEFAULT';

  // Tính % giảm giá nếu có
  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : product.discount;

  const handleSelectAttribute = (attrName, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrName]: value
    }));
  };

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        price: currentPrice,
        sku: currentSkuCode
      },
      1,
      { sku: currentSkuCode, selectedAttributes }
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        ...product,
        price: currentPrice,
        sku: currentSkuCode
      },
      1,
      { sku: currentSkuCode, selectedAttributes }
    );
    navigate('/checkout');
  };

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || "https://placehold.co/400"];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[12px] border border-taca-border flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left: Gallery */}
      <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col gap-4">
        <div className="w-full aspect-square bg-taca-surface rounded-[8px] flex items-center justify-center text-taca-text-muted overflow-hidden relative border border-slate-100">
          <img 
            src={galleryImages[selectedImageIndex] || galleryImages[0]} 
            alt={product.name || product.title} 
            className="w-full h-full object-cover transition-all duration-200" 
          />
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton 
              isFavorite={Boolean(isFavorite)} 
              onToggle={() => onToggleFavorite && onToggleFavorite()} 
            />
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((img, i) => (
            <button
              type="button"
              key={i} 
              onClick={() => setSelectedImageIndex(i)}
              className={`w-[70px] h-[70px] flex-shrink-0 bg-taca-surface rounded-[6px] border cursor-pointer overflow-hidden transition-all ${
                selectedImageIndex === i ? 'border-2 border-taca-primary shadow-xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Title & Brand */}
        <div>
          {product.isOfficial && (
            <span className="inline-block text-[10px] font-bold text-white bg-taca-primary px-2 py-1 rounded-[4px] mr-2 align-middle">
              CHÍNH HÃNG
            </span>
          )}
          <h1 className="text-[20px] md:text-[24px] font-bold text-taca-text-main inline align-middle">
            {product.name || product.title}
          </h1>
          <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[13px] sm:text-[14px] text-taca-text-muted mt-3">
            <div className="flex items-center text-amber-500 text-[14px] font-bold gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-taca-text-main font-bold">{product.rating || 4.9}</span>
            </div>
            <div className="w-[1px] h-3 bg-taca-border"></div>
            <div>{(product.reviewCount || product.rating_summary?.review_count || 1284).toLocaleString()} đánh giá</div>
            <div className="w-[1px] h-3 bg-taca-border"></div>
            <div>Đã bán {(product.soldCount || product.rating_summary?.sold_count || 1420).toLocaleString()}</div>
            {product.brand && (
              <>
                <div className="w-[1px] h-3 bg-taca-border"></div>
                <div>Thương hiệu: <span className="font-semibold text-taca-text-main">{product.brand}</span></div>
              </>
            )}
          </div>
        </div>

        {/* Price Area */}
        <div className="bg-[#fafafa] rounded-xl border border-slate-200/70 p-4 flex flex-col gap-2">
          {product.isFlashSale && (
            <div className="text-[#ff424e] text-[12px] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-[#ff424e]" />
              <span>FLASH SALE · Kết thúc trong 02:45:18</span>
            </div>
          )}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-[32px] font-bold text-[#ff424e] leading-none">
              {Number(currentPrice).toLocaleString('vi-VN')} ₫
            </span>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-[14px] text-taca-text-muted line-through mb-1">
                {Number(currentOriginalPrice).toLocaleString('vi-VN')} ₫
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-[12px] font-bold text-[#ff424e] bg-[#ff424e]/10 px-1.5 py-0.5 rounded-[3px] mb-1">
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              Giá đã bao gồm thuế VAT {product.tax_rate_bps ? `(${product.tax_rate_bps / 100}%)` : '(10%)'}
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Attributes / SKU Picker (Khớp Penpot Taca Buyer / Product Detail) */}
        {attributeDefinitions.length > 0 && (
          <div className="flex flex-col gap-4">
            {attributeDefinitions.map((attr) => (
              <div key={attr.name} className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-taca-text-main">
                  {attr.name}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {attr.values.map((val) => {
                    const isSelected = selectedAttributes[attr.name] === val;
                    const meta = attr.value_meta?.[val];
                    const hasSwatchHex = meta?.swatch_hex;

                    return (
                      <button 
                        key={val}
                        type="button"
                        onClick={() => handleSelectAttribute(attr.name, val)}
                        className={`px-3.5 py-2 text-[13px] transition-all rounded-[8px] border cursor-pointer flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-[#f4f7ff] border-taca-primary text-taca-primary font-semibold ring-1 ring-taca-primary' 
                            : 'bg-white border-taca-border text-taca-text-main hover:border-slate-300'
                        }`}
                      >
                        {hasSwatchHex && (
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" 
                            style={{ backgroundColor: meta.swatch_hex }}
                          />
                        )}
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* SKU status badge */}
        <div className="text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-fit flex items-center gap-2">
          <span>SKU đã chọn: <strong className="text-slate-900">{currentSkuCode}</strong></span>
          <span className="text-slate-300">·</span>
          <span>
            {currentStock <= 0 ? (
              <strong className="text-rose-600">Tạm hết hàng</strong>
            ) : currentStock <= 5 ? (
              <span className="text-amber-700 font-bold">Chỉ còn {currentStock} sản phẩm</span>
            ) : (
              <span>Còn <strong className="text-slate-900">{currentStock}</strong> sản phẩm</span>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1 relative">
          <Button 
            variant="outline" 
            className="flex-1 h-[48px] text-[15px] font-semibold rounded-[8px] border-2 border-taca-primary text-taca-primary bg-white hover:bg-indigo-50"
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
          >
            {currentStock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </Button>
          <Button 
            variant="primary" 
            className="flex-[2] h-[48px] text-[15px] font-semibold rounded-[8px]"
            onClick={handleBuyNow}
            disabled={currentStock <= 0}
          >
            {currentStock <= 0 ? 'Tạm hết hàng' : 'Mua ngay'}
          </Button>

          {addedToast && (
            <div className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-emerald-600 text-white text-[13px] font-bold py-1.5 px-4 rounded-[6px] shadow-lg animate-in fade-in duration-200 flex items-center gap-1.5 z-20">
              <Check className="w-4 h-4 text-white" />
              <span>Đã thêm vào giỏ hàng thành công!</span>
            </div>
          )}
        </div>
        
        <div className="text-[12px] text-taca-text-muted flex items-center gap-x-6 gap-y-2 flex-wrap pt-1">
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Thanh toán an toàn</span>
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Hoàn tiền nếu hàng giả</span>
          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Bảo hành 12 tháng</span>
        </div>
      </div>
    </div>
  );
};

ProductPurchase.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    title: PropTypes.string,
    isOfficial: PropTypes.bool,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    soldCount: PropTypes.number,
    price: PropTypes.number,
    originalPrice: PropTypes.number,
    discount: PropTypes.number,
    isFlashSale: PropTypes.bool,
    sku: PropTypes.string,
    brand: PropTypes.string,
    stock_display: PropTypes.number,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    rating_summary: PropTypes.shape({
      average_rating: PropTypes.number,
      review_count: PropTypes.number,
      sold_count: PropTypes.number
    }),
    attribute_definitions: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      display_as: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string),
      value_meta: PropTypes.object
    })),
    skus: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      sku_code: PropTypes.string,
      attributes: PropTypes.object,
      price: PropTypes.shape({
        base_price: PropTypes.number,
        sale_price: PropTypes.number
      }),
      stock_display: PropTypes.number,
      status: PropTypes.string
    })),
    variants: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string)
    }))
  }).isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func
};

export default ProductPurchase;
