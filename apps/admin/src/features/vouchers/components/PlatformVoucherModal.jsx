import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminVoucherApi } from '../../../services/admin-voucher.api';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';

export default function PlatformVoucherModal({ isOpen, onClose, voucher = null, onSuccess }) {
  const isEditing = Boolean(voucher?.voucher_id);

  const [code, setCode] = useState(() => voucher?.code || '');
  const [title, setTitle] = useState(() => voucher?.title || '');
  const [scope, setScope] = useState(() => voucher?.scope || 'PLATFORM');
  const [discountType, setDiscountType] = useState(() => voucher?.discount_type || 'FIXED');
  const [value, setValue] = useState(() => voucher?.value != null ? String(voucher.value) : '50000');
  const [minOrder, setMinOrder] = useState(() => voucher?.min_order != null ? String(voucher.min_order) : '200000');
  const [usageLimit, setUsageLimit] = useState(() => voucher?.usage_limit != null ? String(voucher.usage_limit) : '1000');
  const [startsAt, setStartsAt] = useState(() => {
    if (voucher?.starts_at) return voucher.starts_at.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });
  const [expiresAt, setExpiresAt] = useState(() => {
    if (voucher?.expires_at) return voucher.expires_at.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length < 3) {
      setErrorMsg('Mã voucher phải có ít nhất 3 ký tự (chữ hoa/số).');
      return;
    }

    const numValue = Number(value);
    if (!numValue || numValue <= 0) {
      setErrorMsg('Giá trị giảm phải lớn hơn 0.');
      return;
    }

    if (discountType === 'PERCENT' && numValue > 100) {
      setErrorMsg('Tỷ lệ giảm theo phần trăm không được vượt quá 100%.');
      return;
    }

    if (!startsAt || !expiresAt) {
      setErrorMsg('Vui lòng chọn ngày bắt đầu và kết thúc áp dụng.');
      return;
    }

    if (new Date(startsAt) > new Date(expiresAt)) {
      setErrorMsg('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    // Yêu cầu xác thực 2FA Step-Up (§3.8 order-commerce.md)
    setIsMfaOpen(true);
  };

  const executeSaveVoucher = async (stepUpToken) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        title: title.trim() || `Voucher ${code.trim().toUpperCase()}`,
        scope,
        discount_type: discountType,
        value: Number(value),
        min_order: Number(minOrder) || 0,
        usage_limit: Number(usageLimit) || 1000,
        starts_at: new Date(startsAt).toISOString(),
        expires_at: new Date(expiresAt + 'T23:59:59Z').toISOString(),
      };

      let res;
      if (isEditing) {
        res = await adminVoucherApi.updateAdminVoucher(
          voucher.voucher_id,
          { ...payload, version: voucher.version || 1 },
          stepUpToken
        );
      } else {
        res = await adminVoucherApi.createAdminVoucher(payload, stepUpToken);
      }

      if (res?.data) {
        if (onSuccess) {
          onSuccess(res.data, isEditing);
        }
        onClose();
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi lưu voucher toàn sàn.'
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 className="text-[16px] font-black text-slate-900 tracking-tight">
              {isEditing ? `Chỉnh Sửa Voucher · ${voucher.code}` : 'Tạo Voucher Toàn Sàn Mới'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-[13px]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scope Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Phạm vi áp dụng (§3.8 order-commerce.md)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('PLATFORM')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                  scope === 'PLATFORM'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Toàn sàn (PLATFORM)</span>
                <span className="text-[10px] font-normal opacity-80">Trừ vào tiền hàng</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('FREESHIP')}
                className={`py-2 px-3 rounded-xl border text-[12px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
                  scope === 'FREESHIP'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Vận chuyển (FREESHIP)</span>
                <span className="text-[10px] font-normal opacity-80">Trừ vào phí ship</span>
              </button>
            </div>
          </div>

          {/* Voucher Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="voucher-code-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Mã voucher *
              </label>
              <input
                id="voucher-code-input"
                name="voucherCode"
                type="text"
                required
                disabled={isEditing && (voucher?.used_count > 0)}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: TACA100K, FREESHIP30"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold text-[13px] uppercase disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="voucher-title-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tên hiển thị
              </label>
              <input
                id="voucher-title-input"
                name="voucherTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Giảm 100K toàn sàn..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="discount-type-select" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Loại giảm giá
              </label>
              <select
                id="discount-type-select"
                name="discountType"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px] bg-white cursor-pointer"
              >
                <option value="FIXED">Số tiền cố định (₫)</option>
                <option value="PERCENT">Phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label htmlFor="voucher-value-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Giá trị giảm * ({discountType === 'FIXED' ? '₫' : '%'})
              </label>
              <input
                id="voucher-value-input"
                name="voucherValue"
                type="number"
                required
                min={1}
                max={discountType === 'PERCENT' ? 100 : 100000000}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
          </div>

          {/* Min Order & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="min-order-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                id="min-order-input"
                name="minOrder"
                type="number"
                min={0}
                step={10000}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
            <div>
              <label htmlFor="usage-limit-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Giới hạn lượt dùng toàn sàn
              </label>
              <input
                id="usage-limit-input"
                name="usageLimit"
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
          </div>

          {/* Period Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="voucher-starts-at-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Bắt đầu áp dụng
              </label>
              <input
                id="voucher-starts-at-input"
                name="startsAt"
                type="date"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
            <div>
              <label htmlFor="voucher-expires-at-input" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Hết hạn
              </label>
              <input
                id="voucher-expires-at-input"
                name="expiresAt"
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 text-[13px]"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Đang lưu...' : isEditing ? 'Cập nhật voucher' : 'Phát hành voucher'}</span>
            </button>
          </div>
        </form>
      </div>

      <StepUpMfaModal
        isOpen={isMfaOpen}
        title="Xác thực Quản lý Voucher Toàn Sàn"
        description="Thao tác phát hành hoặc sửa voucher toàn sàn yêu cầu quyền VOUCHER_MANAGE và xác thực bảo mật 2FA Step-Up (§3.8 order-commerce.md). Vui lòng nhập mã OTP."
        onClose={() => setIsMfaOpen(false)}
        onSuccess={(stepUpToken) => {
          setIsMfaOpen(false);
          executeSaveVoucher(stepUpToken);
        }}
      />
    </div>,
    document.body
  );
}

PlatformVoucherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  voucher: PropTypes.object,
  onSuccess: PropTypes.func,
};
