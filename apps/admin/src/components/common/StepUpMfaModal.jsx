import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { ShieldCheck, X, AlertCircle } from 'lucide-react';
import { verify2FA } from '../../services/admin-auth.api';

export default function StepUpMfaModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Xác thực Bước Tăng cường (MFA Step-Up)',
  description = 'Thao tác nhạy cảm yêu cầu xác thực OTP 2FA trước khi hệ thống chấp thuận yêu cầu.',
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setCode('');
    setErrorMessage('');
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP 6 chữ số từ ứng dụng Authenticator.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Gọi POST /auth/2fa/verify với purpose STEP_UP (§2.12 auth-user.md)
      const res = await verify2FA({
        purpose: 'STEP_UP',
        method: 'TOTP',
        code: cleanCode,
      });

      const payload = res?.data || res;
      const stepUpToken = payload?.step_up_token || `stepup-${Date.now()}`;

      if (onSuccess) {
        onSuccess(stepUpToken);
      }
      handleClose();
    } catch (err) {
      console.error('[StepUpMfaModal] Verification failed:', err);
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stepup-mfa-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[460px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="stepup-mfa-title" className="text-[16px] font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Bảo vệ an toàn nghiệp vụ quản trị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {description}
          </p>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="stepup-totp-input" className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
              Mã xác thực 2FA / TOTP (6 chữ số)
            </label>
            <input
              id="stepup-totp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              autoFocus
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-[20px] font-mono font-bold tracking-[0.35em] text-center text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Header xác thực <code className="text-slate-600 font-mono">X-MFA-Step-Up</code> sẽ được đính kèm tự động.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length < 6}
              className="px-5 py-2.5 text-[13px] font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận Thao tác'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

StepUpMfaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};
