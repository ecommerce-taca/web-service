import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import OrderDetailModal from '../../orders/components/OrderDetailModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function DashboardPage() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  const { dashboard } = SELLER_MOCK_DATA;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reportDownloaded, setReportDownloaded] = useState(false);

  const handleDownloadReport = () => {
    setReportDownloaded(true);
    setTimeout(() => setReportDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Chào buổi sáng, Minh Anh
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Theo dõi hiệu suất cửa hàng và các việc cần xử lý hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {reportDownloaded && (
            <span className="text-[12px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              ✓ Đã tải báo cáo hôm nay (.csv)
            </span>
          )}
          <button
            type="button"
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg font-semibold text-[13px] shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span>📥</span>
            <span>Tải báo cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboard.metrics.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            trend={m.trend}
            isPositive={m.isPositive}
            isWarning={m.isWarning}
          />
        ))}
      </div>

      {/* Two Column Layout: Revenue Chart & Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Revenue Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                DOANH THU 7 NGÀY
              </span>
              <div className="text-[24px] font-extrabold text-slate-900 mt-1 tracking-tight">
                {dashboard.revenue7Days.total}
              </div>
            </div>
            <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
              {dashboard.revenue7Days.growth}
            </span>
          </div>

          {/* Bar Chart Visualization matching Penpot geometry */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-end justify-between gap-3 h-[250px] px-4">
            {dashboard.revenue7Days.chart.map((bar) => {
              // Calculate relative bar heights according to Penpot heights:
              // T2: 90, T3: 126, T4: 108, T5: 180, T6: 148, T7: 218, CN: 250
              const maxH = 250;
              const heights = {
                T2: 90,
                T3: 126,
                T4: 108,
                T5: 180,
                T6: 148,
                T7: 218,
                CN: 250,
              };
              const barHeightPx = heights[bar.day] || 120;
              const heightPercent = Math.round((barHeightPx / maxH) * 100);

              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-semibold text-slate-400 group-hover:text-[#4F46E5] transition-colors">
                    {bar.amount}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[54px] bg-indigo-100 group-hover:bg-[#4F46E5] rounded-t-md transition-all duration-300 relative shadow-2xs"
                  />
                  <div className="text-[12px] font-bold text-slate-600 mt-1">
                    {bar.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Action Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-4 block">
            VIỆC CẦN XỬ LÝ
          </span>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between">
            {dashboard.actionQueue.map((item) => (
              <Link
                key={item.id}
                to={`${basePath}${item.path}`}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
              >
                <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900">
                  {item.label}
                </span>
                <span
                  className={`text-[12px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    item.urgent
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-indigo-50 text-[#4F46E5] border border-indigo-100'
                  }`}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-[13px] font-bold uppercase tracking-wider text-slate-800">
            ĐƠN HÀNG GẦN ĐÂY
          </span>
          <Link
            to={`${basePath}/orders`}
            className="text-[12px] font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6">MÃ ĐƠN</th>
                <th className="py-3.5 px-6">KHÁCH HÀNG</th>
                <th className="py-3.5 px-6">SẢN PHẨM</th>
                <th className="py-3.5 px-6">TỔNG TIỀN</th>
                <th className="py-3.5 px-6">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{order.id}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{order.customer}</td>
                  <td className="py-4 px-6 text-slate-800 max-w-[280px] truncate" title={order.product}>
                    {order.product}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-slate-900">{order.amount}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} type={order.statusType} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-[12px] font-semibold text-[#4F46E5] hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
