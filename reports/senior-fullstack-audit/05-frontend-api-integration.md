# CHƯƠNG 5: ĐỐI CHIẾU TÍCH HỢP API FRONTEND VÀ BACKEND (FRONTEND API INTEGRATION)
## CHI TIẾT HỢP ĐỒNG DỮ LIỆU, ĐỐI CHIẾU REQUEST/RESPONSE VÀ PHÂN TÍCH LỆCH PHA

---

## 1. PHÂN TÍCH TƯƠNG THÍCH CONTRACT TỪNG DỊCH VỤ

### 1.1. Phân hệ Buyer: `payment.api.js` ↔ `PaymentController.java`

#### Hợp đồng 1: Kiểm tra trạng thái giao dịch thanh toán
- **Frontend Service**: [`paymentApi.getPaymentStatus(paymentId)`](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/payment/services/payment.api.js#L34-L65)
- **Backend Controller**: `GET /api/v1/payments/{paymentId}` trong `PaymentController.java`
- **Đối chiếu tham số**:
  - URL Parameter: `paymentId` (String). Khớp 100%.
- **Đối chiếu Response DTO**:
  | Trường dữ liệu Backend | Kiểu dữ liệu | Trường dữ liệu Frontend mong đợi | Đánh giá khớp |
  | :--- | :--- | :--- | :---: |
  | `payment_id` | String | `data.payment_id` | **KHỚP 100%** |
  | `order_id` | String | `data.order_id` | **KHỚP 100%** |
  | `amount` | Long (VND) | `data.amount` | **KHỚP 100%** |
  | `status` | String Enum (`PENDING`, `SUCCESS`, `EXPIRED`, `FAILED`) | `data.status` | **KHỚP 100%** |
  | `payment_url` | String (URL) | `data.payment_url` | **KHỚP 100%** |
  | `qr_payload` | String (VietQR) | `data.qr_payload` | **KHỚP 100%** |
  | `expires_at` | ISO-8601 String | `data.expires_at` | **KHỚP 100%** |
- **Kết luận**: Tương thích hoàn toàn cả trong chế độ Mock và Live Mode.

---

### 1.2. Phân hệ Seller: `seller-finance.api.js` ↔ `Seller*.java`

#### Hợp đồng 2: Lấy thông tin số dư ví người bán
- **Frontend Service**: [`sellerFinanceApi.getWallet()`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js#L16-L44)
- **Backend Controller**: `GET /api/v1/seller/wallet` trong `SellerWalletController.java`
- **Ràng buộc Header**: Gateway tự động đính kèm `X-User-Shop-Scope`.
- **Đối chiếu DTO**:
  - `available_balance`: Số dư khả dụng (Long). Frontend dùng `Intl.NumberFormat('vi-VN')` để format hiển thị. Khớp.
  - `pending_balance`: Tiền chờ quyết toán T+2 (Long). Khớp.
  - `bank_account`: Object gồm `bank_name`, `account_number`, `account_holder`. Khớp.
- **Kết luận**: Tương thích hoàn toàn.

#### Hợp đồng 3: Lấy báo cáo doanh thu & biểu đồ
- **Frontend Service**: [`sellerFinanceApi.getRevenue(params)`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js#L51-L93)
- **Backend Controller**: `GET /api/v1/seller/revenue` trong `SellerRevenueController.java`
- **Query Params**:
  - `granularity`: Frontend gửi `'DAY' | 'WEEK' | 'MONTH'`. Backend nhận Enum `RevenueGranularity`. Khớp.
  - `from`, `to`: Chuỗi định dạng `YYYY-MM-DD`. Khớp.
- **Đối chiếu DTO**: Các trường `total_gmv`, `platform_fee`, `net_revenue`, `buckets` đều trùng khớp định dạng cấu trúc.
- **Kết luận**: Tương thích hoàn toàn.

#### Hợp đồng 4: Yêu cầu rút tiền người bán (CRITICAL MISMATCH)
- **Frontend Service**: [`sellerFinanceApi.requestPayout(payoutData, stepUpToken)`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js#L102-L135)
- **Backend Controller**: `POST /api/v1/seller/payouts`
- **Tình trạng thực tế**:
  - Phía Frontend: Tự động sinh `Idempotency-Key` (hàm `crypto.randomUUID()`) và đính kèm `X-MFA-Step-Up` nếu có OTP. Payload gửi: `{ amount, bank_account_id, reason }`.
  - Phía Backend: **Không có Controller**. Bị khóa cứng theo `ADR-003`.
  - **Hệ quả khi chạy Live Mode**:
    ```text
    POST http://localhost:8080/api/v1/seller/payouts ➔ 404 Not Found
    {"error": {"code": "RESOURCE_NOT_FOUND", "message": "No static resource api/v1/seller/payouts."}}
    ```
- **Kết luận**: **LỖI LỆCH PHA NGHIỆP VỤ NGHIÊM TRỌNG (BLOCKING BUG)**. Cần xử lý tại Backend hoặc điều chỉnh UI Frontend.

#### Hợp đồng 5: Xuất báo cáo doanh thu người bán (MISSING BE)
- **Frontend Service**: [`sellerFinanceApi.exportRevenue(params)`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js#L172-L190)
- **Backend Controller**: `GET /api/v1/seller/revenue/export`
- **Tình trạng thực tế**: Backend chưa code hàm này trong `SellerRevenueController.java`. Gọi Live API trả về 404.
- **Kết luận**: **LỆCH PHA KỸ THUẬT (MISSING CONTROLLER)**.

---

### 1.3. Phân hệ Admin: `admin-finance.api.js` ↔ `Admin*.java`

#### Hợp đồng 6: Đối soát thanh toán cổng VNPAY
- **Frontend Service**: [`adminFinanceApi.getPaymentReconciliation()`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-finance.api.js#L8-L32)
- **Backend Controller**: `GET /api/v1/admin/payments/reconciliation`
- **Đối chiếu DTO**: Mảng các giao dịch đối soát kèm cờ `match: true/false`, `provider_status` và `local_status`. Khớp 100%.

#### Hợp đồng 7: Tạo đợt quyết toán thủ công (ARCHITECTURAL MISMATCH)
- **Frontend Service**: [`adminFinanceApi.createSettlementBatch(payload, stepUpToken)`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-finance.api.js#L39-L64)
- **Backend Controller**: `POST /api/v1/admin/settlements/batch`
- **Tình trạng thực tế**:
  - Backend **không có endpoint này** do thiết kế chạy qua Scheduled Job định kỳ tự động.
  - Code trong `admin-finance.api.js` đã chủ động chặn:
    ```javascript
    if (!isMockMode()) {
      console.warn('Quyết toán sàn chạy tự động theo lịch Cron tại backend...');
      throw new Error('Quyết toán sàn là tiến trình tự động định kỳ (Scheduled Job T+2)...');
    }
    ```
- **Kết luận**: **LỖI THIẾT KẾ THỪA TRÊN UI (GHOST FEATURE ON UI)**. Cần gỡ bỏ modal tạo batch thủ công hoặc đổi thành nút kích hoạt tiến trình đối soát tức thì.

#### Hợp đồng 8 & 9: Cấu hình biểu phí hoa hồng sàn (Fees)
- **Frontend Service**: `getFees()` và `updateFees(feePayload, stepUpToken)`
- **Backend Controller**: `GET /api/v1/admin/fees` và `PUT /api/v1/admin/fees`
- **Cơ chế tính tỷ lệ**:
  - Backend lưu trữ tỷ lệ dưới dạng `rate_bps` (Basis points: `500 = 5.0%`).
  - Frontend `AdminFeesTaxesPage.jsx` hiển thị bằng cách chia cho 100: `(rule.rate_bps / 100).toFixed(1) + '%'`.
  - Khi cập nhật, Frontend nhân 100 để gửi lại BPS cho Backend.
- **Header 2FA**: Hàm `updateFees` gửi kèm header `X-MFA-Step-Up`. Backend kiểm tra token hợp lệ trước khi cho phép lưu phiên bản mới. Khớp 100%.

#### Hợp đồng 10: Thử lại đợt quyết toán lỗi (Settlement Retry)
- **Frontend Service**: `retrySettlement(batchId, stepUpToken)`
- **Backend Controller**: `POST /api/v1/admin/settlements/{batchId}/retry`
- **Yêu cầu bảo mật**: Bắt buộc gửi header `X-MFA-Step-Up`. Khớp 100%.

#### Hợp đồng 11: Báo cáo tài chính toàn sàn & Xuất báo cáo
- **Frontend Service**: `getFinanceSummary(params)` và `exportFinanceSummary(params)`
- **Backend Controller**: `GET /api/v1/admin/finance/summary` và `GET /api/v1/admin/finance/summary/export`
- **Tham số lọc**: Nhận `from`, `to`, `format` (`xlsx` hoặc `csv`). Khớp 100%.

---

## 2. MA TRẬN ĐỐI CHIẾU TÍCH HỢP TỔNG THỂ (INTEGRATION MATRIX)

| STT | Phân hệ | Hàm API Frontend | Endpoint Backend | Request Match | Response Match | Header Security Match | Tình trạng Live Mode |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Buyer | `paymentApi.getPaymentStatus` | `GET /payments/{id}` | 100% | 100% | N/A | **HOẠT ĐỘNG TỐT** |
| 2 | Seller | `sellerFinanceApi.getWallet` | `GET /seller/wallet` | 100% | 100% | `X-User-Shop-Scope` | **HOẠT ĐỘNG TỐT** |
| 3 | Seller | `sellerFinanceApi.getRevenue` | `GET /seller/revenue` | 100% | 100% | `X-User-Shop-Scope` | **HOẠT ĐỘNG TỐT** |
| 4 | Seller | `sellerFinanceApi.getLedger` | `GET /seller/wallet/ledger` | 100% | 100% | `X-User-Shop-Scope` | **HOẠT ĐỘNG TỐT** |
| 5 | Seller | `sellerFinanceApi.exportRevenue` | `GET /seller/revenue/export` | 100% | **0%** | N/A | **LỖI 404 (BE Thiếu)** |
| 6 | Seller | `sellerFinanceApi.requestPayout` | `POST /seller/payouts` | 100% | **0%** | `Idempotency`, `2FA` | **LỖI 404 (ADR-003 Gated)** |
| 7 | Seller | `sellerFinanceApi.getPayouts` | `GET /seller/payouts` | 100% | **0%** | `X-User-Shop-Scope` | **LỖI 404 (ADR-003 Gated)** |
| 8 | Admin | `adminFinanceApi.getPaymentReconciliation` | `GET /admin/payments/reconciliation` | 100% | 100% | `FINANCE_OPS` | **HOẠT ĐỘNG TỐT** |
| 9 | Admin | `adminFinanceApi.getFees` | `GET /admin/fees` | 100% | 100% | N/A | **HOẠT ĐỘNG TỐT** |
| 10 | Admin | `adminFinanceApi.updateFees` | `PUT /admin/fees` | 100% | 100% | `X-MFA-Step-Up` | **HOẠT ĐỘNG TỐT** |
| 11 | Admin | `adminFinanceApi.getTaxes` | `GET /admin/taxes` | 100% | 100% | N/A | **HOẠT ĐỘNG TỐT** |
| 12 | Admin | `adminFinanceApi.updateTaxes` | `PUT /admin/taxes` | 100% | 100% | `X-MFA-Step-Up` | **HOẠT ĐỘNG TỐT** |
| 13 | Admin | `adminFinanceApi.getSettlements` | `GET /admin/settlements` | 100% | 100% | `FINANCE_OPS` | **HOẠT ĐỘNG TỐT** |
| 14 | Admin | `adminFinanceApi.getSettlementDetail` | `GET /admin/settlements/{id}` | 100% | 100% | `FINANCE_OPS` | **HOẠT ĐỘNG TỐT** |
| 15 | Admin | `adminFinanceApi.createSettlementBatch` | `POST /admin/settlements/batch` | N/A | **0%** | N/A | **LỖI THIẾT KẾ (BE Không có)**|
| 16 | Admin | `adminFinanceApi.retrySettlement` | `POST /admin/settlements/{id}/retry` | 100% | 100% | `X-MFA-Step-Up` | **HOẠT ĐỘNG TỐT** |
| 17 | Admin | `adminFinanceApi.getFinanceSummary` | `GET /admin/finance/summary` | 100% | 100% | `FINANCE_OPS` | **HOẠT ĐỘNG TỐT** |
| 18 | Admin | `adminFinanceApi.exportFinanceSummary` | `GET /admin/finance/summary/export` | 100% | 100% | `FINANCE_OPS` | **HOẠT ĐỘNG TỐT** |

---

## 3. KẾT LUẬN KIỂM TOÁN TÍCH HỢP
- **Tỷ lệ tương thích API thực tế**: **83.3%** (15/18 luồng hoạt động chuẩn xác).
- **3 điểm nghẽn tích hợp chính**:
  1. `POST & GET /seller/payouts` (Do chính sách Gating ADR-003 phía BE).
  2. `GET /seller/revenue/export` (Do BE chưa viết Controller).
  3. `POST /admin/settlements/batch` (Do bất đối xứng trong hiểu biết nghiệp vụ giữa FE và BE).

