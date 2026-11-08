# BÁO CÁO KIỂM TOÁN FULL-STACK TOÀN DIỆN (SENIOR AUDIT REPORT)
## HỆ THỐNG THANH TOÁN, VÍ TIỀN & ĐỐI SOÁT TÀI CHÍNH TACA ECOMMERCE

---

### MỤC LỤC BÁO CÁO TOÀN DIỆN (13 CHƯƠNG)
1. **[00-executive-summary.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/00-executive-summary.md)**: Tóm tắt điều hành & Kết quả đánh giá tổng thể.
2. **[01-system-architecture-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/01-system-architecture-audit.md)**: Kiểm toán kiến trúc hệ thống (Hexagonal vs Monorepo MFE).
3. **[02-backend-api-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/02-backend-api-audit.md)**: Kiểm toán toàn bộ 20+ REST API endpoints backend, Auth Policies & DTOs.
4. **[03-database-data-consistency.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/03-database-data-consistency.md)**: Kiểm toán cơ sở dữ liệu MySQL, Flyway V001-V018, Sổ cái kép & Tiền tệ.
5. **[04-frontend-architecture-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/04-frontend-architecture-audit.md)**: Đánh giá kiến trúc Frontend (Buyer, Seller, Admin, Shared Client & Envelopes).
6. **[05-frontend-api-integration.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/05-frontend-api-integration.md)**: Đối chiếu chi tiết API Contracts giữa FE Services và BE Controllers.
7. **[06-ui-ux-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/06-ui-ux-audit.md)**: Kiểm toán UI/UX theo chuẩn Penpot, Trạng thái giao diện, Responsive & A11y.
8. **[07-business-flow-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/07-business-flow-audit.md)**: Kiểm định 6 luồng nghiệp vụ E2E từ Người mua đến Người bán và Quản trị viên.
9. **[08-api-ui-traceability-matrix.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/08-api-ui-traceability-matrix.md)**: Ma trận truy xuất nguồn gốc từ Giao diện → API → Service → Database.
10. **[09-test-scenarios-and-test-cases.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/09-test-scenarios-and-test-cases.md)**: Bộ kịch bản & Test cases kiểm thử tích hợp (Functional, Edge, Security).
11. **[10-performance-security-audit.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/10-performance-security-audit.md)**: Kiểm toán hiệu năng, Độ trễ Kafka Outbox, Bảo mật RBAC & Step-Up 2FA.
12. **[11-bug-risk-register.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/11-bug-risk-register.md)**: Sổ đăng ký lỗi và rủi ro kỹ thuật (Phân loại Critical, High, Medium, Low).
13. **[12-recommendations-and-roadmap.md](file:///d:/di_hoc/taca_ecommerce/senior-fullstack-audit/12-recommendations-and-roadmap.md)**: Lộ trình khắc phục và kiến nghị hoàn thiện (P0 – P3).

---

## 1. THÔNG TIN KIỂM TOÁN TỔNG QUAN

- **Dự án**: Sàn thương mại điện tử Taca Ecommerce (Taca Marketplace).
- **Phạm vi kiểm toán**:
  - **Backend Repo**: [`ecommerce-taca/payment-wallet-service`](https://github.com/ecommerce-taca/payment-wallet-service) (Nhánh `main`, commit mới nhất).
    - Công nghệ: Java 25, Spring Boot 4.0.0-M2, Spring Cloud Gateway, MySQL 8.4 LTS, Apache Kafka 3.7, Flyway 10, Docker Compose.
  - **Frontend Monorepo**: Workspace `d:\di_hoc\taca_ecommerce` (Nhánh hiện tại).
    - Công nghệ: React 18, Vite 5, Tailwind CSS v3, Module Federation (Micro-Frontend với `@taca/shell`, `@taca/buyer`, `@taca/seller`, `@taca/admin`), `@taca/ui-components`.
  - **Nguồn chân lý nghiệp vụ & thiết kế**:
    - Backend Specs & ADRs: `docs/api/payment-wallet-api.md`, `docs/db/payment-wallet-db.md`, `ADR-001` đến `ADR-004`.
    - Thiết kế UI/UX: Workspace Penpot Taca Ecommerce (Board Buyer, Seller, Admin Finance).
- **Phương pháp kiểm toán**: White-box Architecture Audit, Code Inspection, Static Contract Verification, Database Schema DDL Analysis, End-to-End Traceability Mapping.

---

## 2. TỔNG QUAN ĐÁNH GIÁ (SCORECARD)

| Hạng mục kiểm toán | Điểm số | Trạng thái | Đánh giá tóm tắt |
| :--- | :---: | :---: | :--- |
| **1. Kiến trúc Backend (Hexagonal / Clean Architecture)** | **9.2 / 10** | **XUẤT SẮC** | Phân tầng Port & Adapter rất nghiêm ngặt, áp dụng Domain-Driven Design, Sổ cái kép (Double-entry Ledger), Transactional Outbox Pattern cho Kafka. |
| **2. Độ toàn vẹn dữ liệu Database (MySQL & Flyway)** | **9.5 / 10** | **XUẤT SẮC** | 18 Flyway scripts (V001–V018) chuẩn mực, 100% số tiền dùng `BIGINT` (VND nguyên tệ), khóa idempotency key mức DB, ràng buộc toàn vẹn khóa ngoại chặt chẽ. |
| **3. Tuân thủ API Contract & Bảo mật Gateway** | **7.8 / 10** | **CẢNH BÁO** | Backend có chính sách kiểm soát Header rất tốt (`X-User-ID`, `X-User-Roles`, `X-User-Shop-Scope`, `X-MFA-Step-Up`, `Idempotency-Key`). Tuy nhiên xuất hiện **khoảng lệch lớn** giữa UI FE và Backend API gating. |
| **4. Kiến trúc Frontend Monorepo Micro-Frontend** | **8.8 / 10** | **TỐT** | Tách 3 remotes (Buyer, Seller, Admin) chạy độc lập qua Vite Module Federation, Shared UI-components Zero-logic, xử lý Mock Mode vs Live Mode rõ ràng. |
| **5. Khả năng tương thích FE ↔ BE (Integration)** | **6.5 / 10** | **NGUY CƠ CAO** | **Nghiệp vụ rút tiền (Payouts) và tạo đợt quyết toán (Settlement Batch) đang bị khóa cứng (Gated)** tại BE theo ADR-003 nhưng FE đã dựng giao diện hoàn chỉnh, dẫn đến lỗi runtime 404 khi chạy Live Mode. |
| **6. Trải nghiệm người dùng & UI/UX (Penpot Match)** | **9.0 / 10** | **XUẤT SẮC** | Giao diện khớp thiết kế Penpot 98%, xử lý đầy đủ 4 trạng thái (Loading/Success/Empty/Error), mã QR VNPAY tương tác mượt, 100% icons dùng `lucide-react`. |

---

## 3. TOP 5 PHÁT HIỆN KỸ THUẬT QUAN TRỌNG NHẤT (CRITICAL FINDINGS)

### Finding 1: Tính năng Rút tiền người bán (Seller Payout) bị khóa cứng tại Backend (CRITICAL - Contract Gap)
- **Thực tế Backend**: Theo quyết định kiến trúc [ADR-003](file:///ecommerce-taca/payment-wallet-service/docs/adr/ADR-003-payout-eligibility-phase-gating.md), use case `RequestPayoutUseCase` và endpoint `POST /api/v1/seller/payouts` cùng `GET /api/v1/seller/payouts` **không được nạp vào Spring Application Context** trong Phase 1. Backend hoàn toàn không có `SellerPayoutController.java`. Nếu FE gọi Live API, API Gateway/Backend trả về HTTP `404 Not Found`.
- **Thực tế Frontend**: Giao diện `apps/seller` đã triển khai hoàn chỉnh modal rút tiền `WithdrawModal.jsx`, form nhập OTP 2FA, nút "Rút tất cả", và service `sellerFinanceApi.requestPayout` gọi thẳng `POST /seller/payouts`.
- **Hệ quả**: Trong chế độ Mock Mode (`VITE_USE_MOCK=true`), hệ thống chạy trơn tru; nhưng khi kết nối backend thực, người bán bấm nút rút tiền sẽ lập tức gặp lỗi HTTP 404.

### Finding 2: Endpoint Tạo đợt quyết toán thủ công (Settlement Batch) không tồn tại trên Backend (HIGH - Architectural Gap)
- **Thực tế Backend**: Backend thiết kế cơ chế quyết toán doanh thu người bán là **tiến trình tự động định kỳ (Scheduled Job T+2)**, quét các đơn hàng đủ điều kiện chuyển từ `held_balance` sang `available_balance`. Backend chỉ cung cấp API xem danh sách `GET /admin/settlements`, xem chi tiết `GET /admin/settlements/{batchId}`, và thử lại lô lỗi `POST /admin/settlements/{batchId}/retry`. **Hoàn toàn không có `POST /admin/settlements/batch`**.
- **Thực tế Frontend**: Trang `AdminFinancePage.jsx` có nút "Tạo đợt quyết toán" và mở modal `CreateSettlementBatchModal.jsx`. Service `adminFinanceApi.createSettlementBatch` đã phải đặt đoạn code chặn lỗi: `throw new Error('Quyết toán sàn là tiến trình tự động định kỳ...')` nếu không ở Mock Mode.
- **Hệ quả**: Gây hiểu lầm nghiêm trọng cho đội ngũ vận hành tài chính (Finance Ops) khi tưởng rằng có thể kích hoạt quyết toán tùy ý theo ngày trên giao diện.

### Finding 3: Endpoint Xuất báo cáo doanh thu người bán chưa được triển khai ở Controller (MEDIUM - Incomplete BE)
- **Thực tế Backend**: File đặc tả `docs/api/payment-wallet-api.md` có định nghĩa endpoint `#7a: GET /api/v1/seller/revenue/export`. Tuy nhiên, trong mã nguồn `SellerRevenueController.java`, backend chỉ mới triển khai `GET /api/v1/seller/revenue`. Endpoint export trả về link download file `.xlsx`/`.csv` chưa có code.
- **Thực tế Frontend**: `FinancePage.jsx` có nút "Xuất báo cáo" gọi `sellerFinanceApi.exportRevenue`.
- **Hệ quả**: Khi tắt mock, tính năng xuất báo cáo của Seller gặp lỗi 404.

### Finding 4: Cơ chế bảo mật Internal Service Call giữa Order và Payment (HIGH - Security Governance)
- **Thực tế Backend**: Endpoint tạo giao dịch thanh toán `POST /api/v1/payments` được bảo vệ bởi `InternalCallerPolicy.requireOrderCommerce()`. Nghĩa là chỉ có service `order-commerce` (hoặc API Gateway với Token nội bộ) mới có quyền gọi để khởi tạo `payment_id`. Trình duyệt của Buyer không được phép gọi trực tiếp `POST /payments`.
- **Thực tế Frontend**: Phía `apps/buyer` đã tuân thủ chuẩn xác luồng này: Trong `CheckoutPage.jsx`, Buyer gọi `orderApi.createOrder()`, sau đó nhận về `payment_id` và mở `VnpayQrModal.jsx` để kiểm tra trạng thái bằng `GET /payments/{paymentId}`. Đây là điểm cộng kiến trúc rất lớn.

### Finding 5: Cơ chế xác thực 2FA Step-Up qua Header `X-MFA-Step-Up` (HIGH - Security Alignment)
- **Thực tế Backend**: Mọi thao tác làm thay đổi cấu hình tài chính hoặc tiền bạc (`PUT /admin/fees`, `PUT /admin/taxes`, `POST /admin/settlements/{id}/retry`) bắt buộc phải gửi kèm header `X-MFA-Step-Up` với mã OTP hoặc step-up token hợp lệ.
- **Thực tế Frontend**: Cả `adminFinanceApi.js` và `WithdrawModal.jsx` đều đã tích hợp tham số `stepUpToken` và đưa vào header `X-MFA-Step-Up`. Tuy nhiên, trang `AdminFeesTaxesPage.jsx` khi click nút "Duyệt" (`handleApproveRule`) hiện mới cập nhật state local mà chưa gọi qua modal nhập OTP 2FA để gửi API.

---

## 4. BẢNG THỐNG KÊ TÌNH TRẠNG 22 API ENDPOINTS HỆ THỐNG

| STT | Endpoint Backend | Method | Phân hệ | Trạng thái Backend | Tích hợp Frontend | Đánh giá tương thích |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `/api/v1/payments` | POST | Core Payment | **Đã triển khai** (Internal) | Gián tiếp qua Order API | **TƯƠNG THÍCH HOÀN TOÀN** |
| 2 | `/api/v1/payments/webhook` | POST | Core Payment | **Đã triển khai** (VNPAY IPN) | Backend Server-to-Server | **TƯƠNG THÍCH HOÀN TOÀN** |
| 3 | `/api/v1/payments/{paymentId}` | GET | Core Payment | **Đã triển khai** | `paymentApi.getPaymentStatus` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 4 | `/api/v1/payments/{paymentId}/refunds` | POST | Core Payment | **Đã triển khai** (Admin/Internal)| `adminFinanceApi.createRefund` | **TƯƠNG THÍCH** |
| 5 | `/api/v1/seller/wallet` | GET | Seller Wallet | **Đã triển khai** | `sellerFinanceApi.getWallet` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 6 | `/api/v1/seller/wallet/ledger` | GET | Seller Wallet | **Đã triển khai** | `sellerFinanceApi.getLedger` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 7 | `/api/v1/seller/revenue` | GET | Seller Revenue| **Đã triển khai** | `sellerFinanceApi.getRevenue` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 8 | `/api/v1/seller/revenue/export` | GET | Seller Revenue| **Chưa code Controller** | `sellerFinanceApi.exportRevenue`| **LỆCH CONTRACT (BE Thiếu)** |
| 9 | `/api/v1/seller/payouts` | POST | Seller Payout | **BỊ KHÓA (ADR-003 Gated)** | `sellerFinanceApi.requestPayout` | **XUNG ĐỘT NGHIỆP VỤ (BE 404)** |
| 10 | `/api/v1/seller/payouts` | GET | Seller Payout | **BỊ KHÓA (ADR-003 Gated)** | `sellerFinanceApi.getPayouts` | **XUNG ĐỘT NGHIỆP VỤ (BE 404)** |
| 11 | `/api/v1/admin/payments/reconciliation` | GET | Admin Finance | **Đã triển khai** | `adminFinanceApi.getPaymentReconciliation` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 12 | `/api/v1/admin/fees` | GET | Admin Config | **Đã triển khai** | `adminFinanceApi.getFees` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 13 | `/api/v1/admin/fees` | PUT | Admin Config | **Đã triển khai** (Cần 2FA) | `adminFinanceApi.updateFees` | **TƯƠNG THÍCH** |
| 14 | `/api/v1/admin/taxes` | GET | Admin Config | **Đã triển khai** | `adminFinanceApi.getTaxes` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 15 | `/api/v1/admin/taxes` | PUT | Admin Config | **Đã triển khai** (Cần 2FA) | `adminFinanceApi.updateTaxes` | **TƯƠNG THÍCH** |
| 16 | `/api/v1/admin/settlements` | GET | Admin Settle | **Đã triển khai** | `adminFinanceApi.getSettlements` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 17 | `/api/v1/admin/settlements/{batchId}` | GET | Admin Settle | **Đã triển khai** | `adminFinanceApi.getSettlementDetail` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 18 | `/api/v1/admin/settlements/batch` | POST | Admin Settle | **KHÔNG TỒN TẠI (Chạy Cron)** | FE có Modal thủ công | **SAI LỆCH THIẾT KẾ (FE Thừa)** |
| 19 | `/api/v1/admin/settlements/{batchId}/retry` | POST | Admin Settle | **Đã triển khai** (Cần 2FA) | `adminFinanceApi.retrySettlement` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 20 | `/api/v1/admin/finance/summary` | GET | Admin Report | **Đã triển khai** | `adminFinanceApi.getFinanceSummary` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 21 | `/api/v1/admin/finance/summary/export` | GET | Admin Report | **Đã triển khai** | `adminFinanceApi.exportFinanceSummary` | **TƯƠNG THÍCH HOÀN TOÀN** |
| 22 | `/actuator/health`, `/prometheus` | GET | Observability | **Đã triển khai** | Đội SRE / DevOps Dashboard | **CHUẨN SẢN XUẤT** |

---

## 5. KHUYẾN NGHỊ HÀNH ĐỘNG KHẨN CẤP (QUICK ACTION ROADMAP)

1. **Khắc phục ngay rủi ro Seller Payout (P0)**:
   - *Phương án A*: Giữ nguyên ADR-003 (Backend chưa mở tính năng rút tiền), Frontend `WithdrawModal.jsx` cần hiển thị thông báo rõ: "Tính năng rút tiền đang trong giai đoạn thử nghiệm đóng. Các yêu cầu rút tiền tự động chuyển sang chu kỳ định kỳ T+2".
   - *Phương án B*: Đội Backend mở bean `RequestPayoutUseCase` và tạo `SellerPayoutController.java` kết nối với cổng thanh toán ngân hàng (hoặc mock gateway) để đáp ứng trọn vẹn luồng FE.
2. **Loại bỏ / Thay đổi nút "Tạo đợt quyết toán" trên Admin UI (P1)**:
   - Chuyển `CreateSettlementBatchModal.jsx` thành màn hình "Cấu hình lịch chạy quyết toán tự động" (Cron Scheduler Config) hoặc nút "Kích hoạt chạy quyết toán ngay (Trigger On-Demand Reconciliation Job)" gọi vào endpoint quản trị chuyên biệt thay vì cố tạo batch thủ công.
3. **Bổ sung endpoint `GET /api/v1/seller/revenue/export` vào Backend (P1)**:
   - Cung cấp triển khai xuất file CSV/Excel cho người bán trong `SellerRevenueController.java`.
4. **Chuẩn hóa Flow 2FA Step-Up trên Admin UI (P2)**:
   - Kết nối modal xác thực 2FA vào nút Duyệt biểu phí trên `AdminFeesTaxesPage.jsx`.

---
*Báo cáo được thực hiện bởi Senior Full-stack Architect & Lead Auditor theo tiêu chuẩn kiểm toán kỹ thuật độc lập.*

