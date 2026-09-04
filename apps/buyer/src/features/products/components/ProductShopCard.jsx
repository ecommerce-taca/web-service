import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const ProductShopCard = ({ shop }) => {
  const shopUrl = `/shop/${shop.id || 1}`;
  
  return (
    <div className="bg-white p-4 border border-taca-border flex items-center justify-between">
      <Link to={shopUrl} className="flex items-center gap-4 hover:opacity-80 transition-opacity no-underline">
        {/* Avatar Placeholder */}
        <div className="w-[60px] h-[60px] bg-taca-surface flex items-center justify-center text-[20px] font-bold text-taca-primary rounded-[8px]">
          {shop.avatar || 'TA'}
        </div>
        
        {/* Shop Info */}
        <div className="flex flex-col">
          <span className="text-[16px] font-bold text-taca-text-main group-hover:text-taca-primary transition-colors">{shop.name}</span>
          <span className="text-[12px] text-taca-text-muted mt-1">
            Official Store · {shop.rating} ★ · {shop.followers} theo dõi
          </span>
        </div>
      </Link>

      {/* Xem cửa hàng Action */}
      <Link to={shopUrl}>
        <Button variant="outline" className="text-[14px] hover:!border-taca-primary hover:!text-taca-primary">
          Xem cửa hàng
        </Button>
      </Link>
    </div>
  );
};

ProductShopCard.propTypes = {
  shop: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    followers: PropTypes.string
  }).isRequired
};

export default ProductShopCard;
