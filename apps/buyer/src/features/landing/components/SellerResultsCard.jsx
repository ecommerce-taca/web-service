import { useInViewOnce } from '../hooks/useInViewOnce';
import { useCountUp } from '../hooks/useCountUp';
import {
  AVERAGE_SHOP_RESULTS,
  CHART_MAX_VALUE,
  MONTHLY_AVERAGE_REVENUE,
} from '../constants/landingContent';
import { formatVietnameseNumber } from '../utils/formatNumber';

// Xem trước Seller Center dựng bằng HTML với SỐ LIỆU MẪU (trung bình mỗi shop)
export default function SellerResultsCard() {
  const [cardRef, inView] = useInViewOnce(0.35);
  const progress = useCountUp(inView);
  const lastIndex = MONTHLY_AVERAGE_REVENUE.length - 1;

  const kpis = [
    {
      label: 'Doanh thu TB mỗi shop / tháng',
      value: `${formatVietnameseNumber(AVERAGE_SHOP_RESULTS.revenuePerMonth * progress, 1)} tr₫`,
      trend: '▲ 11% so với tháng trước',
    },
    {
      label: 'Đơn TB mỗi shop / tháng',
      value: formatVietnameseNumber(Math.round(AVERAGE_SHOP_RESULTS.ordersPerMonth * progress)),
      trend: '▲ 8%',
    },
    {
      label: 'Giá trị đơn trung bình',
      value: `${formatVietnameseNumber(Math.round((AVERAGE_SHOP_RESULTS.averageOrderValue / 1000) * progress))}.000₫`,
      trend: '▲ 3%',
    },
  ];

  return (
    <div ref={cardRef} className="flex min-w-0 flex-[1_1_460px] flex-col gap-3.5 rounded-[20px] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">KẾT QUẢ TRUNG BÌNH MỖI SHOP</span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-800">
          Trung bình · 6 tháng
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-1 rounded-xl bg-slate-100 p-3.5">
            <div className="text-xs text-slate-500">{kpi.label}</div>
            <div className="num text-xl font-extrabold">{kpi.value}</div>
            <div className="text-xs font-bold text-emerald-700">{kpi.trend}</div>
          </div>
        ))}
      </div>
      <figure
        className={`chart m-0 flex flex-col gap-2 rounded-xl bg-slate-100 px-4 pb-2.5 pt-3.5 ${inView ? 'on' : ''}`}
        role="img"
        aria-label="Biểu đồ doanh thu trung bình mỗi shop trên Taca từ tháng 5 đến tháng 10, tăng từ 5,1 lên 6,9 triệu đồng"
      >
        <figcaption className="flex justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-700">Doanh thu trung bình mỗi shop theo tháng</span>
          <span>triệu ₫</span>
        </figcaption>
        <div className="flex h-[150px] items-end gap-2.5">
          {MONTHLY_AVERAGE_REVENUE.map((month, index) => {
            const isLatest = index === lastIndex;
            return (
              <div
                key={month.label}
                className={`bar-col flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 ${isLatest ? 'today' : ''}`}
              >
                <span className="bar-val text-[11px] font-bold text-indigo-900">
                  {formatVietnameseNumber(month.value, 1)}
                </span>
                <div
                  className={`bar w-full rounded-t-lg rounded-b ${
                    isLatest ? 'bg-gradient-to-b from-[#10b981] to-[#0a68ff]' : 'bg-gradient-to-b from-indigo-500 to-indigo-700'
                  }`}
                  style={{
                    height: `${Math.round((month.value / CHART_MAX_VALUE) * 100)}%`,
                    transitionDelay: `${(index * 0.08).toFixed(2)}s`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-2.5">
          {MONTHLY_AVERAGE_REVENUE.map((month) => (
            <span key={month.label} className="flex-1 text-center text-[11px] text-slate-500">{month.label}</span>
          ))}
        </div>
      </figure>
    </div>
  );
}
