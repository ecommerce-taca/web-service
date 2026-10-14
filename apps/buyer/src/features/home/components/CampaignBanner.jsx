import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const CampaignBanner = ({
  brand,
  title,
  subtitle,
  ctaText = 'Xem sản phẩm',
  bgColor,
  textColor = '#FFFFFF',
  image = '',
}) => {
  return (
    <section
      className="p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 w-full lg:w-[400px] min-w-0 h-[152px] overflow-hidden relative shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-center gap-1.5 flex-1 min-w-0">
        <div className="border border-current px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
          {brand}
        </div>
        <h2 className="text-[17px] font-extrabold leading-tight line-clamp-1 m-0 drop-shadow-xs">
          {title}
        </h2>
        <p className="text-[12px] font-medium opacity-85 line-clamp-1 m-0">
          {subtitle}
        </p>
        <Link
          to={`/search?q=${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`}
          className="mt-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 no-underline group-hover:gap-2"
          style={{ color: textColor }}
        >
          <span>{ctaText || 'Xem sản phẩm'}</span>
          <span>→</span>
        </Link>
      </div>

      {/* Visual Product Thumb if available */}
      {image && (
        <div className="relative z-10 w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/20">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
    </section>
  );
};

CampaignBanner.propTypes = {
  brand: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
  bgColor: PropTypes.string.isRequired,
  textColor: PropTypes.string,
  image: PropTypes.string,
};

export default CampaignBanner;
