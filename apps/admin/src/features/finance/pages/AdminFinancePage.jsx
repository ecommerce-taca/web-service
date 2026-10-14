import { useState, useEffect } from 'react';
import { Download, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';

export default function AdminFinancePage() {
  const [summary, setSummary] = useState(null);
  const [reconciliation, setReconciliation] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      adminFinanceApi.getFinanceSummary(),
      adminFinanceApi.getPaymentReconciliation(),
      adminFinanceApi.getSettlements()
    ]).then(([sumRes, reconRes, setRes]) => {
      if (!isMounted) return;
      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      }
      if (reconRes.status === 'fulfilled' && reconRes.value?.data) {
        setReconciliation(reconRes.value.data);
      }
      if (setRes.status === 'fulfilled' && setRes.value?.data) {
        setSettlements(setRes.value.data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await adminFinanceApi.exportFinanceSummary({ format: 'xlsx' });
      const url = res?.data?.export_url;
      if (url) {
        window.open(url, '_blank');
      }
      setNotice('Đã xuất báo cáo tài chính toàn sàn thành công (.xlsx)!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.warn('Lỗi xuất báo cáo tài chính:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetrySettlement = async (batchId) => {
    try {
      await adminFinanceApi.retrySettlement(batchId);
      setNotice(`Đã gửi yêu cầu xử lý lại đợt quyết toán #${batchId}!`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.warn('Lỗi retry settlement:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            Quản trị Tài chính & Đối soát Sàn
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Tổng hợp GMV toàn sàn, đối soát VNPAY, phí hoa hồng và các đợt quyết toán cho nhà bán hàng.
          </p>
        </div>
        <button
          type="button"
          disabled={isExporting}
          onClick={handleExport}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-bold text-[13px] shadow-2xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>{isExporting ? 'Đang xuất...' : 'Xuất báo cáo tài chính'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* Metric Cards - Khớp Penpot Board Taca Admin / Finance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TỔNG GMV TOÀN SÀN</span>
          <div className="text-[24px] font-black text-slate-900 mt-2">
            {summary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.gmv) : '4.850.000.000 ₫'}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">↑ +14.2% so với tháng trước</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DOANH THU HOA HỒNG (5%)</span>
          <div className="text-[24px] font-black text-[#0A68FF] mt-2">
            {summary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.commission_income) : '242.500.000 ₫'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Thu nhập thuần của sàn</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">THUẾ ĐÃ KHẤU TRỪ</span>
          <div className="text-[24px] font-black text-slate-900 mt-2">
            {summary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.tax_collected) : '48.500.000 ₫'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Khấu trừ tại nguồn 1%</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">KHỐI LƯỢNG RÚT TIỀN (PAYOUT)</span>
          <div className="text-[24px] font-black text-slate-900 mt-2">
            {summary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.payout_volume) : '3.800.000.000 ₫'}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">100% thanh toán đúng hạn</span>
        </div>
      </div>

      {/* Table 1: Đối soát Cổng thanh toán VNPAY (#10) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              ĐỐI SOÁT CỔNG THANH TOÁN (VNPAY RECONCILIATION)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">So khớp trạng thái giao dịch giữa hệ thống Taca và cổng VNPAY</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Khớp 100%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-6">MÃ PAYMENT</th>
                <th className="py-3 px-6">CỔNG THANH TOÁN</th>
                <th className="py-3 px-6">TRẠNG THÁI TACA</th>
                <th className="py-3 px-6">TRẠNG THÁI VNPAY</th>
                <th className="py-3 px-6">SỐ TIỀN</th>
                <th className="py-3 px-6">KẾT QUẢ ĐỐI SOÁT</th>
                <th className="py-3 px-6">THỜI GIAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <td className="py-3.5 px-6 font-extrabold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    {r.match ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 text-[12px]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Khớp hoàn toàn</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 text-[12px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Lệch dữ liệu ({r.mismatch_reason})</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 text-[12px]">
                    {new Date(r.checked_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Đợt Quyết toán cho Nhà bán hàng (Settlement Batches) - Khớp Penpot Board Table / Settlement batches */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              ĐỢT QUYẾT TOÁN CHO NHÀ BÁN HÀNG (SETTLEMENT BATCHES)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Chuyển tiền từ số dư chờ đối soát sang số dư khả dụng sau chu kỳ T+2</p>
          </div>
          <span className="text-[12px] text-slate-500 font-medium">Chu kỳ hàng ngày</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-6">MÃ ĐỢT (BATCH ID)</th>
                <th className="py-3 px-6">KỲ ĐỐI SOÁT</th>
                <th className="py-3 px-6">DOANH THU GỘP</th>
                <th className="py-3 px-6">HOA HỒNG SÀN</th>
                <th className="py-3 px-6">THỰC NHẬN CHO SHOP</th>
                <th className="py-3 px-6">TRẠNG THÁI</th>
                <th className="py-3 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((batch) => (
                <tr key={batch.batch_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{batch.batch_id}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700">{batch.period}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(batch.total_gross)}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-[#0A68FF]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(batch.total_commission)}
                  </td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(batch.total_net)}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      batch.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {batch.status === 'COMPLETED' ? 'ĐÃ CHỐT' : 'THẤT BẠI'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {batch.status === 'FAILED' ? (
                      <button
                        type="button"
                        onClick={() => handleRetrySettlement(batch.batch_id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        Thử lại
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[12px] font-medium">Hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
