import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

export default function BlockProductModal({ isOpen, onClose, product, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Vui lòng nhập lý do khóa vi phạm cụ thể (tối thiểu 5 ký tự).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirm({
        productId: product.product_id,
        version: product.version || 1,
        reason: reason.trim(),
      });
      setReason('');
      onClose();
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi khóa sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Khóa sản phẩm vi phạm</h3>
              <p className="text-xs text-rose-600 font-medium">Hành động kiểm duyệt (Post-publication block)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-xs text-slate-500">Sản phẩm bị xử lý:</div>
            <div className="text-sm font-bold text-slate-900 line-clamp-2">{product.title}</div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                {product.spu_code || product.product_id}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{product.shop_name}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="block-reason-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lý do khóa / Căn cứ vi phạm <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="block-reason-textarea"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ví dụ: Quảng cáo sai sự thật có claim y tế điều trị bệnh; Hàng giả nhãn hiệu; Hình ảnh phản cảm..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500">
              Lý do này sẽ được ghi vào nhật ký kiểm toán và hiển thị cho người bán trong cổng Seller Portal.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Xác nhận khóa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

BlockProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    product_id: PropTypes.string,
    title: PropTypes.string,
    spu_code: PropTypes.string,
    shop_name: PropTypes.string,
    version: PropTypes.number,
  }),
  onConfirm: PropTypes.func.isRequired,
};
