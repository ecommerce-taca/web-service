import PropTypes from 'prop-types';
import { X, Plus, RefreshCw, Trash2, Sparkles, Barcode, AlertTriangle } from 'lucide-react';
import SkuMatrixRow from '../components/SkuMatrixRow';

/**
 * Step 2: Quản lý thuộc tính SKU linh hoạt & Tự động sinh bảng SKU Matrix từ tổ hợp
 */
export default function AttributesStep({
  attributes,
  newValueInputs,
  setNewValueInputs,
  onAddValue,
  onRemoveValue,
  onRemoveAttribute,
  onOpenAddAttrModal,
  onRegenerateSkus,
  combosCount,
  skus = [],
  skuPrefix = '',
  bulkPriceInput = '',
  setBulkPriceInput,
  bulkStockInput = '',
  setBulkStockInput,
  onApplyBulkPrice,
  onApplyBulkStock,
  onToggleAllSkus,
  onFormatAllSkuCodes,
  onUpdateSkuCode,
  onUpdateSkuPrice,
  onUpdateSkuStock,
  onToggleSku
}) {
  return (
    <div className="space-y-6">
      {/* 1. Phần cấu hình thuộc tính phân loại */}
      <div className="space-y-4">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase">
            THUỘC TÍNH SKU & TỔ HỢP BIẾN THỂ
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Tạo các nhóm thuộc tính (Màu sắc, Dung lượng, Kích thước...) và các giá trị tương ứng để tự động sinh ma trận biến thể SKU.
          </p>
        </div>

        <div className="space-y-3">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono select-none">⋮⋮</span>
                <span className="font-bold text-slate-800 text-[13px]">
                  {attr.id} · {attr.name}
                </span>
                {attr.display_as === 'COLOR_SWATCH' && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
                    Màu sắc
                  </span>
                )}
                {onRemoveAttribute && attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttribute(attr.id)}
                    aria-label={`Xóa thuộc tính ${attr.name}`}
                    title="Xóa thuộc tính này"
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
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
                      aria-label={`Xóa giá trị ${val}`}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
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

        <div className="flex flex-wrap items-center justify-between text-[12px] pt-1 gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={onOpenAddAttrModal}
            className="font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Thêm thuộc tính mới</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              {attributes.length} thuộc tính · <strong className="text-slate-900 font-bold">{combosCount}</strong> tổ hợp SKU
            </span>
            <button
              type="button"
              onClick={onRegenerateSkus}
              className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sinh lại bảng SKU ({combosCount} tổ hợp)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bảng Ma trận biến thể & Nhập mã SKU trực tiếp */}
      {skus && skus.length > 0 ? (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block mb-0.5">
                BẢNG BIẾN THỂ & MÃ SKU ({skus.length} SKU)
              </span>
              <p className="text-[12px] text-slate-500">
                Người bán nhập mã SKU (<code className="text-[#4F46E5] font-semibold">seller_sku</code>), giá bán và tồn kho cho từng biến thể tổ hợp. Tiền tố SKU: <span className="font-mono font-bold text-[#4F46E5]">{skuPrefix || 'SKU'}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {onFormatAllSkuCodes && (
                <button
                  type="button"
                  onClick={onFormatAllSkuCodes}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  <span>Chuẩn hóa mã SKU</span>
                </button>
              )}
            </div>
          </div>

          {/* Bulk update toolbar */}
          {setBulkPriceInput && setBulkStockInput && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[12px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-700">Áp dụng hàng loạt:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Giá bán chung (₫)"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="w-28 px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={onApplyBulkPrice}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Gán giá
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Kho chung"
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={onApplyBulkStock}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Gán kho
                  </button>
                </div>
              </div>

              {onToggleAllSkus && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleAllSkus(true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Bật tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleAllSkus(false)}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Tắt tất cả
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cảnh báo khi tắt toàn bộ SKU */}
          {skus.every(s => !s.enabled) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[12px] text-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Tất cả biến thể SKU đang bị <strong>TẮT (OFF)</strong>. Bấm <strong>Bật tất cả</strong> để kích hoạt!</span>
              </div>
              {onToggleAllSkus && (
                <button
                  type="button"
                  onClick={() => onToggleAllSkus(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Bật tất cả ngay
                </button>
              )}
            </div>
          )}

          {/* Table Container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="max-h-[45vh] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                    <th className="py-2.5 px-4 bg-slate-50">BIẾN THỂ ĐA THUỘC TÍNH</th>
                    <th className="py-2.5 px-4 bg-slate-50">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Barcode className="w-3.5 h-3.5 text-[#4F46E5]" aria-hidden="true" />
                        <span>MÃ SKU (seller_sku) *</span>
                      </span>
                    </th>
                    <th className="py-2.5 px-4 bg-slate-50">GIÁ BÁN (₫)</th>
                    <th className="py-2.5 px-4 bg-slate-50">TỒN KHO</th>
                    <th className="py-2.5 px-4 text-center bg-slate-50">HIỂN THỊ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skus.map((sku) => (
                    <SkuMatrixRow
                      key={sku.id}
                      sku={sku}
                      onUpdateCode={onUpdateSkuCode}
                      onUpdatePrice={onUpdateSkuPrice}
                      onUpdateStock={onUpdateSkuStock}
                      onToggle={onToggleSku}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
              Tổng cộng: <strong className="text-slate-900">{skus.length}</strong> biến thể SKU được tạo từ tổ hợp thuộc tính
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
          Chưa có biến thể SKU nào. Hãy thêm giá trị cho các thuộc tính ở trên để tự động sinh bảng SKU Matrix.
        </div>
      )}
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
  onRemoveAttribute: PropTypes.func,
  onOpenAddAttrModal: PropTypes.func.isRequired,
  onRegenerateSkus: PropTypes.func.isRequired,
  combosCount: PropTypes.number.isRequired,
  skus: PropTypes.arrayOf(PropTypes.object),
  skuPrefix: PropTypes.string,
  bulkPriceInput: PropTypes.string,
  setBulkPriceInput: PropTypes.func,
  bulkStockInput: PropTypes.string,
  setBulkStockInput: PropTypes.func,
  onApplyBulkPrice: PropTypes.func,
  onApplyBulkStock: PropTypes.func,
  onToggleAllSkus: PropTypes.func,
  onFormatAllSkuCodes: PropTypes.func,
  onUpdateSkuCode: PropTypes.func,
  onUpdateSkuPrice: PropTypes.func,
  onUpdateSkuStock: PropTypes.func,
  onToggleSku: PropTypes.func,
};
