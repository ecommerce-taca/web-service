import PropTypes from 'prop-types';

const Badge = ({ children, variant, className }) => {
  const baseClass = 'inline-flex items-center justify-center text-[10px] font-medium rounded-none px-2 py-1 uppercase';
  
  let variantClass;
  switch (variant) {
    case 'sale':
      variantClass = 'bg-taca-sale text-white';
      break;
    case 'warning':
      variantClass = 'bg-taca-warning text-white';
      break;
    case 'success':
      variantClass = 'bg-taca-success text-white';
      break;
    case 'official':
      variantClass = 'bg-taca-primary text-white';
      break;
    case 'default':
    default:
      variantClass = 'bg-taca-surface text-taca-text-main';
  }

  const combinedClass = `${baseClass} ${variantClass} ${className || ''}`.trim();

  return (
    <span className={combinedClass}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['sale', 'warning', 'success', 'official', 'default']),
  className: PropTypes.string,
};

Badge.defaultProps = {
  variant: 'default',
  className: '',
};

export default Badge;
