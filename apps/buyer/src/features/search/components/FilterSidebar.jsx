import PropTypes from 'prop-types';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả danh mục' },
  { id: 'dien-thoai', label: 'Điện thoại' },
  { id: 'laptop', label: 'Máy tính & Laptop' },
  { id: 'am-thanh', label: 'Thiết bị Âm thanh' },
  { id: 'gia-dung', label: 'Đồ gia dụng thông minh' },
  { id: 'phu-kien', label: 'Phụ kiện & Khác' },
];

const BRANDS = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Logitech', 'JBL', 'Amazon'];

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-5m', label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { id: '5m-15m', label: '5 - 15 triệu', min: 5000000, max: 15000000 },
  { id: 'over-15m', label: 'Trên 15 triệu', min: 15000000, max: Infinity },
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
  return (
    <div className="w-[240px] flex flex-col gap-8 bg-white p-4 rounded-xl border border-taca-border">
      {/* DANH MỤC */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[13px] font-extrabold text-taca-text-main m-0 uppercase tracking-wider">
          DANH MỤC
        </h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange && onCategoryChange(cat.id)}
                className={`text-left text-[13px] py-1 px-2 rounded-md transition-colors cursor-pointer ${
                  isActive 
                    ? 'font-bold text-taca-primary bg-[#f4f7ff]' 
                    : 'text-taca-text-main hover:text-taca-primary hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100 m-0" />

      {/* BỘ LỌC NHANH */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[13px] font-extrabold text-taca-text-main m-0 uppercase tracking-wider">
            BỘ LỌC NHANH
          </h3>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-taca-primary hover:underline cursor-pointer font-medium"
            >
              Thiết lập lại
            </button>
          )}
        </div>

        {/* Thương hiệu */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Thương hiệu</h4>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {BRANDS.map(brand => {
              const checked = selectedBrand.toLowerCase() === brand.toLowerCase();
              return (
                <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onBrandChange && onBrandChange(checked ? '' : brand)}
                    className="w-[14px] h-[14px] border-gray-400 rounded-sm text-taca-primary focus:ring-taca-primary cursor-pointer"
                  />
                  <span className={`text-[13px] transition-colors ${checked ? 'text-taca-primary font-bold' : 'text-taca-text-main group-hover:text-taca-primary'}`}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Khoảng giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Khoảng giá</h4>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map(range => {
              const checked = selectedPriceRange === range.id;
              return (
                <label key={range.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={checked}
                    onChange={() => onPriceRangeChange && onPriceRangeChange(range.id)}
                    className="w-[14px] h-[14px] text-taca-primary focus:ring-taca-primary cursor-pointer"
                  />
                  <span className={`text-[13px] transition-colors ${checked ? 'text-taca-primary font-bold' : 'text-taca-text-main group-hover:text-taca-primary'}`}>
                    {range.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Dịch vụ */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Dịch vụ & Cam kết</h4>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isOfficialOnly}
              onChange={(e) => onOfficialChange && onOfficialChange(e.target.checked)}
              className="w-[14px] h-[14px] border-gray-400 rounded-sm text-taca-primary focus:ring-taca-primary cursor-pointer"
            />
            <span className={`text-[13px] transition-colors ${isOfficialOnly ? 'text-taca-primary font-bold' : 'text-taca-text-main group-hover:text-taca-primary'}`}>
              Chính hãng 100%
            </span>
          </label>
        </div>

        {/* Đánh giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Đánh giá tối thiểu</h4>
          <div className="flex flex-col gap-2">
            {[4.5, 4.0].map(star => {
              const checked = minRating === star;
              return (
                <label key={star} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="minRating"
                    checked={checked}
                    onChange={() => onRatingChange && onRatingChange(checked ? 0 : star)}
                    className="w-[14px] h-[14px] text-taca-primary focus:ring-taca-primary cursor-pointer"
                  />
                  <span className="text-[13px] text-taca-text-muted flex items-center gap-1">
                    <span className="text-[#faad14] text-[13px]">{'★'.repeat(Math.floor(star))}</span> từ {star} sao
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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
