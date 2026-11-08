import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';

function CreateRefundForm({ onClose, onSuccess, initialPayment }) {
  const [paymentId, setPaymentId] = useState(initialPayment?.payment_id || 'payment-01912fa1');
  const [orderId, setOrderId] = useState(initialPayment?.order_id || 'ord-01912fa0');
  const [amount, setAmount] = useState(String(initialPayment?.amount || 1094000));
  const [reason, setReason] = useState('Khách hàng hủy đơn / đối soát hoàn hàng');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  const numericAmount = Number(String(amount).replace(/[^0-9]/g, '')) || 0;
  const formattedDisplayAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentId.trim()) {
      setError('Vui lòng nhập mã giao dịch thanh toán (Payment ID)');
      return;
    }
    if (numericAmount <= 0) {
      setError('Số tiền hoàn trả phải lớn hơn 0 ₫');
      return;
    }
    setError('');
    setIsMfaOpen(true);
  };

  const handleMfaSuccess = async (stepUpToken) => {
    try {
      setIsSubmitting(true);
      setError('');

      await adminFinanceApi.createRefund(
        paymentId.trim(),
        {
          order_id: orderId.trim(),
          amount: numericAmount,
          reason: reason.trim() || 'Hoàn tiền đối soát hoàn đơn hàng'
        },
        stepUpToken
      );

      if (onSuccess) {
        onSuccess({ paymentId, amount: numericAmount });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi thực hiện hoàn tiền:', err);
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Không thể xử lý yêu cầu hoàn tiền. Vui lòng kiểm tra lại mã 2FA.'
      );
    } finally {
      setIsSubmitting(false);
      setIsMfaOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-900 tracking-tight">
                Tạo Lệnh Hoàn Tiền (Refund)
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Hoàn tiền giao dịch cổng thanh toán và hạch toán đảo sổ cái (REQ-04)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body with internal scrolling */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment ID & Order ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã Payment ID *
              </label>
              <input
                type="text"
                required
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="payment-01912fa1"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[12px] font-bold text-slate-900 focus:outline-none focus:border-rose-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ord-01912fa0"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[12px] font-medium text-slate-800 focus:outline-none focus:border-rose-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Số tiền hoàn trả (VND nguyên tệ) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl font-bold text-slate-900 text-[15px] focus:outline-none focus:border-rose-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                ₫
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Số tiền hoàn: <strong className="text-rose-600 font-extrabold">{formattedDisplayAmount}</strong>
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lý do hoàn tiền & căn cứ biên bản
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi rõ lý do hoàn hàng, hủy đơn hoặc chênh lệch đối soát..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-800 text-[13px] focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Security alert */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11.5px] flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Thao tác yêu cầu xác thực 2FA OTP qua header <strong>X-MFA-Step-Up</strong></span>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-[12px] font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numericAmount <= 0}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Đang gửi...' : `Xác nhận hoàn ${formattedDisplayAmount}`}</span>
            </button>
          </div>
        </form>

        {/* Modal 2FA Step-up */}
        <StepUpMfaModal
          isOpen={isMfaOpen}
          onClose={() => setIsMfaOpen(false)}
          onSuccess={handleMfaSuccess}
          title="Xác thực 2FA Lệnh Hoàn Tiền"
          description={`Hoàn trả số tiền ${formattedDisplayAmount} cho giao dịch #${paymentId} yêu cầu xác thực OTP 2FA để đảo chiều bút toán sổ cái.`}
        />
      </div>
    </div>
  );
}

CreateRefundForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialPayment: PropTypes.object
};

export default function CreateRefundModal({ isOpen, onClose, onSuccess, initialPayment }) {
  if (!isOpen) return null;

  return createPortal(
    <CreateRefundForm onClose={onClose} onSuccess={onSuccess} initialPayment={initialPayment} />,
    document.body
  );
}

CreateRefundModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialPayment: PropTypes.object
};
