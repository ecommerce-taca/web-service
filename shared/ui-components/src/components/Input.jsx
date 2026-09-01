import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-bold text-taca-text-main">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`h-10 px-3 bg-white border ${error ? 'border-taca-sale focus:ring-taca-sale' : 'border-taca-border focus:ring-taca-primary'} text-[14px] text-taca-text-main placeholder-taca-text-muted focus:outline-none focus:ring-1 focus:border-transparent transition-all ${className}`}
        {...props}
      />
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
};

export default Input;
