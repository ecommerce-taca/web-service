import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';

const ProductShopCard = ({ shop }) => {
  return (
    <div className="bg-white p-4 border border-taca-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar Placeholder */}
        <div className="w-[60px] h-[60px] bg-taca-surface flex items-center justify-center text-[20px] font-bold text-taca-primary">
          {shop.avatar || 'TA'}
        </div>
        
        {/* Shop Info */}
        <div className="flex flex-col">
          <span className="text-[16px] font-bold text-taca-text-taca-text-main">{shop.name}</span>
          <span className="text-[12px] text-taca-text-taca-text-muted">
            Official Store · {shop.rating} ★ · {shop.followers} theo dõi
          </span>
        </div>
      </div>

      {/* Xem cửa hàng Action */}
      <Button variant="outline" className="text-[14px]">
        Xem cửa hàng
      </Button>
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
