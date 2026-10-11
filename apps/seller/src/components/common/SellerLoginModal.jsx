import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { signinSeller, quickDemoLogin } from '../../services/seller-auth.api';

export default function SellerLoginModal({ isOpen, onClose, onSuccess }) {
  const [identifier, setIdentifier] = useState('minhanh@example.com');
  const [password, setPassword] = useState('StrongPassword#2026');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await signinSeller({ identifier, password });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    quickDemoLogin();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-50/80 to-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-extrabold text-[#4F46E5] tracking-tight">taca</span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-100 text-[#4F46E5]">
              SELLER AUTH
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
              Đăng nhập Kênh Người Bán
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">
              Đăng nhập để nhận Access Token JWT và quản lý gian hàng Taca Ecommerce.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                Email hoặc Số điện thoại
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="VD: minhanh@example.com hoặc 0901234567"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập vào Seller Center'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center mb-2">
              Chế độ phát triển & kiểm thử độc lập:
            </p>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-[12px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚡</span>
              <span>Đăng nhập nhanh (Tài khoản mẫu Seller)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

SellerLoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
