import PropTypes from 'prop-types';

const Badge = ({ children, variant, className }) => {
  const baseClass = 'inline-flex items-center justify-center text-[10px] font-bold rounded-md border px-2 py-0.5 uppercase tracking-wide';
  
  let variantClass;
  switch (variant) {
    case 'sale':
      variantClass = 'bg-sale text-white border-sale';
      break;
    case 'warning':
      variantClass = 'bg-warning text-white border-warning';
      break;
    case 'success':
      variantClass = 'bg-success text-white border-success';
      break;
    case 'official':
      variantClass = 'bg-primary text-white border-primary';
      break;
    case 'default':
    default:
      variantClass = 'bg-surface text-main border-border';
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
