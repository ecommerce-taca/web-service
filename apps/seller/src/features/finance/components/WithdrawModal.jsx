import { useState } from 'react';
import PropTypes from 'prop-types';

export default function WithdrawModal({ isOpen, onClose, onConfirm, balance = '42.800.000 ₫' }) {
  const [amount, setAmount] = useState('20.000.000');
  const [notification, setNotification] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setNotification(`Yêu cầu rút ${amount} ₫ đã được tạo thành công! Tiền sẽ về tài khoản sau T+2 ngày làm việc.`);
    setTimeout(() => {
      if (onConfirm) onConfirm(amount);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[540px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase">
              YÊU CẦU RÚT TIỀN
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Rút tiền từ ví doanh thu về tài khoản ngân hàng chính chủ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-[13px]">
          {/* Balance overview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-500 uppercase">
              Số dư khả dụng
            </span>
            <span className="text-[20px] font-extrabold text-slate-900">
              {balance}
            </span>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Số tiền muốn rút
              </label>
              <button
                type="button"
                onClick={() => setAmount('42800000')}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
              >
                Rút tất cả
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-3 pr-10 border border-slate-300 rounded-xl text-[16px] font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₫
              </span>
            </div>
          </div>

          {/* Bank account selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Tài khoản nhận
            </label>
            <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-[14px]">
                  Vietcombank · •••• 4838
                </div>
                <div className="text-[12px] font-semibold text-slate-500 mt-0.5">
                  NGUYEN MINH ANH
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#4F46E5] bg-white px-2 py-0.5 rounded border border-indigo-200">
                Mặc định
              </span>
            </div>
          </div>

          {/* Fee & SLA info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-600 flex items-center justify-between">
            <span>Phí rút: <strong className="text-emerald-600">0 ₫</strong></span>
            <span>Dự kiến: <strong>T+2 ngày làm việc</strong></span>
          </div>

          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-center text-[12px] animate-in fade-in">
              ✓ {notification}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[12px] font-semibold"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors"
          >
            Xác nhận rút tiền
          </button>
        </div>
      </div>
    </div>
  );
}

WithdrawModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  balance: PropTypes.string,
};
