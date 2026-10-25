import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cancelSellerOrder } from '../services/seller-order.api';

const CANCEL_REASONS = [
  { value: 'OUT_OF_STOCK', label: 'Hết hàng trong kho (Out of stock)' },
  { value: 'CUSTOMER_REQUEST', label: 'Khách hàng liên hệ yêu cầu hủy đơn' },
  { value: 'UNDELIVERABLE_AREA', label: 'Địa chỉ giao hàng ngoài vùng phủ sóng vận chuyển' },
  { value: 'SELLER_REQUEST', label: 'Lý do vận hành khác từ phía người bán' },
];

export default function CancelOrderModal({ order, isOpen, onClose, onSuccess }) {
  const [reason, setReason] = useState('OUT_OF_STOCK');
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const orderVersion = order.version || 1;
      const result = await cancelSellerOrder(order.id, {
        reason,
        note: customNote.trim() || undefined,
        version: orderVersion,
      });

      if (onSuccess) {
        onSuccess(result || { order_id: order.id, reason });
      }
      onClose();
    } catch (err) {
      console.warn('Lỗi khi hủy đơn hàng:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Không thể hủy đơn hàng vào lúc này. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[520px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                XÁC NHẬN HỦY ĐƠN HÀNG
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Mã đơn: <span className="font-semibold text-slate-800">{order.id}</span>
              </p>
            </div>
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
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 text-[13px]">
            {/* Warning policy box */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-[12px] text-amber-900 leading-relaxed">
                <strong>Chính sách người bán:</strong> Việc hủy đơn do hết hàng có thể ảnh hưởng đến tỷ lệ đơn hàng không thành công (NFR) của gian hàng. Kho hàng sẽ tự động hoàn lại tồn nếu đơn đã giữ chỗ.
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px]">
                {error}
              </div>
            )}

            {/* Reason code selection */}
            <div>
              <label htmlFor="cancel-reason-select" className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                LÝ DO HỦY ĐƠN (BẮT BUỘC)
              </label>
              <select
                id="cancel-reason-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-[13px] font-medium focus:outline-none focus:border-[#4F46E5]"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom note */}
            <div>
              <label htmlFor="cancel-note-input" className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                GHI CHÚ BỔ SUNG (TÙY CHỌN)
              </label>
              <textarea
                id="cancel-note-input"
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Nhập thông tin chi tiết giải trình lý do hủy để thông báo đến khách hàng..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-[12px] focus:outline-none focus:border-[#4F46E5] focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Xác nhận hủy đơn</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CancelOrderModal.propTypes = {
  order: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
