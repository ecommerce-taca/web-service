import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'destructive', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-taca-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-taca-primary text-white hover:bg-taca-primary-hover',
    secondary: 'bg-white text-taca-text-main border border-taca-border hover:bg-taca-surface',
    destructive: 'bg-taca-sale text-white hover:bg-red-700',
    ghost: 'bg-transparent text-taca-text-main hover:bg-taca-surface',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[14px]',
    lg: 'h-12 px-6 text-[16px]',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'destructive', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Button;
