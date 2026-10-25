# Nhật Ký Thay Đổi Dự Án (Implementation Changelog)

*Quy tắc ghi nhật ký: Chỉ ghi nhận các thay đổi thực tế đã diễn ra trên mã nguồn hoặc hạ tầng tài liệu dự án.*

---

## [2026-10-25] — Hoàn thành PHASE-06: Search Enhancement, Response Cleanup & E2E Verification (Hoàn Tất Toàn Bộ Roadmap)

- **Phase ID**: `PHASE-06`
- **Task IDs**: `TASK-06-SEARCH-SUGGEST-API`, `TASK-06-SEARCH-AUTOCOMPLETE-UI`, `TASK-06-UNIFIED-DATA-UNWRAP`, `TASK-06-E2E-VERIFICATION`
- **Loại thay đổi**: `code` / `api-alignment` / `search` / `suggestion` / `response-cleanup` / `e2e` / `report`
- **Những gì đã thay đổi**:
  - `API-009`: Bổ sung helper `unwrapApiResponse(response)` và `createResponseEnvelope(payload, meta)` trong `shared/utils/api-client.js`. Thiết lập getter không thể liệt kê trên `envelope.data.data` trỏ về `payload`, bảo đảm tính tương thích ngược tuyệt đối cho toàn bộ codebase cũ đọc `res.data.data` đồng thời hỗ trợ cú pháp chuẩn 1 tầng `unwrapApiResponse(res)` và `res.data`.
  - `API-009`: Chuẩn hóa unwrapping tại `seller-finance.api.js`, `FinancePage.jsx`, `order.api.js`, `shipment.api.js`, `payment.api.js`, `OrderDetailPage.jsx`.
  - `MISS-001`: Xây dựng mới `apps/buyer/src/features/search/services/search.api.js` gọi `GET /search/suggest?q=...` tuân thủ nghiêm ngặt `search-service` spec §1.1 kèm fallback mock matching theo `PRODUCTS_CATALOG` và `CATEGORIES_TREE`.
  - `MISS-001`: Xây dựng component `SearchSuggestDropdown.jsx` với giao diện 3 khu vực phân định rõ: Từ khóa gợi ý (`keywords`), Ngành hàng liên quan (`categories`) và Top sản phẩm nổi bật (`topProducts`) kèm giá tiền VND và thumbnail.
  - `MISS-001`: Tích hợp debounce 250ms, click outside và phím tắt Escape vào cả `Header.jsx` và `WhiteHeader.jsx`.
  - `shared/utils/api-client.js` (Sửa đổi)
  - `apps/seller/src/features/finance/services/seller-finance.api.js` (Sửa đổi)
  - `apps/seller/src/features/finance/pages/FinancePage.jsx` (Sửa đổi)
  - `apps/buyer/src/features/search/services/search.api.js` (Tạo mới)
  - `apps/buyer/src/features/search/components/SearchSuggestDropdown.jsx` (Tạo mới)
  - `apps/buyer/src/components/layout/Header.jsx` (Sửa đổi)
  - `apps/buyer/src/components/layout/WhiteHeader.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/services/order.api.js` (Sửa đổi)
  - `apps/buyer/src/features/account/services/shipment.api.js` (Sửa đổi)
  - `apps/buyer/src/features/payment/services/payment.api.js` (Sửa đổi)
  - `apps/buyer/src/features/account/pages/OrderDetailPage.jsx` (Sửa đổi)
  - `reports/implementation/phases/PHASE-06/**` (Tạo mới `PLAN.md`, `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, `REMAINING_WORK.md`)
- **Lý do thay đổi**:
  - Hoàn tất 2 phát hiện kỹ thuật cuối cùng (`MISS-001` và `API-009`), chuẩn hóa toàn bộ response mapping trên toàn sàn và nghiệm thu hoàn thành 100% Roadmap Triển khai Taca Ecommerce.
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, 0 errors, 0 warnings trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, 3 remotes buyer, seller, admin build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell host build thành công).
- **Finding được xử lý**:
  - `API-009` (Low) -> `RESOLVED`
  - `MISS-001` (Medium) -> `RESOLVED`

---

## [2026-10-25] — Hoàn thành PHASE-05: Admin Governance, KYC & Finance Reconciliation

- **Phase ID**: `PHASE-05`
- **Task IDs**: `TASK-05-KYC-AUDIT-LOCK`, `TASK-05-REMOVE-PHANTOM-RECON`, `TASK-05-SETTLEMENT-BATCH`, `TASK-05-FINANCE-SUMMARY-EXPORT`, `TASK-05-PLATFORM-VOUCHERS`
- **Loại thay đổi**: `code` / `api-alignment` / `admin` / `kyc` / `finance` / `settlement` / `vouchers` / `report`
- **Những gì đã thay đổi**:
  - `API-006`: Rà soát và bảo vệ toàn vẹn tài liệu kiểm toán KYC (§2.31 `auth-user.md`), đảm bảo không cung cấp endpoint xóa tài liệu; chỉ cho phép các thao tác Duyệt (`APPROVE`), Từ chối (`REJECT` kèm lý do >= 10 ký tự và 2FA Step-Up qua `X-MFA-Step-Up`), và Yêu cầu bổ sung (`NEEDS_INFO` kèm lý do >= 10 ký tự).
  - `API-007`: Gỡ bỏ phantom method `runReconciliation` (`POST /admin/payments/reconciliation/run`) và nút trigger thủ công khỏi `apps/admin/src/services/admin-finance.api.js` và `AdminFinancePage.jsx`. Giữ nguyên bảng đối soát `GET /admin/payments/reconciliation` kèm badge ghi chú lịch Cronjob tự động `00:00 UTC+7`.
  - `MISS-009`: Bổ sung method `createSettlementBatch(payload, stepUpToken)` (`POST /admin/settlements/batch`) kèm header `X-MFA-Step-Up`, xây dựng component `CreateSettlementBatchModal.jsx` hỗ trợ chọn kỳ quyết toán, phạm vi shop (`ALL` hoặc danh sách ID), ghi chú và xác thực OTP 2FA Step-Up, bổ sung nút "+ Tạo đợt quyết toán" trên `AdminFinancePage.jsx`.
  - `MISS-010`: Cập nhật `getFinanceSummary(params)` và `exportFinanceSummary(params)` trong `admin-finance.api.js`, bổ sung thanh công cụ lọc khoảng thời gian (`from`, `to`), nút Lọc, Đặt lại 30 ngày, dropdown chọn định dạng (`.xlsx` hoặc `.csv`) và nút Xuất báo cáo tài chính toàn sàn qua signed download URL trên `AdminFinancePage.jsx`.
  - `MISS-011`: Xây dựng module Quản trị Voucher toàn sàn: tạo mới `admin-voucher.api.js` tích hợp đầy đủ CRUD (`GET /admin/vouchers`, `POST /admin/vouchers`, `PUT /admin/vouchers/{id}`, `DELETE /admin/vouchers/{id}` soft archive), tạo `PlatformVoucherModal.jsx` hỗ trợ phát hành voucher `PLATFORM` và `FREESHIP` kèm 2FA Step-Up, tạo `AdminVouchersPage.jsx` hiển thị 4 metric, tabs phân loại, tìm kiếm mã, tiến độ sử dụng và ngừng phát hành sớm, đăng ký route `/vouchers` trong `App.jsx`.
  - `apps/admin/src/services/admin-finance.api.js` (Sửa đổi)
  - `apps/admin/src/features/finance/components/CreateSettlementBatchModal.jsx` (Tạo mới)
  - `apps/admin/src/features/finance/pages/AdminFinancePage.jsx` (Sửa đổi)
  - `apps/admin/src/services/admin-voucher.api.js` (Tạo mới)
  - `apps/admin/src/features/vouchers/components/PlatformVoucherModal.jsx` (Tạo mới)
  - `apps/admin/src/features/vouchers/pages/AdminVouchersPage.jsx` (Tạo mới)
  - `apps/admin/src/app/App.jsx` (Sửa đổi: Khai báo route /vouchers)
  - `reports/implementation/phases/PHASE-05/**` (Tạo mới)
- **Lý do thay đổi**:
  - Khắc phục 5 vấn đề quản trị sàn Admin (`API-006`, `API-007`, `MISS-009`, `MISS-010`, `MISS-011`) theo đúng hợp đồng specs của Auth-User, Payment-Wallet và Order-Commerce services.
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, sạch 100% trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, cả 3 remotes build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell build thành công).
- **Finding được xử lý**:
  - `API-006` (Medium) -> `RESOLVED`
  - `API-007` (Medium) -> `RESOLVED`
  - `MISS-009` (Medium) -> `RESOLVED`
  - `MISS-010` (Medium) -> `RESOLVED`
  - `MISS-011` (Medium) -> `RESOLVED`

---

## [2026-10-25] — Hoàn thành PHASE-04: Seller Orders & Fulfillment Alignment

- **Phase ID**: `PHASE-04`
- **Task IDs**: `TASK-04-CARRIER-COMPARE`, `TASK-04-INVENTORY-MODULE`, `TASK-04-ORDERS-EXPORT`, `TASK-04-ORDER-CANCEL`, `TASK-04-VOUCHER-MUTATION`
- **Loại thay đổi**: `code` / `api-alignment` / `seller` / `fulfillment` / `inventory` / `orders` / `vouchers` / `report`
- **Những gì đã thay đổi**:
  - `MISS-003`: Bổ sung `getShipmentCarriers` gọi `GET /seller/orders/{orderId}/shipment/carriers`, nâng cấp `PrepareShipmentModal.jsx` hiển thị bảng so sánh cước phí và thời gian giao hàng các hãng (`GHN`, `SPX`, `J&T`), vô hiệu hóa hãng chưa phủ sóng (`available: false`), truyền `carrier` đã chọn vào `fulfillSellerOrder(orderId, { action: 'SHIP', carrier, version })`.
  - `MISS-004`: Xây dựng module Quản lý kho hàng chuyên biệt: tạo mới `seller-inventory.api.js` tích hợp `GET /seller/inventory` và `PATCH /seller/inventory/{skuId}/adjust`, tạo `StockAdjustModal.jsx` điều chỉnh delta (nhập/xuất/cân đối) chống tồn âm, tạo `InventoryPage.jsx` hiển thị 4 metric và bảng SKU, tích hợp route `/inventory` vào `App.jsx` và menu `SellerNav.jsx`.
  - `MISS-006`: Bổ sung `exportSellerOrders` gọi `GET /seller/orders/export`, cập nhật nút "Xuất file" trên `OrdersPage.jsx` tải file Excel qua signed download URL và hiển thị số lượng bản ghi đã xuất.
  - `MISS-007`: Bổ sung `cancelSellerOrder` gọi `POST /seller/orders/{orderId}/cancel`, xây dựng `CancelOrderModal.jsx` với danh mục lý do chuẩn (`OUT_OF_STOCK`, `CUSTOMER_REQUEST`, `UNDELIVERABLE_AREA`, `SELLER_REQUEST`), tích hợp vào `OrderDetailModal.jsx` và bảng đơn hàng `OrdersPage.jsx`.
  - `MISS-008`: Bổ sung `updateSellerVoucher` (`PUT /seller/vouchers/{id}`) và `deleteSellerVoucher` (`DELETE /seller/vouchers/{id}`), xây dựng `EditVoucherModal.jsx` (khóa mã nếu đã có lượt dùng theo specs §3.7c), bổ sung nút dừng kích hoạt sớm voucher trên `VouchersPage.jsx`.
  - `apps/seller/src/app/App.jsx` (Sửa đổi: Đăng ký route /inventory)
  - `apps/seller/src/components/layout/SellerNav.jsx` (Sửa đổi: Thêm nav item Quản lý kho hàng)
  - `apps/seller/src/features/inventory/components/StockAdjustModal.jsx` (Tạo mới)
  - `apps/seller/src/features/inventory/pages/InventoryPage.jsx` (Tạo mới)
  - `apps/seller/src/features/inventory/services/seller-inventory.api.js` (Tạo mới)
  - `apps/seller/src/features/orders/components/CancelOrderModal.jsx` (Tạo mới)
  - `apps/seller/src/features/orders/components/OrderDetailModal.jsx` (Sửa đổi)
  - `apps/seller/src/features/orders/components/PrepareShipmentModal.jsx` (Sửa đổi)
  - `apps/seller/src/features/orders/pages/OrdersPage.jsx` (Sửa đổi)
  - `apps/seller/src/features/orders/services/seller-order.api.js` (Sửa đổi)
  - `apps/seller/src/features/vouchers/components/EditVoucherModal.jsx` (Tạo mới)
  - `apps/seller/src/features/vouchers/pages/VouchersPage.jsx` (Sửa đổi)
  - `apps/seller/src/features/vouchers/services/seller-voucher.api.js` (Sửa đổi)
  - `reports/implementation/phases/PHASE-04/**` (Tạo mới)
- **Lý do thay đổi**:
  - Khắc phục 5 thiếu sót nghiệp vụ Seller (`MISS-003`, `MISS-004`, `MISS-006`, `MISS-007`, `MISS-008`) theo đúng hợp đồng specs của Order-Commerce, Logistics và Inventory services.
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, sạch 100% trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, cả 3 remotes build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell build thành công).
- **Finding được xử lý**:
  - `MISS-003` (High) -> `RESOLVED`
  - `MISS-004` (High) -> `RESOLVED`
  - `MISS-006` (Medium) -> `RESOLVED`
  - `MISS-007` (Medium) -> `RESOLVED`
  - `MISS-008` (Medium) -> `RESOLVED`
- **Finding mới phát hiện**: `0`
- **Vấn đề còn tồn tại**: 7 findings thuộc các Phase 5 và 6 (0 critical, 0 high, 6 medium, 1 low).

---

## [2026-10-25] — Hoàn thành PHASE-03: Buyer Reviews & Order Tracking Alignment

- **Phase ID**: `PHASE-03`
- **Task IDs**: `TASK-03-REVIEW-SUBMIT`, `TASK-03-REVIEW-TABS`, `TASK-03-VOUCHER-CLEAN`, `TASK-03-CART-PAYLOAD`, `TASK-03-SHIPMENT-TRACK`, `TASK-03-PDP-REVIEWS`, `TASK-03-VOUCHER-VALIDATE-REDEMPTION`
- **Loại thay đổi**: `code` / `api-alignment` / `buyer` / `shipment` / `reviews` / `report`
- **Những gì đã thay đổi**:
  - `API-001`: Sửa hàm `submitReview` trong `review.api.js` và `ReviewFormModal.jsx` gọi chuẩn `POST /products/{productId}/reviews` với payload `{ order_id, sku_id, rating, comment, media_ids }`.
  - `API-002`: Xóa bỏ các phantom endpoints `GET /users/me/reviews/pending` và `/completed`; chuyển sang suy diễn client-side từ danh sách đơn hàng đã giao (`DELIVERED`/`COMPLETED` qua `orderApi.getOrders`) trong `ReviewsPage.jsx`.
  - `API-005`: Xóa bỏ `saveVoucher` và endpoint phantom `POST /vouchers/save`; đổi nút trên thẻ `VoucherCard.jsx` thành "Sao chép mã" kèm phản hồi trực quan "Đã chép!", bổ sung khung kiểm tra mã hợp lệ trên `VouchersPage.jsx`.
  - `API-008`: Dọn dẹp payload `cart.api.js` trong `addItem` đảm bảo chỉ gửi strictly `{ product_id, sku_id, quantity }`, tuyệt đối không gửi trường thừa `shop_id`.
  - `MISS-002`: Xây dựng service `shipment.api.js` tích hợp `GET /orders/{orderId}/shipment` và hiển thị chi tiết tiến trình vận chuyển realtime (`shipment.timeline`) trên `OrderDetailPage.jsx`.
  - `MISS-005`: Tích hợp `getProductReviews` trên `ProductReviews.jsx` và `ProductDetailPage.jsx` hiển thị đánh giá công khai, aggregate rating, phân bổ tỷ lệ sao, lọc theo sao (1-5 sao, có ảnh) và phân trang.
  - `MISS-012`: Bổ sung `validateVoucher` (`GET /vouchers/validate?code=&cart_id=`) và `getVoucherRedemptions` (`GET /vouchers/redemptions`) hiển thị tổng tiền đã tiết kiệm `total_saved` cùng lịch sử đã dùng trên `VouchersPage.jsx`.
  - `.github/workflows/ci.yml` (Sửa đổi: Cấu hình Node 22.x cho commitlint và build-and-test jobs)
  - `apps/buyer/src/features/account/components/ReviewFormModal.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/components/VoucherCard.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/pages/OrderDetailPage.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/pages/ReviewsPage.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/pages/VouchersPage.jsx` (Sửa đổi)
  - `apps/buyer/src/features/account/services/review.api.js` (Sửa đổi)
  - `apps/buyer/src/features/account/services/shipment.api.js` (Tạo mới)
  - `apps/buyer/src/features/account/services/voucher.api.js` (Sửa đổi)
  - `apps/buyer/src/features/cart/services/cart.api.js` (Sửa đổi)
  - `apps/buyer/src/features/products/components/ProductReviews.jsx` (Sửa đổi)
  - `apps/buyer/src/features/products/pages/ProductDetailPage.jsx` (Sửa đổi)
  - `reports/implementation/phases/PHASE-03/**` (Tạo mới)
- **Lý do thay đổi**:
  - Khắc phục 3 lỗi vi phạm hợp đồng API (`API-001`, `API-002`, `API-005`), 1 lỗi payload (`API-008`), và bổ sung 3 tính năng còn thiếu (`MISS-002`, `MISS-005`, `MISS-012`).
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, sạch 100% trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, cả 3 remotes build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell build thành công).
- **Finding được xử lý**:
  - `API-001` (High) -> `RESOLVED`
  - `API-002` (Medium) -> `RESOLVED`
  - `API-005` (Medium) -> `RESOLVED`
  - `API-008` (Low) -> `RESOLVED`
  - `MISS-002` (High) -> `RESOLVED`
  - `MISS-005` (High) -> `RESOLVED`
  - `MISS-012` (Medium) -> `RESOLVED`
- **Finding mới phát hiện**: `0`
- **Vấn đề còn tồn tại**: 12 findings thuộc các Phase 4 đến 6.

---

## [2026-10-25] — Hoàn thành PHASE-02: Core Checkout & Payment API Alignment

- **Phase ID**: `PHASE-02`
- **Task IDs**: `TASK-02-PAYMENT-FLOW`, `TASK-02-VOUCHER-SLOTS`, `TASK-02-MOCK-CONTROL`, `TASK-02-ISOLATE-SIM`
- **Loại thay đổi**: `code` / `api-alignment` / `checkout` / `report`
- **Những gì đã thay đổi**:
  - `API-003`: Sửa luồng checkout Buyer tiếp nhận `payment_next_action` từ `POST /checkout` để mở modal QR VNPAY hoặc điều hướng sang COD, loại bỏ hoàn toàn việc gọi trực tiếp `POST /payments` nội bộ.
  - `API-004`: Nâng cấp giao diện `ApplyVoucherModal` và `CheckoutPage` chọn đồng thời 3 loại voucher (Cửa hàng, Toàn sàn, Freeship) và gửi payload mảng 3 slots `voucher_codes: string[]` lên `POST /checkout` theo specs.
  - `MOCK-001`: Cập nhật `isMockMode()` trong `shared/utils/api-client.js` trả về `false` mặc định; dọn dẹp các khối silent catch giả lập đơn hàng trong `order.api.js` để UI hiển thị Error Alert trung thực khi backend lỗi.
  - `MOCK-002`: Cô lập tính năng giả lập xác nhận thanh toán `confirmMockPaymentSuccess` chỉ khả dụng khi `isMockMode() === true`; chế độ thật chỉ dùng polling `GET /payments/{paymentId}`.
- **Những file đã thay đổi / tạo mới**:
  - `shared/utils/api-client.js` (Sửa đổi)
  - `apps/buyer/src/features/account/services/order.api.js` (Sửa đổi)
  - `apps/buyer/src/features/payment/services/payment.api.js` (Sửa đổi)
  - `apps/buyer/src/features/checkout/components/ApplyVoucherModal.jsx` (Sửa đổi)
  - `apps/buyer/src/features/checkout/components/VnpayQrModal.jsx` (Sửa đổi)
  - `apps/buyer/src/features/checkout/pages/CheckoutPage.jsx` (Sửa đổi)
  - `reports/implementation/phases/PHASE-02/**` (Tạo mới)
- **Lý do thay đổi**:
  - Khắc phục 2 lỗi vi phạm hợp đồng API mức High (`API-003`, `API-004`) và 2 lỗi kiến trúc Mock (`MOCK-001`, `MOCK-002`).
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, sạch 100% trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, buyer, seller, admin build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell build thành công).
  - `git status` check: `PASS` (bảo toàn nguyên vẹn thay đổi uncommitted trước đó của người dùng).
- **Finding được xử lý**:
  - `API-003` (High) -> `RESOLVED`
  - `API-004` (High) -> `RESOLVED`
  - `MOCK-001` (Medium) -> `RESOLVED`
  - `MOCK-002` (Low) -> `RESOLVED`
- **Finding mới phát hiện**: `0`
- **Vấn đề còn tồn tại**: 19 findings thuộc các Phase 3 đến 6.

---

## [2026-10-25] — Hoàn thành PHASE-01: Security & Auth Hardening

- **Phase ID**: `PHASE-01`
- **Task IDs**: `TASK-01-MFA`, `TASK-01-RBAC`, `TASK-01-REFRESH`
- **Loại thay đổi**: `code` / `security` / `report`
- **Những gì đã thay đổi**:
  - Triển khai modal `StepUpMfaModal.jsx` và inject header `X-MFA-Step-Up` cho các mutation nhạy cảm: `reviewKyc` (khi từ chối), `updateUserRole`, `updateUserStatus`, `requestPayout`, `updateFees`.
  - Củng cố cơ chế thẩm định quyền Admin `getAdminUser()` với hàm giải mã `parseJwt`, bắt buộc token hợp lệ và kiểm tra role claims; chặn render `<Outlet />` khi unauthenticated.
  - Tối ưu hóa Axios Interceptor refresh token: hỗ trợ AxiosHeaders class, bảo vệ queue request đồng thời, hỗ trợ refresh mock token an toàn mà không làm mất phiên.
- **Những file đã thay đổi / tạo mới**:
  - `shared/utils/api-client.js` (Sửa đổi)
  - `apps/admin/src/services/admin-auth.api.js` (Sửa đổi)
  - `apps/admin/src/layouts/AdminLayout.jsx` (Sửa đổi)
  - `apps/admin/src/services/admin-kyc.api.js` (Sửa đổi)
  - `apps/admin/src/components/common/StepUpMfaModal.jsx` (Tạo mới)
  - `apps/admin/src/features/users/pages/AdminUsersRolesPage.jsx` (Sửa đổi)
  - `apps/admin/src/features/kyc/components/KycReviewModal.jsx` (Sửa đổi)
  - `apps/seller/src/features/finance/components/WithdrawModal.jsx` (Sửa đổi)
  - `reports/implementation/phases/PHASE-01/**` (Tạo mới)
- **Lý do thay đổi**:
  - Khắc phục triệt để 2 lỗ hổng bảo mật nghiêm trọng `AUTH-001` (thiếu MFA header), `AUTH-002` (leo thang quyền qua localStorage) và tối ưu hóa xử lý token `AUTH-003`.
- **Kết quả kiểm thử**:
  - `npm run lint`: `PASS` (exit code 0, sạch 100% trên cả 4 workspaces).
  - `npm run build:remotes`: `PASS` (exit code 0, buyer, seller, admin build thành công).
  - `npm run build -w @taca/shell`: `PASS` (exit code 0, shell build thành công).
  - `git status` check: `PASS` (bảo toàn nguyên vẹn thay đổi uncommitted trước đó của người dùng).
- **Finding được xử lý**:
  - `AUTH-001` (Critical) -> `RESOLVED`
  - `AUTH-002` (Critical) -> `RESOLVED`
  - `AUTH-003` (Low) -> `RESOLVED`
- **Finding mới phát hiện**: `0`
- **Vấn đề còn tồn tại**: 23 findings thuộc các Phase 2 đến 6.

---

## [2026-10-25] — Khởi tạo Khung Báo Cáo Tiến Độ Triển Khai (Phase 0 Baseline)

- **Phase ID**: `PHASE-00`
- **Task ID**: `TASK-00-BASELINE-AUDIT`
- **Loại thay đổi**: `documentation` / `governance`
- **Những gì đã thay đổi**:
  - Hoàn thành audit đối chiếu toàn bộ các module Frontend (`buyer`, `seller`, `admin`, `shared`) với tài liệu API chính thức trên GitHub `ecommerce-taca/docs`.
  - Phân loại và đăng ký 26 findings độc lập với đầy đủ chỉ mục (`AUTH-001` đến `AUTH-003`, `API-001` đến `API-009`, `MISS-001` đến `MISS-012`, `MOCK-001`, `MOCK-002`).
  - Thiết lập hạ tầng báo cáo chuẩn hóa theo Master Prompt tại `reports/implementation/`:
    - `README.md`
    - `MASTER_PROGRESS.md`
    - `ROADMAP_STATUS.md`
    - `FINDINGS_TRACKER.md`
    - `CHANGELOG.md`
    - `phases/PHASE-00/`
    - `evidence/README.md`
- **Những file đã thay đổi / tạo mới**:
  - `reports/implementation/README.md` (Tạo mới)
  - `reports/implementation/MASTER_PROGRESS.md` (Tạo mới)
  - `reports/implementation/ROADMAP_STATUS.md` (Tạo mới)
  - `reports/implementation/FINDINGS_TRACKER.md` (Tạo mới)
  - `reports/implementation/CHANGELOG.md` (Tạo mới)
  - `reports/implementation/phases/PHASE-00/PLAN.md` (Tạo mới)
  - `reports/implementation/phases/PHASE-00/IMPLEMENTATION_REPORT.md` (Tạo mới)
  - `reports/implementation/phases/PHASE-00/TEST_REPORT.md` (Tạo mới)
  - `reports/implementation/phases/PHASE-00/REMAINING_WORK.md` (Tạo mới)
  - `reports/implementation/evidence/README.md` (Tạo mới)
- **Lý do thay đổi**:
  - Xây dựng nền tảng quản trị chất lượng kỹ thuật, kiểm soát tiến độ triển khai từng phase theo nguyên tắc: Implement → Verify → Report → Update Progress → Stop.
- **Kết quả kiểm thử**:
  - Kiểm tra tính toàn vẹn tài liệu và liên kết tệp tin: `PASS`.
  - Kiểm tra trạng thái Git diff: bảo vệ 100% các file uncommitted của người dùng.
- **Finding được xử lý**:
  - `0` (Phase 0 chỉ chịu trách nhiệm audit và thiết lập cơ sở đối chiếu).
- **Finding mới phát hiện**:
  - `26` findings được ghi nhận vào `FINDINGS_TRACKER.md`.
- **Vấn đề còn tồn tại**:
  - Toàn bộ 26 findings đang ở trạng thái `CONFIRMED` và sẵn sàng được triển khai trong các Phase 1-6 tiếp theo.
