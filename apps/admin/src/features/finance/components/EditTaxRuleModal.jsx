import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, ShieldCheck, Percent, Calendar, FileText } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';

function EditTaxRuleForm({ onClose, onSuccess, currentTax }) {
  const initialPercent = currentTax?.tax_rate_bps != null ? (currentTax.tax_rate_bps / 100).toFixed(1) : '1.0';
  const initialEffective = currentTax?.effective_from ? currentTax.effective_from.slice(0, 10) : '2026-01-01';
  const initialNote = currentTax?.note || 'Thuế suất GTGT khấu trừ tại nguồn theo Thông tư 40/2021/TT-BTC';

  const [taxPercent, setTaxPercent] = useState(initialPercent);
  const [effectiveFrom, setEffectiveFrom] = useState(initialEffective);
  const [note, setNote] = useState(initialNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(taxPercent);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 50) {
      setError('Vui lòng nhập thuế suất hợp lệ (từ 0% đến 50%)');
      return;
    }
    if (!effectiveFrom) {
      setError('Vui lòng chọn ngày có hiệu lực');
      return;
    }
    setError('');
    setIsMfaOpen(true);
  };

  const handleMfaSuccess = async (stepUpToken) => {
    try {
      setIsSubmitting(true);
      setError('');
      const rateBps = Math.round(parseFloat(taxPercent) * 100);

      await adminFinanceApi.updateTaxes(
        {
          tax_rate_bps: rateBps,
          effective_from: new Date(effectiveFrom).toISOString(),
          note: note.trim() || 'Thuế suất GTGT khấu trừ tại nguồn theo Thông tư 40/2021/TT-BTC'
        },
        stepUpToken
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Lỗi cập nhật thuế:', err);
      setError(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Không thể cập nhật cấu hình thuế. Vui lòng kiểm tra lại mã 2FA.'
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
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Percent className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-900 tracking-tight">
                Cấu hình Thuế Khấu trừ (Thông tư 40)
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Quy chuẩn thuế suất GTGT giữ lại tại nguồn theo phiên bản (ADR-004)
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
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] font-semibold">
              {error}
            </div>
          )}

          {/* Tax Rate Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Thuế suất GTGT khấu trừ (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                required
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                placeholder="1.0"
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl font-bold text-slate-900 text-[15px] focus:outline-none focus:border-indigo-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Quy chuẩn Thông tư 40/2021/TT-BTC: 1.0% ({Math.round(parseFloat(taxPercent || 0) * 100)} bps)
            </p>
          </div>

          {/* Effective From */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Ngày bắt đầu hiệu lực (Effective From)</span>
            </label>
            <input
              type="date"
              required
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-[13px] font-medium focus:outline-none focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          {/* Note / Legal Basis */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Căn cứ pháp lý & Ghi chú kiểm toán</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Căn cứ Thông tư 40/2021/TT-BTC hướng dẫn thuế GTGT sàn TMĐT..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-[13px] focus:outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Security requirement banner */}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thuế suất (2FA)'}</span>
            </button>
          </div>
        </form>

        {/* Modal 2FA Step-up */}
        <StepUpMfaModal
          isOpen={isMfaOpen}
          onClose={() => setIsMfaOpen(false)}
          onSuccess={handleMfaSuccess}
          title="Xác thực 2FA Cập nhật Thuế"
          description={`Thay đổi thuế suất khấu trừ tại nguồn thành ${taxPercent}% yêu cầu xác thực mã OTP 2FA để bảo đảm tính tuân thủ pháp lý tài chính.`}
        />
      </div>
    </div>
  );
}

EditTaxRuleForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  currentTax: PropTypes.object
};

export default function EditTaxRuleModal({ isOpen, onClose, onSuccess, currentTax }) {
  if (!isOpen) return null;

  return createPortal(
    <EditTaxRuleForm onClose={onClose} onSuccess={onSuccess} currentTax={currentTax} />,
    document.body
  );
}

EditTaxRuleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  currentTax: PropTypes.object
};
