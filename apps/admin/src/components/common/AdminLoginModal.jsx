import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { signinAdmin, quickDemoAdminLogin } from '../../services/admin-auth.api';

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [identifier, setIdentifier] = useState('admin@taca.vn');
  const [password, setPassword] = useState('AdminSecret#2026');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await signinAdmin({ identifier, password });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
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

  const handleQuickDemo = () => {
    quickDemoAdminLogin();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
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
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
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

          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                Email Quản trị
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@taca.vn"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0A68FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                Mật khẩu Quản trị
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0A68FF]"
              />
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
              <span>⚡</span>
              <span>Đăng nhập Super Admin (Trần Hoàng · 2FA ON)</span>
            </button>
          </div>
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
