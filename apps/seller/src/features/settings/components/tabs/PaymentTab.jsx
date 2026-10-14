import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import { VIETNAM_BANK_CATALOG } from '../../../../services/seller-shop.api';

/**
 * Tab 5: Tài khoản ngân hàng đối soát & rút tiền (PUT /seller/onboarding/bank - §2.26)
 */
export default function PaymentTab({
  bankSummary,
  bankForm,
  setBankForm,
  saving,
  onSaveBank
}) {
  return (
    <form onSubmit={onSaveBank} className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT & RÚT TIỀN (PUT /seller/onboarding/bank - §2.26)
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Doanh thu bán hàng từ ví số dư sẽ được đối soát tự động về tài khoản ngân hàng chính chủ này.
        </p>
      </div>

      {bankSummary && (
        <div className="p-5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Tài khoản liên kết hiện tại
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-white text-emerald-700 border border-emerald-200 rounded inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đã xác thực KYC</span>
            </span>
          </div>
          <p className="text-[15px] font-extrabold text-slate-900">{bankSummary.bank_name}</p>
          <p className="text-xs text-slate-600 font-mono">
            Chủ tài khoản: <strong className="text-slate-800">{bankSummary.account_name}</strong> · Số TK: <strong className="text-slate-800">{bankSummary.account_number_masked}</strong>
          </p>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-slate-800 text-[14px]">Cập nhật tài khoản thụ hưởng mới</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Ngân hàng * (bank_code / bank_name)
            </label>
            <select
              value={bankForm.bank_code}
              onChange={(e) => {
                const b = VIETNAM_BANK_CATALOG.find((x) => x.code === e.target.value);
                setBankForm({
                  ...bankForm,
                  bank_code: e.target.value,
                  bank_name: b ? b.name : '',
                });
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            >
              {VIETNAM_BANK_CATALOG.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Số tài khoản ngân hàng * (account_number)
            </label>
            <input
              type="text"
              required
              value={bankForm.account_number}
              onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '') })}
              placeholder="Nhập 8–20 chữ số"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Tên chủ tài khoản * (account_name: VIẾT HOA)
            </label>
            <input
              type="text"
              required
              value={bankForm.account_name}
              onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value.toUpperCase() })}
              placeholder="VD: NGUYEN MINH ANH"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu tài khoản ngân hàng'}
        </button>
      </div>
    </form>
  );
}

PaymentTab.propTypes = {
  bankSummary: PropTypes.shape({
    bank_code: PropTypes.string,
    bank_name: PropTypes.string,
    account_name: PropTypes.string,
    account_number_masked: PropTypes.string,
    verified: PropTypes.bool,
  }),
  bankForm: PropTypes.shape({
    bank_code: PropTypes.string.isRequired,
    bank_name: PropTypes.string.isRequired,
    account_name: PropTypes.string.isRequired,
    account_number: PropTypes.string.isRequired,
  }).isRequired,
  setBankForm: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onSaveBank: PropTypes.func.isRequired,
};
