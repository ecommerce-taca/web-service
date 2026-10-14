import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Zap, Lock } from 'lucide-react';
import { signinAdmin, quickDemoAdminLogin, verify2FA } from '../../services/admin-auth.api';

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  // Step: 'CREDENTIALS' | 'MFA_CHALLENGE'
  const [step, setStep] = useState('CREDENTIALS');
  const [identifier, setIdentifier] = useState('admin@taca.vn');
  const [password, setPassword] = useState('AdminSecret#2026');
  const [force2fa, setForce2fa] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await signinAdmin({ identifier, password, force2fa });
      if (res?.mfa_required) {
        setChallengeId(res.challenge_id);
        setStep('MFA_CHALLENGE');
        setTotpCode('');
      } else {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Đăng nhập quản trị thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!totpCode.trim() || totpCode.trim().length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực 2FA.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await verify2FA({
        purpose: 'LOGIN',
        challenge_id: challengeId,
        method: 'TOTP',
        code: totpCode.trim(),
      });

      const payload = res?.data || res;
      if (payload?.verified) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setErrorMessage('Mã xác thực 2FA không chính xác hoặc đã hết hạn.');
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Xác thực mã 2FA thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    quickDemoAdminLogin();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  const resetToCredentials = () => {
    setStep('CREDENTIALS');
    setErrorMessage('');
    setTotpCode('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[26px] font-black text-[#0A68FF] tracking-tight">taca</span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-950 text-[#38BDF8] border border-blue-800/50">
              ADMIN ACCESS
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ đăng nhập"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {step === 'CREDENTIALS' ? (
            <>
              <div>
                <h2 className="text-[18px] font-extrabold text-white tracking-tight">
                  Xác thực Quản trị viên
                </h2>
                <p className="text-[12px] text-slate-400 mt-1">
                  Truy cập dành riêng cho Quản trị viên sàn thương mại điện tử Taca.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-[12px] text-rose-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-[13px]">
                <div>
                  <label htmlFor="admin-login-email" className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                    Email Quản trị
                  </label>
                  <input
                    id="admin-login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@taca.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0A68FF]"
                  />
                </div>

                <div>
                  <label htmlFor="admin-login-password" className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                    Mật khẩu Quản trị
                  </label>
                  <input
                    id="admin-login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0A68FF]"
                  />
                </div>

                {/* Option kích hoạt thử nghiệm luồng 2FA */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="force2fa"
                    checked={force2fa}
                    onChange={(e) => setForce2fa(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-[#0A68FF] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="force2fa" className="text-[11px] text-slate-400 cursor-pointer select-none">
                    Mô phỏng tài khoản bắt buộc mã 2FA TOTP (#12 POST /auth/2fa/verify)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-[13px] shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Đang kiểm tra quyền...' : 'Đăng nhập Admin Console'}
                </button>
              </form>

              {/* Quick Demo Login Option */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 text-center mb-2 font-medium">
                  Kiểm thử nhanh (Tài khoản mẫu Super Admin):
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl font-bold text-[12px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Đăng nhập Super Admin (Trần Hoàng · 2FA ON)</span>
                </button>
              </div>
            </>
          ) : (
            /* STEP 2: MFA CHALLENGE (TOTP 6 DIGITS) (#12 POST /auth/2fa/verify) */
            <>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-[#38BDF8] text-[10px] font-bold uppercase mb-2">
                  <Lock className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" aria-hidden="true" />
                  <span>Xác thực 2 yếu tố (2FA TOTP)</span>
                </div>
                <h2 className="text-[18px] font-extrabold text-white tracking-tight">
                  Nhập mã Authenticator
                </h2>
                <p className="text-[12px] text-slate-400 mt-1">
                  Mở ứng dụng Google Authenticator hoặc ứng dụng OTP trên điện thoại của bạn và nhập mã 6 chữ số.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-[12px] text-rose-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-4 text-[13px]">
                <div>
                  <label htmlFor="admin-totp-code" className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                    Mã xác thực 6 số (TOTP)
                  </label>
                  <input
                    id="admin-totp-code"
                    name="totpCode"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-center font-mono text-[22px] tracking-[0.5em] placeholder:text-slate-600 focus:outline-none focus:border-[#0A68FF]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Mục đích: Xác thực đăng nhập</span>
                    <button
                      type="button"
                      onClick={() => setTotpCode('123456')}
                      className="text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      Điền mã mẫu 123456
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full py-2.5 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-[13px] shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Đang kiểm tra mã 2FA...' : 'Xác nhận & Hoàn tất đăng nhập'}
                </button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  className="w-full py-2 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-[12px] transition-colors cursor-pointer"
                >
                  ← Quay lại nhập mật khẩu
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

AdminLoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};
