import PropTypes from 'prop-types';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClass = 'inline-flex items-center justify-center text-[10px] font-bold rounded-md border px-2 py-0.5 uppercase tracking-wide';
  
  const variants = {
    sale: 'bg-taca-sale text-white border-taca-sale',
    warning: 'bg-taca-warning text-white border-taca-warning',
    success: 'bg-taca-success text-white border-taca-success',
    official: 'bg-taca-primary text-white border-taca-primary',
    default: 'bg-taca-surface text-taca-text-main border-taca-border',
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['sale', 'warning', 'success', 'official', 'default']),
  className: PropTypes.string,
};

export default Badge;
