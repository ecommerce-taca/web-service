# Kế Hoạch Triển Khai: PHASE-03 (Phase Plan)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-03`
- **Tên Phase**: Buyer Reviews & Order Tracking Alignment (Chuẩn Hóa Đánh Giá, Theo Dõi Đơn Hàng & Voucher Buyer)
- **Trạng thái**: `IN_PROGRESS`
- **Mục tiêu**: Chuẩn hóa toàn bộ các tính năng tương tác sau mua và khuyến mãi của người mua theo đúng hợp đồng API Gateway và tài liệu chính thức từ GitHub docs:
  1. `API-001` (High): Sửa endpoint gửi đánh giá sang `POST /products/{productId}/reviews` với payload chuẩn `{ order_id, sku_id, rating, comment, media_ids }`.
  2. `API-002` (Medium): Xóa bỏ phantom endpoints `GET /users/me/reviews/pending` và `GET /users/me/reviews/completed`, chuyển sang suy diễn client-side từ danh sách đơn hàng đã giao (`GET /orders`).
  3. `API-005` (Medium): Xóa bỏ phantom endpoint `POST /vouchers/save` ("Lưu voucher"), thay bằng hành động "Sao chép mã" (Copy code to clipboard) và áp dụng trực tiếp.
  4. `API-008` (Low): Dọn dẹp payload `POST /cart/items` đảm bảo không gửi trường thừa `shop_id`, chỉ gửi `{ product_id, sku_id, quantity }`.
  5. `MISS-002` (High): Xây dựng service và giao diện theo dõi vận chuyển thời gian thực trên màn Chi tiết đơn hàng thông qua `GET /orders/{orderId}/shipment`.
  6. `MISS-005` (High): Tích hợp hiển thị danh sách đánh giá công khai kèm bộ lọc số sao, điểm tổng hợp và phân trang trên PDP thông qua `GET /products/{productId}/reviews`.
  7. `MISS-012` (Medium): Bổ sung tích hợp kiểm tra voucher (`GET /vouchers/validate?code=&cart_id=`) và tab lịch sử đã dùng (`GET /vouchers/redemptions`) hiển thị số tiền đã tiết kiệm.

---

## 2. Phạm Vi Được Phê Duyệt & Tasks Chi Tiết

| Task ID | Finding ID | Ứng dụng | File / Module dự kiến ảnh hưởng | Mô tả thay đổi dự kiến |
| :---: | :---: | :---: | :--- | :--- |
| `TASK-03-REVIEW-SUBMIT` | `API-001` | Buyer | - `apps/buyer/src/features/account/services/review.api.js`<br>- `apps/buyer/src/features/account/components/ReviewFormModal.jsx` | - Đổi `submitReview(productId, reviewPayload)` gọi `POST /products/{productId}/reviews`.<br>- Chuẩn hóa body: `{ order_id, sku_id, rating, comment, media_ids }` (sửa `content` thành `comment`). |
| `TASK-03-REVIEW-TABS` | `API-002` | Buyer | - `apps/buyer/src/features/account/services/review.api.js`<br>- `apps/buyer/src/features/account/pages/ReviewsPage.jsx` | - Xóa các hàm gọi phantom endpoints `GET /users/me/reviews/pending` và `/completed`.<br>- Lấy danh sách sản phẩm từ các đơn hàng có trạng thái `DELIVERED`/`COMPLETED` (`orderApi.getOrders`) để hiển thị tab "Chưa đánh giá" và tab "Đã đánh giá". |
| `TASK-03-VOUCHER-CLEAN` | `API-005` | Buyer | - `apps/buyer/src/features/account/services/voucher.api.js`<br>- `apps/buyer/src/features/account/pages/VouchersPage.jsx`<br>- `apps/buyer/src/features/account/components/VoucherCard.jsx` | - Xóa `saveVoucher` và endpoint `POST /vouchers/save`.<br>- Chuyển nút hành động trên thẻ voucher thành "Sao chép mã" với thông báo toast/feedback. |
| `TASK-03-CART-PAYLOAD` | `API-008` | Buyer | - `apps/buyer/src/features/cart/services/cart.api.js`<br>- `apps/buyer/src/features/cart/contexts/CartProvider.jsx` | - Rà soát và xác thực payload gửi đến `POST /cart/items` chỉ gồm 3 trường: `{ product_id, sku_id, quantity }`, tuyệt đối không chứa `shop_id`. |
| `TASK-03-SHIPMENT-TRACK` | `MISS-002` | Buyer | - `apps/buyer/src/features/account/services/shipment.api.js` (Mới)<br>- `apps/buyer/src/features/account/pages/OrderDetailPage.jsx` | - Tạo service `shipmentApi.getOrderShipment(orderId)` gọi `GET /orders/{orderId}/shipment`.<br>- Hiển thị nhà vận chuyển, mã vận đơn, thời gian dự kiến và timeline các mốc vận chuyển thật trên OrderDetailPage. |
| `TASK-03-PDP-REVIEWS` | `MISS-005` | Buyer | - `apps/buyer/src/features/account/services/review.api.js`<br>- `apps/buyer/src/features/products/pages/ProductDetailPage.jsx`<br>- `apps/buyer/src/features/products/components/ProductReviews.jsx` | - Bổ sung `getProductReviews(productId, params)` gọi `GET /products/{productId}/reviews`.<br>- Truyền `productId` từ PDP vào component `ProductReviews`.<br>- Hiển thị điểm số aggregate thật, phân bố số sao, bộ lọc theo sao (1-5 sao, có ảnh) và danh sách reviews từ backend. |
| `TASK-03-VOUCHER-VALIDATE-REDEMPTION` | `MISS-012` | Buyer | - `apps/buyer/src/features/account/services/voucher.api.js`<br>- `apps/buyer/src/features/account/pages/VouchersPage.jsx` | - Bổ sung `validateVoucher(code, cart_id)` (`GET /vouchers/validate`) và `getVoucherRedemptions(params)` (`GET /vouchers/redemptions`).<br>- Thêm tab/khu vực "Lịch sử đã dùng" hiển thị danh sách mã đã dùng kèm tổng tiền đã tiết kiệm `total_saved`. |

---

## 3. Rủi Ro & Biện Pháp Phòng Ngừa
- **Rủi ro**: Dữ liệu từ đơn hàng cũ chưa có `sku_id` hoặc trạng thái `DELIVERED`.
- **Biện pháp**: Fallback tương thích an toàn nếu `sku_id` vắng mặt thì lấy ID item hoặc `DEFAULT`, kiểm tra cả `DELIVERED` lẫn `COMPLETED` để tương thích dữ liệu cũ.
- **Rủi ro**: Khi shipment chưa tạo vận đơn (`404 SHIPMENT_NOT_FOUND`), trang chi tiết đơn hàng không được văng lỗi crash.
- **Biện pháp**: Bắt lỗi 404 từ `GET /orders/{orderId}/shipment` một cách êm ái, hiển thị trạng thái "Đơn hàng đang được người bán chuẩn bị, chưa xuất vận đơn".

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. Không còn bất kỳ request nào gửi tới `POST /reviews`, `GET /users/me/reviews/pending`, `GET /users/me/reviews/completed`, `POST /vouchers/save`.
2. Gửi đánh giá sản phẩm thành công qua `POST /products/{productId}/reviews` với payload chuẩn.
3. PDP hiển thị đầy đủ reviews từ `GET /products/{productId}/reviews` kèm lọc và aggregate.
4. Màn chi tiết đơn hàng gọi `GET /orders/{orderId}/shipment` và hiển thị timeline mốc vận chuyển chi tiết.
5. Trang Vouchers hỗ trợ xem lịch sử đã dùng (`GET /vouchers/redemptions`) và kiểm tra mã hợp lệ (`GET /vouchers/validate`).
6. Kiểm tra toàn bộ code bằng `npm run lint`, `npm run build:remotes` và build shell đều thành công 100%.

---

## 5. Kế Hoạch Kiểm Thử (Test Plan)
- Static code analysis (`npm run lint`).
- Production build remotes & shell (`npm run build:remotes`, shell build).
- Kiểm tra tính toàn vẹn của luồng review, shipment tracking và voucher redemptions.
