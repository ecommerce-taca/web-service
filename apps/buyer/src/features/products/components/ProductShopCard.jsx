import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@taca/ui-components';

const ProductShopCard = ({ shop }) => {
  const shopUrl = `/shop/${shop.id || 1}`;
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-card border border-taca-border shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <Link to={shopUrl} className="flex min-w-0 items-center gap-4 sm:gap-6 hover:opacity-80 transition-opacity no-underline">
        {/* Avatar Placeholder */}
        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] shrink-0 bg-taca-primary-light flex items-center justify-center text-[20px] sm:text-[24px] font-bold text-taca-primary rounded-card">
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
      <Link to={shopUrl} className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto px-6 h-[44px] text-[14px] font-semibold rounded-control border-taca-border hover:!border-taca-primary hover:!text-taca-primary">
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
