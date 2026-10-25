import { useState, useEffect, useId } from 'react';
import PropTypes from 'prop-types';
import {
  SlidersHorizontal,
  ShieldCheck,
  Star,
  Check,
  Layers,
  Smartphone,
  Laptop,
  Utensils,
  Tv,
  BookOpen,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { productApi } from '../../products/services/product.api';

const CATEGORY_ICON_MAP = {
  all: Layers,
  'dien-thoai': Smartphone,
  'dien-thoai-tablet': Smartphone,
  laptop: Laptop,
  'laptop-may-tinh': Laptop,
  'gia-dung': Utensils,
  'nha-cua-doi-song': Utensils,
  'tv-loa': Tv,
  'tv-dien-may': Tv,
  'nha-sach': BookOpen,
  'nha-sach-taca': BookOpen,
  'thoi-trang': Shirt,
  'lam-dep': Sparkles,
  'lam-dep-suc-khoe': Sparkles,
};

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'Tất cả danh mục' },
  { id: 'dien-thoai', slug: 'dien-thoai-tablet', label: 'Điện thoại & Tablet' },
  { id: 'laptop', slug: 'laptop-may-tinh', label: 'Máy tính & Laptop' },
  { id: 'gia-dung', slug: 'nha-cua-doi-song', label: 'Đồ gia dụng & Đời sống' },
  { id: 'tv-loa', slug: 'tv-dien-may', label: 'TV & Điện máy' },
  { id: 'nha-sach', slug: 'nha-sach-taca', label: 'Nhà sách Taca' },
  { id: 'thoi-trang', slug: 'thoi-trang', label: 'Thời trang' },
  { id: 'lam-dep', slug: 'lam-dep-suc-khoe', label: 'Làm đẹp & Sức khỏe' },
];

const BRANDS = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Logitech', 'Anker', 'Lock&Lock'];

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-5m', label: 'Dưới 5 triệu' },
  { id: '5m-15m', label: '5 - 15 triệu' },
  { id: 'over-15m', label: 'Trên 15 triệu' },
];

const FilterSidebar = ({
  selectedCategory = 'all',
  onCategoryChange,
  selectedBrand = '',
  onBrandChange,
  selectedPriceRange = 'all',
  onPriceRangeChange,
  isOfficialOnly = false,
  onOfficialChange,
  minRating = 0,
  onRatingChange,
  onResetFilters
}) => {
  const instanceId = useId();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    productApi.getCategories()
      .then(res => {
        if (!isMounted) return;
        const tree = res?.data || [];
        if (Array.isArray(tree) && tree.length > 0) {
          const dynamicCats = [{ id: 'all', label: 'Tất cả danh mục' }];
          tree.forEach(node => {
            dynamicCats.push({
              id: node.id || node.category_id || node.slug,
              slug: node.slug || node.id,
              label: node.name || node.title || node.label,
            });
          });
          setCategories(dynamicCats);
        }
      })
      .catch(err => {
        console.warn('[FilterSidebar] Lỗi tải danh mục từ API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory !== 'all') ||
    selectedBrand ||
    (selectedPriceRange && selectedPriceRange !== 'all') ||
    isOfficialOnly ||
    Number(minRating) > 0
  );

  return (
    <aside className="w-full lg:w-[250px] flex flex-col gap-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs sticky top-24">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h3 className="text-[14px] font-black text-slate-900 m-0 uppercase tracking-tight">
            BỘ LỌC TÌM KIẾM
          </h3>
        </div>
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer transition-colors bg-transparent border-none p-0"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* DANH MỤC */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[12px] font-extrabold text-slate-700 m-0 uppercase tracking-wider">
          DANH MỤC SẢN PHẨM
        </h4>
        <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id || 
              (cat.slug && selectedCategory === cat.slug) || 
              (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'));
            const IconComponent = CATEGORY_ICON_MAP[cat.id] || CATEGORY_ICON_MAP[cat.slug] || Layers;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange && onCategoryChange(cat.id)}
                className={`text-left text-[12px] py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border-none ${
                  isActive 
                    ? 'font-bold text-white bg-taca-primary shadow-xs' 
                    : 'bg-transparent text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </span>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 m-0" />

      {/* THƯƠNG HIỆU */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[12px] font-extrabold text-slate-700 m-0 uppercase tracking-wider">
          THƯƠNG HIỆU
        </h4>
        <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {BRANDS.map(brand => {
            const checked = Boolean(selectedBrand && selectedBrand.toLowerCase() === brand.toLowerCase());
            return (
              <label
                key={brand}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors select-none ${
                  checked ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onBrandChange && onBrandChange(checked ? '' : brand)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[12px]">{brand}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 m-0" />

      {/* KHOẢNG GIÁ */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[12px] font-extrabold text-slate-700 m-0 uppercase tracking-wider">
          KHOẢNG GIÁ
        </h4>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map(range => {
            const checked = selectedPriceRange === range.id;
            return (
              <label
                key={range.id}
                onClick={(e) => {
                  if (checked && range.id !== 'all') {
                    e.preventDefault();
                    onPriceRangeChange && onPriceRangeChange('all');
                  }
                }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors select-none ${
                  checked ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={`priceRange-${instanceId}`}
                  checked={checked}
                  onChange={() => onPriceRangeChange && onPriceRangeChange(range.id)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[12px]">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 m-0" />

      {/* DỊCH VỤ & CAM KẾT */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[12px] font-extrabold text-slate-700 m-0 uppercase tracking-wider">
          DỊCH VỤ & CAM KẾT
        </h4>
        <label
          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer border transition-all select-none ${
            isOfficialOnly
              ? 'bg-rose-50/80 border-rose-300 text-rose-700 font-bold'
              : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={Boolean(isOfficialOnly)}
            onChange={(e) => onOfficialChange && onOfficialChange(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 text-[12px]">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Chính hãng 100% (Mall)</span>
          </div>
        </label>
      </div>

      <hr className="border-slate-100 m-0" />

      {/* ĐÁNH GIÁ */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-[12px] font-extrabold text-slate-700 m-0 uppercase tracking-wider">
          ĐÁNH GIÁ SẢN PHẨM
        </h4>
        <div className="flex flex-col gap-1.5">
          {[4.5, 4.0].map(star => {
            const checked = Number(minRating) === star;
            return (
              <label
                key={star}
                onClick={(e) => {
                  if (checked) {
                    e.preventDefault();
                    onRatingChange && onRatingChange(0);
                  }
                }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors select-none ${
                  checked ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={`minRating-${instanceId}`}
                  checked={checked}
                  onChange={() => onRatingChange && onRatingChange(star)}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-[12px] flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(star)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </span>
                  <span>Từ {star} sao</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

FilterSidebar.propTypes = {
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  selectedBrand: PropTypes.string,
  onBrandChange: PropTypes.func,
  selectedPriceRange: PropTypes.string,
  onPriceRangeChange: PropTypes.func,
  isOfficialOnly: PropTypes.bool,
  onOfficialChange: PropTypes.func,
  minRating: PropTypes.number,
  onRatingChange: PropTypes.func,
  onResetFilters: PropTypes.func,
};

export default FilterSidebar;
