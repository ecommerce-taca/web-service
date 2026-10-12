import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@taca/ui-components';

const ProductShopCard = ({ shop }) => {
  const shopUrl = `/shop/${shop.id || 1}`;
  
  return (
    <div className="bg-white p-6 rounded-[12px] border border-taca-border flex items-center justify-between">
      <Link to={shopUrl} className="flex items-center gap-6 hover:opacity-80 transition-opacity no-underline">
        {/* Avatar Placeholder */}
        <div className="w-[80px] h-[80px] bg-[#f4f7ff] flex items-center justify-center text-[24px] font-bold text-taca-primary rounded-[8px]">
          {shop.avatar || 'TA'}
        </div>
        
        {/* Shop Info */}
        <div className="flex flex-col gap-2">
          <span className="text-[18px] font-bold text-taca-text-main group-hover:text-taca-primary transition-colors">{shop.name}</span>
          <span className="text-[14px] text-taca-text-muted flex items-center gap-1.5 flex-wrap">
            <span>Official Store</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{shop.rating}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span>{shop.followers} người theo dõi</span>
          </span>
        </div>
      </Link>

      {/* Xem cửa hàng Action */}
      <Link to={shopUrl}>
        <Button variant="outline" className="px-6 h-[40px] text-[14px] font-semibold rounded-[8px] border-taca-border hover:!border-taca-primary hover:!text-taca-primary">
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
