import PropTypes from 'prop-types';
import { Flame, Zap, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Phổ biến', icon: Flame },
  { id: 'sales', label: 'Bán chạy', icon: Zap },
  { id: 'newest', label: 'Mới nhất', icon: Sparkles },
  { id: 'price-asc', label: 'Giá thấp → cao', icon: ArrowUp },
  { id: 'price-desc', label: 'Giá cao → thấp', icon: ArrowDown },
];

const SortBar = ({ currentSort = 'popular', onSortChange, totalCount = 0 }) => {
  return (
    <div className="bg-white rounded-[12px] p-3 border border-taca-border mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
        <span className="text-[12px] font-bold text-taca-text-muted uppercase tracking-wider shrink-0">
          Ưu tiên xem:
        </span>
        <div className="flex max-w-full items-center gap-1.5 min-w-0 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORT_OPTIONS.map((opt) => {
            const isActive = currentSort === opt.id;
            const IconComponent = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSortChange && onSortChange(opt.id)}
                className={`px-2.5 sm:px-3 py-1.5 text-[12px] font-bold rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 ${
                  isActive
                    ? 'bg-taca-primary text-white shadow-xs'
                    : 'bg-taca-surface text-taca-text-main hover:bg-taca-primary/5 hover:text-taca-primary border border-taca-border'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-taca-text-muted'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {totalCount > 0 && (
        <div className="text-[12px] text-taca-text-muted font-medium pr-1 md:text-right whitespace-nowrap">
          Hiển thị <span className="font-bold text-taca-text-main">{totalCount}</span> sản phẩm
        </div>
      )}
    </div>
  );
};

SortBar.propTypes = {
  currentSort: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
};

export default SortBar;
