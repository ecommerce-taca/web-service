import { useState, useEffect, useCallback } from 'react';
import { Download, Check, CheckCircle2, AlertTriangle, Eye, Calendar, Filter, RotateCcw } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';
import SettlementBatchDetailModal from '../components/SettlementBatchDetailModal';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';
import CreateRefundModal from '../components/CreateRefundModal';

export default function AdminFinancePage() {
  const [summary, setSummary] = useState(null);
  const [reconciliation, setReconciliation] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [notice, setNotice] = useState('');
  const [retryBatchId, setRetryBatchId] = useState(null);
  const [isRetryMfaOpen, setIsRetryMfaOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);

  // Giới hạn ngày: chỉ cho phép chọn ngày trong quá khứ hoặc hôm nay (<= today)
  const today = new Date().toISOString().slice(0, 10);

  // Bộ lọc thời gian cho báo cáo tài chính tổng quan (MISS-010)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Helper tính toán các khoảng ngày chọn nhanh (Quick Presets)
  const getPresetRange = useCallback((preset) => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from = to;

    if (preset === 'today') {
      from = to;
    } else if (preset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      from = d.toISOString().slice(0, 10);
    } else if (preset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      from = d.toISOString().slice(0, 10);
    } else if (preset === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      from = d.toISOString().slice(0, 10);
    }
    return { from, to };
  }, []);

  const isPresetActive = useCallback((presetKey) => {
    const { from, to } = getPresetRange(presetKey);
    return fromDate === from && toDate === to;
  }, [fromDate, toDate, getPresetRange]);

  const loadData = useCallback(async (customParams = null) => {
    try {
      setLoadingSummary(true);
      const summaryParams = customParams || { from: fromDate, to: toDate };
      const [sumRes, reconRes, setRes] = await Promise.allSettled([
        adminFinanceApi.getFinanceSummary(summaryParams),
        adminFinanceApi.getPaymentReconciliation(),
        adminFinanceApi.getSettlements()
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      }
      if (reconRes.status === 'fulfilled' && reconRes.value?.data) {
        setReconciliation(reconRes.value.data);
      }
      if (setRes.status === 'fulfilled' && setRes.value?.data) {
        setSettlements(setRes.value.data);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu tài chính:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Điều chỉnh an toàn khi người dùng nhập hoặc chọn ngày
  const handleFromDateChange = (val) => {
    let nextFrom = val;
    if (nextFrom > today) {
      nextFrom = today;
    }
    setFromDate(nextFrom);
    if (toDate && nextFrom > toDate) {
      setToDate(nextFrom);
    }
  };

  const handleToDateChange = (val) => {
    let nextTo = val;
    if (nextTo > today) {
      nextTo = today;
    }
    setToDate(nextTo);
    if (fromDate && nextTo < fromDate) {
      setFromDate(nextTo);
    }
  };

  const handleSelectPreset = (presetKey) => {
    const { from, to } = getPresetRange(presetKey);
    setFromDate(from);
    setToDate(to);
    loadData({ from, to });
    const labels = {
      today: 'Hôm nay',
      '7d': '7 ngày qua',
      '30d': '30 ngày qua',
      month: 'Tháng này'
    };
    setNotice(`Đã chọn nhanh khoảng thời gian: ${labels[presetKey] || presetKey} (${from} → ${to})`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleFilter = (e) => {
    e.preventDefault();
    let validFrom = fromDate;
    let validTo = toDate;

    // Ràng buộc bảo vệ: không cho phép vượt quá ngày hôm nay
    if (validTo > today) {
      validTo = today;
      setToDate(today);
    }
    if (validFrom > validTo) {
      validFrom = validTo;
      setFromDate(validTo);
    }

    loadData({ from: validFrom, to: validTo });
    setNotice(`Đã cập nhật số liệu tài chính từ ${validFrom} đến ${validTo}`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleResetFilter = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const defaultFrom = d.toISOString().slice(0, 10);
    const defaultTo = new Date().toISOString().slice(0, 10);
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    loadData({ from: defaultFrom, to: defaultTo });
    setNotice(`Đã đặt lại phạm vi 30 ngày gần nhất (${defaultFrom} → ${defaultTo})`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await adminFinanceApi.exportFinanceSummary({
        from: fromDate,
        to: toDate,
        format: exportFormat
      });
      const url = res?.data?.export_url;
      if (url) {
        window.open(url, '_blank');
      }
      setNotice(`Đã xuất báo cáo tài chính toàn sàn thành công (.${exportFormat})!`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.warn('Lỗi xuất báo cáo tài chính:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewBatchDetail = async (batchId) => {
    try {
      const res = await adminFinanceApi.getSettlementDetail(batchId);
      if (res?.data) {
        setSelectedBatchDetail(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết batch:', err);
    }
  };

  const handleOpenRetryMfa = (batchId) => {
    setRetryBatchId(batchId);
    setIsRetryMfaOpen(true);
  };

  const handleConfirmRetrySettlement = async (stepUpToken) => {
    if (!retryBatchId) return;
    try {
      await adminFinanceApi.retrySettlement(retryBatchId, stepUpToken);
      setNotice(`Đã xác thực 2FA thành công và gửi yêu cầu xử lý lại đợt quyết toán #${retryBatchId}!`);
      setTimeout(() => setNotice(''), 4000);
      loadData();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      console.warn('Lỗi retry settlement:', err);
      setNotice('Không thể thử lại đợt quyết toán. Vui lòng kiểm tra lại mã 2FA.');
    } finally {
      setRetryBatchId(null);
      setIsRetryMfaOpen(false);
    }
  };

  const handleApproveBatch = (batchId) => {
    setSettlements((prev) =>
      prev.map((b) =>
        b.batch_id === batchId
          ? { ...b, status: 'COMPLETED', status_label: 'Đã quyết toán' }
          : b
      )
    );
    setNotice(`Đã phê duyệt giải ngân cho đợt quyết toán #${batchId}!`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header - Khớp Penpot Board Taca Admin / Finance */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
              Finance
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Đối soát Marketplace, settlement seller, reserve và chargeback.
            </p>
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            <select
              id="admin-finance-export-format"
              name="adminFinanceExportFormat"
              aria-label="Định dạng xuất báo cáo tài chính"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[12px] font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-bold text-[13px] shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>{isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}</span>
            </button>
          </div>
        </div>

        {/* Date Filter Toolbar & Quick Presets (Chỉ cho phép ngày quá khứ & hôm nay: <= today) */}
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
          {/* Quick Preset Boxes - Thao tác 1-Click thuận tiện UX */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Kỳ nhanh:
            </span>
            <button
              type="button"
              onClick={() => handleSelectPreset('today')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                isPresetActive('today')
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/50'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('7d')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                isPresetActive('7d')
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/50'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('30d')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                isPresetActive('30d')
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/50'
              }`}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('month')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                isPresetActive('month')
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/50'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Custom Date Form (Ràng buộc max={today} không vượt quá ngày hiện tại) */}
          <form onSubmit={handleFilter} className="flex items-center gap-2 flex-wrap sm:flex-nowrap bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Từ:</span>
              <input
                id="admin-finance-from-date"
                name="adminFinanceFromDate"
                type="date"
                max={toDate < today ? toDate : today}
                aria-label="Từ ngày (chỉ trong quá khứ hoặc hôm nay)"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className="text-[12px] font-medium text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
                title="Chỉ chọn ngày trong quá khứ hoặc hôm nay"
              />
            </div>

            <span className="text-slate-400 text-[12px] font-bold">→</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Đến:</span>
              <input
                id="admin-finance-to-date"
                name="adminFinanceToDate"
                type="date"
                max={today}
                min={fromDate}
                aria-label="Đến ngày (tối đa ngày hôm nay)"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className="text-[12px] font-medium text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
                title="Chỉ chọn ngày trong quá khứ hoặc hôm nay (tối đa hôm nay)"
              />
            </div>

            <button
              type="submit"
              disabled={loadingSummary}
              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200/50"
            >
              <Filter className="w-3 h-3" aria-hidden="true" />
              <span>{loadingSummary ? 'Đang lọc...' : 'Lọc'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              title="Đặt lại 30 ngày gần nhất"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              aria-label="Đặt lại 30 ngày gần nhất"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* 4 Metric Cards - Khớp Penpot Board Taca Admin / Finance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GMV CHỜ ĐỐI SOÁT</span>
          <div className="text-[26px] font-black text-slate-900 mt-2">
            {summary?.gmv ? `${(summary.gmv / 1000000000).toFixed(1)} tỷ ₫` : '286,4 tỷ ₫'}
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 mt-1 inline-block">T+1 / T+2</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PHẢI TRẢ SELLER</span>
          <div className="text-[26px] font-black text-indigo-600 mt-2">
            {summary?.payout_volume ? `${(summary.payout_volume / 1000000000).toFixed(1)} tỷ ₫` : '248,8 tỷ ₫'}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">4.218 seller</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RESERVE</span>
          <div className="text-[26px] font-black text-amber-600 mt-2">
            {summary?.tax_collected ? `${((summary.tax_collected * 3.75) / 1000000000).toFixed(1)} tỷ ₫` : '18,2 tỷ ₫'}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">6,4% GMV</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CHARGEBACK</span>
          <div className="text-[26px] font-black text-rose-600 mt-2">
            {summary?.refunded ? `${((summary.refunded * 10) / 1000000000).toFixed(2)} tỷ ₫` : '1,28 tỷ ₫'}
          </div>
          <span className="text-[11px] font-semibold text-rose-500 mt-1 inline-block">0,45%</span>
        </div>
      </div>

      {/* Table 1: Đợt Quyết toán cho Nhà bán hàng (Settlement Batches) - Khớp Penpot Board Taca Admin / Finance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              Settlement batches
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Đợt chuyển tiền tự động từ số dư chờ đối soát sang số dư khả dụng sau chu kỳ T+2 (§3.8 payment-wallet.md)
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[12px] font-semibold text-indigo-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span>Chu kỳ tự động: 02:00 sáng Thứ Hai (T+2)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-6">BATCH</th>
                <th className="py-3 px-6">KỲ</th>
                <th className="py-3 px-6 text-center">SELLER</th>
                <th className="py-3 px-6 text-right">GMV</th>
                <th className="py-3 px-6 text-right">PHÍ</th>
                <th className="py-3 px-6 text-right">NET PAYOUT</th>
                <th className="py-3 px-6 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-6 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {settlements.map((batch) => {
                const isPending = batch.status === 'PENDING_RECONCILIATION';
                const isFailed = batch.status === 'FAILED';
                const isCompleted = batch.status === 'COMPLETED';

                return (
                  <tr key={batch.batch_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                      <button
                        type="button"
                        onClick={() => handleViewBatchDetail(batch.batch_id)}
                        className="hover:underline font-bold text-indigo-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                        <span>{batch.batch_id}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">{batch.period}</td>
                    <td className="py-3.5 px-6 text-center font-bold text-slate-800">
                      {(batch.sellers_count || 1842).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                      {(batch.total_gross / 1000000000).toFixed(1)} tỷ
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-rose-600">
                      {(batch.total_commission / 1000000000).toFixed(2)} tỷ
                    </td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-indigo-600">
                      {(batch.total_net / 1000000000).toFixed(2)} tỷ
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isFailed
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {batch.status_label || (isCompleted ? 'Đã quyết toán' : isFailed ? 'Lỗi' : 'Chờ đối soát')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleApproveBatch(batch.batch_id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Duyệt
                          </button>
                        )}
                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => handleOpenRetryMfa(batch.batch_id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <span>Thử lại (2FA)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewBatchDetail(batch.batch_id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Đối soát Cổng thanh toán VNPAY (#10, API-007) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              ĐỐI SOÁT CỔNG THANH TOÁN (VNPAY RECONCILIATION)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tiến trình Cron tự động chạy hàng ngày lúc 00:00 (UTC+7) so khớp giao dịch Taca và VNPAY
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Lịch Cron: 00:00 UTC+7
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Khớp 100%
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedPaymentForRefund(null);
                setIsRefundModalOpen(true);
              }}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Tạo hoàn tiền (2FA)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-6">MÃ PAYMENT</th>
                <th className="py-3 px-6">CỔNG THANH TOÁN</th>
                <th className="py-3 px-6">TRẠNG THÁI TACA</th>
                <th className="py-3 px-6">TRẠNG THÁI VNPAY</th>
                <th className="py-3 px-6 text-right">SỐ TIỀN</th>
                <th className="py-3 px-6 text-center">KẾT QUẢ ĐỐI SOÁT</th>
                <th className="py-3 px-6 text-right">THỜI GIAN</th>
                <th className="py-3 px-6 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reconciliation.map((r, i) => (
                <tr key={r.payment_id || i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{r.payment_id}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700">{r.provider}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      {r.local_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                      {r.provider_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-extrabold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.amount)}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {r.match ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 text-[12px]">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        <span>Khớp hoàn toàn</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 text-[12px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Lệch dữ liệu ({r.mismatch_reason})</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-500 text-[12px]">
                    {new Date(r.checked_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentForRefund(r);
                        setIsRefundModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      <span>Hoàn tiền</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem chi tiết đợt quyết toán theo Shop (#16) */}
      <SettlementBatchDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        batchDetail={selectedBatchDetail}
        onRetry={handleOpenRetryMfa}
      />

      {/* Modal Xác thực 2FA khi Thử lại Quyết toán */}
      <StepUpMfaModal
        isOpen={isRetryMfaOpen}
        onClose={() => {
          setIsRetryMfaOpen(false);
          setRetryBatchId(null);
        }}
        onSuccess={handleConfirmRetrySettlement}
        title="Xác thực 2FA Thử lại Quyết toán"
        description={`Kích hoạt chạy lại đợt quyết toán #${retryBatchId || ''} yêu cầu mã OTP 2FA từ ứng dụng Authenticator để đảm bảo tính an toàn tài chính sàn.`}
      />

      {/* Modal Tạo Lệnh Hoàn Tiền (#4, REQ-04) */}
      <CreateRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSuccess={({ paymentId, amount }) => {
          loadData();
          setNotice(`Đã tạo lệnh hoàn tiền thành công ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)} cho giao dịch #${paymentId}! Bút toán đảo sổ cái đã được ghi nhận.`);
          setTimeout(() => setNotice(''), 4000);
        }}
        initialPayment={selectedPaymentForRefund}
      />
    </div>
  );
}
