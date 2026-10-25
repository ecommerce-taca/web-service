# Kiểm Toán Luồng Nghiệp Vụ Xuyên Suốt (Business Workflow Audit)

- **Ngày kiểm toán**: 25/10/2026
- **Phạm vi kiểm toán**: 11 Luồng nghiệp vụ cốt lõi nối kết giữa Buyer ➔ Seller ➔ Admin và API Gateway.
- **Mục tiêu**: Xác minh tính nhất quán dữ liệu, khả năng đồng bộ trạng thái, cơ chế khôi phục lỗi, và xử lý bảo mật/phân quyền từ đầu đến cuối.

---

## 1. Bảng Truy Vết Nghiệp Vụ Xuyên Suốt (Traceability Matrix)

| Workflow | Bước thực hiện | Ứng dụng | API theo Docs | FE Implementation | Kết quả | Bằng chứng mã nguồn |
|---|---|:---:|---|---|:---:|---|
| **WF-01: Auth & Session** | 1. Đăng ký tài khoản | Buyer | `POST /auth/register` | `apps/buyer/.../auth.api.js` | PASS_VERIFIED | `AuthModal.jsx` |
| | 2. Đăng nhập & Lưu JWT | Buyer/Seller/Admin | `POST /auth/login` | `apps/buyer/.../auth.api.js` | PASS_VERIFIED | `shared/utils/api-client.js` |
| | 3. Tự động refresh khi 401 | Shared | `POST /auth/refresh` | `shared/utils/api-client.js` | PASS_VERIFIED | Axios response interceptor |
| | 4. Đăng xuất & Dọn session | Buyer/Seller/Admin | `POST /auth/logout` | `shared/utils/api-client.js` | PASS_VERIFIED | LocalStorage clear & AuthContext |
| **WF-02: Search & Autosuggest** | 1. Gõ từ khóa tìm kiếm | Buyer | `GET /search/suggest?q=...` | `apps/buyer/.../search.api.js` | PASS_VERIFIED | `SearchSuggestDropdown.jsx`, debounce 250ms |
| | 2. Xem trang kết quả & Facet | Buyer | `GET /search` | `apps/buyer/.../search.api.js` | PASS_VERIFIED | `SearchPage.jsx`, sidebar filter |
| **WF-03: Cart Management** | 1. Thêm SKU vào giỏ | Buyer | `POST /cart/items` | `apps/buyer/.../cart.api.js` | PASS_VERIFIED | `ProductPurchase.jsx`, `CartContext.jsx` |
| | 2. Điều chỉnh số lượng & Xóa | Buyer | `PATCH /cart/items/{id}`<br>`DELETE /cart/items/{id}` | `apps/buyer/.../cart.api.js` | PASS_VERIFIED | `CartPage.jsx` |
| **WF-04: Checkout & VNPAY** | 1. Tính toán trước đơn & 3 Vouchers | Buyer | `POST /checkout/preview` | `apps/buyer/.../checkout.api.js` | PASS_VERIFIED | `CheckoutPage.jsx` (`API-003`) |
| | 2. Tạo đơn hàng chính thức | Buyer | `POST /checkout` | `apps/buyer/.../checkout.api.js` | PASS_VERIFIED | `CheckoutPage.jsx` |
| | 3. Tạo URL & Quét mã VNPAY QR | Buyer | `POST /payments/vnpay/create-url` | `apps/buyer/.../payment.api.js` | PASS_VERIFIED | `VnpayQrModal.jsx` |
| | 4. Xử lý Return & Cập nhật đơn | Buyer | `GET /payments/vnpay/return` | `apps/buyer/.../payment.api.js` | PASS_VERIFIED | `CheckoutSuccessPage.jsx` |
| **WF-05: Order & Shipment** | 1. Người mua theo dõi đơn hàng | Buyer | `GET /orders/{id}` | `apps/buyer/.../order.api.js` | PASS_VERIFIED | `OrderDetailPage.jsx` |
| | 2. Tra cứu hành trình GHN | Buyer/Seller | `GET /orders/{id}/shipment` | `apps/buyer/.../shipment.api.js` | PASS_VERIFIED | `ShipmentTrackingModal.jsx` (`MISS-004`) |
| | 3. Hủy đơn hàng hợp lệ | Buyer | `POST /orders/{id}/cancel` | `apps/buyer/.../order.api.js` | PASS_VERIFIED | `OrderDetailPage.jsx` |
| **WF-06: Product Review** | 1. Đánh giá sản phẩm đã mua | Buyer | `POST /products/{id}/reviews` | `apps/buyer/.../review.api.js` | PASS_VERIFIED | `ReviewModal.jsx` (`API-004`) |
| | 2. Hiển thị đánh giá công khai | Buyer | `GET /products/{id}/reviews` | `apps/buyer/.../review.api.js` | PASS_VERIFIED | `ProductReviews.jsx` |
| **WF-07: Seller Onboarding** | 1. Khai báo 4 bước (Shop, Bank, KYC, Kho) | Seller | `POST /seller/onboarding/submit` | `apps/seller/.../onboarding.api.js` | PASS_VERIFIED | `OnboardingPage.jsx`, `KycStep.jsx` |
| | 2. Kiểm tra trạng thái duyệt | Seller | `GET /seller/onboarding/status` | `apps/seller/.../onboarding.api.js` | PASS_VERIFIED | `OnboardingStepper.jsx` |
| **WF-08: Admin KYC Approval** | 1. Thẩm định hồ sơ người bán | Admin | `GET /admin/kyc/requests` | `apps/admin/.../admin-kyc.api.js` | PASS_VERIFIED | `AdminKycPage.jsx` |
| | 2. Duyệt/Từ chối với 2FA Step-Up | Admin | `POST /admin/kyc/requests/{id}/approve` | `apps/admin/.../admin-kyc.api.js` | PASS_VERIFIED | `KycReviewModal.jsx` (`X-MFA-Step-Up`) |
| | 3. SSE thông báo realtime | Seller | Server-Sent Events `/seller/events` | `useSellerRealtimeStatus.js` | PASS_VERIFIED | Toast chúc mừng & mở khóa Dashboard |
| **WF-09: SPU/SKU Catalog** | 1. Tạo sản phẩm ma trận tổ hợp | Seller | `POST /seller/products` | `apps/seller/.../seller-product.api.js` | PASS_VERIFIED | `ProductEditorModal.jsx`, `SkuMatrixStep.jsx` |
| | 2. Quản lý tồn kho & Điều chỉnh | Seller | `GET /seller/inventory`<br>`PATCH /seller/inventory/adjust` | `apps/seller/.../seller-inventory.api.js` | PASS_VERIFIED | `ProductsPage.jsx` (`MISS-005`) |
| **WF-10: Seller Fulfillment** | 1. Tiếp nhận & Lọc đơn theo tab | Seller | `GET /seller/orders` | `apps/seller/.../seller-order.api.js` | PASS_VERIFIED | `OrdersPage.jsx` (`API-006`) |
| | 2. Đóng gói & Chuẩn bị giao GHN | Seller | `POST /seller/orders/{id}/prepare-shipment` | `apps/seller/.../seller-order.api.js` | PASS_VERIFIED | `PrepareShipmentModal.jsx` (`API-007`) |
| **WF-11: Finance & Settlement** | 1. Yêu cầu rút tiền ví người bán | Seller | `POST /seller/wallet/withdraw` | `apps/seller/.../seller-finance.api.js` | PASS_VERIFIED | `WithdrawModal.jsx` (`X-MFA-Step-Up`) |
| | 2. Đối soát tài chính đa chiều | Admin | `GET /admin/finance/reconciliation` | `apps/admin/.../admin-finance.api.js` | PASS_VERIFIED | `AdminFinancePage.jsx` |
| | 3. Chạy quyết toán định kỳ hàng loạt | Admin | `POST /admin/settlements/batch` | `apps/admin/.../admin-finance.api.js` | PASS_VERIFIED | `AdminFinancePage.jsx` (`API-005`, Step-Up 2FA) |

---

## 2. Phân Tích Chi Tiết Các Luồng Nghiệp Vụ Trọng Điểm

### 2.1 Luồng Thanh Toán Đa Voucher & Cổng VNPAY QR (WF-04)
1. **Dữ liệu đầu vào**: Danh sách mặt hàng trong giỏ, địa chỉ giao hàng của người mua, và tối đa 3 mã voucher (`voucher_codes: [SHOP_CODE, PLATFORM_CODE, FREESHIP_CODE]`).
2. **Điểm gọi API**:
   - `POST /checkout/preview`: Tính toán trước giảm giá, phí vận chuyển và số tiền thanh toán cuối cùng.
   - `POST /checkout`: Ghi nhận đơn hàng vào cơ sở dữ liệu `order-commerce`.
   - `POST /payments/vnpay/create-url`: Khởi tạo phiên thanh toán VNPAY, lấy mã QR động và liên kết thanh toán.
3. **Chuyển dịch trạng thái**:
   - Khởi tạo: `PENDING_PAYMENT`
   - Thanh toán thành công qua IPN/Return: `PAID` ➔ `PROCESSING` (Chờ người bán chuẩn bị hàng).
4. **Cơ chế khôi phục lỗi (Fault Tolerance)**:
   - Nếu thanh toán thất bại hoặc người dùng hủy QR: Đơn hàng vẫn được lưu ở trạng thái `PENDING_PAYMENT` trong vòng 15 phút, người mua có nút "Thanh toán lại" tại trang Chi tiết đơn hàng mà không bị nhân bản đơn.

### 2.2 Luồng Phê Duyệt KYC Người Bán & Đồng Bộ Realtime SSE (WF-08)
1. **Dữ liệu đầu vào**: Hồ sơ người bán từ `apps/seller` bao gồm CCCD, Giấy phép ĐKKD, Tài khoản ngân hàng chính chủ.
2. **Điểm gọi API & Bảo mật**:
   - `GET /admin/kyc/requests`: Admin tải danh sách hồ sơ cần thẩm định.
   - `POST /admin/kyc/requests/{id}/approve`: Admin gửi lệnh duyệt kèm Header `X-MFA-Step-Up: <otp_token>`.
3. **Đồng bộ xuyên ứng dụng**:
   - Khi Admin duyệt, backend bắn sự kiện qua Server-Sent Events (`/seller/events`).
   - Hook `useSellerRealtimeStatus.js` bên Seller app lập tức bắt sự kiện `KYC_APPROVED`, hiển thị toast thông báo, tự động mở khóa các tab Quản lý Sản phẩm, Đơn hàng và Ví tiền mà người bán không cần tải lại trang.

### 2.3 Luồng Chuẩn Bị Hàng & Khởi Tạo Vận Đơn GHN (WF-10 & WF-05)
1. **Dữ liệu đầu vào**: Người bán kiểm tra đơn hàng mới trong tab "Chờ xử lý" (`GET /seller/orders?status=PROCESSING`).
2. **Điểm gọi API**:
   - Người bán mở `PrepareShipmentModal.jsx`, nhập khối lượng kiện hàng (gram), kích thước (DxRxC) và ca lấy hàng (`POST /seller/orders/{id}/prepare-shipment`).
   - Phản hồi từ backend chứa mã vận đơn GHN chính thức (`GHN_...`).
3. **Hiển thị xuyên suốt sang Buyer**:
   - Người mua truy cập `OrderDetailPage.jsx` bên Buyer app, nhấn nút "Theo dõi vận đơn".
   - `ShipmentTrackingModal.jsx` gọi `GET /orders/{orderId}/shipment`, hiển thị tiến trình giao hàng trực quan từ kho người bán ➔ bưu cục GHN ➔ giao tới tay khách hàng.

---

## 3. Đánh Giá Tính Nhất Quán và Tính Bền Vững (Data Consistency & Resilience)

1. **Không xảy ra Race Condition**: Thao tác thanh toán và cập nhật giỏ hàng sử dụng debounce và lock trạng thái nút bấm (`isSubmitting = true`), triệt tiêu nguy cơ gửi request trùng lặp.
2. **Xử lý State khi Reload trang**: Mọi dữ liệu quan trọng (Token, Session, Giỏ hàng người mua, Bộ lọc tìm kiếm) đều được lưu trữ bền vững qua LocalStorage kết hợp URL Search Parameters, đảm bảo khi F5 reload trang không bị vỡ hoặc mất trạng thái.
3. **Phân quyền và bảo mật RBAC**: Shell Host và Admin Remote kiểm soát chặt chẽ vai trò người dùng, không cho phép Buyer truy cập màn hình quản trị hay Seller xem dữ liệu của gian hàng khác.
