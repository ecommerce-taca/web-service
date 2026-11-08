import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-bold text-taca-text-main">
          {label}
          {props.required && <span className="text-taca-sale ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`w-full h-10 px-3 rounded-lg ${isPassword ? 'pr-10' : ''} bg-white border ${error ? 'border-taca-sale focus:ring-taca-sale' : 'border-taca-border focus:ring-taca-primary'} text-[14px] text-taca-text-main placeholder-taca-text-muted focus:outline-none focus:ring-1 focus:border-transparent transition-all [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {(error || helperText) && (
        <span className={`text-[10px] font-medium ${error ? 'text-taca-sale' : 'text-taca-text-muted'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
};

export default Input;
