import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Package, Flame } from 'lucide-react';

const FlashProductCard = ({ id, name, price, discount, image, soldPercentage }) => {
  const originalPrice = Math.round(price / (1 - discount / 100));

  return (
    <Link
      to={`/product/${id || 1}`}
      className="flex bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-rose-400 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group no-underline flex-1 min-w-[260px]"
    >
      {/* Left: Product Image */}
      <div className="w-[110px] h-[120px] rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden relative border border-slate-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
            <Package className="w-5 h-5 text-slate-400" />
          </div>
        )}
        {/* Discount badge on image */}
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black shadow-xs">
          -{discount}%
        </span>
      </div>

      {/* Right: Info */}
      <div className="flex flex-col justify-between flex-1 pl-3 py-0.5 min-w-0">
        <div>
          <span className="text-[9px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
            HOT DEAL
          </span>
          <h3 className="text-[12px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0A68FF] transition-colors mt-1 m-0">
            {name}
          </h3>
        </div>

        <div className="space-y-1.5 pt-2">
          <div>
            <div className="text-[15px] font-black text-rose-600 leading-none">
              {price.toLocaleString('vi-VN')} đ
            </div>
            {originalPrice > price && (
              <div className="text-[10px] text-slate-400 line-through mt-0.5">
                {originalPrice.toLocaleString('vi-VN')} đ
              </div>
            )}
          </div>

          {/* Sold Track */}
          <div className="w-full h-[14px] bg-rose-100/80 rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, soldPercentage))}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-extrabold tracking-wider uppercase drop-shadow-xs gap-1">
              <Flame className="w-2.5 h-2.5 fill-white text-white shrink-0" />
              <span>Đã bán {soldPercentage}%</span>
            </span>
          </div>
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
