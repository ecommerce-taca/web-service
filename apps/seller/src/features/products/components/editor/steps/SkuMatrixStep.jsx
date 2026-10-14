import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import SkuMatrixRow from '../components/SkuMatrixRow';

/**
 * Step 3: Biến thể đa thuộc tính (SKU Matrix) & Công cụ cập nhật hàng loạt
 */
export default function SkuMatrixStep({
  skus,
  bulkPriceInput,
  setBulkPriceInput,
  bulkStockInput,
  setBulkStockInput,
  onApplyBulkPrice,
  onApplyBulkStock,
  onToggleAllSkus,
  onRegenerateSkus,
  combosCount,
  onUpdateSkuCode,
  onUpdateSkuPrice,
  onUpdateSkuStock,
  onToggleSku
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
            BIẾN THỂ ĐA THUỘC TÍNH (SKU MATRIX)
          </span>
          <p className="text-[12px] text-slate-500">
            Thiết lập mã SKU, giá bán, tồn kho cho từng biến thể tổ hợp thuộc tính.
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerateSkus}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 rounded-lg font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sinh lại bảng ({combosCount} tổ hợp)</span>
        </button>
      </div>

      {/* Bulk update toolbar */}
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
      </div>

      {/* Cảnh báo khi tắt toàn bộ SKU */}
      {skus.every(s => !s.enabled) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[12px] text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Tất cả biến thể SKU đang bị <strong>TẮT (OFF)</strong> nên giá ngoài danh mục hiển thị 0 ₫. Bấm <strong>Bật tất cả</strong> để kích hoạt!</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleAllSkus(true)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Bật tất cả ngay
          </button>
        </div>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">BIẾN THỂ ĐA THUỘC TÍNH</th>
              <th className="py-2.5 px-4">MÃ SKU *</th>
              <th className="py-2.5 px-4">GIÁ BÁN (₫)</th>
              <th className="py-2.5 px-4">TỒN KHO</th>
              <th className="py-2.5 px-4 text-center">HIỂN THỊ</th>
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
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
          Tổng cộng: <strong className="text-slate-900">{skus.length}</strong> biến thể SKU
        </div>
      </div>
    </div>
  );
}

SkuMatrixStep.propTypes = {
  skus: PropTypes.arrayOf(PropTypes.object).isRequired,
  bulkPriceInput: PropTypes.string.isRequired,
  setBulkPriceInput: PropTypes.func.isRequired,
  bulkStockInput: PropTypes.string.isRequired,
  setBulkStockInput: PropTypes.func.isRequired,
  onApplyBulkPrice: PropTypes.func.isRequired,
  onApplyBulkStock: PropTypes.func.isRequired,
  onToggleAllSkus: PropTypes.func.isRequired,
  onRegenerateSkus: PropTypes.func.isRequired,
  combosCount: PropTypes.number.isRequired,
  onUpdateSkuCode: PropTypes.func.isRequired,
  onUpdateSkuPrice: PropTypes.func.isRequired,
  onUpdateSkuStock: PropTypes.func.isRequired,
  onToggleSku: PropTypes.func.isRequired,
};
