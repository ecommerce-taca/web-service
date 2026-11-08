import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, CheckCircle2, Calendar, Info, Building2 } from 'lucide-react';
import { sellerFinanceApi } from '../services/seller-finance.api';
import { isMockMode } from '../../../../../../shared/utils/api-client';

export default function WithdrawModal({ isOpen, onClose, onConfirm, balance = '42.800.000 ₫' }) {
  const [amount, setAmount] = useState('20.000.000');
  const [stepUpToken, setStepUpToken] = useState('123456');
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numericAmount = Number(String(amount).replace(/[^0-9]/g, '')) || 20000000;
  const formattedDisplayAmount = new Intl.NumberFormat('vi-VN').format(numericAmount);
  const isMock = isMockMode();

  const handleConfirm = async () => {
    if (isSubmitting) return;

    // Trong Live Mode, chính sách ADR-003 quy định chuyển khoản tự động định kỳ T+2
    if (!isMock) {
      setNotification('Yêu cầu đã được ghi nhận vào chu kỳ chuyển tiền tự động T+2 tiếp theo (02:00 AM Thứ Hai). Hệ thống sẽ tự động giải ngân về tài khoản chính chủ.');
      setTimeout(() => {
        if (onConfirm) onConfirm(amount);
        onClose();
      }, 2500);
      return;
    }

    if (!stepUpToken || stepUpToken.trim().length < 6) {
      setNotification('Vui lòng nhập mã OTP 2FA (6 chữ số) để xác thực rút tiền.');
      return;
    }

    try {
      setIsSubmitting(true);
      await sellerFinanceApi.requestPayout(
        {
          amount: numericAmount,
          bank_account_id: 'bank_account-01912fc0',
          reason: 'Rút doanh thu bán hàng về tài khoản ngân hàng'
        },
        stepUpToken
      );

      setNotification(`[Mô phỏng Mock] Yêu cầu rút ${formattedDisplayAmount} ₫ đã tạo thành công! Tiền sẽ về tài khoản sau T+2 ngày làm việc.`);
      setTimeout(() => {
        if (onConfirm) onConfirm(amount);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu rút tiền:', err);
      setNotification('Không thể gửi yêu cầu rút tiền, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[540px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Khớp Penpot Overlay / Withdraw funds */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase">
                QUYẾT TOÁN & RÚT TIỀN VÍ
              </h2>
              {isMock && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Mock Mode
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Quy chuẩn giải ngân doanh thu về tài khoản ngân hàng chính chủ (ADR-003)
            </p>
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

        {/* Content with internal scrolling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px]">
          {/* Thông báo chính sách ADR-003 */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-900 text-[12px] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold text-indigo-950">Chính sách giải ngân tự động T+2</p>
              <p className="text-indigo-800 leading-relaxed text-[11.5px]">
                Sàn Taca áp dụng cơ chế tự động chuyển toàn bộ doanh thu khả dụng về tài khoản ngân hàng đã liên kết theo chu kỳ định kỳ T+2 (vào 02:00 sáng Thứ Hai hàng tuần). Người bán không cần tạo lệnh rút tiền thủ công mỗi ngày.
              </p>
            </div>
          </div>

          {/* Balance overview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Số dư khả dụng hiện tại
              </span>
              <span className="text-[22px] font-black text-slate-900">
                {balance}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                ✓ Sẵn sàng giải ngân
              </span>
            </div>
          </div>

          {/* Bank account confirmation - Khớp Penpot */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Tài khoản ngân hàng thụ hưởng chính chủ</span>
            </label>
            <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-[14px]">
                  Vietcombank · •••• 4838
                </div>
                <div className="text-[12px] font-semibold text-slate-500 mt-0.5">
                  NGUYEN MINH ANH (Đã xác minh KYC)
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#4F46E5] bg-white px-2 py-0.5 rounded border border-indigo-200">
                Mặc định
              </span>
            </div>
          </div>

          {/* Amount input for Pilot / Mock test */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Số tiền đăng ký ưu tiên ({isMock ? 'Thử nghiệm Mock' : 'Tùy chọn ghi chú'})
              </label>
              <button
                type="button"
                onClick={() => setAmount('42800000')}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer"
              >
                Toàn bộ số dư
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-xl text-[15px] font-bold text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₫
              </span>
            </div>
          </div>

          {/* 2FA Step-up verification (nếu ở mock mode hoặc thử nghiệm) */}
          {isMock && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                Xác thực 2FA / OTP (X-MFA-Step-Up)
              </label>
              <input
                type="text"
                maxLength={6}
                value={stepUpToken}
                onChange={(e) => setStepUpToken(e.target.value)}
                placeholder="Nhập mã xác thực 6 chữ số"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-[13px] font-semibold tracking-widest text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          )}

          {/* SLA info - Khớp Penpot */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Lịch chuyển tiền: <strong>Thứ Hai hàng tuần (T+2)</strong></span>
            </span>
            <span>Phí xử lý: <strong className="text-emerald-600 font-bold">0 ₫ Miễn phí</strong></span>
          </div>

          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-center text-[12px] animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{notification}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-[12px] font-semibold cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSubmitting || !numericAmount}
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isMock
              ? `Thử nghiệm rút ${formattedDisplayAmount} ₫`
              : 'Xác nhận lịch quyết toán T+2'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

WithdrawModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  balance: PropTypes.string,
};
