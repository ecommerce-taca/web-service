# orders.md (Quản lý Đơn Hàng)

## 1. Các trạng thái đơn hàng (Order Statuses)
Dựa theo giao diện UI trang Đơn mua của Buyer, đơn hàng đi qua các trạng thái:
1. **Chờ xác nhận (Pending):** Đã đặt nhưng người bán chưa duyệt.
2. **Đang vận chuyển / Đang giao (Delivering):** Đã giao cho đơn vị vận chuyển.
3. **Đã giao (Delivered):** Giao thành công. Lúc này sẽ hiện nút "Đánh giá".
4. **Đã hủy (Cancelled):** Đơn bị hủy bởi người mua hoặc hệ thống.

## 2. Cấu trúc dữ liệu hiển thị (UI Model)
Một đơn hàng trên UI cần hiển thị:
- `id`: Mã đơn hàng (VD: TACA2408271)
- `storeName`: Tên cửa hàng bán.
- `status`: Trạng thái hiện tại.
- `items`: Danh sách sản phẩm trong đơn (Tên, phân loại, giá, số lượng, ảnh).
- `totalPrice`: Thành tiền (Tổng thanh toán).

*Đang chờ API Contract từ Backend Order Service.*
