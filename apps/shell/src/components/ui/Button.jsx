import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick = undefined,
  disabled = false,
  className = '',
}) => {
  const baseClass = 'inline-flex items-center justify-center text-[12px] font-bold rounded-lg border px-4 min-h-[40px] transition-all duration-200';
  const disabledClass = 'disabled:opacity-50 disabled:cursor-not-allowed';
  
  let variantClass;
  switch (variant) {
    case 'primary':
      variantClass = 'bg-primary text-white border-primary hover:not-disabled:bg-primary-hover';
      break;
    case 'outline':
      variantClass = 'bg-transparent text-primary border-primary hover:not-disabled:bg-primary/5';
      break;
    case 'danger':
      variantClass = 'bg-sale text-white border-sale hover:not-disabled:opacity-90';
      break;
    default:
      variantClass = 'bg-primary text-white border-primary hover:not-disabled:bg-primary-hover';
  }

  const combinedClass = `${baseClass} ${disabledClass} ${variantClass} ${className || ''}`.trim();

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'outline', 'danger']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
