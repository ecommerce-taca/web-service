import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'destructive', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-taca-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-taca-primary text-white border-taca-primary hover:not-disabled:bg-taca-primary-hover',
    secondary: 'bg-white text-taca-text-main border-taca-border hover:not-disabled:bg-taca-surface',
    outline: 'bg-transparent text-taca-primary border-taca-primary hover:not-disabled:bg-taca-primary/5',
    destructive: 'bg-taca-sale text-white border-taca-sale hover:not-disabled:bg-red-700',
    danger: 'bg-taca-sale text-white border-taca-sale hover:not-disabled:bg-red-700',
    ghost: 'bg-transparent text-taca-text-main border-transparent hover:not-disabled:bg-taca-surface',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'min-h-[40px] px-4 text-[14px]',
    lg: 'h-12 px-6 text-[16px]',
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'destructive', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
