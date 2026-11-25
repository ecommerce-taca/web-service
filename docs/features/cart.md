# Giỏ hàng (Cart) — Tài liệu Tích hợp Frontend

> **Backend Service:** `ecommerce-taca/cart-service` ([API Spec](file:///d:/di_hoc/taca_ecommerce/docs/api/services/cart.md))  
> **Phạm vi FE:** `apps/buyer/src/features/cart/`

---

## 1. Kiến trúc & Các File Liên Quan

- **API Service:** [cart.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/cart/services/cart.api.js)
  - Gọi trực tiếp qua `shared/utils/api-client.js` (prefix `/api/v1/cart`).
  - Strict request body (`product_id`, `sku_id`, `quantity` là số nguyên `1..999`, không gửi field thừa vì BE bật `fail-on-unknown-properties: true`).
  - Tự động sinh `Idempotency-Key` cho `POST /cart/items`.
  - Chuẩn hóa response `snake_case` của BE (`item_id`, `product_id`, `sku_id`, `shop_id`, `title_snapshot`, `sku_label_snapshot`, `unit_price_snapshot`, `line_total`, `available`, `availability_status`) sang model UI qua `mapCartItemFromApi`.
  - Chuẩn hóa toàn bộ `CartErrorCode` (`400`, `401`, `403`, `404`, `409`, `503`, `500`) qua `normalizeCartError`.
- **Context & State:** [CartProvider.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/cart/contexts/CartProvider.jsx)
  - Nguồn chân lý duy nhất cho `cartId`, `items`, `selectedIds`, `selectedItems`, `selectedSubtotal`, `loading`, `error`.
  - Khi Live Mode + có token: đồng bộ `GET /cart` khi khởi động và khi có sự kiện `auth:login`; dọn sạch khi `auth:logout`.
  - Khi Guest (chưa đăng nhập): lưu trữ an toàn ở `localStorage` (`taca_cart_items`). Không tự chèn dữ liệu demo giả ở Live Mode.
- **UI Page:** [CartPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/cart/pages/CartPage.jsx)
  - Xử lý đầy đủ 4 trạng thái: `Loading` (Skeleton), `Error` (banner + nút Đồng bộ lại / Thử lại), `Empty`, `Success`.
  - Hiển thị badge trạng thái tồn kho theo `availability_status` (`OUT_OF_STOCK`, `PRODUCT_UNAVAILABLE`, `STALE`, `UNKNOWN`) và khóa chọn/tăng giảm đối với item không khả dụng.
  - Không tự bịa logic giảm giá/voucher tại Cart (voucher và phí ship được tính ở `CheckoutPage`).

---

## 2. Tối ưu Hiệu năng & Tránh Lỗi N+1 / CAS Conflict

1. **Cập nhật `item_id` & `cart_id` trực tiếp từ `POST /cart/items`:** Không gọi thêm `GET /cart` sau mỗi lần thêm sản phẩm.
2. **Debounce `PUT /cart/items/{itemId}` (350ms theo từng `itemId`):** Người dùng bấm `+`/`-` liên tiếp chỉ phát sinh 1 HTTP request với số lượng cuối cùng, tránh lỗi CAS `CART_VERSION_CONFLICT` trên MongoDB BE. Hủy timer tự động nếu người dùng xóa item hoặc unmount.
3. **Cache nhẹ metadata hiển thị (`image`, `shopName`) ở `localStorage`:** Do `CartItemResponse` của BE không chứa URL ảnh sản phẩm, FE cache nhẹ theo `sku_id` khi thêm từ trang chi tiết sản phẩm để hiển thị lại sau reload mà không gọi N+1 request sang Product Service.
4. **Reorder tuần tự (`OrderCard.jsx`, `OrderDetailPage.jsx`):** Thực hiện `await addToCart(...)` tuần tự cho từng sản phẩm trong đơn cũ thay vì bắn song song `forEach`, tránh race condition CAS version conflict ở BE.
