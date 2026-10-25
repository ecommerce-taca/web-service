# Kế Hoạch Triển Khai: PHASE-04 (Phase Plan)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-04`
- **Tên Phase**: Seller Orders & Fulfillment Alignment (Tồn Kho, Đơn Hàng & Vận Chuyển Seller)
- **Trạng thái**: `IN_PROGRESS`
- **Mục tiêu**: Chuẩn hóa toàn bộ các tính năng xử lý đơn hàng, điều phối vận chuyển, quản lý tồn kho và khuyến mại người bán theo đúng hợp đồng API Gateway và tài liệu chính thức từ GitHub docs (`order-commerce.md`, `shipment.md`, `inventory.md`):
  1. `MISS-003` (High): Tích hợp tra cứu và so sánh phí/thời gian các hãng vận chuyển (`GET /seller/orders/{orderId}/shipment/carriers`) trước khi bàn giao vận đơn (`PATCH /seller/orders/{orderId}/fulfill` với `action="SHIP"` và `carrier`).
  2. `MISS-004` (High): Xây dựng module quản lý tồn kho chuyên biệt cho Seller: hiển thị bảng tồn kho (`GET /seller/inventory`) và modal điều chỉnh số lượng tồn (`PATCH /seller/inventory/{skuId}/adjust`).
  3. `MISS-006` (Medium): Bổ sung tính năng xuất danh sách đơn hàng cho người bán (`GET /seller/orders/export` hỗ trợ `format=xlsx` và `csv`).
  4. `MISS-007` (Medium): Chuẩn hóa quy trình người bán hủy đơn hàng (`POST /seller/orders/{orderId}/cancel`) kèm mã lý do hủy (`OUT_OF_STOCK`, `CUSTOMER_REQUEST`, `UNDELIVERABLE_AREA`, `SELLER_REQUEST`) và kiểm soát concurrency `version`.
  5. `MISS-008` (Medium): Hoàn thiện quản lý voucher người bán: cập nhật voucher (`PUT /seller/vouchers/{voucherId}`) và kết thúc sớm / hủy kích hoạt (`DELETE /seller/vouchers/{voucherId}`).

---

## 2. Phạm Vi Được Phê Duyệt & Tasks Chi Tiết

| Task ID | Finding ID | Ứng dụng | File / Module dự kiến ảnh hưởng | Mô tả thay đổi dự kiến |
| :---: | :---: | :---: | :--- | :--- |
| `TASK-04-CARRIER-COMPARE` | `MISS-003` | Seller | - `apps/seller/src/features/orders/services/seller-order.api.js`<br>- `apps/seller/src/features/orders/components/PrepareShipmentModal.jsx` | - Bổ sung hàm `getShipmentCarriers(orderId)` gọi `GET /seller/orders/{orderId}/shipment/carriers`.<br>- Tải danh sách đơn vị vận chuyển (`GHN`, `SPX`, `J&T`...) kèm cước phí `fee`, thời gian dự kiến `estimate.min_days - max_days`, hiển thị trạng thái `available: false` kèm `unavailable_reason`.<br>- Khi xác nhận chuẩn bị hàng, truyền đúng `carrier` đã chọn vào `fulfillSellerOrder(orderId, { action: 'SHIP', carrier, version })`. |
| `TASK-04-INVENTORY-MODULE` | `MISS-004` | Seller | - `apps/seller/src/features/inventory/services/seller-inventory.api.js` (Mới)<br>- `apps/seller/src/features/inventory/components/StockAdjustModal.jsx` (Mới)<br>- `apps/seller/src/features/inventory/pages/InventoryPage.jsx` (Mới)<br>- `apps/seller/src/app/App.jsx`<br>- `apps/seller/src/components/layout/SellerNav.jsx` | - Tạo service gọi `GET /seller/inventory` và `PATCH /seller/inventory/{skuId}/adjust`.<br>- Xây dựng trang Quản lý kho hàng hiển thị chỉ số tổng tồn, đang giữ (reserved), cảnh báo tồn thấp (`low_stock`), bảng danh sách SKU.<br>- Xây dựng modal điều chỉnh số lượng tồn với delta (nhập/xuất), lý do và version optimistic locking.<br>- Đăng ký route `/inventory` và thêm mục menu "Quản lý kho hàng" trên thanh điều hướng Seller. |
| `TASK-04-ORDERS-EXPORT` | `MISS-006` | Seller | - `apps/seller/src/features/orders/services/seller-order.api.js`<br>- `apps/seller/src/features/orders/pages/OrdersPage.jsx` | - Bổ sung `exportSellerOrders(params)` gọi `GET /seller/orders/export`.<br>- Nút "Xuất" trên `OrdersPage.jsx` gọi API lấy signed URL `export_url`, tự động kích hoạt tải xuống file và hiển thị số dòng `row_count` đã xuất. |
| `TASK-04-ORDER-CANCEL` | `MISS-007` | Seller | - `apps/seller/src/features/orders/services/seller-order.api.js`<br>- `apps/seller/src/features/orders/components/CancelOrderModal.jsx` (Mới)<br>- `apps/seller/src/features/orders/components/OrderDetailModal.jsx`<br>- `apps/seller/src/features/orders/pages/OrdersPage.jsx` | - Bổ sung `cancelSellerOrder(orderId, { reason, version })` gọi `POST /seller/orders/{orderId}/cancel`.<br>- Xây dựng modal hủy đơn cho phép chọn lý do chuẩn hóa (`OUT_OF_STOCK`, `CUSTOMER_REQUEST`, `UNDELIVERABLE_AREA`, `SELLER_REQUEST`) kèm ghi chú.<br>- Nối nút "Từ chối đơn" trên `OrderDetailModal.jsx` và thao tác hủy trên `OrdersPage.jsx` vào modal này. |
| `TASK-04-VOUCHER-MUTATION` | `MISS-008` | Seller | - `apps/seller/src/features/vouchers/services/seller-voucher.api.js`<br>- `apps/seller/src/features/vouchers/components/EditVoucherModal.jsx` (Mới)<br>- `apps/seller/src/features/vouchers/pages/VouchersPage.jsx` | - Bổ sung `updateSellerVoucher(voucherId, payload)` (`PUT /seller/vouchers/{voucherId}`) và `deleteSellerVoucher(voucherId, { version })` (`DELETE /seller/vouchers/{voucherId}`).<br>- Xây dựng modal chỉnh sửa thông số voucher (loại giảm, mức giảm, đơn tối thiểu, số lượng phát hành, thời hạn). Khóa trường mã nếu `used_count > 0`.<br>- Thêm nút dừng/kết thúc sớm voucher (`DELETE /seller/vouchers/{id}`) với hộp thoại xác nhận trực quan. |

---

## 3. Rủi Ro & Biện Pháp Phòng Ngừa
- **Rủi ro**: Khi chưa cấu hình adapter thật cho một số carrier như J&T hoặc SPX, API carrier có thể trả về `available: false`.
- **Biện pháp**: Xử lý giao diện hiển thị rõ lý do không khả dụng (`unavailable_reason`), vô hiệu hóa nút chọn nhưng vẫn cho phép chọn các carrier đang khả dụng (`available: true`, ví dụ GHN).
- **Rủi ro**: Điều chỉnh tồn kho delta âm làm số lượng khả dụng < 0 gây lỗi 409 `INVENTORY_STOCK_INSUFFICIENT`.
- **Biện pháp**: Validation client-side kiểm tra trước `available_qty + delta >= 0` và hiển thị cảnh báo trực quan trước khi gửi API.
- **Rủi ro**: Tranh chấp đồng thời (concurrency conflict) khi sửa voucher hoặc hủy đơn hàng nếu `version` không khớp.
- **Biện pháp**: Luôn truyền `version` hiện tại của bản ghi, bắt mã lỗi 409 và reload dữ liệu mới nhất kèm thông báo người dùng thử lại.

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. Carrier Selection: Màn chuẩn bị hàng gọi `GET /seller/orders/{orderId}/shipment/carriers`, hiển thị danh sách biểu phí và chuyển trạng thái đơn sang `SHIPPED` với carrier đã chọn qua `PATCH /seller/orders/{orderId}/fulfill`.
2. Inventory Management: Module `/inventory` hiển thị chính xác danh sách SKU từ `GET /seller/inventory`, hỗ trợ điều chỉnh tồn kho qua `PATCH /seller/inventory/{skuId}/adjust`.
3. Order Export: Bấm "Xuất" gọi `GET /seller/orders/export` và tải xuống file danh sách đơn hàng thực tế.
4. Order Cancellation: Hủy đơn hàng gọi `POST /seller/orders/{orderId}/cancel` với đầy đủ reason code và version.
5. Voucher Updates: Chỉnh sửa voucher qua `PUT /seller/vouchers/{id}` và dừng voucher qua `DELETE /seller/vouchers/{id}` hoạt động trơn tru.
6. Lint & Build: Chạy `npm run lint` và `npm run build:remotes` vượt qua 100% không có lỗi.

---

## 5. Kế Hoạch Kiểm Thử (Test Plan)
- Static code analysis (`npm run lint`).
- Production build remotes (`npm run build:remotes`) và host (`npm run build -w @taca/shell`).
- Kiểm tra các luồng tương tác trên giao diện Seller: Vận chuyển, Kho hàng, Xuất đơn, Hủy đơn, Voucher.
