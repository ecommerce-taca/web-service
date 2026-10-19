import PropTypes from 'prop-types';
import { Check, AlertTriangle, ClipboardList } from 'lucide-react';
import { VIETNAM_BANK_CATALOG } from '../../../../services/seller-shop.api';

/**
 * Step 4: Tài khoản ngân hàng đối soát & rút tiền + Khối tổng kết nộp duyệt Admin
 */
export default function BankStep({
  bankForm,
  setBankForm,
  bankSummary,
  saving,
  kycStatus,
  profileForm,
  isKycComplete,
  warehouseForm,
  onSaveBank,
  onBackToWarehouse,
  onSubmitKyc
}) {
  return (
    <div className="space-y-8 max-w-3xl">
      <form onSubmit={onSaveBank} className="space-y-6 text-[13px]">
        <div>
          <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
            BƯỚC 4: TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT & RÚT TIỀN
          </h2>
          <p className="text-[12px] text-slate-500 mt-1">
            Hệ thống Taca chuyển doanh thu bán hàng định kỳ vào tài khoản này (PUT /seller/onboarding/bank).
          </p>
        </div>

        {bankSummary && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tài khoản hiện tại</p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                {bankSummary.bank_name}
              </p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {bankSummary.account_name} · {bankSummary.account_number_masked}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đã xác thực</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Hướng dẫn kiểm thử VNPAY Sandbox */}
          <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[12px] text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-blue-800 uppercase text-[10px]">
                <span className="px-1.5 py-0.5 bg-blue-100 rounded border border-blue-200">VNPAY Sandbox</span>
                <span>Ngân hàng kiểm thử chuẩn: NCB (Ngân hàng Quốc Dân)</span>
              </div>
              <p className="text-blue-700 font-mono">
                Số thẻ/TK test: <b>9704198526191432198</b> · Chủ TK: <b>NGUYEN VAN A</b>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBankForm({
                  ...bankForm,
                  bank_code: 'NCB',
                  bank_name: 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)',
                  account_number: '9704198526191432198',
                  account_name: 'NGUYEN VAN A',
                });
              }}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-300 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Điền nhanh thẻ test VNPAY
            </button>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Ngân hàng thụ hưởng * (bank_code / bank_name)
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
              Số tài khoản ngân hàng * (account_number: 8–20 số)
            </label>
            <input
              type="text"
              required
              value={bankForm.account_number}
              onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, '') })}
              placeholder="VD: 1012345678"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Tên chủ tài khoản * (account_name: VIẾT HOA KHÔNG DẤU)
            </label>
            <input
              type="text"
              required
              value={bankForm.account_name}
              onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value.toUpperCase() })}
              placeholder="VD: NGUYEN MINH ANH"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onBackToWarehouse}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            ← Quay lại bước 3
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Đang lưu...' : 'Lưu thông tin ngân hàng'}
          </button>
        </div>
      </form>

      {/* KHỐI TỔNG KẾT & NỘP XÉT DUYỆT ADMIN CHÍNH THỨC */}
      <div className="p-6 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-indigo-600 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-[15px] font-extrabold text-slate-900 uppercase tracking-tight">
              TỔNG KẾT HỒ SƠ & GỬI THẨM ĐỊNH (FINAL SUBMISSION)
            </h3>
            <p className="text-[12px] text-slate-600">
              Kiểm tra lại toàn bộ 4 bước trước khi gửi hồ sơ cho Ban Quản Trị xét duyệt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">1. Hồ sơ gian hàng</span>
            <p className="font-bold text-slate-900">{profileForm.name || '---'}</p>
            <p className="text-slate-500">MST: {profileForm.tax_code || profileForm.tax_code_masked || '---'}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">2. Giấy tờ KYC</span>
            <p className={`font-bold inline-flex items-center gap-1 ${isKycComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isKycComplete ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Đã có tài liệu hợp lệ (§2.25)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Chưa có tài liệu</span>
                </>
              )}
            </p>
            <p className="text-slate-500">Giấy phép ĐKKD / Hộ kinh doanh</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">3. Kho lấy hàng</span>
            <p className="font-bold text-slate-900">{warehouseForm.warehouse_name || 'Chưa lưu kho'}</p>
            <p className="text-slate-500 truncate">{warehouseForm.province ? `${warehouseForm.ward}, ${warehouseForm.province}` : '---'}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">4. Tài khoản ngân hàng</span>
            <p className="font-bold text-slate-900">{bankSummary ? bankSummary.bank_name : (bankForm.account_number ? bankForm.bank_name : 'Chưa lưu ngân hàng')}</p>
            <p className="text-slate-500 font-mono">{bankSummary ? bankSummary.account_number_masked : (bankForm.account_number ? `STK: ${bankForm.account_number}` : '---')}</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 italic">
            * Sau khi bấm gửi, hồ sơ sẽ chuyển sang hàng đợi Admin để thẩm định.
          </span>

          <button
            type="button"
            disabled={saving || kycStatus === 'PENDING'}
            onClick={onSubmitKyc}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 ${
              kycStatus === 'PENDING'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-indigo-500/20'
            }`}
          >
            {kycStatus === 'PENDING' ? (
              <span>⏳ Đang chờ Admin phê duyệt</span>
            ) : saving ? (
              <span>Đang gửi hồ sơ...</span>
            ) : kycStatus === 'REJECTED' || kycStatus === 'NEEDS_INFO' ? (
              <span>CẬP NHẬT & GỬI LẠI HỒ SƠ THẨM ĐỊNH (POST /submit) →</span>
            ) : (
              <span>GỬI TOÀN BỘ HỒ SƠ THẨM ĐỊNH (POST /submit) →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

BankStep.propTypes = {
  bankForm: PropTypes.shape({
    bank_code: PropTypes.string.isRequired,
    bank_name: PropTypes.string.isRequired,
    account_name: PropTypes.string.isRequired,
    account_number: PropTypes.string.isRequired,
    confirm_account_name: PropTypes.bool,
  }).isRequired,
  setBankForm: PropTypes.func.isRequired,
  bankSummary: PropTypes.shape({
    bank_code: PropTypes.string,
    bank_name: PropTypes.string,
    account_name: PropTypes.string,
    account_number_masked: PropTypes.string,
    verified: PropTypes.bool,
  }),
  saving: PropTypes.bool.isRequired,
  kycStatus: PropTypes.string.isRequired,
  profileForm: PropTypes.shape({
    name: PropTypes.string,
    tax_code: PropTypes.string,
    tax_code_masked: PropTypes.string,
  }).isRequired,
  isKycComplete: PropTypes.bool.isRequired,
  warehouseForm: PropTypes.shape({
    warehouse_name: PropTypes.string,
    province: PropTypes.string,
    ward: PropTypes.string,
  }).isRequired,
  onSaveBank: PropTypes.func.isRequired,
  onBackToWarehouse: PropTypes.func.isRequired,
  onSubmitKyc: PropTypes.func.isRequired,
};
