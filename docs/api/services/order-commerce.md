# Order Commerce Service API Specification

> **Dịch vụ Upstream:** `order-commerce-service` (Port nội bộ `8084`)  
> **Prefix Gateway:** `/api/v1/cart/**`, `/api/v1/checkout/**`, `/api/v1/orders/**`, `/api/v1/vouchers/**`, `/api/v1/seller/orders/**`, `/api/v1/seller/vouchers/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/order-commerce-docs/docs/api/order-commerce.md`

---

## 1. Quản Lý Giỏ Hàng (Cart Management)

### 1.1 `GET /cart`
- **Quyền:** Authenticated (hoặc Guest Cart lưu ở Client)
- **Response 200:** Danh sách mặt hàng trong giỏ, tự động phân nhóm theo từng Cửa hàng (`shop_id`), hiển thị trạng thái tồn kho và cờ chọn mua (`is_selected`).

### 1.2 `POST /cart/items`
- **Body:** `{ skuId, quantity }`
- **Response 201:** Trả về giỏ hàng mới nhất đã cộng dồn số lượng.

### 1.3 `PUT /cart/items/{itemId}` & `DELETE /cart/items/{itemId}`
- Cập nhật số lượng hoặc xóa sản phẩm khỏi giỏ hàng.

---

## 2. Quy Trình Checkout & Đặt Hàng (Checkout & Orders)

### 2.1 `POST /checkout/preview` (Xem trước chi phí)
- **Body:**
  ```json
  {
    "items": [{ "skuId": "sku-ip16-256", "quantity": 1 }],
    "shippingAddressId": "addr-01912",
    "voucherCodes": ["FREESHIP50K", "DISCOUNT100K"]
  }
  ```
- **Response 200:** Chi tiết chi phí phân rã:
  - `subtotal`: Tổng tiền hàng gốc.
  - `shippingFee`: Phí vận chuyển tạm tính từ đơn vị giao vận.
  - `discountShipping`: Số tiền miễn giảm ship từ voucher.
  - `discountVoucher`: Số tiền giảm giá trực tiếp vào hàng.
  - `totalAmount`: Số tiền thực tế người mua phải trả.

### 2.2 `POST /orders` (Khởi tạo đơn hàng)
- **Body:**
  ```json
  {
    "items": [{ "skuId": "sku-ip16-256", "quantity": 1 }],
    "shippingAddressId": "addr-01912",
    "paymentMethod": "VNPAY_QR" // hoặc "COD"
  }
  ```
- **Response 201:** Tạo bản ghi đơn hàng ở trạng thái `PENDING_PAYMENT`.

### 2.3 `GET /orders/me` & `GET /orders/{orderId}`
- Lấy danh sách hoặc chi tiết đơn hàng của người mua.
- Hỗ trợ lọc theo trạng thái:
  - `PENDING_PAYMENT`: Chờ thanh toán.
  - `CONFIRMED`: Đã xác nhận, người bán đang chuẩn bị hàng.
  - `SHIPPED`: Đã bàn giao đơn vị vận chuyển đang trên đường giao.
  - `DELIVERED`: Giao hàng thành công.
  - `CANCELLED`: Đơn đã bị hủy.

### 2.4 `POST /orders/{orderId}/cancel`
- Cho phép người mua hủy đơn khi đơn hàng còn ở trạng thái `PENDING_PAYMENT` hoặc `CONFIRMED` (chưa bàn giao cho shipper).

---

## 3. Khuyến Mãi & Voucher Sàn / Shop (Vouchers)

- `GET /vouchers`: Danh sách mã giảm giá công khai hiển thị trên trang chủ và trang chi tiết sản phẩm.
- `POST /vouchers/save`: Lưu mã giảm giá vào ví voucher của tài khoản.
- `GET /users/me/vouchers`: Danh sách voucher hiện có trong ví người dùng.
- `POST /seller/vouchers`: Người bán tự tạo voucher riêng cho cửa hàng `{ code, discountType: "PERCENTAGE"|"FIXED_AMOUNT", value, minOrderValue, maxDiscount, startAt, endAt }`.
- `GET /seller/vouchers`: Quản lý danh sách voucher của gian hàng.

---

## 4. Xử Lý Đơn Hàng Phía Người Bán (Seller Order Operations)

- `GET /seller/orders`: Danh sách các đơn đặt hàng tại gian hàng của seller.
- `GET /seller/orders/{id}`: Xem chi tiết đơn hàng, mặt hàng SKU và địa chỉ giao hàng.
- `POST /seller/orders/{id}/confirm`: Người bán bấm xác nhận còn hàng và bắt đầu đóng gói.
