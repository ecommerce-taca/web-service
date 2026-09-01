import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FlashProductCard = ({ id, name, price, discount, image, soldPercentage }) => {
  return (
    <Link
      to={`/product/${id || 1}`}
      className="flex bg-white w-[286px] h-[166px] border border-taca-border hover:border-taca-primary transition-colors group no-underline flex-shrink-0"
    >
      {/* Left: Image placeholder */}
      <div className="w-[112px] h-[120px] bg-slate-100 flex-shrink-0 m-[23px] mr-0 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-[48px] h-[48px] bg-slate-200" />
        )}
      </div>

      {/* Right: Info */}
      <div className="flex flex-col justify-center flex-1 pl-4 pr-4 py-4 gap-1 min-w-0">
        <h3 className="text-[12px] font-semibold text-taca-text-main line-clamp-2 leading-snug group-hover:text-taca-primary transition-colors m-0">
          {name}
        </h3>

        <div className="flex flex-col gap-0.5 mt-auto">
          <span className="text-[14px] font-extrabold text-taca-sale leading-none">
            {price.toLocaleString('vi-VN')} đ
          </span>
          <span className="text-[11px] font-bold text-taca-sale">
            -{discount}%
          </span>
        </div>

        {/* Sold Track */}
        <div className="mt-1 w-full h-[10px] bg-rose-100 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-taca-sale"
            style={{ width: `${soldPercentage}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-bold tracking-wider uppercase mix-blend-difference">
            Đã bán {soldPercentage}%
          </span>
        </div>
      </div>
    </Link>
  );
};

FlashProductCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  image: PropTypes.string,
  soldPercentage: PropTypes.number,
};

FlashProductCard.defaultProps = {
  id: 1,
  image: '',
  soldPercentage: 0,
};

export default FlashProductCard;
