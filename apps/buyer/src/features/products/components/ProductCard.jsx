import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Badge from '../../../components/ui/Badge';

const ProductCard = ({ id, image, name, price, originalPrice, discount, isOfficial, rating, soldCount, tags }) => {
  return (
    <Link to={`/product/${id || 1}`} className="flex flex-col bg-white border border-taca-border cursor-pointer group hover:border-taca-primary hover:shadow-md transition-all h-full no-underline rounded-[12px] overflow-hidden p-3 gap-3">
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-[#f4f7ff] rounded-[8px] overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute top-3 left-3 text-taca-primary text-[12px] font-bold">
            SKU
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOfficial && <Badge variant="official">Official</Badge>}
          {discount && <Badge variant="sale">-{discount}%</Badge>}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 gap-2">
        <h3 className="text-[14px] font-medium text-taca-text-taca-text-main line-clamp-2 leading-snug group-hover:text-taca-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1">
          {originalPrice && (
            <span className="text-[12px] text-taca-text-taca-text-muted line-through">
              {originalPrice.toLocaleString('vi-VN')} ₫
            </span>
          )}
          <span className="text-[16px] font-extrabold text-taca-sale">
            {price.toLocaleString('vi-VN')} ₫
          </span>
        </div>
        
        {/* Rating and Tags */}
        {(rating || soldCount || (tags && tags.length > 0)) && (
          <div className="flex flex-col gap-1 mt-1">
            {(rating || soldCount) && (
              <div className="flex items-center text-[11px] text-taca-text-taca-text-muted">
                {rating && (
                  <span className="flex items-center text-[#faad14] mr-2">
                    <span className="mr-1 tracking-[2px]">★★★★★</span> <span className="text-taca-text-taca-text-muted font-medium">{rating}</span>
                  </span>
                )}
                {rating && soldCount && <span>·</span>}
                {soldCount && <span className="ml-2">Đã bán {soldCount}</span>}
              </div>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center text-[11px] text-taca-text-taca-text-muted mt-1">
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
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  discount: PropTypes.number,
  isOfficial: PropTypes.bool,
  rating: PropTypes.number,
  soldCount: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
};

ProductCard.defaultProps = {
  id: 1,
  image: '',
  originalPrice: null,
  discount: null,
  isOfficial: false,
  rating: null,
  soldCount: null,
  tags: [],
};

export default ProductCard;
