import PropTypes from 'prop-types';
import { Search, Folder, Sparkles, ArrowUpRight } from 'lucide-react';

export default function SearchSuggestDropdown({
  query,
  suggestions,
  loading,
  isOpen,
  onSelectKeyword,
  onSelectCategory,
  onSelectProduct
}) {
  if (!isOpen) return null;

  const { keywords = [], categories = [], topProducts = [] } = suggestions || {};
  const hasResults = keywords.length > 0 || categories.length > 0 || topProducts.length > 0;

  return (
    <div
      id="search-suggest-dropdown"
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {loading ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <div className="w-3.5 h-3.5 border-2 border-taca-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tìm gợi ý phù hợp cho &quot;{query}&quot;...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ) : !hasResults ? (
        <div className="p-6 text-center text-slate-500">
          <p className="text-sm font-medium">Không tìm thấy gợi ý cho &quot;{query}&quot;</p>
          <p className="text-xs text-slate-400 mt-1">Bấm Enter để tìm kiếm toàn bộ kho sản phẩm của Taca</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {/* Section 1: Từ khóa gợi ý (Instant Keywords) */}
          {keywords.length > 0 && (
            <div className="p-2 sm:p-3">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Từ khóa gợi ý</span>
              </div>
              <ul className="mt-1 space-y-0.5 list-none p-0 m-0">
                {keywords.map((kw, idx) => (
                  <li key={`kw-${idx}`}>
                    <button
                      type="button"
                      onClick={() => onSelectKeyword(kw)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px] text-slate-700 hover:text-taca-primary hover:bg-slate-50 transition-colors group cursor-pointer border-none bg-transparent"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-taca-primary shrink-0" />
                        <span className="truncate font-medium">{kw}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-taca-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 2: Ngành hàng liên quan (Categories) */}
          {categories.length > 0 && (
            <div className="p-2 sm:p-3 bg-slate-50/50">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-indigo-500" />
                <span>Ngành hàng liên quan</span>
              </div>
              <div className="mt-1.5 px-3 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-taca-primary hover:text-taca-primary hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Sản phẩm nổi bật (Top Products) */}
          {topProducts.length > 0 && (
            <div className="p-2 sm:p-3">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sản phẩm nổi bật
              </div>
              <div className="mt-1.5 space-y-1">
                {topProducts.map((prd) => (
                  <button
                    key={prd.id}
                    type="button"
                    onClick={() => onSelectProduct(prd)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer border-none bg-transparent"
                  >
                    <img
                      src={prd.thumbnail}
                      alt={prd.title}
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-800 truncate group-hover:text-taca-primary transition-colors">
                        {prd.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[13px] font-extrabold text-taca-primary">
                          {Number(prd.price || 0).toLocaleString('vi-VN')} ₫
                        </span>
                        {prd.rating && (
                          <span className="text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.2 rounded">
                            ★ {prd.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SearchSuggestDropdown.propTypes = {
  query: PropTypes.string,
  suggestions: PropTypes.shape({
    keywords: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        slug: PropTypes.string
      })
    ),
    topProducts: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        thumbnail: PropTypes.string
      })
    )
  }),
  loading: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onSelectKeyword: PropTypes.func.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  onSelectProduct: PropTypes.func.isRequired
};
