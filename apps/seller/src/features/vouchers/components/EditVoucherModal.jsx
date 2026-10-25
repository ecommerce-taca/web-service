import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateSellerVoucher } from '../services/seller-voucher.api';

export default function EditVoucherModal({ voucher, isOpen, onClose, onSuccess }) {
  const [name, setName] = useState(voucher?.name || '');
  const [code, setCode] = useState(voucher?.code || '');
  const [discountType, setDiscountType] = useState(
    voucher?.discount_type || (voucher?.type?.includes('Phần trăm') ? 'PERCENT' : 'FIXED')
  );
  const [discountValue, setDiscountValue] = useState(voucher?.discount || voucher?.value || '');
  const [minOrder, setMinOrder] = useState(
    voucher?.condition ? voucher.condition.replace('Đơn từ ', '') : '200.000 ₫'
  );
  const [usageLimit, setUsageLimit] = useState(voucher?.total || voucher?.usage_limit || 1000);
  const [dateRange, setDateRange] = useState(voucher?.time_range || '20/08 – 31/08');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  if (!isOpen || !voucher) return null;

  const isCodeLocked = (voucher.used || voucher.used_count || 0) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const voucherId = voucher.voucher_id || voucher.id || voucher.code;
      const payload = {
        code,
        name,
        discountType,
        discountValue,
        minOrder,
        usageLimit: Number(usageLimit) || 1000,
        dateRange,
        version: voucher.version || 1,
      };

      await updateSellerVoucher(voucherId, payload);
      setNotification('Cập nhật voucher thành công!');
      setTimeout(() => {
        if (onSuccess) onSuccess({ ...voucher, ...payload });
        onClose();
      }, 1000);
    } catch (err) {
      console.warn('Lỗi cập nhật voucher:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Có lỗi xảy ra khi cập nhật voucher. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[580px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase">
              CHỈNH SỬA VOUCHER
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Cập nhật định mức ưu đãi và thời hạn áp dụng voucher
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-[13px]">
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

          {/* Program name */}
          <div>
            <label htmlFor="edit-voucher-name" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Tên chương trình *
            </label>
            <input
              id="edit-voucher-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Voucher code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="edit-voucher-code" className="block text-[11px] font-bold text-slate-700 uppercase">
                Mã voucher *
              </label>
              {isCodeLocked && (
                <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" aria-hidden="true" />
                  <span>Đã có lượt dùng ({voucher.used || voucher.used_count}) – Khóa mã</span>
                </span>
              )}
            </div>
            <input
              id="edit-voucher-code"
              type="text"
              required
              disabled={isCodeLocked}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 font-mono font-bold border rounded-lg ${
                isCodeLocked
                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                  : 'border-slate-300 text-slate-900 focus:outline-none focus:border-[#4F46E5]'
              }`}
            />
          </div>

          {/* Type & Discount Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="edit-voucher-discount-type" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Loại giảm giá
              </label>
              <select
                id="edit-voucher-discount-type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Giảm số tiền cố định (₫)</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-voucher-discount-value" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mức giảm *
              </label>
              <input
                id="edit-voucher-discount-value"
                type="text"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENT' ? '10%' : '50.000 ₫'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Min order & Usage limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="edit-voucher-min-order" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Đơn hàng tối thiểu
              </label>
              <input
                id="edit-voucher-min-order"
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="200.000 ₫"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label htmlFor="edit-voucher-usage-limit" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Số lượng phát hành
              </label>
              <input
                id="edit-voucher-usage-limit"
                type="number"
                min={voucher.used || 1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Time range */}
          <div>
            <label htmlFor="edit-voucher-date-range" className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Thời gian áp dụng
            </label>
            <input
              id="edit-voucher-date-range"
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="01/09/2026 – 30/09/2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Footer actions */}
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
              disabled={submitting}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditVoucherModal.propTypes = {
  voucher: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
