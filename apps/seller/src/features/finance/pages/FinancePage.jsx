import { useState } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import WithdrawModal from '../components/WithdrawModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function FinancePage() {
  const { finance } = SELLER_MOCK_DATA;
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Ví doanh thu & Rút tiền
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Đối soát doanh thu, phí sàn, hoàn tiền và lịch sử rút tiền.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>💳</span>
          <span>Yêu cầu rút tiền</span>
        </button>
      </div>

      {/* Top Section: Hero Balance + 2 Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Available Balance Hero Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                SỐ DƯ KHẢ DỤNG
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Sẵn sàng rút
              </span>
            </div>
            <div className="text-[34px] font-black text-slate-900 mt-2 tracking-tight">
              {finance.balance}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px]">
            <div className="text-slate-500">
              Đang chờ đối soát:{' '}
              <strong className="text-slate-800 font-bold">{finance.pending}</strong>
            </div>
            <div className="text-slate-400">
              {finance.bankAccount} · {finance.cycle}
            </div>
          </div>
        </div>

        {/* 2 Metrics: Monthly Revenue & Platform Fee (6 cols) */}
        <div className="lg:col-span-3">
          <MetricCard
            label="Doanh thu tháng"
            value={finance.monthlyRevenue}
            trend={finance.monthlyGrowth}
            isPositive={true}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard
            label="Phí nền tảng"
            value={finance.platformFee}
            subtitle={finance.platformFeeRate}
            isWarning={false}
          />
        </div>
      </div>

      {/* Middle Section: Net Revenue & Reconciliation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Net Revenue Banner (6 cols) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-200">
              DOANH THU THUẦN
            </span>
            <p className="text-[12px] text-indigo-300 mt-1">
              Tháng 8 / sau phí sàn, hoàn tiền và chiết khấu voucher
            </p>
            <div className="text-[36px] font-black text-white mt-6 tracking-tight">
              {finance.settlement.net}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[12px] text-indigo-200">
            <span>Chu kỳ đối soát: Hàng ngày (T+2)</span>
            <span className="font-semibold text-white">Trạng thái: Đã chốt</span>
          </div>
        </div>

        {/* Right: Breakdown Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 mb-4 block">
            CHI TIẾT ĐỐI SOÁT THÁNG
          </span>

          <div className="space-y-3.5 text-[13px]">
            <div className="flex justify-between items-center text-slate-600">
              <span>Doanh thu gộp</span>
              <span className="font-bold text-slate-900">{finance.settlement.gross}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Phí nền tảng (5%)</span>
              <span className="font-bold text-rose-600">{finance.settlement.fee}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hoàn hàng / Hủy đơn</span>
              <span className="font-bold text-rose-600">{finance.settlement.refunds}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hỗ trợ phí vận chuyển từ sàn</span>
              <span className="font-bold text-emerald-600">{finance.settlement.shippingSubsidy}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-[14px]">
              <span className="text-slate-900">Doanh thu thực nhận</span>
              <span className="text-[#4F46E5] text-[16px]">{finance.settlement.net}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transaction & Withdrawal History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-[13px] font-bold uppercase tracking-wider text-slate-800">
            LỊCH SỬ GIAO DỊCH & RÚT TIỀN
          </span>
          <span className="text-[12px] text-slate-500">2 giao dịch gần nhất</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6">MÃ GIAO DỊCH</th>
                <th className="py-3.5 px-6">THỜI GIAN</th>
                <th className="py-3.5 px-6">TÀI KHOẢN NHẬN</th>
                <th className="py-3.5 px-6">SỐ TIỀN</th>
                <th className="py-3.5 px-6">PHÍ</th>
                <th className="py-3.5 px-6">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finance.withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{w.id}</td>
                  <td className="py-4 px-6 text-slate-600">{w.created_at}</td>
                  <td className="py-4 px-6 font-medium text-slate-800">{w.account}</td>
                  <td className="py-4 px-6 font-extrabold text-slate-900">{w.amount}</td>
                  <td className="py-4 px-6 text-emerald-600 font-semibold">{w.fee}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={w.status} type={w.status_type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        balance={finance.balance}
      />
    </div>
  );
}
