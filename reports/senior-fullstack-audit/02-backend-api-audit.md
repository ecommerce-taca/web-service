# CHƯƠNG 2: KIỂM TOÁN TẦNG BACKEND REST API (BACKEND API AUDIT)
## KIỂM ĐỊNH CHI TIẾT 20+ ENDPOINTS, BẢO MẬT VÀ DTO CONTRACTS

---

## 1. DANH MỤC CONTROLLER VÀ PHÂN VÙNG NGHIỆP VỤ

Backend `payment-wallet-service` tổ chức các REST API Controller tại package `com.taca.paymentwallet.adapter.in.web` phục vụ 3 nhóm đối tượng:
1. **Core Payment**: Xử lý giao dịch thanh toán đơn hàng và Webhook đối tác VNPAY.
2. **Seller Finance**: Quản lý số dư ví, doanh thu, sổ cái và rút tiền của Người bán.
3. **Admin Backoffice**: Đối soát giao dịch, quản lý biểu phí hoa hồng, cấu hình thuế và quyết toán định kỳ.

```text
com.taca.paymentwallet.adapter.in.web/
├── PaymentController.java                         # Core Payment & IPN Webhook
├── SellerWalletController.java                    # Số dư ví người bán
├── SellerLedgerController.java                    # Sổ cái giao dịch người bán
├── SellerRevenueController.java                   # Báo cáo doanh thu & biểu đồ
├── AdminPaymentReconciliationController.java       # Đối soát VNPAY vs Sàn
├── AdminFeeController.java                        # Cấu hình biểu phí hoa hồng sàn
├── AdminTaxController.java                        # Cấu hình thuế GTGT khấu trừ
├── AdminSettlementController.java                 # Quản lý các đợt quyết toán
└── AdminFinanceSummaryController.java              # Báo cáo tài chính toàn sàn
```

---

## 2. KIỂM ĐỊNH CHI TIẾT TỪNG CONTROLLER & ENDPOINTS

### 2.1. Nhóm Core Payment (`PaymentController.java`)

#### Endpoint 1: Khởi tạo giao dịch thanh toán (`POST /api/v1/payments`)
- **Mục đích**: Nhận thông tin đơn hàng từ hệ thống `order-commerce`, sinh mã giao dịch thanh toán, liên kết với cổng VNPAY và trả về URL thanh toán kèm chuỗi payload VietQR.
- **Ràng buộc bảo mật & Actor**:
  - `InternalCallerPolicy.requireOrderCommerce()`: **Chỉ chấp nhận cuộc gọi nội bộ từ hệ thống Order**. Người dùng trình duyệt (Buyer) không thể gọi trực tiếp endpoint này.
  - Header bắt buộc: `Idempotency-Key` (UUID định danh duy nhất).
- **Request DTO**:
  ```json
  {
    "order_id": "ord-01912fa0",
    "amount": 25000000,
    "currency": "VND",
    "payment_method": "VNPAY",
    "return_url": "https://taca.vn/checkout/callback",
    "order_info": "Thanh toan don hang ord-01912fa0"
  }
  ```
- **Response DTO (HTTP 201 Created)**:
  ```json
  {
    "data": {
      "payment_id": "pay-01912fa1-8a90",
      "order_id": "ord-01912fa0",
      "amount": 25000000,
      "currency": "VND",
      "status": "PENDING",
      "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
      "qr_payload": "00020101021238580010A00000072701280006970454...",
      "expires_at": "2026-11-08T10:15:00Z"
    },
    "meta": { "request_id": "req-98fa21b" }
  }
  ```
- **Đánh giá**: Triển khai hoàn chỉnh, xử lý Idempotency chuẩn xác.

#### Endpoint 2: Tiếp nhận Webhook IPN từ VNPAY (`POST /api/v1/payments/webhook`)
- **Mục đích**: Nhận thông báo kết quả giao dịch thanh toán tức thời từ server VNPAY thông qua HTTP POST.
- **Xử lý kỹ thuật**:
  - Xác thực chữ ký số HMAC-SHA512 với `vnp_SecureHash`.
  - Kiểm tra trạng thái mã phản hồi `vnp_ResponseCode == "00"`.
  - Cập nhật trạng thái Payment sang `SUCCESS` hoặc `FAILED`.
  - Ghi bản ghi vào bảng `outbox_messages` để phát sinh sự kiện Kafka `PaymentSuccessEvent`.
- **Response**: Trả về định dạng JSON theo đúng chuẩn đối tác VNPAY yêu cầu: `{"RspCode": "00", "Message": "Confirm Success"}`.
- **Đánh giá**: Bảo mật cao, chống giả mạo IPN.

#### Endpoint 3: Truy vấn trạng thái thanh toán (`GET /api/v1/payments/{paymentId}`)
- **Mục đích**: Phục vụ trình duyệt Buyer Polling trạng thái mã QR theo chu kỳ 2.5 giây.
- **Quyền hạn**: Bất kỳ người dùng sở hữu `payment_id` hợp lệ.
- **Response DTO (HTTP 200 OK)**:
  ```json
  {
    "data": {
      "payment_id": "pay-01912fa1-8a90",
      "order_id": "ord-01912fa0",
      "amount": 25000000,
      "currency": "VND",
      "status": "SUCCESS",
      "provider_reference": "VNP14892019",
      "paid_at": "2026-11-08T10:02:15Z"
    },
    "meta": { "request_id": "req-11029ab" }
  }
  ```
- **Đánh giá**: Hoạt động tối ưu, hỗ trợ caching header nhẹ.

#### Endpoint 4: Khởi tạo hoàn tiền (`POST /api/v1/payments/{paymentId}/refunds`)
- **Mục đích**: Hoàn tiền khi đơn hàng bị hủy hoặc trả hàng thành công.
- **Ràng buộc**: Quyền `ADMIN` hoặc `FINANCE_OPS`, hoặc cuộc gọi nội bộ từ `order-commerce`. Cần `Idempotency-Key`.
- **Đánh giá**: Đã triển khai hoàn tất và liên kết sổ cái kế toán để đảo chiều tiền.

---

### 2.2. Nhóm Seller Wallet & Revenue

#### Endpoint 5: Lấy thông tin ví người bán (`GET /api/v1/seller/wallet`)
- **Mục đích**: Hiển thị số dư khả dụng (`available_balance`), số dư đóng băng/chờ quyết toán (`pending_balance`), tài khoản ngân hàng và chu kỳ thanh toán.
- **Ràng buộc**: Header `X-User-Shop-Scope` bắt buộc. Backend tự lọc theo shop ID được Gateway truyền vào.
- **Response DTO (HTTP 200 OK)**:
  ```json
  {
    "data": {
      "wallet_id": "wal-shop-001",
      "shop_id": "shop-01912f31",
      "available_balance": 42800000,
      "pending_balance": 5200000,
      "currency": "VND",
      "status": "ACTIVE",
      "bank_account": {
        "bank_name": "Vietcombank",
        "account_number": "•••• 4838",
        "account_holder": "NGUYEN MINH ANH"
      },
      "settlement_cycle": "Hàng ngày (T+2)"
    },
    "meta": { "request_id": "req-wal-891" }
  }
  ```
- **Đánh giá**: Triển khai chuẩn, dữ liệu tiền tệ là số nguyên VND.

#### Endpoint 6: Lấy lịch sử sổ cái ví (`GET /api/v1/seller/wallet/ledger`)
- **Mục đích**: Hiển thị sao kê chi tiết từng biến động số dư của Người bán.
- **Query params**: `page` (default 1), `size` (default 20), `from`, `to`, `entry_type` (`CREDIT` | `DEBIT`).
- **Response**: Trả về danh sách entries kèm số dư sau giao dịch (`balance_after`).
- **Đánh giá**: Hoàn hảo, truy vấn trực tiếp từ bảng `ledger_entries`.

#### Endpoint 7: Báo cáo tổng hợp doanh thu (`GET /api/v1/seller/revenue`)
- **Mục đích**: Thống kê GMV, hoa hồng sàn (commission), thuế đã khấu trừ (tax), số tiền thực nhận (net), và biểu đồ theo ngày/tuần/tháng (`granularity: DAY | WEEK | MONTH`).
- **Query params**: `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `granularity=MONTH`.
- **Đánh giá**: Đã triển khai đầy đủ thuật toán gom nhóm bucket tại tầng service.

#### Endpoint 8: Xuất báo cáo doanh thu (`GET /api/v1/seller/revenue/export`)
- **Tình trạng**: **CHƯA TRIỂN KHAI (MISSING IN CONTROLLER)**.
- **Phân tích**: Được định nghĩa tại mục §3.5 của tài liệu spec `docs/api/payment-wallet-api.md`, nhưng trong file `SellerRevenueController.java` hoàn toàn không có method ánh xạ route `/export`. Khi gọi sẽ trả về lỗi HTTP `404 Not Found`.

---

### 2.3. Nhóm Seller Payouts (Gated Feature - ADR-003)

#### Endpoint 9 & 10: Rút tiền người bán (`POST /api/v1/seller/payouts` & `GET /api/v1/seller/payouts`)
- **Tình trạng**: **BỊ KHÓA TOÀN BỘ (PRODUCTION-GATED)**.
- **Nguyên nhân**:
  - File `ADR-003-payout-eligibility-phase-gating.md` chỉ rõ tính năng rút tiền tự phục vụ (Self-service Payout) của Người bán tiềm ẩn rủi ro lừa đảo và rửa tiền trong giai đoạn đầu.
  - Mã nguồn Backend có class `RequestPayoutUseCase.java` nhưng **không được khai báo `@Service` hoặc `@Component`** trong cấu hình Spring.
  - Không có file `SellerPayoutController.java` trong thư mục `adapter/in/web`.
- **Hệ quả thực tế**: Mọi lời gọi API từ Frontend đến `/seller/payouts` đều bị Spring Cloud Gateway hoặc Web Controller trả về lỗi `404 Not Found`.

---

### 2.4. Nhóm Admin Backoffice (`Admin*.java`)

#### Endpoint 11: Đối soát cổng thanh toán (`GET /api/v1/admin/payments/reconciliation`)
- **Controller**: `AdminPaymentReconciliationController.java`.
- **Quyền hạn**: `FINANCE_OPS`.
- **Mục đích**: So khớp trạng thái các giao dịch trên sàn với kết quả trả về từ đối tác VNPAY, phát hiện chênh lệch (mismatch) hoặc giao dịch treo.

#### Endpoint 12 & 13: Quản lý biểu phí hoa hồng (`GET /api/v1/admin/fees`, `PUT /api/v1/admin/fees`)
- **Controller**: `AdminFeeController.java`.
- **Quy tắc phiên bản**: Phí hoa hồng sàn được quản lý theo mô hình **Effective-Dated Versioning** (có hiệu lực từ ngày... đến ngày...). Không bao giờ cập nhật đè (update in-place) mà luôn tạo version mới.
- **Yêu cầu bảo mật cho PUT**: Bắt buộc gửi header `X-MFA-Step-Up` chứa mã xác thực OTP 2FA.

#### Endpoint 14 & 15: Cấu hình thuế khấu trừ (`GET /api/v1/admin/taxes`, `PUT /api/v1/admin/taxes`)
- **Controller**: `AdminTaxController.java`.
- **Nghiệp vụ**: Tuân thủ Thông tư 40/2021/TT-BTC về khấu trừ thuế GTGT tại nguồn đối với sàn thương mại điện tử (ADR-004). Mức thuế tính theo basis points (`tax_rate_bps: 100` tương đương 1.0%).
- **Yêu cầu bảo mật cho PUT**: Bắt buộc gửi header `X-MFA-Step-Up`.

#### Endpoint 16 & 17: Danh sách & Chi tiết đợt quyết toán (`GET /api/v1/admin/settlements`, `GET /api/v1/admin/settlements/{batchId}`)
- **Controller**: `AdminSettlementController.java`.
- **Dữ liệu**: Trả về tổng tiền giải ngân, tiền giữ lại (held_amount), số lượng shop tham gia đợt quyết toán và chi tiết phân bổ từng shop.

#### Endpoint 18: Tạo đợt quyết toán thủ công (`POST /api/v1/admin/settlements/batch`)
- **Tình trạng**: **HOÀN TOÀN KHÔNG TỒN TẠI TRÊN BACKEND**.
- **Phân tích**: Backend quy định quyết toán sàn là nghiệp vụ vận hành tự động định kỳ 100% qua Scheduled Job. Không hỗ trợ API tạo thủ công.

#### Endpoint 19: Thử lại đợt quyết toán lỗi (`POST /api/v1/admin/settlements/{batchId}/retry`)
- **Controller**: `AdminSettlementController.java`.
- **Mục đích**: Khi một đợt quyết toán gặp sự cố gián đoạn mạng hoặc ngân hàng từ chối, Quản trị viên kích hoạt chạy lại.
- **Yêu cầu bảo mật**: Bắt buộc quyền `FINANCE_OPS` + header `X-MFA-Step-Up`.

#### Endpoint 20 & 21: Báo cáo tài chính sàn & Xuất báo cáo (`GET /api/v1/admin/finance/summary`, `GET /api/v1/admin/finance/summary/export`)
- **Controller**: `AdminFinanceSummaryController.java`.
- **Đánh giá**: Đã triển khai đầy đủ cả 2 endpoint, hỗ trợ xuất file Excel qua signed download URL.

---

## 3. CHUẨN HÓA ENVELOPE DỮ LIỆU VÀ XỬ LÝ LỖI TOÀN CỤC

Toàn bộ Backend áp dụng lớp lọc `GlobalExceptionHandler.java` thống nhất cấu trúc phản hồi.

### 3.1. Chuẩn phản hồi thành công (Success Envelope)
```json
{
  "data": { ... },
  "meta": {
    "request_id": "req-01912f-89bc",
    "timestamp": "2026-11-08T10:15:30Z",
    "page": 1,
    "size": 20,
    "total": 128,
    "total_pages": 7
  }
}
```

### 3.2. Chuẩn phản hồi lỗi (Error Envelope)
```json
{
  "error": {
    "code": "STEP_UP_MFA_REQUIRED",
    "message": "Thao tác yêu cầu xác thực bảo mật 2 lớp qua OTP.",
    "details": {
      "header_required": "X-MFA-Step-Up",
      "action": "UPDATE_FEE_CONFIG"
    },
    "timestamp": "2026-11-08T10:15:30Z"
  },
  "meta": {
    "request_id": "req-01912f-89bc"
  }
}
```

### 3.3. Bảng ánh xạ mã lỗi chuẩn (Error Code Mapping)
| Exception Java | HTTP Code | Error Code Chuẩn | Diễn giải |
| :--- | :---: | :--- | :--- |
| `EntityNotFoundException` | 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy thanh toán, ví hoặc biểu phí |
| `ForbiddenScopeException` | 403 | `SHOP_SCOPE_VIOLATION` | Người bán cố tình truy vấn ví của shop khác |
| `InvalidStepUpTokenException`| 403 / 428 | `INVALID_STEP_UP_TOKEN` | Thiếu hoặc sai mã OTP 2FA trong header |
| `IdempotencyConflictException`| 409 | `IDEMPOTENCY_KEY_IN_USE`| Trùng lặp request đang được xử lý |
| `InternalCallerViolationException` | 403 | `INTERNAL_CALL_REQUIRED`| Client ngoài cố gọi API tạo thanh toán nội bộ |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_FAILED` | Sai định dạng dữ liệu đầu vào |

---

## 4. KẾT LUẬN KIỂM TOÁN TẦNG API BACKEND
- **Độ hoàn thiện tổng thể**: Đạt 82% so với tài liệu đặc tả `docs/api/payment-wallet-api.md`.
- **Vấn đề cốt lõi cần giải quyết**:
  1. Thiếu mã nguồn triển khai Controller cho endpoint `#7a: GET /seller/revenue/export`.
  2. Sự không tương thích giữa việc Backend khóa tính năng Payout (`/seller/payouts` trả về 404) và việc Frontend đã sẵn sàng giao diện rút tiền.
  3. Thiếu endpoint tạo hoặc kích hoạt quyết toán thủ công (`POST /admin/settlements/batch`).

