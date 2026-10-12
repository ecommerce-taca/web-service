import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PackageCheck 
} from 'lucide-react';

export const getOrderStatusInfo = (status) => {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Giao thành công',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        icon: CheckCircle2,
      };
    case 'SHIPPING':
      return {
        label: 'Đang vận chuyển',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
        icon: Truck,
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        icon: PackageCheck,
      };
    case 'PENDING':
      return {
        label: 'Chờ xác nhận',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
        icon: Clock,
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: AlertCircle,
      };
    default:
      return {
        label: status || 'Đang xử lý',
        colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Clock,
      };
  }
};
