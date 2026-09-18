# Đơn hàng (Orders)

## Trạng thái triển khai
- **UI Hoàn thành**: 
  - `OrdersPage.jsx`: Hiển thị danh sách đơn hàng đã mua (Tất cả, Chờ xác nhận, Đang giao, Đã giao, Đã hủy).
  - `OrderDetailPage.jsx`: Theo dõi trạng thái vận chuyển, chi tiết giá, sản phẩm trong đơn.
- **API Tích hợp**:
  - `GET /orders/me` (lấy danh sách).
  - `GET /orders/{orderId}` (lấy chi tiết).
