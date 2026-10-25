import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Package, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adjustSellerInventory } from '../services/seller-inventory.api';

const REASON_PRESETS = [
  'Nhập thêm hàng từ nhà phân phối',
  'Kiểm kê định kỳ cân đối sổ sách',
  'Hàng lỗi / hư hỏng / quá hạn',
  'Xuất mẫu trưng bày hoặc tặng kèm',
  'Khác (nhập chi tiết bên dưới)',
];

export default function StockAdjustModal({ item, isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('add'); // 'add' | 'subtract' | 'set'
  const [amount, setAmount] = useState('10');
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  if (!isOpen || !item) return null;

  const currentAvailable = Number(item.available_qty) || 0;
  const numAmount = Math.abs(parseInt(amount, 10)) || 0;

  let delta = 0;
  if (mode === 'add') {
    delta = numAmount;
  } else if (mode === 'subtract') {
    delta = -numAmount;
  } else if (mode === 'set') {
    delta = numAmount - currentAvailable;
  }

  const finalAvailable = currentAvailable + delta;
  const isInvalid = finalAvailable < 0;

  const finalReason = selectedReason === 'Khác (nhập chi tiết bên dưới)'
    ? (customReason.trim() || 'Điều chỉnh thủ công')
    : selectedReason;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalid) {
      setError('Số lượng tồn sau điều chỉnh không thể nhỏ hơn 0.');
      return;
    }
    if (delta === 0) {
      setError('Số lượng điều chỉnh không tạo ra thay đổi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await adjustSellerInventory(item.sku_id, {
        delta_available: delta,
        reason: finalReason,
        version: item.version || 1,
      });

      setNotification('Cập nhật tồn kho thành công!');
      setTimeout(() => {
        if (onSuccess) onSuccess(res);
        onClose();
      }, 900);
    } catch (err) {
      console.warn('Lỗi điều chỉnh tồn kho:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Có lỗi xảy ra khi điều chỉnh tồn kho. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[540px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
              <span>ĐIỀU CHỈNH TỒN KHO SKU</span>
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Mã SKU: <span className="font-semibold text-slate-800">{item.seller_sku || item.sku_id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[13px]">
          {/* SKU Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-11 h-11 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-[13px] truncate">
                {item.product_name || 'Tên sản phẩm'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Phân loại: <span className="text-slate-700 font-medium">{item.sku_label || item.seller_sku}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-slate-500">Tồn hiện tại</div>
              <div className="text-[15px] font-extrabold text-[#4F46E5]">
                {currentAvailable.toLocaleString()}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{notification}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              HÌNH THỨC ĐIỀU CHỈNH
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'add'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Nhập thêm</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('subtract')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'subtract'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" aria-hidden="true" />
                <span>Xuất bớt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('set');
                  setAmount(String(currentAvailable));
                }}
                className={`py-2 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'set'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#4F46E5]" aria-hidden="true" />
                <span>Cân đối lại</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="adjust-quantity-input" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {mode === 'add' ? 'Số lượng nhập thêm *' : mode === 'subtract' ? 'Số lượng xuất kho *' : 'Số lượng tồn thực tế mới *'}
            </label>
            <input
              id="adjust-quantity-input"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-[14px] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Reason preset */}
          <div>
            <label htmlFor="adjust-reason-select" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              LÝ DO ĐIỀU CHỈNH
            </label>
            <select
              id="adjust-reason-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-[13px] focus:outline-none focus:border-[#4F46E5]"
            >
              {REASON_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === 'Khác (nhập chi tiết bên dưới)' && (
            <div>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do chi tiết để lưu vết sổ kho..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-[12px] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          )}

          {/* Calculation Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[12px]">
            <div>
              <span className="text-slate-500">Tồn khả dụng trước: </span>
              <span className="font-semibold text-slate-800">{currentAvailable}</span>
              <span className="text-slate-400 mx-2">→</span>
              <span className="text-slate-500">Biến động: </span>
              <span className={`font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 mr-1.5">Tồn mới:</span>
              <span className={`font-extrabold text-[15px] ${isInvalid ? 'text-rose-600' : 'text-slate-900'}`}>
                {finalAvailable.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || isInvalid}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Xác nhận cập nhật</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

StockAdjustModal.propTypes = {
  item: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
