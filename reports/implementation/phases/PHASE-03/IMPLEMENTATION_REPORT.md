# Báo Cáo Triển Khai: PHASE-03 (Implementation Report)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-03`
- **Tên Phase**: Buyer Reviews & Order Tracking Alignment (Chuẩn Hóa Đánh Giá, Theo Dõi Đơn Hàng & Voucher Buyer)
- **Thời gian thực hiện**: 2026-10-25
- **Trạng thái**: `COMPLETE_VERIFIED`
- **Người thực hiện**: Senior Frontend Engineer / Antigravity Agent

---

## 2. Chi Tiết Thực Hiện Từng Task & Finding

### 2.1. `API-001`: Sửa Endpoint Gửi Đánh Giá (`POST /products/{productId}/reviews`)
- **Vấn đề trước sửa đổi**: `review.api.js` gọi endpoint sai contract `POST /reviews` với body `{ order_item_id, product_id, rating, content }`.
- **Khắc phục**:
  - Sửa `reviewApi.submitReview(productId, reviewData)` trong [review.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/review.api.js) để gọi chuẩn `POST /products/${productId}/reviews`.
  - Chuẩn hóa payload theo đúng schema specs §3.2 rating-comment:
    ```json
    {
      "order_id": "TC-20260827-0001",
      "sku_id": "sku-01912f33",
      "rating": 5,
      "comment": "Sạc nhanh, đóng gói kỹ.",
      "media_ids": []
    }
    ```
  - Cập nhật [ReviewFormModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/components/ReviewFormModal.jsx) truyền đúng `productId` lên đường dẫn URL và map `content` sang `comment`.

### 2.2. `API-002`: Xóa Bỏ Phantom Endpoints Review Tab và Suy Diễn Client-Side
- **Vấn đề trước sửa đổi**: `review.api.js` gọi hai endpoint không tồn tại trong backend specs: `GET /users/me/reviews/pending` và `GET /users/me/reviews/completed`.
- **Khắc phục**:
  - Xóa bỏ hoàn toàn 2 hàm phantom khỏi [review.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/review.api.js).
  - Tái cấu trúc [ReviewsPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/ReviewsPage.jsx):
    - Tab "Chưa đánh giá": Lấy danh sách đơn hàng đã giao (`DELIVERED`/`COMPLETED`) từ `orderApi.getOrders({ size: 100 })`, bóc tách từng sản phẩm trong đơn và loại bỏ các mặt hàng người mua đã gửi đánh giá.
    - Tab "Đã đánh giá": Hiển thị danh sách các review đã nộp thành công (lưu trữ đồng bộ trên client/backend), hiển thị số sao, nhận xét, ảnh đính kèm và phản hồi từ người bán (nếu có).

### 2.3. `API-005`: Xóa Bỏ Phantom Endpoint Lưu Voucher (`POST /vouchers/save`)
- **Vấn đề trước sửa đổi**: Backend v1 xác nhận không có bảng sở hữu voucher theo user (`POST /vouchers/save` không tồn tại; "Voucher của tôi" là danh sách voucher buyer đang đủ điều kiện dùng tính động).
- **Khắc phục**:
  - Xóa bỏ `saveVoucher` khỏi [voucher.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/voucher.api.js).
  - Cập nhật [VoucherCard.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/components/VoucherCard.jsx): Đổi nút hành động thành "Sao chép mã" (Copy to clipboard) kèm icon `Copy`/`Check` và trạng thái "Đã chép!" phản hồi trực quan trong 2 giây.
  - Cập nhật [VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/VouchersPage.jsx): Chuyển form nhập mã thành khung "Kiểm tra mã ưu đãi" (gọi `voucherApi.validateVoucher`).

### 2.4. `API-008`: Dọn Dẹp Payload `POST /cart/items`
- **Vấn đề trước sửa đổi**: Nguy cơ gửi trường thừa `shop_id` vào request thêm giỏ hàng.
- **Khắc phục**:
  - Trong [cart.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/cart/services/cart.api.js), tạo `sanitizedBody` chỉ đóng gói strictly 3 trường:
    ```javascript
    {
      product_id: String(payload.product_id || payload.productId || ''),
      sku_id: String(payload.sku_id || payload.sku || 'DEFAULT'),
      quantity: Math.max(1, Math.min(999, Number(payload.quantity) || 1))
    }
    ```
  - Triệt để loại bỏ mọi thuộc tính thừa ngoài contract order-commerce specs §3.1.

### 2.5. `MISS-002`: Tích Hợp Theo Dõi Vận Chuyển Realtime (`GET /orders/{orderId}/shipment`)
- **Vấn đề trước sửa đổi**: Khối thông tin vận chuyển trên màn Chi tiết đơn hàng bị fix cứng dữ liệu tĩnh, không gọi API Shipment tracking timeline.
- **Khắc phục**:
  - Xây dựng mới service [shipment.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/shipment.api.js) tích hợp endpoint `GET /orders/{orderId}/shipment`.
  - Cập nhật [OrderDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/OrderDetailPage.jsx):
    - Đọc dữ liệu vận đơn: nhà vận chuyển (`GHN Express`), mã vận đơn (`tracking_code`), thời gian dự kiến giao hàng (`estimated_delivery.min_date - max_date`).
    - Hiển thị danh sách các mốc hành trình vận chuyển thực tế từ mảng `shipment.timeline` (Thời gian, trạng thái, địa điểm/ghi chú).
    - Xử lý êm dịu trường hợp đơn hàng chưa xuất vận đơn (404/not created) với thông báo rõ ràng cho người mua.

### 2.6. `MISS-005`: Tích Hợp Đánh Giá Sản Phẩm Công Khai Trên PDP (`GET /products/{productId}/reviews`)
- **Vấn đề trước sửa đổi**: Component `ProductReviews.jsx` trên trang chi tiết sản phẩm hiển thị mock cứng, không gọi API backend và không lọc được theo số sao.
- **Khắc phục**:
  - Thêm phương thức `reviewApi.getProductReviews(productId, params)` trong [review.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/review.api.js) hỗ trợ các bộ lọc `{ rating, with_media, page, size, sort }`.
  - Cập nhật [ProductDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/products/pages/ProductDetailPage.jsx) truyền `productId={product.id || id}` xuống `ProductReviews`.
  - Tái cấu trúc [ProductReviews.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/products/components/ProductReviews.jsx):
    - Hiển thị điểm số aggregate thật, số lượng đánh giá xác thực, và biểu đồ phân bổ % theo từng mức sao (1 đến 5 sao).
    - Các chip lọc tương tác: Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao, Có hình ảnh.
    - Hiển thị thông tin người đánh giá (ẩn danh an toàn `Nguyễn M. A`), huy hiệu "Đã mua hàng", phân loại hàng đã chọn, ảnh đính kèm và phản hồi từ người bán.
    - Điều hướng phân trang mượt mà khi sản phẩm có nhiều đánh giá.

### 2.7. `MISS-012`: Tích Hợp Kiểm Tra Voucher & Lịch Sử Đã Sử Dụng (`GET /vouchers/redemptions`)
- **Vấn đề trước sửa đổi**: Chưa có giao diện và API xem lịch sử voucher đã sử dụng cũng như API kiểm tra voucher độc lập.
- **Khắc phục**:
  - Thêm `validateVoucher(code, cartId)` (`GET /vouchers/validate`) và `getVoucherRedemptions(params)` (`GET /vouchers/redemptions`) trong [voucher.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/voucher.api.js).
  - Bổ sung tab "Lịch sử đã dùng" trên [VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/VouchersPage.jsx) hiển thị tổng tiền đã tiết kiệm `total_saved` nổi bật cùng danh sách từng lượt dùng mã kèm mã đơn hàng và ngày sử dụng.

---

## 3. Danh Sách File Đã Thay Đổi
1. [apps/buyer/src/features/cart/services/cart.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/cart/services/cart.api.js) (`API-008`)
2. [apps/buyer/src/features/account/services/review.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/review.api.js) (`API-001`, `API-002`, `MISS-005`)
3. [apps/buyer/src/features/account/components/ReviewFormModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/components/ReviewFormModal.jsx) (`API-001`)
4. [apps/buyer/src/features/account/pages/ReviewsPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/ReviewsPage.jsx) (`API-002`)
5. [apps/buyer/src/features/products/pages/ProductDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/products/pages/ProductDetailPage.jsx) (`MISS-005`)
6. [apps/buyer/src/features/products/components/ProductReviews.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/products/components/ProductReviews.jsx) (`MISS-005`)
7. [apps/buyer/src/features/account/services/shipment.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/shipment.api.js) (`MISS-002`)
8. [apps/buyer/src/features/account/pages/OrderDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/OrderDetailPage.jsx) (`MISS-002`)
9. [apps/buyer/src/features/account/services/voucher.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/voucher.api.js) (`API-005`, `MISS-012`)
10. [apps/buyer/src/features/account/components/VoucherCard.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/components/VoucherCard.jsx) (`API-005`)
11. [apps/buyer/src/features/account/pages/VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/VouchersPage.jsx) (`API-005`, `MISS-012`)

---

## 4. Kết Quả Xác Minh Kỹ Thuật
- **ESLint Linting**: Toàn bộ 4 workspace đều vượt qua với mã lỗi 0 (`npm run lint`).
- **Production Build Remotes**: `@taca/buyer`, `@taca/seller`, `@taca/admin` build thành công 100% (`npm run build:remotes`).
- **Production Build Shell**: `@taca/shell` build thành công 100% (`npm run build -w @taca/shell`).
