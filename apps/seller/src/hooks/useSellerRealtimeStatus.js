import { useState, useEffect } from 'react';
import sellerRealtimeService from '../services/seller-realtime.service';

/**
 * Custom Hook theo dõi trạng thái Realtime của Seller
 * Tự động đồng bộ trạng thái khi Admin duyệt hồ sơ KYC mà không cần F5 (AUD-04)
 */
export function useSellerRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Khởi động kết nối Realtime
    sellerRealtimeService.connect();

    // Đăng ký nhận thông báo từ Service
    const unsubscribe = sellerRealtimeService.subscribe((event) => {
      if (event.type === 'CONNECTION_OPEN') {
        setIsConnected(true);
      } else if (event.type === 'KYC_STATUS_CHANGED') {
        setLastEvent(event.data);

        // Tạo thông báo cho Seller
        if (event.data.decision === 'APPROVED') {
          setNotification({
            type: 'success',
            title: '🎉 Hồ sơ Người Bán đã được phê duyệt!',
            message: 'Chúc mừng bạn! Cửa hàng đã được kích hoạt thành công. Bạn có thể bắt đầu đăng bán sản phẩm ngay bây giờ.',
          });
        } else if (event.data.decision === 'REJECTED') {
          setNotification({
            type: 'error',
            title: '⚠️ Hồ sơ Người Bán bị từ chối',
            message: event.data.reason
              ? `Lý do: ${event.data.reason}. Vui lòng cập nhật lại hồ sơ.`
              : 'Hồ sơ KYC chưa đạt yêu cầu. Vui lòng kiểm tra lại tài liệu đã tải lên.',
          });
        } else if (event.data.decision === 'NEEDS_INFO') {
          setNotification({
            type: 'warning',
            title: '📋 Cần bổ sung thông tin hồ sơ',
            message: event.data.reason
              ? `Yêu cầu: ${event.data.reason}`
              : 'Admin yêu cầu bổ sung thông tin chứng từ pháp lý.',
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissNotification = () => {
    setNotification(null);
  };

  return {
    isConnected,
    lastEvent,
    notification,
    dismissNotification,
  };
}

export default useSellerRealtimeStatus;
