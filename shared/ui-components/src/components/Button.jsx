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
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-control border font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
  
  const variants = {
    primary: 'border-taca-primary bg-taca-primary text-white shadow-brand hover:border-taca-primary-hover hover:bg-taca-primary-hover disabled:bg-taca-primary',
    secondary: 'border-taca-border bg-white text-taca-text-main shadow-brand hover:bg-taca-surface',
    outline: 'border-taca-primary bg-transparent text-taca-primary hover:bg-taca-primary-light',
    destructive: 'border-taca-sale bg-taca-sale text-white shadow-brand hover:bg-red-700',
    danger: 'border-taca-sale bg-taca-sale text-white shadow-brand hover:bg-red-700',
    ghost: 'border-transparent bg-transparent text-taca-text-main hover:bg-taca-surface',
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
