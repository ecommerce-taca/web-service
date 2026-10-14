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
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider pl-1">
          Ưu tiên xem:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const isActive = currentSort === opt.id;
            const IconComponent = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSortChange && onSortChange(opt.id)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-taca-primary text-white shadow-xs scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {totalCount > 0 && (
        <div className="text-[12px] text-slate-400 font-medium pr-1 text-right hidden md:block">
          Hiển thị <span className="font-bold text-slate-700">{totalCount}</span> sản phẩm
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
