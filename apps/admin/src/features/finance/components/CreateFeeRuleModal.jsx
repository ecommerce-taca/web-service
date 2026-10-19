import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, ShieldCheck } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';

export default function CreateFeeRuleModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState('CATEGORY');
  const [scopeLabel, setScopeLabel] = useState('Điện thoại › Apple');
  const [commissionPercent, setCommissionPercent] = useState('5.0');
  const [paymentPercent, setPaymentPercent] = useState('1.5');
  const [vatPercent, setVatPercent] = useState('10');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-11-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-12-31');
  const [note, setNote] = useState('');
  const [stepUpToken, setStepUpToken] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên quy tắc biểu phí');
      return;
    }
    if (!stepUpToken.trim()) {
      setError('Vui lòng nhập mã xác thực 2FA Step-up (X-MFA-Step-Up)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const rateBps = Math.round(parseFloat(commissionPercent) * 100);
      const paymentBps = Math.round(parseFloat(paymentPercent) * 100);
      const vatBps = Math.round(parseFloat(vatPercent) * 100);

      await adminFinanceApi.updateFees(
        {
          name: name.trim(),
          scope,
          scope_label: scopeLabel,
          rate_bps: rateBps,
          payment_rate_bps: paymentBps,
          vat_rate_bps: vatBps,
          effective_from: new Date(effectiveFrom).toISOString(),
          effective_to: effectiveTo ? new Date(effectiveTo).toISOString() : null,
          note: note.trim() || `Tạo biểu phí ${name}`
        },
        stepUpToken
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Lỗi tạo biểu phí:', err);
      setError('Không thể tạo biểu phí. Vui lòng kiểm tra lại thông tin và mã xác thực 2FA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header - Khớp Penpot Taca Admin / Fees / Taxes */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
              Tạo Biểu phí & Thuế Mới
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Cấu hình commission, phí thanh toán và VAT theo phiên bản (Effective-dated)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[12px] font-semibold">
              {error}
            </div>
          )}

          {/* Rule Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tên quy tắc biểu phí *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Điện thoại Apple chính hãng, Campaign 11.11..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Scope and Scope Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phạm vi áp dụng
              </label>
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (e.target.value === 'PLATFORM') setScopeLabel('Toàn bộ gian hàng sàn');
                  if (e.target.value === 'CATEGORY') setScopeLabel('Điện thoại › Apple');
                  if (e.target.value === 'SELLER_TIER') setScopeLabel('Shop KYC < 30 ngày');
                  if (e.target.value === 'CAMPAIGN') setScopeLabel('SPU tham gia chiến dịch');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium bg-white"
              >
                <option value="CATEGORY">Danh mục sản phẩm (CATEGORY)</option>
                <option value="PLATFORM">Toàn sàn (PLATFORM)</option>
                <option value="SELLER_TIER">Phân hạng người bán (SELLER_TIER)</option>
                <option value="CAMPAIGN">Chiến dịch Marketing (CAMPAIGN)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mô tả chi tiết phạm vi
              </label>
              <input
                type="text"
                value={scopeLabel}
                onChange={(e) => setScopeLabel(e.target.value)}
                placeholder="VD: Điện thoại › Apple"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          {/* Rates breakdown: Commission, Payment, VAT */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-bold text-indigo-700"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={paymentPercent}
                  onChange={(e) => setPaymentPercent(e.target.value)}
                  className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-bold text-slate-800"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                VAT (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  required
                  value={vatPercent}
                  onChange={(e) => setVatPercent(e.target.value)}
                  className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-bold text-slate-800"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Effective Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày bắt đầu hiệu lực *
              </label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày kết thúc (tùy chọn)
              </label>
              <input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ghi chú / Lý do điều chỉnh
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Q4 Baseline commission theo quyết định HĐQT..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* 2FA Step-up (Required by FINANCE_OPS §3.8) */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-700" aria-hidden="true" />
              <label className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Xác thực 2FA Quản trị viên (X-MFA-Step-Up) *
              </label>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={stepUpToken}
              onChange={(e) => setStepUpToken(e.target.value)}
              placeholder="Nhập mã xác thực 6 chữ số"
              className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-[13px] font-bold tracking-widest text-indigo-950 focus:outline-none focus:border-indigo-600"
            />
            <p className="text-[11px] text-indigo-700 mt-1">
              Bắt buộc đối với thay đổi biểu phí tài chính theo hợp đồng bảo mật API Gateway.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-[12px] font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-[13px] shadow-2xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Đang tạo...' : '+ Tạo biểu phí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateFeeRuleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};
