import { Truck, ShieldCheck, Zap, RotateCcw } from 'lucide-react';

const BENEFITS = [
  {
    icon: Truck,
    title: 'Freeship 0Đ Toàn Quốc',
    desc: 'Áp dụng cho mọi đơn hàng',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: ShieldCheck,
    title: '100% Hàng Chính Hãng',
    desc: 'Hoàn tiền 111% nếu hàng giả',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Zap,
    title: 'Giao Nhanh 2 Giờ',
    desc: 'Khu vực nội thành HCM & HN',
    color: 'text-amber-500 bg-amber-50 border-amber-100',
  },
  {
    icon: RotateCcw,
    title: 'Đổi Trả 15 Ngày',
    desc: 'Thủ tục hoàn tiền dễ dàng',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
];

const BenefitsBar = () => {
  return (
    <div className="bg-white rounded-2xl py-3.5 sm:py-4 px-4 sm:px-6 border border-slate-200/80 shadow-xs grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {BENEFITS.map((b, i) => {
        const IconComponent = b.icon;
        return (
          <div key={i} className="flex items-center gap-3 py-1 group">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${b.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-extrabold text-slate-900 truncate">
                {b.title}
              </span>
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {b.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BenefitsBar;
