import { Bell } from 'lucide-react';

/**
 * Tab 6: Cài đặt thông báo đơn hàng & ví tiền
 */
export default function NotificationsTab() {
  return (
    <div className="py-12 text-center text-slate-500 space-y-3">
      <Bell className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
      <p className="font-semibold text-slate-700">Cài đặt thông báo đơn hàng & ví tiền</p>
      <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
        Hệ thống tự động thông báo qua Email và App Seller Center khi phát sinh đơn hàng mới hoặc có thay đổi số dư ví.
      </p>
    </div>
  );
}
