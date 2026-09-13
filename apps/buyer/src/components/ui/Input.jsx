import PropTypes from 'prop-types';

const Input = ({ label, type, placeholder, value, onChange, disabled, error, className }) => {
  const baseInputClass = 'text-[14px] bg-white border rounded-none px-4 min-h-[40px] w-full outline-none transition-colors disabled:bg-taca-surface disabled:text-taca-text-muted disabled:cursor-not-allowed';
  const borderClass = error ? 'border-sale' : 'border-taca-border focus:border-taca-primary';
  const inputClass = `${baseInputClass} ${borderClass} ${className || ''}`.trim();

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[12px] font-bold text-taca-text-main">{label}</label>}
      <input
        type={type}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span className="text-[10px] font-medium text-taca-sale">{error}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

Input.defaultProps = {
  label: '',
  type: 'text',
  placeholder: '',
  value: undefined,
  disabled: false,
  error: '',
  className: '',
};

export default Input;
