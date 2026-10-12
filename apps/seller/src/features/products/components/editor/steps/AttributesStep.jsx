import PropTypes from 'prop-types';

/**
 * Step 2: Quản lý thuộc tính SKU linh hoạt theo ngành hàng
 */
export default function AttributesStep({
  attributes,
  newValueInputs,
  setNewValueInputs,
  onAddValue,
  onRemoveValue,
  onOpenAddAttrModal,
  onRegenerateSkus,
  combosCount
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase">
          THUỘC TÍNH SKU
        </h3>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Tạo thuộc tính linh hoạt theo từng ngành hàng — không giới hạn màu sắc hoặc kích thước.
        </p>
      </div>

      <div className="space-y-3">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">⋮⋮</span>
              <span className="font-bold text-slate-800 text-[13px]">
                {attr.id} · {attr.name}
              </span>
              {attr.display_as === 'COLOR_SWATCH' && (
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                  Màu sắc
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {attr.values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveValue(attr.id, val)}
                    className="text-slate-400 hover:text-rose-500 text-xs font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Add value mini-input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="＋ Giá trị"
                  value={newValueInputs[attr.id] || ''}
                  onChange={(e) => setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddValue(attr.id);
                    }
                  }}
                  className="w-24 px-2 py-1 bg-white border border-dashed border-slate-300 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={() => onAddValue(attr.id)}
                  className="text-[11px] font-bold text-[#4F46E5] px-1 hover:underline cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between text-[12px] pt-2 gap-2">
        <button
          type="button"
          onClick={onOpenAddAttrModal}
          className="font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
        >
          ＋ Thêm thuộc tính
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">
            {attributes.length} thuộc tính · <strong className="text-slate-900">{combosCount}</strong> tổ hợp SKU
          </span>
          <button
            type="button"
            onClick={onRegenerateSkus}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>🔄</span>
            <span>Sinh bảng SKU từ {combosCount} tổ hợp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

AttributesStep.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      display_as: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  newValueInputs: PropTypes.object.isRequired,
  setNewValueInputs: PropTypes.func.isRequired,
  onAddValue: PropTypes.func.isRequired,
  onRemoveValue: PropTypes.func.isRequired,
  onOpenAddAttrModal: PropTypes.func.isRequired,
  onRegenerateSkus: PropTypes.func.isRequired,
  combosCount: PropTypes.number.isRequired,
};
