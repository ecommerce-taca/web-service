# Báo Cáo Triển Khai: PHASE-02 (Implementation Report)

*Cập nhật: 2026-10-25 15:00:00 (ICT)*  
*Chủ quản: Senior Software Engineer / Technical Lead & QA Engineer*  
*Tài liệu API chính thức: [https://github.com/ecommerce-taca/docs](https://github.com/ecommerce-taca/docs)* (`order-commerce-docs` §3.4, §3.5 và `payment-wallet-docs` §2, §3.1, §3.2)

---

## 1. Tóm Tắt Kết Quả Triển Khai (Executive Summary)

Phase `PHASE-02: Core Checkout & Payment API Alignment` đã được triển khai hoàn chỉnh 100% phạm vi được phê duyệt, giải quyết dứt điểm 4 findings trọng yếu liên quan đến luồng đặt hàng, áp dụng khuyến mãi đa tầng và tích hợp cổng thanh toán:
- `API-003` (High): Chuẩn hóa luồng checkout nhận kết quả điều hướng thanh toán từ `POST /checkout` (`payment_next_action`) thay vì gọi trực tiếp endpoint nội bộ `POST /payments`.
- `API-004` (High): Nâng cấp payload `POST /checkout` truyền mảng 3 slot `voucher_codes: string[]` hỗ trợ đồng thời voucher cửa hàng (`SHOP`), voucher toàn sàn (`PLATFORM`) và mã miễn phí vận chuyển (`FREESHIP`).
- `MOCK-001` (Medium): Chuyển giá trị mặc định của `isMockMode()` sang `false`, loại bỏ cơ chế silent catch nuốt lỗi mạng/backend để hiển thị trung thực Error State cho người dùng kèm nút thử lại.
- `MOCK-002` (Low): Cô lập tính năng giả lập xác nhận thanh toán ("Tôi đã thanh toán (Test)") chỉ khả dụng trong chế độ Mock/Development, đảm bảo môi trường thật luôn xác thực qua polling `GET /payments/{paymentId}`.

---

## 2. Chi Tiết Các Thay Đổi Mã Nguồn (Code Changes)

### 2.1. `TASK-02-MOCK-CONTROL` (`MOCK-001`)
- **[shared/utils/api-client.js](file:///d:/di_hoc/taca_ecommerce/shared/utils/api-client.js)**:
  - Cập nhật hàm `isMockMode()` trả về `false` mặc định khi biến môi trường `VITE_USE_MOCK` không được gán hoặc là `'false'`. Chỉ bật mock khi có cấu hình tường minh (`true` hoặc `localStorage.getItem('taca_force_mock') === 'true'`).
- **[apps/buyer/src/features/account/services/order.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/services/order.api.js)**:
  - `createOrder`: Trong chế độ thật (`!isMockMode()`), gọi `POST /checkout` kèm `Idempotency-Key`. Khi API Gateway trả về lỗi (400, 409, 500), không âm thầm nuốt lỗi và tạo mock order giả mà ném ngoại lệ lên component để hiển thị lỗi trung thực.
  - `getOrders` & `getOrderDetail`: Khi `!isMockMode()`, không tự động fallback sang `INITIAL_DEMO_ORDERS` khi có sự cố kết nối.

### 2.2. `TASK-02-VOUCHER-SLOTS` (`API-004`)
- **[apps/buyer/src/features/checkout/components/ApplyVoucherModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/components/ApplyVoucherModal.jsx)**:
  - Tái cấu trúc phân loại voucher thành 3 danh sách chuyên biệt:
    1. Voucher Cửa hàng (`SHOP`)
    2. Voucher Toàn sàn (`PLATFORM`)
    3. Mã Miễn phí vận chuyển (`FREESHIP`)
  - Cho phép người dùng tick/untick độc lập từng slot, hỗ trợ nhập mã thủ công và tự động định tuyến vào đúng slot tương ứng.
  - Tính toán tổng số tiền tiết kiệm trên cả 3 slots và trả về callback `onApplyVouchers({ shopVoucher, tacaVoucher, freeshipVoucher })`.
- **[apps/buyer/src/features/checkout/pages/CheckoutPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/pages/CheckoutPage.jsx)**:
  - Bổ sung state `selectedFreeshipVoucher`, tính toán `freeshipDiscount` và `effectiveShippingFee`.
  - Truyền mảng 3 slots `voucher_codes: string[]` vào cả `orderApi.previewCheckout` và `orderApi.createOrder`.
  - Hiển thị chi tiết từng dòng giảm giá trong cột Tóm tắt đơn hàng (Tạm tính, Phí vận chuyển, Giảm giá Shop, Giảm giá Sàn, Giảm giá Freeship, Tổng thanh toán).

### 2.3. `TASK-02-PAYMENT-FLOW` (`API-003`) & `TASK-02-ISOLATE-SIM` (`MOCK-002`)
- **[apps/buyer/src/features/checkout/pages/CheckoutPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/pages/CheckoutPage.jsx)**:
  - Kiểm tra `payment_next_action` từ kết quả `POST /checkout`:
    - Với phương thức `VNPAY`: trích xuất `payment_id` và `reservation_expires_at` để khởi tạo `VnpayQrModal`.
    - Với phương thức `COD`: điều hướng người dùng tới trang quản lý đơn hàng `/account/orders`.
  - Bắt các mã lỗi chuyên biệt từ Order Service:
    - `ORDER_VOUCHER_SLOT_CONFLICT`: "Xung đột loại voucher: Mỗi đơn hàng chỉ được dùng tối đa 1 voucher sàn, 1 voucher shop và 1 mã freeship."
    - `ORDER_VOUCHER_INVALID`: "Mã voucher áp dụng không hợp lệ hoặc đã hết hạn sử dụng."
    - `409 Conflict`: "Giá sản phẩm hoặc tồn kho đã thay đổi trong giỏ hàng. Vui lòng kiểm tra lại đơn hàng."
- **[apps/buyer/src/features/payment/services/payment.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/payment/services/payment.api.js)**:
  - `getPaymentStatus`: Không tự động fallback mock khi gọi `GET /payments/{paymentId}` trong chế độ thật.
  - `confirmMockPaymentSuccess`: Chặn gọi hàm giả lập nếu đang ở chế độ thật (`!isMockMode()`).
- **[apps/buyer/src/features/checkout/components/VnpayQrModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/components/VnpayQrModal.jsx)**:
  - Cô lập tính năng giả lập thành công: chỉ khi `isMockMode() === true` nút "Tôi đã thanh toán (Test)" mới kích hoạt `confirmMockPaymentSuccess`.
  - Trong chế độ chuẩn (`!isMockMode()`), nút đóng vai trò là "Kiểm tra thanh toán" gọi `GET /payments/{paymentId}` từ backend thật và thông báo rõ nếu chưa nhận được giao dịch.

---

## 3. Trạng Thái Findings Sau Khi Xử Lý

| Finding ID | Ứng dụng | Mức độ | Trạng thái cũ | Trạng thái mới | Bằng chứng mã nguồn |
| :---: | :---: | :---: | :---: | :---: | :--- |
| `API-003` | Buyer | 🟠 High | `CONFIRMED` | `RESOLVED` | `CheckoutPage.jsx` tiếp nhận `payment_next_action` từ `POST /checkout` điều hướng VNPAY modal hoặc COD |
| `API-004` | Buyer | 🟠 High | `CONFIRMED` | `RESOLVED` | `ApplyVoucherModal.jsx` & `CheckoutPage.jsx` gửi mảng `voucher_codes: string[]` 3 slots chuẩn spec |
| `MOCK-001` | All | 🟡 Medium | `CONFIRMED` | `RESOLVED` | `api-client.js` chuyển `isMockMode()` mặc định sang `false`; `order.api.js` không nuốt lỗi |
| `MOCK-002` | Buyer | 🟢 Low | `CONFIRMED` | `RESOLVED` | `VnpayQrModal.jsx` & `payment.api.js` cô lập tính năng simulate chỉ trong mock mode |

---

## 4. Bằng Chứng Xác Minh (Verification Evidence)

1. **Linting Check**:
   - Lệnh: `npm run lint`
   - Kết quả: **Pass 100% (Exit code 0)** trên tất cả 4 workspaces (`@taca/admin`, `@taca/buyer`, `@taca/seller`, `@taca/shell`).
2. **Build Test**:
   - Lệnh: `npm run build:remotes`
   - Kết quả: **Pass 100% (Exit code 0)**, build thành công toàn bộ bundle remotes.
   - Lệnh: `npm run build -w @taca/shell`
   - Kết quả: **Pass 100% (Exit code 0)**, build thành công container shell.
