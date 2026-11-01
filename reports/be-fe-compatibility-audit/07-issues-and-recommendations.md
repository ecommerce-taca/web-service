# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 07. Danh Sách Lỗi & Đề Xuất Xử Lý Theo Độ Ưu Tiên (Issues & Recommendations)

**Mục tiêu**: Hệ thống hóa toàn bộ các phát hiện sau audit theo thang đo mức độ nghiêm trọng chuẩn quốc tế (CRITICAL, HIGH, MEDIUM, LOW, INFO) kèm nguyên nhân gốc rễ, ảnh hưởng hệ thống và giải pháp khắc phục triệt để.

---

### 1. Bảng Phân Loại Mức Độ Nghiêm Trọng

```
┌──────────────┬───────┬─────────────────────────────────────────────────────────┐
│ Mức Độ       │ Số Lg │ Ý Nghĩa Nghiệp Vụ & Ảnh Hưởng Vận Hành                  │
├──────────────┼───────┼─────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL  │   3   │ Gây sai lệch tài chính, bảo mật hoặc sai logic đặt hàng │
│ 🟠 HIGH      │   5   │ FE gọi endpoint ma, gửi param bị BE chặn, hoặc gãy DTO  │
│ 🟡 MEDIUM    │   6   │ Mock fallback ngầm, sai lệch Enum, thiếu validation     │
│ 🟢 LOW       │   4   │ Dead code, hardcode text, tham số trùng lặp             │
│ 🔵 INFO      │   2   │ Tính năng tương lai (ADR-003 Payout, Google OAuth)      │
└──────────────┴───────┴─────────────────────────────────────────────────────────┘
```

---

### 2. Danh Mục Chi Tiết Từng Lỗi

#### 🔴 CÁC LỖI MỨC ĐỘ CRITICAL (Bắt Buộc Xử Lý Trước Khi Chạy Thật)

##### [ISSUE-C01] Lệch Contract Đặt Hàng & Voucher Tại `POST /checkout`
- **File**: `apps/buyer/src/features/account/services/order.api.js:220` & `apps/buyer/src/features/checkout/pages/CheckoutPage.jsx:158`.
- **Nguyên nhân**: FE gửi trường `voucher_codes: [...]` (chuỗi ký tự text) thay vì `voucher_ids: [...]` (danh sách UUID đã xác thực). Đồng thời FE gửi kèm `total`, `subtotal`, `shipping_fee`, `discount_amount` do FE tự tính toán.
- **Hậu quả**: Backend NestJS/Spring Boot Checkout Service trả về lỗi `400 CHECKOUT_VOUCHER_INVALID` hoặc loại bỏ toàn bộ mã giảm giá của người mua. Việc FE tự gửi số tiền tính toán phía client có thể gây chênh lệch giá trị thanh toán so với giá trị thực tế Backend tính.
- **Đề xuất xử lý**:
  1. Trước khi checkout, FE bắt buộc gọi `POST /api/v1/vouchers/validate` để đổi `code` lấy `voucher_id`.
  2. Bỏ toàn bộ các trường tiền tự tính (`total`, `subtotal`, `shipping_fee`, `discount_amount`) khỏi payload gửi lên `POST /checkout`.
  3. Chỉ gửi đúng DTO Backend yêu cầu: `{ cart_id, selected_item_ids, address_id, payment_method, voucher_ids, note }`.

##### [ISSUE-C02] Hack Đổi Trạng Thái Đơn Hàng Thành `PAID` Qua `localStorage`
- **File**: `apps/buyer/src/features/account/services/order.api.js:322` (`markOrderPaid`) & `CheckoutPage.jsx:212`.
- **Nguyên nhân**: Khi người dùng được chuyển hướng từ cổng thanh toán VNPAY về, FE tự gọi hàm `markOrderPaid` để gán trạng thái `PAID` vào bộ nhớ trình duyệt `localStorage`.
- **Hậu quả**: Bỏ qua toàn bộ cơ chế bảo mật xác thực chữ ký số IPN từ VNPAY. Backend vẫn giữ trạng thái đơn là `PENDING_PAYMENT`, gây mất đồng bộ dữ liệu giữa Server và Client, tạo lỗ hổng cho phép thanh toán khống.
- **Đề xuất xử lý**:
  1. Xóa bỏ hoàn toàn hàm `markOrderPaid` trong `order.api.js`.
  2. Khi VNPAY chuyển hướng về Buyer kèm `vnp_TxnRef` và `vnp_ResponseCode`:
     - Gọi API `GET /api/v1/payments/{paymentId}/status` để kiểm tra kết quả Backend đã nhận được webhook hợp lệ chưa.
     - Hiển thị màn hình chờ xác nhận (Polling trạng thái trong 3-5 giây) hoặc thông báo đơn hàng đang được xử lý.

##### [ISSUE-C03] Lệch DTO Chi Tiết Sản Phẩm & Biến Thể SKU
- **File**: `apps/buyer/src/features/products/pages/ProductDetailPage.jsx` & `apps/buyer/src/features/products/components/ProductPurchase.jsx:28-75`.
- **Nguyên nhân**: FE truy xuất `product.attribute_definitions`, `product.price` (dạng number), và `activeSku.sku_code`. Tuy nhiên Backend Product Catalog trả về: `attributes: [{ key, label, type, values }]`, giá là object `{ base_price, sale_price, currency }`, và biến thể định danh là `sku_id` / `seller_sku`.
- **Hậu quả**: Người dùng không thể chọn Size/Màu sắc biến thể trên giao diện (dropdown bị trống); giá hiển thị bị render thành `[object Object]`; khi bấm "Thêm vào giỏ" sẽ gửi `sku_id: undefined` dẫn đến lỗi 400.
- **Đề xuất xử lý**:
  1. Xây dựng hàm Adapter `normalizeProductDetail(rawProduct)` tại tầng Service để chuyển đổi DTO của BE sang định dạng an toàn cho UI.
  2. Map `rawProduct.price?.sale_price || rawProduct.price?.base_price` ra giá số nguyên hiển thị.
  3. Map mảng `rawProduct.attributes` vào bộ chọn phân loại biến thể.

---

#### 🟠 CÁC LỖI MỨC ĐỘ HIGH (Endpoint Ma & Chặn Request)

##### [ISSUE-H01] Gọi Endpoint Không Tồn Tại `DELETE /cart`
- **File**: `apps/buyer/src/features/cart/services/cart.api.js:121`.
- **Nguyên nhân**: Hàm `clearCart` gọi trực tiếp `DELETE /cart`. Backend NestJS Cart Service chỉ có endpoint `DELETE /cart/items/{itemId}`.
- **Hậu quả**: Nhận mã lỗi `404 Not Found`.
- **Đề xuất xử lý**: Xóa hàm `clearCart` gọi endpoint này. Sau khi tạo đơn hàng thành công, Backend tự động dọn dẹp các mục đã mua trong giỏ hàng qua Kafka event.

##### [ISSUE-H02] Gọi Endpoint Không Tồn Tại `POST /admin/settlements/batch`
- **File**: `apps/admin/src/services/admin-finance.api.js:41`.
- **Nguyên nhân**: Nút "Tạo đợt quyết toán" trên giao diện Admin gọi API tạo thủ công, trong khi Backend Payment Service vận hành theo cơ chế Scheduled Cron tự động (ADR-003).
- **Hậu quả**: Nút bấm phát sinh lỗi `404 / 405`.
- **Đề xuất xử lý**: Gỡ bỏ hàm này và ẩn nút bấm tạo thủ công trên `AdminSettlementPage.jsx`. Hiển thị nhãn thông tin: "Hệ thống tự động quyết toán vào 02:00 sáng Thứ Hai hàng tuần".

##### [ISSUE-H03] Truy Vấn Bị Chặn `GET /products?is_flash_sale=true`
- **File**: `apps/buyer/src/features/products/services/product.api.js:850` (`getFlashSaleProducts`).
- **Nguyên nhân**: NestJS Product Service cấu hình strict DTO validation với `forbidNonWhitelisted: true`. Tham số `is_flash_sale` không có trong `GetProductsQueryDto`.
- **Hậu quả**: Gateway trả về `400 Bad Request: property is_flash_sale should not exist`.
- **Đề xuất xử lý**: Bỏ param `is_flash_sale` khỏi query. Lấy danh sách sản phẩm thông thường và lọc client-side các sản phẩm có `sale_price < base_price`, hoặc đề xuất Backend bổ sung flag nếu nghiệp vụ Flash Sale mở rộng.

##### [ISSUE-H04] Khối Catch Âm Thầm Trả Mock Khi Cổng Rút Tiền Bị Khóa
- **File**: `apps/seller/src/features/finance/services/seller-finance.api.js:118, 152, 180`.
- **Nguyên nhân**: Backend Payment Service đang khóa chức năng Payout theo quyết định thiết kế ADR-003. Khối `catch` ở FE tự sinh ra `payout_id` giả lập kèm trạng thái thành công.
- **Hậu quả**: Người bán tưởng rằng lệnh rút tiền đã được gửi vào tài khoản ngân hàng, nhưng thực tế Backend không hề ghi nhận giao dịch.
- **Đề xuất xử lý**: Ném lỗi (`throw error`) hoặc hiển thị badge cảnh báo "Tính năng rút tiền đang trong quá trình bảo trì kỹ thuật".

##### [ISSUE-H05] Trùng Lặp Điều Hướng Kênh Người Bán & Người Mua
- **File**: `apps/buyer/src/features/account/pages/SellerRegisterPage.jsx` & `apps/buyer/src/components/layout/Header.jsx:88`.
- **Nguyên nhân**: Người dùng đã có gian hàng hoạt động (`role: SELLER`) nhưng trong trang cá nhân Buyer vẫn hiển thị nút "Đăng ký mở shop" và cho phép mở lại form đăng ký.
- **Hậu quả**: Người dùng gửi lại form sẽ bị Backend báo lỗi `409 SHOP_ALREADY_EXISTS`.
- **Đề xuất xử lý**: Kiểm tra quyền tài khoản; nếu đã là Seller, tự động điều hướng sang `/seller/dashboard` hoặc đổi tên nút thành "Vào Kênh Quản Trị Người Bán".

---

#### 🟡 CÁC LỖI MỨC ĐỘ MEDIUM (Validation & Mock Fallback)

##### [ISSUE-M01] Thiếu Validation Lý Do Từ Chối KYC Admin
- **File**: `apps/admin/src/features/kyc/components/KycReviewModal.jsx:64`.
- **Chi tiết**: BE bắt buộc độ dài từ 10 đến 500 ký tự. Form modal Admin hiện tại cho phép submit dưới 10 ký tự, nhận lỗi 400 từ BE.
- **Khắc phục**: Thêm validation client-side tối thiểu 10 ký tự, hiển thị bộ đếm ký tự (`charactersCount / 500`) và disable nút "Xác nhận từ chối" khi chưa đạt chuẩn.

##### [ISSUE-M02] Quiet Mock Fallback Trong Voucher & Review API
- **File**: `apps/buyer/src/features/account/services/voucher.api.js:134` & `review.api.js:105`.
- **Chi tiết**: Khối catch tự động trả về `MOCK_VOUCHERS` và `MOCK_REVIEWS` khi Gateway lỗi hoặc không có dữ liệu.
- **Khắc phục**: Trả về mảng rỗng `[]` và ném lỗi rõ ràng để UI hiển thị Empty State.

##### [ISSUE-M03] Hardcode Dữ Liệu Thống Kê Tại Dashboard & KYC
- **File**: `apps/seller/.../DashboardPage.jsx:26` và `apps/admin/.../AdminKycPage.jsx:9-18`.
- **Chi tiết**: Sử dụng mock object cho các chỉ số quan trọng (Doanh thu shop, SLA KYC).
- **Khắc phục**: Thay thế bằng dữ liệu tính toán từ API thực tế `GET /seller/wallet/balance` và `GET /admin/shops/kyc`.

---

#### 🟢 CÁC LỖI MỨC ĐỘ LOW & INFO

- **[ISSUE-L01]**: Quản lý danh sách yêu thích hoàn toàn bằng `localStorage` (`favorites.api.js`). Đề xuất: Giữ nguyên chế độ Guest/Local, ghi chú rõ ràng.
- **[ISSUE-I01]**: Tích hợp Google OAuth: Cần chuẩn hóa luồng gọi `POST /api/v1/auth/google` (hoặc OAuth redirect) khi Backend Auth Service triển khai client secret.
