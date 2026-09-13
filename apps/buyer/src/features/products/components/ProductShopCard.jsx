import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const ProductShopCard = ({ shop }) => {
  const shopUrl = `/shop/${shop.id || 1}`;
  
  return (
    <div className="bg-white p-5 rounded-[12px] border border-taca-border flex flex-col items-center gap-4 text-center">
      <Link to={shopUrl} className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity no-underline w-full">
        {/* Avatar Placeholder */}
        <div className="w-[80px] h-[80px] bg-[#f4f7ff] flex items-center justify-center text-[24px] font-bold text-taca-primary rounded-full">
          {shop.avatar || 'TA'}
        </div>
        
        {/* Shop Info */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[16px] font-bold text-taca-text-main group-hover:text-taca-primary transition-colors line-clamp-1">{shop.name}</span>
          <span className="text-[13px] text-taca-text-muted">
            <span className="font-semibold text-taca-text-main">Official Store</span> · {shop.rating} ★ · {shop.followers} theo dõi
          </span>
        </div>
      </Link>

      {/* Xem cửa hàng Action */}
      <Link to={shopUrl} className="w-full">
        <Button variant="outline" className="w-full text-[14px] font-semibold h-[40px] rounded-[8px] border-taca-border hover:!border-taca-primary hover:!text-taca-primary">
          Xem cửa hàng
        </Button>
      </Link>
    </div>
  );
};

ProductShopCard.propTypes = {
  shop: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    followers: PropTypes.string
  }).isRequired
};

export default ProductShopCard;
