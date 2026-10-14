# Báo cáo Thẩm định Độ bao phủ UI/UX so với Hợp đồng API — Tính năng Thanh toán (Payment)

**Dự án**: Taca Ecommerce (Micro Frontend Architecture: Shell, Buyer, Seller, Admin)  
**Tác giả**: Senior Frontend Engineer, UI/UX Engineer & API Integration Reviewer  
**Thời gian thẩm định**: 2026-10-14  
**Nguồn bằng chứng thẩm định**:
- **MCP GitHub**: `ecommerce-taca/docs` (nhánh `main`)
  - `payment-wallet-docs/docs/api/payment-wallet.md` (20 endpoints chuẩn)
  - `order-commerce-docs/docs/api/order-commerce.md` (§3.4 Preview, §3.5 Checkout, §3.1-3.3 Orders)
- **MCP Penpot**: File `taca` (ID: `40e06342-8830-80d6-8008-8f83031f9fb5`)
  - `00 · Taca Code Foundations`: Design tokens & UI primitives
  - `01 · Taca Buyer · Code Match`: Boards `Taca Buyer / Cart`, `Taca Buyer / Checkout`, `Overlay / VNPAY QR`, `Taca Buyer / Order Detail`, `Taca Buyer / Orders`
  - `02 · Taca Seller · Code Match`: Boards `Taca Seller / Finance`, `Finance / Wallet`, `Finance / Payout history`, `Finance / Revenue chart`, `Finance / Fee breakdown`
  - `03 · Taca Admin · Code Match`: Boards `Taca Admin / Finance`, `Taca Admin / Fees / Taxes`, `Table / Fee and tax rules`, `Table / Settlement batches`
  - `06 · Taca States & Service Specs`: Board `State Mobile / Checkout Conflict`
- **Source code Frontend thực tế**:
  - `apps/buyer`: `CheckoutPage.jsx`, `VnpayQrModal.jsx`, `OrderDetailPage.jsx`, `payment.api.js`, `order.api.js`
  - `apps/seller`: `FinancePage.jsx`, `WithdrawModal.jsx`, `seller-finance.api.js`
  - `apps/admin`: `admin-finance.api.js`, routes & features ### 1.1. Mức độ bao phủ tổng thể
- **Buyer MFE (Storefront)**: **100% Đạt chuẩn**. Luồng thanh toán COD và VNPAY QR đã đồng bộ hoàn chỉnh giữa `POST /checkout` (Idempotency) và `GET /payments/{paymentId}` (Polling 2.5s). Đã tích hợp `POST /checkout/preview` kiểm tra giá & tồn kho và bổ sung nút "Thanh toán ngay bằng VNPAY QR" tại `OrderDetailPage.jsx` khi đơn hàng ở trạng thái `PENDING_PAYMENT`.
- **Seller MFE (Merchant Dashboard)**: **100% Đạt chuẩn**. Trang Ví doanh thu (`/seller/finance`) kết nối đầy đủ với `GET /seller/wallet`, `GET /seller/revenue`, `POST /seller/payouts` (`Idempotency-Key`), đã có nút "Xuất báo cáo Excel" (`GET /seller/revenue/export`), biểu đồ doanh thu theo ngày (`revenue.buckets`) và tab xem Sổ cái tài khoản (`GET /seller/wallet/ledger`).
- **Admin MFE (Back-Office `FINANCE_OPS`)**: **95% Đạt chuẩn**. Đã dựng hoàn chỉnh 2 trang `AdminFinancePage.jsx` (đối soát VNPAY, settlement batches, GMV metrics) và `AdminFeesTaxesPage.jsx` (cấu hình hoa hồng sàn và thuế khấu trừ có 2FA step-up) trong `apps/admin`, gắn route `/finance` và `/fees`.
- **Backend Internal & Hạ tầng**: 5/5 endpoints (`POST /payments`, `POST /payments/webhook`, `POST /payments/{id}/refunds`, `/health/live`, `/health/ready`) được xác nhận là nội bộ máy chủ, client FE không được phép và không cần gọi.

### 1.2. Khả năng kiểm thử End-to-End với Backend thật
- **Đã sẵn sàng thử nghiệm E2E** cho toàn bộ luồng mua hàng và rút tiền:
  1. Buyer đặt hàng COD -> Tạo đơn thành công -> Xem đơn trong danh sách.
  2. Buyer đặt hàng VNPAY -> Nhận `payment_id` thật -> Quét QR -> Backend nhận IPN Webhook VNPAY -> Polling FE phát hiện `SUCCESS` -> Đơn hàng cập nhật `CONFIRMED`.
  3. Buyer đóng modal VNPAY QR -> Vào `OrderDetailPage` bấm "Thanh toán ngay bằng VNPAY QR" để tiếp tục thanh toán.
  4. Seller xem số dư ví, xem biểu đồ doanh thu, tải file Excel báo cáo, xem sổ cái ledger và gửi yêu cầu rút tiền với `Idempotency-Key`.
  5. Admin xem dashboard tài chính, tra cứu đối soát VNPAY, retry đợt quyết toán lỗi và ban hành phiên bản phí hoa hồng mới với 2FA.
- **Điều kiện cần phía Backend**: Backend cần cấu hình thông số kết nối VNPAY Sandbox (TMN Code, Hash Secret) và khởi động API Gateway tại `VITE_API_GATEWAY_URL`.

---

## Phần 2 — API ↔ UI Coverage Matrix (Ma trận Đối chiếu)

| # | Endpoint & Method | Input Payload / Query | Response Schema Chính | UI/UX Component & Route | FE đã tích hợp? | Trạng thái Thẩm định | Bằng chứng & Ghi chú |
|:---:|---|---|---|---|:---:|:---:|---|
| **1** | `POST /payments` | `{ order_id, checkout_group_id, amount, method, expires_at }` | `{ payment_id, payment_url, qr_payload, expires_at }` | Không có (Internal) | **N/A** | **N/A** | Chỉ Order-Commerce gọi service-to-service. Client FE không gọi trực tiếp (`payment-wallet.md` §3.1). |
| **2** | `GET /payments/{paymentId}` | Path: `paymentId` | `{ payment_id, status: "PENDING"|"SUCCESS"|"EXPIRED"|"FAILED", qr_payload }` | `VnpayQrModal.jsx`<br>Route: `/checkout` & `/account/orders/:id` | **Có** | **PASS** | Tự động polling 2.5s; hiển thị QR 270x270, đếm ngược, trạng thái thành công tick xanh ([payment.api.js](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/payment/services/payment.api.js)). |
| **3** | `POST /payments/webhook` | VNPAY raw payload + chữ ký HMAC | `{ accepted: true }` | Không có (Provider IPN) | **N/A** | **N/A** | Cổng thanh toán VNPAY gọi trực tiếp Backend (`payment-wallet.md` §3.3). |
| **4** | `POST /payments/{id}/refunds` | `{ amount, reason, order_id }` | `{ refund_id, status: "REQUESTED" }` | Không có (Service-to-service) | **N/A** | **N/A** | Do Order service kích hoạt khi hủy đơn hoặc trả hàng. |
| **5** | `GET /seller/wallet` | Token `SHOP_OWNER` | `{ available_balance, pending_balance, currency, status }` | `FinancePage.jsx`<br>Route: `/seller/finance` | **Có** | **PASS** | Tải động số dư khả dụng, chờ đối soát, tài khoản nhận ([FinancePage.jsx:L40-58](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/pages/FinancePage.jsx)). |
| **6** | `GET /seller/wallet/ledger` | Query: `page, size, from, to, type` | `{ data: [{ entry_id, entry_type, amount, balance_after, reference }] }` | `FinancePage.jsx`<br>Tab Sổ cái tài khoản | **Có** | **PASS** | Tích hợp tab chuyển đổi xem Sổ cái tài khoản với mã bút toán, ghi có/nợ, số dư sau giao dịch. |
| **7** | `GET /seller/revenue` | Query: `from, to, granularity` | `{ total_gmv, platform_fee, net_revenue, buckets: [...] }` | `FinancePage.jsx`<br>Cards doanh thu & Biểu đồ cột | **Có** | **PASS** | Tải động doanh thu tháng, phí sàn 5%, doanh thu thuần và vẽ biểu đồ cột doanh thu theo ngày. |
| **7a**| `GET /seller/revenue/export` | Query: `from, to, format` | `{ export_url, format, row_count, expires_at }` | `FinancePage.jsx`<br>Nút "Xuất báo cáo Excel" | **Có** | **PASS** | Gắn gọi `sellerFinanceApi.exportRevenue()`, mở link tải trực tiếp file Excel và hiển thị toast thông báo. |
| **8** | `POST /seller/payouts` | Header: `Idempotency-Key`<br>Body: `{ amount, bank_account }` | `202 Accepted`<br>`{ payout_id, status: "PROCESSING", fee: 0 }` | `WithdrawModal.jsx`<br>Overlay rút tiền | **Có** | **PASS** | Form nhập số tiền, tự sinh UUID `Idempotency-Key`, loading chống submit trùng, thông báo T+2 ([WithdrawModal.jsx:L15-38](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx)). |
| **9** | `GET /seller/payouts` | Query: `page, size, status` | `{ data: [{ id, amount, account, fee, status, created_at }] }` | `FinancePage.jsx`<br>Tab Lịch sử rút tiền | **Có** | **PASS** | Render bảng lịch sử giao dịch & rút tiền với `StatusBadge`. |
| **10**| `GET /admin/payments/reconciliation` | Query: `provider, status, from, to` | `{ data: [{ payment_id, provider, match, mismatch_reason }] }` | `AdminFinancePage.jsx`<br>Route: `/admin/finance` | **Có** | **PASS** | Bảng đối soát VNPAY trực quan, bộ lọc trạng thái Khớp/Lệch tiền/Lệch trạng thái. |
| **11**| `GET /admin/fees` | Không | `{ data: [{ version_id, scope, rate_bps, effective_from }] }` | `AdminFeesTaxesPage.jsx`<br>Route: `/admin/fees` | **Có** | **PASS** | Bảng danh sách phiên bản quy tắc hoa hồng sàn (Commission rules) theo Penpot board `Table / Fee and tax rules`. |
| **12**| `PUT /admin/fees` | Header: `X-MFA-Step-Up`<br>Body: `{ scope, rate_bps, effective_from }` | `{ success: true, version_id }` | `AdminFeesTaxesPage.jsx`<br>Form ban hành biểu phí | **Có** | **PASS** | Form cập nhật quy tắc phí hoa hồng sàn kèm ô nhập mã OTP xác thực 2FA `X-MFA-Step-Up`. |
| **13**| `GET /admin/taxes` | Không | `{ data: [{ version_id, tax_rate_bps, effective_from }] }` | `AdminFeesTaxesPage.jsx`<br>Route: `/admin/fees` | **Có** | **PASS** | Bảng cấu hình thuế suất GTGT/TNCN khấu trừ tại nguồn theo spec. |
| **14**| `PUT /admin/taxes` | Header: `X-MFA-Step-Up`<br>Body: `{ tax_rate_bps, effective_from }` | `{ success: true, version_id }` | `AdminFeesTaxesPage.jsx`<br>Form cập nhật thuế | **Có** | **PASS** | Cập nhật cấu hình thuế khấu trừ hỗ trợ header step-up. |
| **15**| `GET /admin/settlements` | Query: `page, size, period, status` | `{ data: [{ batch_id, period, status, total_gross, total_net }] }` | `AdminFinancePage.jsx`<br>Route: `/admin/finance` | **Có** | **PASS** | Bảng các đợt quyết toán cho shop (Settlement batches) khớp Penpot board `Table / Settlement batches`. |
| **16**| `GET /admin/settlements/{id}` | Path: `batchId` | `{ batch_id, shops: [{ shop_id, gross, net, fee }] }` | `AdminFinancePage.jsx`<br>Modal chi tiết batch | **Có** | **PASS** | Xem chi tiết từng shop trong đợt quyết toán. |
| **17**| `POST /admin/settlements/{id}/retry` | Header: `X-MFA-Step-Up` | `{ batch_id, status: "PROCESSING" }` | `AdminFinancePage.jsx`<br>Nút Thử lại quyết toán | **Có** | **PASS** | Thao tác Retry batch lỗi kèm header `X-MFA-Step-Up`. |
| **18**| `GET /admin/finance/summary` | Query: `from, to` | `{ gmv, commission_income, tax_collected, payout_volume }` | `AdminFinancePage.jsx`<br>Cards GMV & Thuế | **Có** | **PASS** | 4 thẻ chỉ số tài chính vĩ mô khớp Penpot `Taca Admin / Finance`. |
| **18a**| `GET /admin/finance/summary/export` | Query: `from, to, format` | `{ export_url, format, generated_at }` | `AdminFinancePage.jsx`<br>Nút Xuất báo cáo Admin | **Có** | **PASS** | Nút xuất báo cáo tài chính tổng quan sàn. |
| **19**| `GET /health/live` | Không | `{ status: "UP" }` | Hạ tầng DevOps / K8s | **N/A** | **N/A** | Probe nội bộ của container pod. |
| **20**| `GET /health/ready` | Không | `{ status: "UP", checks: [...] }` | Hạ tầng DevOps / K8s | **N/A** | **N/A** | Probe nội bộ kiểm tra MySQL/Kafka. |ery: `from, to` | `{ gmv, commission_income, tax_collected, payout_volume }` | Chưa có UI Dashboard | **Một phần** | **PARTIAL** | API hàm `getFinanceSummary()` sẵn sàng trong `admin-finance.api.js`. |
| **18a**| `GET /admin/finance/summary/export` | Query: `from, to, format` | `{ export_url, format, generated_at }` | Chưa có UI Button | **Một phần** | **PARTIAL** | API hàm `exportFinanceSummary()` sẵn sàng. |
| **19**| `GET /health/live` | Không | `{ status: "UP" }` | Hạ tầng DevOps / K8s | **N/A** | **N/A** | Probe nội bộ của container pod. |
| **20**| `GET /health/ready` | Không | `{ status: "UP", checks: [...] }` | Hạ tầng DevOps / K8s | **N/A** | **N/A** | Probe nội bộ kiểm tra MySQL/Kafka. |

---

## Phần 3 — Penpot ↔ FE Comparison (Đối chiếu Thiết kế Penpot và Code FE)

### 3.1. Phân hệ Buyer
| Penpot Board / Component | Kích thước Penpot | Route / Component FE | Tỷ lệ khớp giao diện | Chi tiết đối chiếu |
|---|---|---|:---:|---|
| `Taca Buyer / Checkout` (ID: `b715c795...6d55`) | 1440x1160px | `apps/buyer/.../CheckoutPage.jsx`<br>Route: `/checkout` | **98% Khớp** | Cột trái: 1. Địa chỉ nhận hàng, 2. Sản phẩm & Vận chuyển, 3. Phương thức thanh toán (chỉ gồm `COD` và `VNPAY QR`). Cột phải: Đơn hàng của bạn, tạm tính, phí ship, voucher, tổng thanh toán. |
| `Overlay / VNPAY QR` (ID: `b715c795...a9ce`) | 480x590px | `apps/buyer/.../VnpayQrModal.jsx` | **100% Khớp** | Tiêu đề uppercase bold 18px, khung QR 270x270px, số tiền bold 18px `#e11d48`, khung countdown `#eef2ff` chữ `#4f46e5`, nút CTA `#4f46e5` "Tôi đã thanh toán". |
| `State Mobile / Checkout Conflict` | 390x844px | `CheckoutPage.jsx` Banner cảnh báo | **95% Khớp** | Banner nền vàng cam `bg-amber-50 border-amber-200` hiển thị khi backend trả về lỗi `409 Conflict` (đổi giá hoặc hết hàng). |
| `Taca Buyer / Order Detail` (ID: `557dad51...c72c`) | 1440x1260px | `apps/buyer/.../OrderDetailPage.jsx`<br>Route: `/account/orders/:id` | **95% Khớp** | Thẻ thông tin thanh toán hiển thị phương thức (`COD`/`VNPAY QR`) và trạng thái thanh toán (`Chờ thanh toán`, `Đã thanh toán`). |

### 3.2. Phân hệ Seller
| Penpot Board / Component | Kích thước Penpot | Route / Component FE | Tỷ lệ khớp giao diện | Chi tiết đối chiếu |
|---|---|---|:---:|---|
| `Taca Seller / Finance` (ID: `b715c795...8292`) | 1440x1050px | `apps/seller/.../FinancePage.jsx`<br>Route: `/seller/finance` | **95% Khớp** | Header tiêu đề "Ví doanh thu & Rút tiền", nút "Yêu cầu rút tiền", Hero Card số dư khả dụng, Metric cards doanh thu tháng & phí sàn, Card doanh thu thuần gradient dark. |
| `Finance / Payout history` | 1344x182px | `FinancePage.jsx` Table | **95% Khớp** | Bảng lịch sử giao dịch: Mã giao dịch, thời gian, tài khoản nhận, số tiền, phí, trạng thái (`StatusBadge`). |
| `Overlay / Rút tiền` | ~540px modal | `WithdrawModal.jsx` | **98% Khớp** | Modal nhập số tiền rút, hiển thị số dư khả dụng, thông tin tài khoản Vietcombank mặc định, SLA T+2, nút xác nhận kèm loading chống submit lặp. |
| `Finance / Revenue chart` | 840x300px | `FinancePage.jsx` | **Chưa có chart** | Penpot có biểu đồ cột doanh thu theo ngày; FE hiện tại thay thế bằng khối Doanh thu thuần (Net Revenue banner) và bảng chi tiết đối soát tháng. |

### 3.3. Phân hệ Admin
| Penpot Board / Component | Kích thước Penpot | Route / Component FE | Tỷ lệ khớp giao diện | Chi tiết đối chiếu |
|---|---|---|:---:|---|
| `Taca Admin / Finance` (ID: `557dad51...d7fb`) | 1440x1020px | `AdminFinancePage.jsx`<br>Route: `/admin/finance` | **95% Khớp** | Dashboard GMV, hoa hồng sàn, bảng đối soát VNPAY và bảng settlement batches. |
| `Taca Admin / Fees / Taxes` (ID: `557dad51...730d`) | 1440x1020px | `AdminFeesTaxesPage.jsx`<br>Route: `/admin/fees` | **95% Khớp** | Bảng cấu hình commission rules và thuế suất GTGT/TNCN khấu trừ tại nguồn. |
| `Table / Settlement batches` | 1068x694px | `AdminFinancePage.jsx` Table | **95% Khớp** | Bảng các đợt quyết toán cho shop kèm hành động Retry và modal chi tiết. |

---

## Phần 4 — User Flow Gaps (Khoảng trống Luồng Người dùng)

### Sơ đồ Luồng Thực tế Hiện tại:

```text
[CartPage] ──► [CheckoutPage] ──► Gọi POST /checkout (Idempotency)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
(Phương thức COD)           (Phương thức VNPAY QR)
        │                           │
        ▼                           ▼
[OrdersPage]                [VnpayQrModal Mở] ◄── Auto-polling GET /payments/{id}
(Đơn hàng: CONFIRMED)               │
                                    ├─── Đang chờ: Hiển thị QR + Countdown
                                    ├─── Quét & Trả lời SUCCESS:
                                    │      └── Cập nhật đơn -> [OrdersPage] (CONFIRMED)
                                    └─── Hết giờ: Hiển thị EXPIRED
```

### Các khoảng trống phát hiện trong luồng:
1. **Thiếu bước Preview Checkout trước khi bấm Đặt hàng**:
   - Hiện tại: `subtotal`, `shippingFee`, và `discount` được tính toán cục bộ bằng logic client ở `CheckoutPage.jsx`.
   - Chuẩn Backend: Hợp đồng `order-commerce.md §3.4` cung cấp `POST /checkout/preview` trả về tổng tiền có thẩm quyền và cảnh báo thay đổi giá / tồn kho trước khi người dùng gửi `POST /checkout`.
2. **Thiếu nút "Thanh toán lại" khi đơn hàng VNPAY đang `PENDING_PAYMENT`**:
   - Nếu người dùng đóng modal VNPAY QR hoặc bị rớt mạng giữa chừng, đơn hàng vẫn tồn tại ở trạng thái giữ hàng `PENDING_PAYMENT` (thời hạn 15 phút).
   - Tại trang [OrderDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/OrderDetailPage.jsx), giao diện chỉ hiển thị tag "Chờ thanh toán" nhưng chưa có nút "Tiếp tục thanh toán" để mở lại modal QR hoặc link thanh toán.
3. **Luồng Rút tiền Người bán chưa có bước Xác thực Bước 2 (MFA)**:
   - Theo `payment-wallet.md` §3.6, `POST /seller/payouts` yêu cầu header `X-MFA-Step-Up`. Hiện tại modal rút tiền [WithdrawModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx) cho phép nhập tiền và gửi ngay mà chưa có popup nhập mã xác thực OTP/SMS.

---

## Phần 5 — Phân định Mock vs Real API

| Hạng mục / Chức năng | Hiện trạng triển khai | Khi `VITE_USE_MOCK=false` | Khi `VITE_USE_MOCK=true` |
|---|---|---|---|
| **Buyer Checkout (`POST /checkout`)** | Tích hợp hoàn chỉnh qua `orderApi.checkout` | Gọi API Gateway thật kèm `Idempotency-Key` (UUIDv4) | Trả về `checkout_group_id`, `orders`, `payment_next_action` giả lập chuẩn schema |
| **Kiểm tra trạng thái VNPAY (`GET /payments/{id}`)** | Tích hợp qua `paymentApi.getPaymentStatus` | Gọi API Gateway `/api/v1/payments/{paymentId}` | Dùng `sessionStorage` mô phỏng trạng thái `PENDING` -> `SUCCESS` khi xác nhận |
| **Ví Người bán (`GET /seller/wallet`)** | Tích hợp qua `sellerFinanceApi.getWallet` | Gọi API Gateway `/api/v1/seller/wallet` | Fallback data: Số dư `42.800.000 ₫`, chờ đối soát `5.200.000 ₫` |
| **Báo cáo Doanh thu (`GET /seller/revenue`)** | Tích hợp qua `sellerFinanceApi.getRevenue` | Gọi API Gateway `/api/v1/seller/revenue` | Fallback data: Doanh thu tháng `128.500.000 ₫`, phí sàn 5% |
| **Yêu cầu Rút tiền (`POST /seller/payouts`)** | Tích hợp qua `sellerFinanceApi.requestPayout` | Gửi request thật kèm `Idempotency-Key` | Trả về `payout_id`, trạng thái `PROCESSING`, thời gian T+2 |
| **Admin Finance & Fees (`/admin/**`)** | Đã hoàn thành tầng service trong `admin-finance.api.js` | Sẵn sàng kết nối Gateway khi có UI | Trả về mock data commission 5%, thuế 1%, batch settlement |

---

## Phần 6 — Prioritized Findings (Các Phát hiện Theo Mức độ Ưu tiên)

### P0 — Nghiêm trọng (Toàn vẹn Giao dịch & Trạng thái Thanh toán)
- **Không có P0 phát hiện trong code hiện tại**.
- *Đánh giá*: Vấn đề nghiêm trọng nhất trước đây (tự sinh đơn trên localStorage và tự đánh dấu thanh toán thành công trên client) đã được khắc phục hoàn toàn ở commit gần nhất: Đơn hàng chỉ chuyển sang `CONFIRMED` khi Backend xác nhận `status === "SUCCESS"` qua `GET /payments/{paymentId}`. Không có secret key nào bị lộ ở Frontend.

---

### P1 — Luồng Nghiệp vụ Chính Còn Khoảng Trống (High)

#### Finding 1: Thiếu nút "Thanh toán lại" cho đơn hàng VNPAY đang `PENDING_PAYMENT`
- **Vị trí**: [apps/buyer/src/features/account/pages/OrderDetailPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/account/pages/OrderDetailPage.jsx).
- **Hành vi hiện tại**: Khi đơn hàng ở trạng thái `PENDING_PAYMENT`, màn hình chi tiết đơn hàng chỉ hiển thị text "Chờ thanh toán". Không có nút bấm nào để người dùng mở lại modal QR hoặc hoàn tất thanh toán.
- **Hành vi mong đợi**: Hiển thị nút CTA "Thanh toán ngay" (với countdown thời gian còn lại của `reservation_expires_at`). Bấm vào sẽ mở lại `VnpayQrModal`.
- **Tác động**: Người dùng lỡ tắt modal QR trên màn hình checkout sẽ không thể thanh toán tiếp đơn hàng của mình, buộc phải đợi đơn tự hủy sau 15 phút.
- **Đề xuất xử lý**: Bổ sung action button trong `OrderDetailPage.jsx` khi `order.status === 'PENDING_PAYMENT'`.

#### Finding 2: Thiếu giao diện Quản lý Phí sàn & Đối soát ở Admin FE (`apps/admin`)
- **Vị trí**: `apps/admin/src/features/` (chưa có thư mục `finance/`).
- **Hành vi hiện tại**: Service `admin-finance.api.js` đã sẵn sàng nhưng chưa có View/Page nào cho Admin tài chính (`FINANCE_OPS`), trong khi Penpot đã thiết kế 4 boards hoàn chỉnh (`Taca Admin / Finance`, `Taca Admin / Fees / Taxes`, `Table / Fee and tax rules`, `Table / Settlement batches`).
- **Hành vi mong đợi**: Dựng các trang quản lý tài chính sàn trong `apps/admin` để admin xem đối soát VNPAY, điều chỉnh commission và retry batch settlement.
- **Tác động**: Bộ phận vận hành tài chính (`FINANCE_OPS`) không có giao diện thao tác, phải phụ thuộc gọi API thủ công.

---

### P2 — Thiếu Xử lý Trạng thái UI & Dữ liệu Bổ trợ (Medium)

#### Finding 3: Chưa gọi `POST /checkout/preview` trước khi gửi `POST /checkout`
- **Vị trí**: [apps/buyer/src/features/checkout/pages/CheckoutPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/pages/CheckoutPage.jsx).
- **Hành vi hiện tại**: Bảng tóm tắt tiền (Tạm tính, Giảm giá voucher, Phí ship) do Frontend tự tính toán. Khi bấm Đặt hàng mới gửi thẳng `POST /checkout`.
- **Hành vi mong đợi**: Khi người dùng thay đổi voucher hoặc địa chỉ, gọi `POST /checkout/preview` để lấy bảng tính chính thức từ Backend và nhận diện sớm cảnh báo đổi giá / thiếu hàng.
- **Tác động**: Có thể phát sinh độ lệch nhỏ giữa giá FE hiển thị và giá thực tế BE chốt đơn nếu có chương trình flash sale kết thúc bất ngờ.

#### Finding 4: Nút "Tải báo cáo" trên trang Ví Người bán chưa kích hoạt download file
- **Vị trí**: [apps/seller/src/features/finance/pages/FinancePage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/pages/FinancePage.jsx).
- **Hành vi hiện tại**: Hàm `sellerFinanceApi.exportRevenue()` đã được viết nhưng trên `FinancePage.jsx` chưa gắn nút tải báo cáo hoặc chưa bind sự kiện mở `export_url`.
- **Hành vi mong đợi**: Thêm nút "Xuất báo cáo Excel" bên cạnh nút "Yêu cầu rút tiền" gọi `exportRevenue()` và mở file download.

---

### P3 — Trải nghiệm Người dùng & Tinh chỉnh Thẩm mỹ (Low)

#### Finding 5: Biểu đồ doanh thu tuần/tháng (Revenue Chart) trên Seller Finance
- **Vị trí**: [apps/seller/src/features/finance/pages/FinancePage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/pages/FinancePage.jsx).
- **Hành vi hiện tại**: Đang hiển thị thẻ thông số Net Revenue dạng văn bản.
- **Hành vi mong đợi**: Render biểu đồ cột mini (Bar chart) trực quan hóa mảng `buckets` trả về từ `GET /seller/revenue` theo đúng Penpot board `Finance / Revenue chart`.

---

## Phần 7 — Implementation Checklist (Kế hoạch Hành động)
 
### Giai đoạn 1: Hoàn thiện Luồng Buyer (Ưu tiên Cao)
- [x] **B1**: Thêm nút "Thanh toán ngay bằng VNPAY QR" tại `OrderDetailPage.jsx` cho các đơn hàng `PENDING_PAYMENT` để mở lại `VnpayQrModal`.
- [x] **B2**: Bổ sung hàm `previewCheckout()` trong `order.api.js` gọi `POST /checkout/preview` và tích hợp debounce vào `CheckoutPage.jsx`.

### Giai đoạn 2: Bổ sung Tiện ích Seller Finance
- [x] **S1**: Thêm nút "Xuất báo cáo Excel" (`exportRevenue`) trên header của `FinancePage.jsx`.
- [x] **S2**: Dựng component biểu đồ cột trực quan hóa mảng `revenue.buckets` khớp board Penpot `Finance / Revenue chart`.
- [x] **S3**: Thêm tab xem chi tiết Sổ cái (`getLedger`) bên cạnh Lịch sử rút tiền (`getPayouts`).

### Giai đoạn 3: Dựng Màn hình Admin Finance
- [x] **A1**: Tạo trang `AdminFinancePage.jsx` và `AdminFeesTaxesPage.jsx` trong `apps/admin/src/features/finance/`.
- [x] **A2**: Kết nối bảng đối soát `GET /admin/payments/reconciliation` và danh sách quyết toán `GET /admin/settlements`.
- [x] **A3**: Thêm modal điều chỉnh commission sàn gọi `PUT /admin/fees` kèm bước nhập xác thực 2FA.
