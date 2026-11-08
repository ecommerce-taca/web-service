# CHƯƠNG 8: MA TRẬN TRUY XUẤT NGUỒN GỐC TOÀN DIỆN (API–UI TRACEABILITY MATRIX)
## ÁNH XẠ XUYÊN SUỐT: NGHIỆP VỤ ➔ GIAO DIỆN ➔ API ➔ CONTROLLER ➔ SERVICE ➔ DATABASE

---

## 1. MÔ TẢ MA TRẬN TRUY XUẤT NGUỒN GỐC (TRACEABILITY ARCHITECTURE)

Ma trận truy xuất nguồn gốc (Traceability Matrix) là công cụ kiểm định tối cao chứng minh tính kết nối logic xuyên suốt từ yêu cầu nghiệp vụ (Business Requirement), thành phần giao diện (UI Component), phương thức gọi mạng (FE Service), định tuyến cổng (API Gateway), mã nguồn bộ điều khiển (BE Controller), ca sử dụng tầng ứng dụng (Application Use Case) cho đến bảng cơ sở dữ liệu vật lý (MySQL Database Tables).

Mọi chức năng bị đứt gãy tại bất kỳ mắt xích nào đều được gắn nhãn cảnh báo rõ ràng.

---

## 2. BẢNG MA TRẬN TRUY XUẤT NGUỒN GỐC 22 NGHIỆP VỤ CỐT LÕI

| Mã Req | Nghiệp vụ / Tính năng | Actor | FE Page & Component | Hàm API Frontend | Route API Gateway | BE Controller & Method | Use Case / Service BE | Bảng CSDL Liên quan | Trạng thái Kiểm toán |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **REQ-01** | Đặt hàng & Khởi tạo thanh toán | Buyer | `CheckoutPage.jsx` | `orderApi.createOrder()` | `POST /api/v1/orders` | `OrderController.create()` ➔ Gọi nội bộ `PaymentController.createPayment()` | `CreatePaymentUseCase` | `payments`, `payment_orders`, `idempotency_keys` | **PASSED (100%)** |
| **REQ-02** | Hiển thị mã QR & Polling trạng thái | Buyer | `VnpayQrModal.jsx` | `paymentApi.getPaymentStatus()` | `GET /api/v1/payments/{id}` | `PaymentController.getPayment()` | `GetPaymentStatusUseCase` | `payments` | **PASSED (100%)** |
| **REQ-03** | Nhận Webhook IPN từ VNPAY | System | N/A (Server-to-Server) | N/A | `POST /api/v1/payments/webhook`| `PaymentController.handleWebhook()`| `ProcessPaymentWebhookUseCase`| `payments`, `ledger_postings`, `outbox_messages` | **PASSED (100%)** |
| **REQ-04** | Hoàn tiền đơn hàng hủy / trả hàng | Admin | `OrderRefundModal.jsx` | `adminFinanceApi.createRefund()`| `POST /api/v1/payments/{id}/refunds`| `PaymentController.createRefund()` | `ProcessRefundUseCase` | `refunds`, `ledger_entries`, `payments` | **PASSED (100%)** |
| **REQ-05** | Xem số dư ví doanh thu shop | Seller | `FinancePage.jsx` | `sellerFinanceApi.getWallet()` | `GET /api/v1/seller/wallet` | `SellerWalletController.getWallet()` | `GetSellerWalletUseCase` | `wallets` | **PASSED (100%)** |
| **REQ-06** | Xem biểu đồ & chỉ số doanh thu | Seller | `FinancePage.jsx` | `sellerFinanceApi.getRevenue()`| `GET /api/v1/seller/revenue` | `SellerRevenueController.getRevenue()`| `GetSellerRevenueUseCase` | `ledger_entries`, `payment_allocations` | **PASSED (100%)** |
| **REQ-07** | Xuất báo cáo doanh thu Excel | Seller | `FinancePage.jsx` | `sellerFinanceApi.exportRevenue()`| `GET /api/v1/seller/revenue/export`| **CHƯA CÓ CONTROLLER** | **CHƯA TRIỂN KHAI** | `ledger_entries` | **MISSING_BE (Lệch contract)** |
| **REQ-08** | Xem sao kê sổ cái biến động ví | Seller | `FinancePage.jsx` | `sellerFinanceApi.getLedger()` | `GET /api/v1/seller/wallet/ledger`| `SellerLedgerController.getLedger()`| `GetSellerLedgerUseCase` | `ledger_entries`, `ledger_postings` | **PASSED (100%)** |
| **REQ-09** | Gửi yêu cầu rút tiền về ngân hàng | Seller | `WithdrawModal.jsx` | `sellerFinanceApi.requestPayout()`| `POST /api/v1/seller/payouts` | **BỊ KHÓA (ADR-003)** | `RequestPayoutUseCase` (Disabled) | `payouts`, `wallets` | **BLOCKED (Gated 404)** |
| **REQ-10** | Xem lịch sử các lần rút tiền | Seller | `FinancePage.jsx` | `sellerFinanceApi.getPayouts()` | `GET /api/v1/seller/payouts` | **BỊ KHÓA (ADR-003)** | `GetPayoutsUseCase` (Disabled) | `payouts` | **BLOCKED (Gated 404)** |
| **REQ-11** | Đối soát giao dịch sàn và VNPAY | Admin | `AdminFinancePage.jsx` | `adminFinanceApi.getPaymentReconciliation()`| `GET /api/v1/admin/payments/reconciliation`| `AdminPaymentReconciliationController.get()`| `ReconcilePaymentsUseCase`| `payments`, `reconciliation_logs` | **PASSED (100%)** |
| **REQ-12** | Xem danh sách phiên bản biểu phí | Admin | `AdminFeesTaxesPage.jsx` | `adminFinanceApi.getFees()` | `GET /api/v1/admin/fees` | `AdminFeeController.getFees()` | `GetFeeConfigsUseCase` | `fee_configs` | **PASSED (100%)** |
| **REQ-13** | Cập nhật version biểu phí (2FA) | Admin | `CreateFeeRuleModal.jsx` | `adminFinanceApi.updateFees()` | `PUT /api/v1/admin/fees` | `AdminFeeController.updateFees()` | `UpdateFeeConfigUseCase` | `fee_configs` | **PASSED (100%)** |
| **REQ-14** | Xem cấu hình thuế GTGT Thông tư 40 | Admin | `AdminFeesTaxesPage.jsx` | `adminFinanceApi.getTaxes()` | `GET /api/v1/admin/taxes` | `AdminTaxController.getTaxes()` | `GetTaxConfigsUseCase` | `tax_configs` | **PASSED (100%)** |
| **REQ-15** | Cập nhật cấu hình thuế GTGT (2FA) | Admin | `AdminFeesTaxesPage.jsx` | `adminFinanceApi.updateTaxes()` | `PUT /api/v1/admin/taxes` | `AdminTaxController.updateTaxes()` | `UpdateTaxConfigUseCase` | `tax_configs` | **PASSED (100%)** |
| **REQ-16** | Xem danh sách đợt quyết toán T+2 | Admin | `AdminFinancePage.jsx` | `adminFinanceApi.getSettlements()`| `GET /api/v1/admin/settlements` | `AdminSettlementController.list()` | `ListSettlementsUseCase` | `settlement_batches` | **PASSED (100%)** |
| **REQ-17** | Xem chi tiết giải ngân từng Shop | Admin | `SettlementBatchDetailModal.jsx` | `adminFinanceApi.getSettlementDetail()`| `GET /api/v1/admin/settlements/{id}`| `AdminSettlementController.detail()`| `GetSettlementDetailUseCase`| `settlement_items`, `wallets` | **PASSED (100%)** |
| **REQ-18** | Tạo đợt quyết toán thủ công | Admin | `CreateSettlementBatchModal.jsx` | `adminFinanceApi.createSettlementBatch()`| `POST /api/v1/admin/settlements/batch`| **KHÔNG TỒN TẠI TRÊN BE** | **CHẠY TỰ ĐỘNG CRON JOB** | `settlement_batches` | **DISCREPANCY (FE Thừa)** |
| **REQ-19** | Thử lại đợt quyết toán bị lỗi (2FA)| Admin | `SettlementBatchDetailModal.jsx` | `adminFinanceApi.retrySettlement()`| `POST /api/v1/admin/settlements/{id}/retry`| `AdminSettlementController.retry()`| `RetrySettlementUseCase` | `settlement_batches`, `outbox_messages` | **PASSED (100%)** |
| **REQ-20** | Xem báo cáo tài chính toàn sàn | Admin | `AdminFinancePage.jsx` | `adminFinanceApi.getFinanceSummary()`| `GET /api/v1/admin/finance/summary`| `AdminFinanceSummaryController.get()`| `GetPlatformFinanceSummaryUseCase`| `ledger_entries`, `payments` | **PASSED (100%)** |
| **REQ-21** | Xuất báo cáo tài chính toàn sàn | Admin | `AdminFinancePage.jsx` | `adminFinanceApi.exportFinanceSummary()`| `GET /api/v1/admin/finance/summary/export`| `AdminFinanceSummaryController.export()`| `ExportFinanceSummaryUseCase`| `ledger_entries` | **PASSED (100%)** |
| **REQ-22** | Tiến trình quyết toán tự động T+2| System | N/A (Background Cron) | N/A | N/A (Nội bộ Backend) | `ScheduledSettlementJob.execute()`| `SettleShopRevenueUseCase` | `wallets`, `ledger_entries`, `outbox_messages` | **PASSED (100%)** |

---

## 3. THỐNG KÊ KẾT QUẢ KIỂM ĐỊNH TRUY XUẤT NGUỒN GỐC

- **Tổng số nghiệp vụ rà soát**: 22 nghiệp vụ.
- **PASSED (Thông suốt từ FE đến DB)**: **17 / 22** (Đạt tỷ lệ **77.3%**).
- **BLOCKED (Gated theo chính sách kiến trúc ADR-003)**: **2 / 22** (REQ-09, REQ-10 liên quan đến Rút tiền Người bán).
- **MISSING_BE (Thiếu mã nguồn Controller phía Backend)**: **1 / 22** (REQ-07 Xuất báo cáo doanh thu Seller).
- **DISCREPANCY (Sai lệch thiết kế - FE xây thừa modal thủ công)**: **1 / 22** (REQ-18 Tạo đợt quyết toán thủ công).
- **AUTOMATED_SYSTEM (Nghiệp vụ nền tự động)**: **1 / 22** (REQ-22 Cron Job T+2).

---

## 4. KẾT LUẬN VỀ TÍNH TRUY XUẤT NGUỒN GỐC
Hệ thống thể hiện mức độ liên kết mã nguồn rất cao ở các phân hệ cốt lõi (Thanh toán đơn hàng, Đối soát VNPAY, Quản lý ví, Sổ cái kế toán và Cấu hình biểu phí). Việc phát hiện chính xác 4 điểm lệch pha thông qua ma trận truy xuất này cung cấp cơ sở dữ liệu quan trọng để đội ngũ kỹ thuật xử lý dứt điểm trước khi nghiệm thu sản phẩm.

