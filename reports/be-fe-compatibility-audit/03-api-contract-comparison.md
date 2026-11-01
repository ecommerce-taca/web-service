# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 03. Đối Chiếu Chi Tiết API Contract BE – FE (Contract Comparison)

**Mục tiêu**: Phân tích chi tiết từng điểm không tương thích giữa đặc tả kỹ thuật Backend và mã nguồn thực tế của Frontend trên các khía cạnh: Endpoint, Request Body, Response Data, và Authorization.

---

### 1. Phân Tích Chuyên Sâu Các Điểm Gãy Contract Trọng Yếu

#### 1.1. Luồng Đặt Hàng & Checkout: `POST /checkout`
- **Mã nguồn FE**: `apps/buyer/src/features/account/services/order.api.js:220` (`createOrder`) & `CheckoutPage.jsx:158`.
- **Đặc tả BE**: `ecommerce-taca/docs/checkout-docs/checkout.md` (§3.3) & `CONTRACT-MATRIX.md`.

```diff
// So sánh Request Payload gửi lên API /checkout
{
  "cart_id": "c-98214",
  "selected_item_ids": ["item-1", "item-2"],
  "address_id": "addr-551",
  "payment_method": "VNPAY",
- "voucher_codes": ["FREESHIP50", "TACANEW"],  // ❌ FE GỬI: Mảng mã code dạng text
+ "voucher_ids": ["v-uuid-8812", "v-uuid-9921"], // ✅ BE YÊU CẦU: Mảng UUID đã qua validate
- "total": 1450000,                            // ❌ FE GỬI THỪA: Số tiền do FE tự tính
- "subtotal": 1500000,                         // ❌ FE GỬI THỪA: BE không nhận field này
- "shipping_fee": 30000,                       // ❌ FE GỬI THỪA: BE tự tính theo GHN API
- "discount_amount": 80000,                    // ❌ FE GỬI THỪA: BE tự trừ theo rule voucher
- "shipping_address": { ... },                 // ❌ FE GỬI THỪA: BE truy vấn address_id từ DB
  "note": "Giao giờ hành chính"
}
```

*Phân tích rủi ro & hậu quả:*
1. **Lỗi `400 CHECKOUT_VOUCHER_INVALID`**: Voucher Code trên hệ thống e-commerce không phải là khóa chính duy nhất (có thể có voucher toàn sàn trùng tên mã với voucher của từng shop). BE Checkout Service chỉ chấp nhận `voucher_ids`. Nếu FE gửi `voucher_codes`, Backend validator sẽ loại bỏ hoặc trả về lỗi 400.
2. **Nguy cơ sai lệch tài chính (Financial Discrepancy)**: Việc FE tự tính `total`, `discount_amount`, `shipping_fee` rồi hiển thị cho người dùng trước khi BE xác nhận giá chốt có thể dẫn đến việc khách hàng nhìn thấy một số tiền nhưng link thanh toán VNPAY do BE tạo ra lại là một số tiền khác (do quy tắc làm tròn hoặc mã voucher vừa hết lượt dùng).
3. **Giải pháp bắt buộc**: FE phải gọi `POST /api/v1/checkout/preview` trước để lấy bản tính chuẩn xác từ BE (bao gồm `voucher_ids` hợp lệ, tiền ship thực tế, chiết khấu). Khi bấm nút "Đặt hàng", chỉ gửi đúng payload tinh gọn theo contract BE.

---

#### 1.2. Hack Thanh Toán Phía Client: `markOrderPaid`
- **Mã nguồn FE**: `apps/buyer/src/features/checkout/pages/CheckoutPage.jsx:212`.
- **Đặc tả BE**: `ecommerce-taca/docs/payment-wallet-docs/payment-wallet.md` (§3.4).

```javascript
// Đoạn mã vi phạm Clean Architecture & Security trong CheckoutPage.jsx:
const handlePaymentSuccess = async (paymentId) => {
  // ❌ FE tự gọi hàm ghi đè dữ liệu cục bộ:
  await orderApi.markOrderPaid(currentOrder.id, paymentId);
  navigate(`/account/orders/${currentOrder.id}?status=success`);
};
```

*Phân tích rủi ro & hậu quả:*
1. **Bỏ qua xác thực chữ ký số (Bypass Security Signature)**: Khi VNPAY chuyển hướng người dùng về trang web, URL chuyển hướng phía trình duyệt hoàn toàn có thể bị giả mạo tham số (query tampering). Trạng thái đơn hàng thanh toán thành công **CHỈ ĐƯỢC PHÉP** xác nhận khi BE Payment Service nhận được Server-to-Server IPN Webhook (`POST /api/v1/payments/webhook`) có kiểm tra mã băm bảo mật SHA512.
2. **Mất đồng bộ dữ liệu (Data Inconsistency)**: Khi người dùng mở trên thiết bị khác hoặc refresh lại trang, đơn hàng trên Backend vẫn ở trạng thái `PENDING_PAYMENT` vì BE chưa xử lý xong hoặc FE chỉ tự lưu vào `localStorage`.

---

#### 1.3. Gọi Endpoint Không Tồn Tại (Phantom Endpoints)

##### A. `DELETE /cart` (Xóa trắng giỏ hàng)
- **Mã nguồn FE**: `apps/buyer/src/features/cart/services/cart.api.js:121` (`clearCart`).
- **Thực tế BE**: NestJS Cart Service chỉ có route `@Delete('items/:itemId')`. Hoàn toàn không có handler cho route gốc `@Delete()`.
- **Hậu quả**: Khi gọi `cartApi.clearCart()`, Gateway trả về `404 Not Found`.

##### B. `POST /admin/settlements/batch` (Tạo đợt quyết toán thủ công)
- **Mã nguồn FE**: `apps/admin/src/services/admin-finance.api.js:41` (`createSettlementBatch`).
- **Thực tế BE**: Payment-Wallet Service theo kiến trúc Spring Boot (tài liệu `payment-wallet.md` §3.8 và quyết định thiết kế ADR-003) quy định: *Quyết toán số dư ví sàn sang tài khoản ngân hàng người bán là tiến trình tự động chạy theo chu kỳ hàng tuần vào 02:00 sáng Thứ Hai qua Spring Scheduled Cron*. Controller của Admin chỉ hỗ trợ:
  - `GET /api/v1/admin/settlements` (Xem danh sách đợt)
  - `GET /api/v1/admin/settlements/{batchId}` (Xem chi tiết đợt)
  - `POST /api/v1/admin/settlements/{batchId}/retry` (Thử lại các giao dịch thất bại trong đợt)
- **Hậu quả**: Nút "Tạo đợt quyết toán mới" trên `AdminSettlementPage.jsx` khi bấm vào sẽ luôn nhận mã lỗi `405 Method Not Allowed` hoặc `404 Not Found`.

##### C. `GET /products?is_flash_sale=true` (Lọc sản phẩm Flash Sale)
- **Mã nguồn FE**: `apps/buyer/src/features/products/services/product.api.js:850` (`getFlashSaleProducts`).
- **Thực tế BE**: NestJS Product Catalog cấu hình global:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, // ⚠️ Báo lỗi ngay nếu query chứa param ngoài DTO
    transform: true
  }));
  ```
  Trong `GetProductsQueryDto`, các trường được phép chỉ gồm: `page, limit, category_id, sort, min_price, max_price, rating`. Không có trường `is_flash_sale`.
- **Hậu quả**: API Gateway trả về mã `400 Bad Request` kèm message `property is_flash_sale should not exist`.

---

#### 1.4. Lệch Cấu Trúc Chi Tiết Sản Phẩm & Biến Thể SKU
- **Mã nguồn FE**: `ProductDetailPage.jsx:78`, `ProductPurchase.jsx:28-75`.
- **Thực tế BE**: `GET /api/v1/products/{id}`.

| Thuộc tính | FE Mong Đợi | BE Trả Về Thực Tế | Đánh Giá Tương Thích & Ảnh Hưởng |
|:---|:---|:---|:---|
| Tên sản phẩm | `product.name` | `product.title` | FE fallback `product.name \|\| product.title` tạm thời chạy nhưng không chuẩn hóa DTO |
| Định nghĩa thuộc tính | `product.attribute_definitions` | `product.attributes: [{ key, label, type, values }]` | ❌ **GÃY GIAO DIỆN**: `ProductPurchase` không đọc được danh sách thuộc tính (Size, Màu), khiến người mua không bấm chọn được biến thể |
| Giá hiển thị | `product.price` (Số nguyên VND) | `product.price: { base_price, sale_price, currency }` | ❌ **LỖI HIỂN THỊ**: Trình duyệt render ra chuỗi `[object Object]` nếu không gọi `.sale_price` |
| Mã phân loại SKU | `activeSku.sku_code` | `activeSku.sku_id` & `activeSku.seller_sku` | ❌ **LỖI LOGIC**: Khi thêm vào giỏ hàng gửi `sku_id: undefined` dẫn đến lỗi `400 SKU_REQUIRED` |
| Tỷ lệ giảm giá | `product.discount` (Số nguyên %) | Không có trường `discount` sẵn | FE cần tính: `Math.round((base - sale)/base * 100)` thay vì mong đợi BE trả sẵn trường này |

---

#### 1.5. Quy Tắc Validation Lý Do Từ Chối KYC Người Bán
- **Mã nguồn FE**: `apps/admin/src/features/kyc/components/KycReviewModal.jsx:64`.
- **Thực tế BE**: `PUT /api/v1/admin/shops/kyc/{shopId}/reject`.

- **Quy chuẩn Backend**: `@Size(min = 10, max = 500, message = "Lý do từ chối phải có độ dài từ 10 đến 500 ký tự")` trên trường `reason`.
- **Hiện trạng Frontend**: Trước đây form từ chối KYC không có bộ đếm ký tự và không disable nút "Xác nhận từ chối" khi nhập dưới 10 ký tự, dẫn đến việc Admin bấm xác nhận thì Backend trả về mã lỗi `400 VALIDATION_FAILED` mà giao diện không hiển thị rõ lỗi trường nào.
- **Yêu cầu tương thích**: Form Admin bắt buộc phải validate client-side min 10 ký tự, hiển thị thông báo lỗi trực quan ngay dưới ô nhập liệu và chỉ submit khi đạt chuẩn.

---

### 2. Tổng Hợp Ma Trận Lệch Chuẩn (Mismatch Matrix)

| Nhóm API | Endpoint | Thành Phần Lệch | Mức Độ | Hướng Khắc Phục Bắt Buộc |
|:---|:---|:---|:---|:---|
| **Checkout** | `POST /checkout` | `voucher_codes` thay vì `voucher_ids` | **CRITICAL** | Sử dụng API `POST /vouchers/validate` để đổi mã code lấy `voucher_id` trước khi submit |
| **Checkout** | `POST /checkout` | Gửi kèm `total, subtotal, shipping_fee` | **CRITICAL** | Loại bỏ toàn bộ các field tiền tự tính khỏi request body, để BE tự tính |
| **Payment** | N/A | `markOrderPaid` ghi đè `localStorage` | **CRITICAL** | Xóa bỏ hàm này; kiểm tra trạng thái đơn qua `GET /payments/{id}/status` |
| **Cart** | `DELETE /cart` | Endpoint không tồn tại | **HIGH** | Xóa bỏ hàm `clearCart` gọi endpoint này; giỏ hàng tự xóa trên BE sau khi order tạo xong |
| **Settlement** | `POST /admin/settlements/batch`| Endpoint không tồn tại | **HIGH** | Gỡ bỏ nút và hàm tạo batch thủ công; hiển thị lịch chạy tự động theo tài liệu BE |
| **Payout** | `POST /seller/payouts` | BE chưa mở cổng (ADR-003) | **HIGH** | Đặt trạng thái badge "Bảo trì / Đang phát triển" trên UI, không giả lập mock ngầm |
| **Product** | `GET /products` | Query `is_flash_sale=true` | **HIGH** | Bỏ param này; lọc Flash Sale bằng endpoint chuyên dụng hoặc filter giá sale < base |
| **Product** | `GET /products/{id}` | Cấu trúc `price` và `attributes` | **HIGH** | Viết Adapter chuyển đổi DTO: map `price.sale_price` và `attributes` chuẩn xác |
| **KYC** | `PUT /admin/shops/kyc/{id}/reject` | Validation độ dài `reason` | **MEDIUM** | Thêm validation min 10 ký tự tại `KycReviewModal.jsx` |
| **Voucher** | `GET /vouchers/available` | Fallback mock khi Gateway lỗi | **MEDIUM** | Loại bỏ khối catch trả về mock ngầm; hiển thị banner lỗi hoặc empty state |

---

### 3. Đánh Giá Khung Xác Thực & Phân Quyền (Auth & RBAC)

1. **Chuẩn Token**: FE gửi đúng chuẩn `Authorization: Bearer <JWT>` qua interceptor của `api-client.js`.
2. **Refresh Token Flow**: Đã triển khai luồng tự động làm mới token qua `POST /auth/refresh` khi gặp mã `401`.
3. **Lỗ hổng RBAC tại FE**: 
   - Một số trang Seller và Admin hiện đang kiểm tra quyền qua state của `AuthContext` ở phía client mà chưa xử lý triệt để trường hợp token đã hết hạn hoặc bị thu hồi quyền trên Redis backend.
   - Khi API trả về `403 Forbidden`, FE cần có Global Interceptor chuyển hướng người dùng về trang thông báo "Bạn không có quyền truy cập chức năng này" thay vì đứng im ở màn hình loading.
