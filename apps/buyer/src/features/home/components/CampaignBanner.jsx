import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const CampaignBanner = ({ brand, title, subtitle, ctaText, bgColor, textColor }) => {
  return (
    <section
      className="p-5 flex flex-col items-start justify-center gap-1.5 w-[424px] h-[151px] overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        {brand}
      </div>
      <h2 className="text-[18px] font-extrabold leading-tight line-clamp-1 m-0">
        {title}
      </h2>
      <p className="text-[13px] font-medium opacity-80 line-clamp-1 m-0">
        {subtitle}
      </p>
      <Link
        to={`/search?q=${brand.toLowerCase().replace(/\s+/g, '-')}`}
        className="mt-1 bg-transparent border-none text-[11px] font-bold cursor-pointer hover:opacity-70 transition-opacity p-0 flex items-center gap-1 no-underline"
        style={{ color: textColor }}
      >
        {ctaText || 'Xem sản phẩm'} →
      </Link>
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
};

CampaignBanner.defaultProps = {
  textColor: '#FFFFFF',
  ctaText: 'Xem sản phẩm',
};

export default CampaignBanner;
