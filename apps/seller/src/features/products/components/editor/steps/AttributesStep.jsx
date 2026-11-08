import PropTypes from 'prop-types';
import { X, Plus, Trash2, Sparkles, Layers } from 'lucide-react';

const COMMON_ATTRIBUTE_PRESETS = [
  { name: 'Màu sắc', display_as: 'COLOR_SWATCH', values: ['Đen', 'Trắng', 'Titan', 'Xanh'] },
  { name: 'Dung lượng', display_as: 'PLAIN', values: ['128GB', '256GB', '512GB'] },
  { name: 'Kích thước', display_as: 'PLAIN', values: ['S', 'M', 'L', 'XL'] },
  { name: 'Kết nối', display_as: 'PLAIN', values: ['Wi-Fi', '5G'] },
  { name: 'Chất liệu', display_as: 'PLAIN', values: ['Cotton', 'Titanium', 'Nhôm'] },
];

const VALUE_SUGGESTIONS = {
  color: ['Đen', 'Trắng', 'Xám', 'Xanh dương', 'Xanh lá', 'Đỏ', 'Vàng', 'Titan', 'Tím', 'Hồng'],
  storage: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
  size: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  connectivity: ['Wi-Fi', '5G', '4G LTE', 'Bluetooth', 'GPS'],
};

function getSuggestionsForAttr(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('màu') || lower.includes('color')) return VALUE_SUGGESTIONS.color;
  if (lower.includes('dung lượng') || lower.includes('bộ nhớ') || lower.includes('storage') || lower.includes('ssd') || lower.includes('ram')) {
    return VALUE_SUGGESTIONS.storage;
  }
  if (lower.includes('kích') || lower.includes('size') || lower.includes('cỡ')) return VALUE_SUGGESTIONS.size;
  if (lower.includes('kết nối') || lower.includes('connectivity') || lower.includes('mạng')) return VALUE_SUGGESTIONS.connectivity;
  return [];
}

/**
 * Step 2: Quản lý thuộc tính SKU linh hoạt & Tự động sinh tổ hợp biến thể
 */
export default function AttributesStep({
  attributes,
  newValueInputs,
  setNewValueInputs,
  onAddValue,
  onRemoveValue,
  onRemoveAttribute,
  onOpenAddAttrModal,
  onAddAttribute,
  combosCount,
  combinations = []
}) {
  return (
    <div className="space-y-6">
      {/* 1. Header & Hướng dẫn */}
      <div>
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase">
          THUỘC TÍNH SKU & PHÂN LOẠI HÀNG
        </h3>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Tạo các nhóm phân loại (Màu sắc, Dung lượng, Kích thước...) và chọn các giá trị để hệ thống tự động sinh ma trận biến thể SKU.
        </p>
      </div>

      {/* 2. Gợi ý thuộc tính nhanh (1-Click Presets) */}
      <div className="p-3 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>Thêm nhanh nhóm thuộc tính phổ biến</span>
          </span>
          <span className="text-[10px] text-slate-400">1-click điền sẵn</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_ATTRIBUTE_PRESETS.map((preset) => {
            const alreadyExists = attributes.some(
              (a) => a.name.toLowerCase() === preset.name.toLowerCase()
            );
            return (
              <button
                key={preset.name}
                type="button"
                disabled={alreadyExists}
                onClick={() => {
                  if (onAddAttribute && !alreadyExists) {
                    onAddAttribute(preset);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  alreadyExists
                    ? 'border-slate-200 bg-slate-100/60 text-slate-400 cursor-not-allowed'
                    : 'border-indigo-200 bg-white hover:bg-indigo-50 text-[#4F46E5] hover:border-[#4F46E5] cursor-pointer shadow-2xs'
                }`}
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({preset.values.slice(0, 2).join(', ')}...)
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onOpenAddAttrModal}
            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
            <span>Tùy chỉnh khác...</span>
          </button>
        </div>
      </div>

      {/* 3. Danh sách thuộc tính hiện có */}
      <div className="space-y-3">
        {attributes.map((attr) => {
          const suggestions = getSuggestionsForAttr(attr.name).filter(
            (s) => !attr.values.includes(s)
          );

          return (
            <div
              key={attr.id}
              className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400 font-mono text-xs select-none">⋮⋮</span>
                  <span className="font-bold text-slate-900 text-[13px]">
                    {attr.name}
                  </span>
                  {attr.display_as === 'COLOR_SWATCH' ? (
                    <span className="text-[10px] bg-indigo-50 text-[#4F46E5] px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                      Hiển thị Màu sắc
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      Văn bản
                    </span>
                  )}
                </div>

                {onRemoveAttribute && attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttribute(attr.id)}
                    aria-label={`Xóa thuộc tính ${attr.name}`}
                    title="Xóa nhóm thuộc tính này"
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Danh sách giá trị hiện tại */}
              <div className="flex flex-wrap items-center gap-2">
                {attr.values.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[12px] font-semibold text-slate-800 shadow-2xs"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveValue(attr.id, val)}
                      aria-label={`Xóa giá trị ${val}`}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}

                {/* Ô nhập giá trị tùy chỉnh */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="+ Nhập giá trị"
                    value={newValueInputs[attr.id] || ''}
                    onChange={(e) =>
                      setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onAddValue(attr.id);
                      }
                    }}
                    className="w-28 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={() => onAddValue(attr.id)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Gợi ý giá trị 1-click */}
              {suggestions.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                  <span className="text-[10px] text-slate-400 shrink-0">Gợi ý 1-click:</span>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.slice(0, 8).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => onAddValue(attr.id, sug)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-[#4F46E5] hover:border-indigo-200 border border-slate-200 rounded text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Tóm tắt ma trận biến thể (Combos Summary Card) */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
            <span className="text-[13px] font-bold text-slate-900">
              Ma trận biến thể ({combosCount} tổ hợp SKU)
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#4F46E5] bg-white px-2.5 py-1 rounded-full border border-indigo-200">
            {combosCount} biến thể SKU
          </span>
        </div>

        <p className="text-[12px] text-slate-600">
          Hệ thống sẽ tự động sinh ma trận <strong>{combosCount} SKU</strong> từ {attributes.length} nhóm thuộc tính trên. Ở <strong>Bước 3: Giá & kho</strong>, bạn sẽ thiết lập mã SKU, giá bán và số lượng tồn kho (có hỗ trợ áp dụng hàng loạt 1-click).
        </p>

        {/* Xem trước tổ hợp */}
        {combinations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {combinations.slice(0, 8).map((combo, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white border border-indigo-100 rounded-md text-[11px] font-medium text-slate-700 shadow-2xs"
              >
                {Object.values(combo).join(' / ')}
              </span>
            ))}
            {combinations.length > 8 && (
              <span className="px-2 py-1 bg-indigo-100/70 text-[#4F46E5] rounded-md text-[11px] font-bold">
                +{combinations.length - 8} tổ hợp khác
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AttributesStep.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      display_as: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  newValueInputs: PropTypes.object.isRequired,
  setNewValueInputs: PropTypes.func.isRequired,
  onAddValue: PropTypes.func.isRequired,
  onRemoveValue: PropTypes.func.isRequired,
  onRemoveAttribute: PropTypes.func,
  onOpenAddAttrModal: PropTypes.func.isRequired,
  onAddAttribute: PropTypes.func,
  combosCount: PropTypes.number.isRequired,
  combinations: PropTypes.arrayOf(PropTypes.object),
};
