import PropTypes from 'prop-types';
import { X, AlertTriangle, Building2 } from 'lucide-react';

export default function SettlementBatchDetailModal({ isOpen, onClose, batchDetail, onRetry }) {
  if (!isOpen || !batchDetail) return null;

  const {
    batch_id,
    period,
    status,
    total_gross,
    total_commission,
    total_net,
    shops = []
  } = batchDetail;

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                Chi tiết Đợt quyết toán #{batch_id}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'FAILED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status === 'COMPLETED' ? 'Đã quyết toán' : status === 'FAILED' ? 'Thất bại' : 'Đang xử lý'}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Kỳ quyết toán: <strong className="text-slate-800">{period}</strong> · Danh sách phân bổ doanh thu chi tiết theo từng nhà bán hàng
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

        {/* Batch Overview Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TỔNG DOANH THU (GROSS)</span>
            <div className="text-[20px] font-extrabold text-slate-900 mt-1">
              {formatVnd(total_gross)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PHÍ SÀN THU VỀ</span>
            <div className="text-[20px] font-extrabold text-emerald-600 mt-1">
              {formatVnd(total_commission)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">THỰC CHI SELLER (NET)</span>
            <div className="text-[20px] font-extrabold text-indigo-600 mt-1">
              {formatVnd(total_net)}
            </div>
          </div>
        </div>

        {/* Shops breakdown table */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-3">
            DANH SÁCH GIAN HÀNG THUỘC ĐỢT ({shops.length})
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4">Tài khoản nhận</th>
                  <th className="py-3 px-4 text-right">Doanh thu gộp</th>
                  <th className="py-3 px-4 text-right">Phí sàn</th>
                  <th className="py-3 px-4 text-right">Thực nhận</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {shops.map((s) => (
                  <tr key={s.shop_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
                        <div>
                          <div>{s.shop_name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{s.shop_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[12px]">
                      {s.bank_masked || 'Vietcombank •••• 4838'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {formatVnd(s.gross)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                      −{formatVnd(s.commission)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                      {formatVnd(s.net)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          s.status === 'RELEASED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.status === 'RELEASED' ? 'Đã chi trả' : 'Giữ chờ duyệt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[12px] text-slate-500">
            Hạch toán tự động qua Double-entry Ledger theo hợp đồng `payment-wallet-service §3.8`
          </div>
          <div className="flex items-center gap-3">
            {status === 'FAILED' && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(batch_id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[12px] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Thử lại đợt quyết toán</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-bold text-[12px] shadow-2xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

SettlementBatchDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  batchDetail: PropTypes.shape({
    batch_id: PropTypes.string,
    period: PropTypes.string,
    status: PropTypes.string,
    total_gross: PropTypes.number,
    total_commission: PropTypes.number,
    total_net: PropTypes.number,
    shops: PropTypes.arrayOf(
      PropTypes.shape({
        shop_id: PropTypes.string.isRequired,
        shop_name: PropTypes.string.isRequired,
        bank_masked: PropTypes.string,
        gross: PropTypes.number,
        commission: PropTypes.number,
        tax: PropTypes.number,
        net: PropTypes.number,
        status: PropTypes.string
      })
    )
  }),
  onRetry: PropTypes.func
};
