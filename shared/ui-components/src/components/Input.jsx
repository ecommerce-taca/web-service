import { forwardRef, useId, useState } from 'react';
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
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const messageId = error || helperText ? `${inputId}-message` : undefined;

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
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          className={`h-10 w-full rounded-control border px-3 bg-white ${isPassword ? 'pr-10' : ''} ${error ? 'border-taca-sale focus:border-taca-sale focus:ring-taca-sale' : 'border-taca-border focus:border-taca-primary focus:ring-taca-primary'} text-body text-taca-text-main placeholder:text-taca-text-muted disabled:cursor-not-allowed disabled:bg-taca-surface disabled:text-taca-text-muted focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${className}`}
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
        <span id={messageId} className={`text-caption font-medium ${error ? 'text-taca-sale' : 'text-taca-text-muted'}`}>
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
