import PropTypes from 'prop-types';
import { LoaderCircle } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'destructive', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-taca-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
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
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className}`.trim()}
      {...props}
    >
      {loading && (
        <LoaderCircle className="w-4 h-4 animate-spin shrink-0 mr-1.5" aria-hidden="true" />
      )}
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
  loading: PropTypes.bool,
};

export default Button;
