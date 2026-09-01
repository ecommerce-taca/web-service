import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Badge from '../../../components/ui/Badge';

const ProductCard = ({ id, image, name, price, originalPrice, discount, isOfficial }) => {
  return (
    <Link to={`/product/${id || 1}`} className="flex flex-col bg-white border border-taca-border cursor-pointer group hover:border-taca-primary transition-colors h-full no-underline">
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-taca-surface overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taca-text-muted text-[12px]">
            [Image Placeholder]
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOfficial && <Badge variant="official">Official</Badge>}
          {discount && <Badge variant="sale">-{discount}%</Badge>}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="text-[14px] font-medium text-taca-text-main line-clamp-2 leading-snug group-hover:text-taca-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1">
          {originalPrice && (
            <span className="text-[12px] text-taca-text-muted line-through">
              {originalPrice.toLocaleString('vi-VN')} ₫
            </span>
          )}
          <span className="text-[16px] font-extrabold text-taca-sale">
            {price.toLocaleString('vi-VN')} ₫
          </span>
        </div>
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
};

ProductCard.defaultProps = {
  id: 1,
  image: '',
  originalPrice: null,
  discount: null,
  isOfficial: false,
};

export default ProductCard;
