import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from '@taca/ui-components';
import FavoriteButton from './FavoriteButton';

const ProductCard = ({
  product,
  id,
  image = '',
  name,
  title,
  price = 0,
  originalPrice = null,
  discount = null,
  isOfficial = false,
  rating = null,
  soldCount = null,
  tags = [],
  isFavorite = false,
  onToggleFavorite
}) => {
  // Chuẩn hóa trường theo đặc tả API Product Catalog Service (§3.1)
  const actualId = product?.product_id || product?.id || id || 1;
  const actualName = product?.title || product?.name || title || name || 'Sản phẩm';
  const actualImage = product?.cover_media?.url || product?.image || image || (product?.images && product.images[0]) || '';
  
  // Xử lý đối tượng giá tiền theo cấu trúc { base_price, sale_price, currency: "VND" }
  const actualPrice = product?.price?.sale_price !== undefined
    ? product.price.sale_price
    : (typeof product?.price === 'number' ? product.price : (price?.sale_price ?? (typeof price === 'number' ? price : 0)));

  const actualOriginalPrice = product?.price?.base_price !== undefined
    ? product.price.base_price
    : (product?.originalPrice ?? originalPrice ?? null);

  const actualDiscount = (actualOriginalPrice && actualOriginalPrice > actualPrice)
    ? Math.round(((actualOriginalPrice - actualPrice) / actualOriginalPrice) * 100)
    : (product?.discount ?? discount ?? null);

  const actualRating = product?.rating_summary?.avg ?? product?.rating ?? rating ?? null;
  const actualSoldCount = product?.soldCount ?? product?.sold_count ?? soldCount ?? null;
  const actualIsOfficial = product?.shop?.is_official ?? product?.isOfficial ?? isOfficial ?? false;
  const actualStockStatus = product?.stock_display?.status;
  const isOutOfStock = actualStockStatus === 'OUT_OF_STOCK' || product?.stock_display === 0;

  return (
    <Link 
      to={`/product/${actualId}`} 
      className="flex flex-col bg-white border border-taca-border cursor-pointer group hover:border-taca-primary hover:shadow-md transition-all h-full no-underline rounded-[12px] overflow-hidden p-3 gap-3 relative"
    >
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-[#f4f7ff] rounded-[8px] overflow-hidden flex-shrink-0">
        {actualImage ? (
          <img 
            src={actualImage} 
            alt={actualName} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale opacity-75' : ''
            }`} 
          />
        ) : (
          <div className="absolute top-3 left-3 text-taca-primary text-[12px] font-bold">
            SKU
          </div>
        )}

        {/* Hết hàng overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              Hết hàng
            </span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {actualIsOfficial && <Badge variant="official">Official</Badge>}
          {actualDiscount && actualDiscount > 0 && <Badge variant="sale">-{actualDiscount}%</Badge>}
        </div>

        {/* Favorite Button */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton 
            isFavorite={Boolean(isFavorite)} 
            onToggle={() => onToggleFavorite && onToggleFavorite(actualId, isFavorite, {
              id: actualId,
              product_id: actualId,
              name: actualName,
              title: actualName,
              price: actualPrice,
              originalPrice: actualOriginalPrice,
              original_price: actualOriginalPrice,
              discount: actualDiscount,
              image: actualImage,
              rating: actualRating,
              soldCount: actualSoldCount,
              sold: actualSoldCount,
              isOfficial: actualIsOfficial,
              tags
            })} 
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 gap-2">
        <h3 className="text-[14px] font-medium text-taca-text-main line-clamp-2 leading-snug group-hover:text-taca-primary transition-colors">
          {actualName}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1">
          {Boolean(actualOriginalPrice) && actualOriginalPrice > actualPrice && (
            <span className="text-[12px] text-taca-text-muted line-through">
              {Number(actualOriginalPrice).toLocaleString('vi-VN')} ₫
            </span>
          )}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[16px] font-extrabold text-taca-sale">
              {Number(actualPrice || 0).toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>
        
        {/* Rating and Tags */}
        {(actualRating || actualSoldCount || (tags && tags.length > 0)) && (
          <div className="flex flex-col gap-1 mt-1">
            {(actualRating || actualSoldCount) && (
              <div className="flex items-center text-[11px] text-taca-text-muted">
                {actualRating && (
                  <span className="flex items-center text-amber-500 mr-2 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                    <span className="text-slate-700 font-bold">{actualRating}</span>
                  </span>
                )}
                {actualRating && actualSoldCount && <span>·</span>}
                {actualSoldCount && <span className="ml-2">Đã bán {actualSoldCount}</span>}
              </div>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center text-[11px] text-taca-text-muted mt-1">
                {tags.map((tag, index) => (
                  <span key={index} className="flex items-center">
                    {tag} {index < tags.length - 1 && <span className="mx-2">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  originalPrice: PropTypes.number,
  discount: PropTypes.number,
  isOfficial: PropTypes.bool,
  rating: PropTypes.number,
  soldCount: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};

export default ProductCard;
