import { useState, useEffect, useCallback } from 'react';
import { Download, CreditCard, CheckCircle2 } from 'lucide-react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import WithdrawModal from '../components/WithdrawModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';
import { sellerFinanceApi } from '../services/seller-finance.api';

export default function FinancePage() {
  const { finance: fallbackFinance } = SELLER_MOCK_DATA;
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [activeTab, setActiveTab] = useState('PAYOUTS'); // 'PAYOUTS' | 'LEDGER'
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  const [granularity, setGranularity] = useState('MONTH'); // 'MONTH' | 'WEEK' | 'DAY'

  const fetchFinanceData = useCallback(async (selectedGranularity = granularity) => {
    try {
      const [walletRes, revenueRes, ledgerRes] = await Promise.allSettled([
        sellerFinanceApi.getWallet(),
        sellerFinanceApi.getRevenue({ granularity: selectedGranularity }),
        sellerFinanceApi.getLedger()
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.data?.data) {
        setWallet(walletRes.value.data.data);
      }
      if (revenueRes.status === 'fulfilled' && revenueRes.value?.data?.data) {
        setRevenue(revenueRes.value.data.data);
      }
      if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.data?.data) {
        setLedger(ledgerRes.value.data.data);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông tin tài chính người bán:', err);
    }
  }, [granularity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFinanceData(granularity);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFinanceData, granularity]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await sellerFinanceApi.exportRevenue({ format: 'xlsx' });
      const url = res?.data?.export_url;
      if (url) {
        window.open(url, '_blank');
      }
      setExportNotice('Đã xuất báo cáo doanh thu thành công (.xlsx)!');
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.warn('Export revenue failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const displayBalance = wallet?.available_balance != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet.available_balance)
    : fallbackFinance.balance;

  const displayPending = wallet?.pending_balance != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet.pending_balance)
    : fallbackFinance.pending;

  const displayBankInfo = wallet?.bank_account
    ? `${wallet.bank_account.bank_name} · ${wallet.bank_account.account_number}`
    : fallbackFinance.bankAccount;

  const displayCycle = wallet?.settlement_cycle || fallbackFinance.cycle;
  const displayMonthlyRevenue = revenue?.monthly_revenue || fallbackFinance.monthlyRevenue;
  const displayGrowth = revenue?.monthly_growth || fallbackFinance.monthlyGrowth;
  const displayPlatformFee = revenue?.platform_fee || fallbackFinance.platformFee;
  const displayFeeRate = revenue?.platform_fee_rate || fallbackFinance.platformFeeRate;
  const displayNetRevenue = revenue?.net_revenue || fallbackFinance.settlement.net;

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
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-bold text-[13px] shadow-2xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span>{isExporting ? 'Đang xuất...' : 'Tải báo cáo'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-white" aria-hidden="true" />
            <span>Yêu cầu rút tiền</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{exportNotice}</span>
        </div>
      )}

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
              {displayBalance}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px]">
            <div className="text-slate-500">
              Đang chờ đối soát:{' '}
              <strong className="text-slate-800 font-bold">{displayPending}</strong>
            </div>
            <div className="text-slate-400">
              {displayBankInfo} · {displayCycle}
            </div>
          </div>
        </div>

        {/* 2 Metrics: Monthly Revenue & Platform Fee (6 cols) */}
        <div className="lg:col-span-3">
          <MetricCard
            label="Doanh thu tháng"
            value={displayMonthlyRevenue}
            trend={displayGrowth}
            isPositive={true}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard
            label="Phí nền tảng"
            value={displayPlatformFee}
            subtitle={displayFeeRate}
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
              {displayNetRevenue}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[12px] text-indigo-200">
            <span>Chu kỳ đối soát: {displayCycle}</span>
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
              <span className="font-bold text-slate-900">{fallbackFinance.settlement.gross}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Phí nền tảng (5%)</span>
              <span className="font-bold text-rose-600">{fallbackFinance.settlement.fee}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hoàn hàng / Hủy đơn</span>
              <span className="font-bold text-rose-600">{fallbackFinance.settlement.refunds}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Hỗ trợ phí vận chuyển từ sàn</span>
              <span className="font-bold text-emerald-600">{fallbackFinance.settlement.shippingSubsidy}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-[14px]">
              <span className="text-slate-900">Doanh thu thực nhận</span>
              <span className="text-[#4F46E5] text-[16px]">{displayNetRevenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section - Khớp Penpot Board Finance / Revenue chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              BIỂU ĐỒ DOANH THU THEO THỜI GIAN
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">So sánh doanh thu gộp và doanh thu thực nhận sau phí sàn</p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setGranularity('DAY')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${granularity === 'DAY' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setGranularity('WEEK')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${granularity === 'WEEK' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setGranularity('MONTH')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${granularity === 'MONTH' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Theo tháng
            </button>
          </div>
        </div>

        {/* Bar chart bars */}
        <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
          {[
            { day: '01/08', gross: 42, net: 38 },
            { day: '05/08', gross: 65, net: 60 },
            { day: '10/08', gross: 80, net: 74 },
            { day: '15/08', gross: 55, net: 50 },
            { day: '20/08', gross: 95, net: 88 },
            { day: '25/08', gross: 110, net: 102 },
            { day: '30/08', gross: 128, net: 119 },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-[52px]">
              <span className="text-[10px] font-bold text-slate-700">{bar.gross} tr</span>
              <div className="w-full flex gap-1 items-end h-28 justify-center">
                <div 
                  style={{ height: `${(bar.gross / 130) * 100}%` }} 
                  className="w-3.5 bg-indigo-200 hover:bg-indigo-300 rounded-t-sm transition-all" 
                  title={`Doanh thu gộp: ${bar.gross} triệu`}
                />
                <div 
                  style={{ height: `${(bar.net / 130) * 100}%` }} 
                  className="w-3.5 bg-[#4F46E5] hover:bg-indigo-700 rounded-t-sm transition-all" 
                  title={`Doanh thu thuần: ${bar.net} triệu`}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-6 pt-3 text-[12px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-indigo-200 rounded-xs" />
            <span>Doanh thu gộp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#4F46E5] rounded-xs" />
            <span>Doanh thu thực nhận</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transaction & Ledger Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('PAYOUTS')}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                activeTab === 'PAYOUTS'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              LỊCH SỬ RÚT TIỀN ({fallbackFinance.withdrawals.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LEDGER')}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                activeTab === 'LEDGER'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              SỔ CÁI TÀI KHOẢN (LEDGER)
            </button>
          </div>
          <span className="text-[12px] text-slate-500 hidden sm:inline">Dữ liệu ghi nhận tự động</span>
        </div>

        {activeTab === 'PAYOUTS' ? (
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
                {fallbackFinance.withdrawals.map((w) => (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">MÃ BÚT TOÁN</th>
                  <th className="py-3.5 px-6">PHÂN LOẠI</th>
                  <th className="py-3.5 px-6">SỐ TIỀN</th>
                  <th className="py-3.5 px-6">SỐ DƯ SAU</th>
                  <th className="py-3.5 px-6">DIỄN GIẢI</th>
                  <th className="py-3.5 px-6">THỜI GIAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Chưa có bút toán nào trong sổ cái
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry) => (
                    <tr key={entry.entry_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">{entry.entry_id}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          entry.entry_type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {entry.entry_type === 'CREDIT' ? '+ GHI CÓ' : '- GHI NỢ'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.amount)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.balance_after)}
                      </td>
                      <td className="py-4 px-6 text-slate-600">{entry.description}</td>
                      <td className="py-4 px-6 text-slate-500 text-[12px]">
                        {new Date(entry.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={() => fetchFinanceData()}
        balance={displayBalance}
      />
    </div>
  );
}
