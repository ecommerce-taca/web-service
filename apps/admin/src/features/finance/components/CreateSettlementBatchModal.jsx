import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';

export default function CreateSettlementBatchModal({ isOpen, onClose, onSuccess }) {
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [scope, setScope] = useState('ALL');
  const [shopIdsText, setShopIdsText] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!periodStart || !periodEnd) {
      setErrorMsg('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc kỳ quyết toán.');
      return;
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
      setErrorMsg('Ngày bắt đầu không được lớn hơn ngày kết thúc kỳ.');
      return;
    }

    if (!note.trim()) {
      setErrorMsg('Vui lòng nhập ghi chú hoặc căn cứ thực hiện đợt quyết toán.');
      return;
    }

    // Yêu cầu xác thực 2FA Step-Up (§3.8 payment-wallet.md)
    setIsMfaOpen(true);
  };

  const executeCreateBatch = async (stepUpToken) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        period_start: periodStart,
        period_end: periodEnd,
        note: note.trim(),
        shop_ids: scope === 'ALL'
          ? []
          : shopIdsText.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await adminFinanceApi.createSettlementBatch(payload, stepUpToken);
      if (res?.data) {
        if (onSuccess) {
          onSuccess(res.data);
        }
        onClose();
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi tạo đợt quyết toán.'
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h3 className="text-[16px] font-black text-slate-900 tracking-tight">
              Tạo Đợt Quyết Toán Doanh Thu
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="period-start-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Từ ngày
              </label>
              <input
                id="period-start-input"
                name="periodStart"
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-[13px] bg-slate-50/50"
              />
            </div>
            <div>
              <label htmlFor="period-end-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Đến ngày
              </label>
              <input
                id="period-end-input"
                name="periodEnd"
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-[13px] bg-slate-50/50"
              />
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Phạm vi người bán
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('ALL')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  scope === 'ALL'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả nhà bán hàng</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('SPECIFIC')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  scope === 'SPECIFIC'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Chỉ định Shop ID</span>
              </button>
            </div>
          </div>

          {scope === 'SPECIFIC' && (
            <div>
              <label htmlFor="specific-shops-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Danh sách Shop ID (cách nhau bởi dấu phẩy)
              </label>
              <input
                id="specific-shops-input"
                name="specificShops"
                type="text"
                value={shopIdsText}
                onChange={(e) => setShopIdsText(e.target.value)}
                placeholder="shop-01, shop-02, shop-03..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-[13px]"
              />
            </div>
          )}

          {/* Note Field */}
          <div>
            <label htmlFor="settlement-note-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Ghi chú đợt quyết toán / Căn cứ pháp lý
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
              <textarea
                id="settlement-note-input"
                name="settlementNote"
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Quyết toán định kỳ chu kỳ bán lẻ T+2 từ ngày 25 đến ngày 27..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-[13px]"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
            <span className="font-bold">Quy chuẩn tài chính (§3.8 payment-wallet.md): </span>
            Lô quyết toán sẽ chuyển số dư chờ đối soát sang số dư khả dụng sau khi so khớp hoàn tất. Thao tác yêu cầu xác thực 2FA Step-Up.
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Đang khởi tạo...' : 'Tạo đợt quyết toán'}</span>
            </button>
          </div>
        </form>
      </div>

      <StepUpMfaModal
        isOpen={isMfaOpen}
        title="Xác thực Tạo Đợt Quyết Toán"
        description="Thao tác khởi tạo đợt quyết toán doanh thu người bán yêu cầu xác thực bảo mật 2FA Step-Up. Vui lòng nhập mã OTP để tiếp tục."
        onClose={() => setIsMfaOpen(false)}
        onSuccess={(stepUpToken) => {
          setIsMfaOpen(false);
          executeCreateBatch(stepUpToken);
        }}
      />
    </div>,
    document.body
  );
}

CreateSettlementBatchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
