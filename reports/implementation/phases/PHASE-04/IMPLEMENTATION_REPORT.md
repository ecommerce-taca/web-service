# Báo Cáo Triển Khai: PHASE-04 (Implementation Report)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-04`
- **Tên Phase**: Seller Orders & Fulfillment Alignment (Tồn Kho, Đơn Hàng & Vận Chuyển Seller)
- **Thời gian thực hiện**: 2026-10-25
- **Trạng thái**: `COMPLETE_VERIFIED`
- **Người thực hiện**: Senior Frontend Engineer / Antigravity Agent

---

## 2. Chi Tiết Thực Hiện Từng Task & Finding

### 2.1. `MISS-003`: So Sánh Biểu Phí & Chọn Đơn Vị Vận Chuyển (`GET /seller/orders/{orderId}/shipment/carriers`)
- **Vấn đề trước sửa đổi**:
  - `PrepareShipmentModal.jsx` sử dụng danh sách tĩnh các hãng vận chuyển giả lập (`GHN Express`, `GHTK Express`, `Viettel Post`, `SPX Express`), không tra cứu biểu phí thực tế và thời gian dự kiến (ETA) từ Logistics Service.
  - Seller không biết cước phí cụ thể của từng hãng hay lý do hãng không phục vụ tuyến đường giao hàng trước khi bàn giao.
- **Khắc phục**:
  - Bổ sung `getShipmentCarriers(orderId)` trong [seller-order.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/services/seller-order.api.js) gọi `GET /seller/orders/${orderId}/shipment/carriers`.
  - Nâng cấp [PrepareShipmentModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/PrepareShipmentModal.jsx):
    - Tự động tải danh sách hãng vận chuyển khả dụng (`GHN`, `SPX`, `J&T`...).
    - Hiển thị cước phí đã định giá (`fee.toLocaleString() ₫`), thời gian giao dự kiến (`estimate.min_days - max_days ngày`).
    - Hiển thị trực quan trạng thái không khả dụng (`available: false`) kèm lý do như `unavailable_reason: REGION_NOT_COVERED` ("Chưa phủ sóng tuyến này") và vô hiệu hóa chọn lựa tương ứng.
    - Truyền `carrier` đã chọn (ví dụ: `GHN`, `SPX`) vào payload `fulfillSellerOrder(orderId, { action: 'SHIP', carrier, version })` (`PATCH /seller/orders/{orderId}/fulfill`).

### 2.2. `MISS-004`: Module Quản Lý & Điều Chỉnh Tồn Kho Chuyên Biệt (`GET /seller/inventory` & `PATCH /seller/inventory/{skuId}/adjust`)
- **Vấn đề trước sửa đổi**:
  - Cổng người bán hoàn toàn thiếu module quản lý tồn kho chuyên biệt, không có màn hình xem lượng tồn khả dụng (`available_qty`) so với lượng đang giữ (`reserved_qty`), không có API điều chỉnh tồn kho SKU.
- **Khắc phục**:
  - Xây dựng mới service [seller-inventory.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/services/seller-inventory.api.js) tích hợp `GET /seller/inventory` và `PATCH /seller/inventory/${skuId}/adjust` (kèm `Idempotency-Key` và version concurrency).
  - Xây dựng modal [StockAdjustModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/components/StockAdjustModal.jsx):
    - Hỗ trợ 3 phương thức điều chỉnh: Nhập thêm hàng (`delta > 0`), Xuất kho bớt (`delta < 0`), hoặc Cân đối lại số lượng thực tế.
    - Cung cấp danh mục lý do chuẩn hóa: Nhập thêm từ nhà phân phối, Kiểm kê định kỳ, Hàng lỗi / hỏng, Xuất mẫu, hoặc lý do tùy biến.
    - Tính toán và hiển thị preview số lượng tồn kho mới thời gian thực; chặn gửi request nếu `available_qty + delta < 0`.
  - Xây dựng trang [InventoryPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/pages/InventoryPage.jsx):
    - 4 thẻ thống kê: Tổng SKU quản lý, Tồn khả dụng toàn kho, Hàng đang giữ theo đơn, Cảnh báo tồn thấp (`low_stock`).
    - Bảng chi tiết SKU hiển thị mã hàng, tên sản phẩm, biến thể, số lượng khả dụng, số lượng giữ, tag cảnh báo tồn thấp và cập nhật lần cuối.
    - Bộ lọc tab: Tất cả, Đang hoạt động, Cảnh báo sắp hết, Hết hàng, kết hợp tìm kiếm SKU/tên sản phẩm.
  - Tích hợp route `/inventory` vào [App.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/app/App.jsx) (với React lazy loading) và thanh điều hướng [SellerNav.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/layout/SellerNav.jsx).

### 2.3. `MISS-006`: Xuất Danh Sách Đơn Hàng Cho Người Bán (`GET /seller/orders/export`)
- **Vấn đề trước sửa đổi**:
  - Nút "Xuất" trên `OrdersPage.jsx` chỉ bật thông báo toast giả lập mà không gọi API backend tải về danh sách đơn hàng.
- **Khắc phục**:
  - Bổ sung `exportSellerOrders(params)` trong [seller-order.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/services/seller-order.api.js) gọi `GET /seller/orders/export` với các tham số `{ status, from, to, format: 'xlsx' | 'csv' }`.
  - Cập nhật [OrdersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/pages/OrdersPage.jsx):
    - Nút "Xuất file" gọi API backend lấy signed download URL (`export_url`).
    - Tự động kích hoạt tải file về máy người dùng và hiển thị số lượng bản ghi `row_count` đã xuất thành công.
    - Xử lý trạng thái loading spinner khi đang kết xuất dữ liệu.

### 2.4. `MISS-007`: Chuẩn Hóa Quy Trình Người Bán Hủy Đơn Hàng (`POST /seller/orders/{orderId}/cancel`)
- **Vấn đề trước sửa đổi**:
  - Nút "Từ chối đơn" trên `OrderDetailModal.jsx` chỉ gán state nội bộ dạng text, không gọi endpoint hủy đơn và không gửi mã lý do hay version kiểm soát tranh chấp.
- **Khắc phục**:
  - Bổ sung `cancelSellerOrder(orderId, { reason, version })` trong [seller-order.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/services/seller-order.api.js) gọi `POST /seller/orders/${orderId}/cancel` kèm `Idempotency-Key`.
  - Xây dựng component [CancelOrderModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/CancelOrderModal.jsx):
    - Lựa chọn lý do hủy đơn chuẩn hóa theo specs Order-Commerce:
      - `OUT_OF_STOCK`: Hết hàng trong kho
      - `CUSTOMER_REQUEST`: Khách hàng yêu cầu hủy đơn
      - `UNDELIVERABLE_AREA`: Địa chỉ ngoài vùng phủ sóng vận chuyển
      - `SELLER_REQUEST`: Lý do vận hành khác từ người bán
    - Hộp cảnh báo về chính sách NFR (Non-Fulfillment Rate) và tự động hoàn trả tồn kho reservation.
    - Trường ghi chú giải trình bổ sung gửi cho khách hàng.
  - Tích hợp mở modal hủy đơn từ [OrderDetailModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/OrderDetailModal.jsx) và nút "Hủy" trên từng dòng đơn hàng chưa bàn giao tại [OrdersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/pages/OrdersPage.jsx).

### 2.5. `MISS-008`: Cập Nhật & Kết Thúc Sớm Voucher Cửa Hàng (`PUT /seller/vouchers/{id}` & `DELETE /seller/vouchers/{id}`)
- **Vấn đề trước sửa đổi**:
  - `seller-voucher.api.js` chỉ có chức năng lấy danh sách và tạo voucher mới.
  - Nút "Chỉnh sửa" trên `VouchersPage.jsx` chỉ hiển thị thông báo toast giả lập, không có màn hình chỉnh sửa voucher hay thao tác dừng voucher trước thời hạn.
- **Khắc phục**:
  - Bổ sung `updateSellerVoucher(voucherId, payload)` (`PUT /seller/vouchers/${voucherId}`) và `deleteSellerVoucher(voucherId, { version })` (`DELETE /seller/vouchers/${voucherId}`) trong [seller-voucher.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/services/seller-voucher.api.js).
  - Xây dựng [EditVoucherModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/components/EditVoucherModal.jsx):
    - Cho phép chỉnh sửa tên chương trình, loại giảm giá, mức giảm, giá trị đơn hàng tối thiểu, tổng số lượng phát hành, thời gian áp dụng.
    - Tuân thủ quy định specs §3.7c: Khóa trường mã voucher (`isCodeLocked`) nếu voucher đã có lượt sử dụng (`used_count > 0`) để bảo vệ tính toàn vẹn của lịch sử đơn hàng.
  - Cập nhật [VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/pages/VouchersPage.jsx):
    - Nút "Chỉnh sửa" mở `EditVoucherModal` nạp thông tin voucher hiện tại.
    - Bổ sung nút "Dừng" cho phép dừng kích hoạt voucher sớm kèm hộp thoại xác nhận an toàn trước khi gọi `DELETE /seller/vouchers/{id}`.

---

## 3. Danh Sách File Đã Thay Đổi
1. [apps/seller/src/features/orders/services/seller-order.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/services/seller-order.api.js) (`MISS-003`, `MISS-006`, `MISS-007`)
2. [apps/seller/src/features/orders/components/PrepareShipmentModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/PrepareShipmentModal.jsx) (`MISS-003`)
3. [apps/seller/src/features/orders/components/CancelOrderModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/CancelOrderModal.jsx) (Mới - `MISS-007`)
4. [apps/seller/src/features/orders/components/OrderDetailModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/OrderDetailModal.jsx) (`MISS-007`)
5. [apps/seller/src/features/orders/pages/OrdersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/pages/OrdersPage.jsx) (`MISS-003`, `MISS-006`, `MISS-007`)
6. [apps/seller/src/features/inventory/services/seller-inventory.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/services/seller-inventory.api.js) (Mới - `MISS-004`)
7. [apps/seller/src/features/inventory/components/StockAdjustModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/components/StockAdjustModal.jsx) (Mới - `MISS-004`)
8. [apps/seller/src/features/inventory/pages/InventoryPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/inventory/pages/InventoryPage.jsx) (Mới - `MISS-004`)
9. [apps/seller/src/app/App.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/app/App.jsx) (`MISS-004`)
10. [apps/seller/src/components/layout/SellerNav.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/layout/SellerNav.jsx) (`MISS-004`)
11. [apps/seller/src/features/vouchers/services/seller-voucher.api.js](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/services/seller-voucher.api.js) (`MISS-008`)
12. [apps/seller/src/features/vouchers/components/EditVoucherModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/components/EditVoucherModal.jsx) (Mới - `MISS-008`)
13. [apps/seller/src/features/vouchers/pages/VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/pages/VouchersPage.jsx) (`MISS-008`)

---

## 4. Bằng Chứng Xác Minh (Verification Evidence)
- **Linter**: `npm run lint` chạy qua tất cả workspaces (`admin`, `buyer`, `seller`, `shell`), exit code 0, 0 error, 0 warning.
- **Build Remotes**: `npm run build:remotes` thành công 100% cho cả 3 remote apps (`@taca/seller`, `@taca/admin`, `@taca/buyer`), bundle sinh ra đầy đủ các chunk `InventoryPage`, `OrdersPage`, `VouchersPage`.
- **Build Shell**: `npm run build -w @taca/shell` thành công 100%, tích hợp Micro-Frontend Module Federation không lỗi.
- **Contract Compliance**:
  - `GET /seller/orders/{orderId}/shipment/carriers`: Trả danh sách hãng vận chuyển, biểu phí và thời gian giao.
  - `PATCH /seller/orders/{orderId}/fulfill`: Nhận `{ action: 'SHIP', carrier, version }`.
  - `GET /seller/orders/export`: Trả `{ export_url, format, row_count }`.
  - `POST /seller/orders/{orderId}/cancel`: Nhận `{ reason, version }`.
  - `GET /seller/inventory`: Trả `{ data: [{ sku_id, seller_sku, available_qty, reserved_qty, low_stock }], meta }`.
  - `PATCH /seller/inventory/{skuId}/adjust`: Nhận `{ delta_available, reason, version }`.
  - `PUT /seller/vouchers/{voucherId}` & `DELETE /seller/vouchers/{voucherId}`: Nhận version và cập nhật trạng thái.
