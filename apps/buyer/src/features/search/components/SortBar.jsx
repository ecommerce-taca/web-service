import PropTypes from 'prop-types';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'sales', label: 'Bán chạy' },
  { id: 'newest', label: 'Mới nhất' },
  { id: 'price-asc', label: 'Giá thấp → cao' },
  { id: 'price-desc', label: 'Giá cao → thấp' },
];

const SortBar = ({ currentSort = 'popular', onSortChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <span className="text-[14px] font-semibold text-taca-text-main">Sắp xếp:</span>
      <div className="flex flex-wrap items-center gap-2">
        {SORT_OPTIONS.map((opt) => {
          const isActive = currentSort === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSortChange && onSortChange(opt.id)}
              className={`px-4 py-2 border text-[13px] font-semibold rounded-[8px] cursor-pointer transition-colors ${
                isActive
                  ? 'border-taca-primary bg-[#f4f7ff] text-taca-primary shadow-sm'
                  : 'border-taca-border bg-white text-taca-text-main hover:border-taca-primary hover:text-taca-primary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

SortBar.propTypes = {
  currentSort: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
};

export default SortBar;
