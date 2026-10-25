import { useInViewOnce } from '../hooks/useInViewOnce';
import { useCountUp } from '../hooks/useCountUp';
import { PLATFORM_STATS } from '../constants/landingContent';
import { formatVietnameseNumber } from '../utils/formatNumber';

// SỐ LIỆU MẪU toàn sàn, đếm tăng dần khi cuộn tới
export default function PlatformStats() {
  const [statsRef, inView] = useInViewOnce(0.35);
  const progress = useCountUp(inView);

  const stats = [
    { label: 'shop đang bán', value: `${formatVietnameseNumber(Math.round(PLATFORM_STATS.shops * progress))}+` },
    { label: 'người mua hoạt động', value: `${formatVietnameseNumber(PLATFORM_STATS.buyersMillions * progress, 1)} triệu` },
    {
      label: 'đơn mỗi tháng',
      value: formatVietnameseNumber(Math.round((PLATFORM_STATS.ordersPerMonth * progress) / 1000) * 1000),
    },
    { label: 'phí hoa hồng, chỉ từ', value: `${formatVietnameseNumber(Math.round(PLATFORM_STATS.minCommissionRate * progress))}%` },
  ];

  return (
    <div ref={statsRef} className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 pt-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="num grad-text text-[40px] font-extrabold tracking-[-0.02em]">{stat.value}</div>
          <div className="text-[15px] text-slate-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
