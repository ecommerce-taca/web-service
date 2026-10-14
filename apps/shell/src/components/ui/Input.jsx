import PropTypes from 'prop-types';

const Input = ({
  id,
  name,
  label = '',
  type = 'text',
  placeholder = '',
  value = undefined,
  onChange,
  disabled = false,
  error = '',
  className = '',
}) => {
  const inputId = id || name || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const baseInputClass = 'text-[14px] bg-white border rounded-lg px-4 min-h-[40px] w-full outline-none transition-colors disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed';
  const borderClass = error ? 'border-sale' : 'border-border focus:border-primary';
  const inputClass = `${baseInputClass} ${borderClass} ${className}`.trim();

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-bold text-main">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span className="text-[10px] font-medium text-sale">{error}</span>}
    </div>
  );
};

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
