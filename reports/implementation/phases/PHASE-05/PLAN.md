# Kế Hoạch Triển Khai PHASE-05: Admin Governance, KYC & Finance Reconciliation

- **Giai đoạn**: PHASE-05
- **Mục tiêu**: Chuẩn hóa bảo mật và nghiệp vụ quản trị sàn trên Admin Portal (apps/admin), loại bỏ phantom endpoints, hoàn thiện quyết toán doanh thu người bán theo lô (Batch Settlement), báo cáo tài chính toàn sàn (Finance Summary & Export), và quản lý Voucher toàn sàn (Platform Vouchers).
- **Phạm vi ứng dụng**: `apps/admin` (Port 5176, route prefix `/admin/*`), tích hợp API Gateway `/api`.
- **Hợp đồng & Specs đối chiếu**:
  - `docs/lld/auth-user.md` §2.31 (KYC review & Step-up MFA)
  - `docs/lld/payment-wallet.md` §2, §3.5, §3.7, §3.8 (Reconciliation, Settlement, Finance Summary & Export)
  - `docs/lld/order-commerce.md` §3.8 (Admin Platform Vouchers CRUD)
- **Tài liệu Findings đối chiếu**: `FINDINGS_TRACKER.md` (5 Findings: `API-006`, `API-007`, `MISS-009`, `MISS-010`, `MISS-011`)

---

## 1. Danh Sách Tasks Chi Tiết

### Task 1: Khóa Chặt Quản Trị KYC & Loại Bỏ Thao Tác Xóa Tài Liệu (`API-006`)
- **Vấn đề**: Tài liệu kiểm toán KYC là dữ liệu pháp lý không được phép xóa tùy tiện.
- **Giải pháp**:
  - Kiểm tra toàn bộ codebase Admin KYC (`admin-kyc.api.js`, `AdminKycPage.jsx`, `KycReviewModal.jsx`).
  - Đảm bảo 100% không tồn tại nút hoặc endpoint xóa tài liệu KYC.
  - Chuẩn hóa các thao tác xử lý hồ sơ: chỉ cho phép `APPROVE` (Duyệt), `REJECT` (Từ chối kèm lý do >= 10 ký tự và xác thực 2FA Step-Up qua header `X-MFA-Step-Up`), và `NEEDS_INFO` (Yêu cầu bổ sung kèm lý do >= 10 ký tự).

### Task 2: Loại Bỏ Nút Đối Soát Thủ Công Phantom (`API-007`)
- **Vấn đề**: Đối soát thanh toán cổng VNPAY/hệ thống chạy hoàn toàn bằng cron job tự động ở backend (`00:00 UTC+7`). Nút "Chạy đối soát" gọi `POST /admin/payments/reconciliation/run` là phantom endpoint không có trong specs.
- **Giải pháp**:
  - Xóa bỏ method `runReconciliation` trong `apps/admin/src/services/admin-finance.api.js`.
  - Gỡ bỏ nút "Chạy đối soát" và state `isRunningReconciliation` khỏi `AdminFinancePage.jsx`.
  - Giữ lại bảng đối soát tự động `GET /admin/payments/reconciliation`, bổ sung ghi chú tiến trình Cron tự động và trạng thái khớp dữ liệu.

### Task 3: Triển Khai Quyết Toán Doanh Thu Người Bán Theo Lô (`MISS-009`)
- **Vấn đề**: Thiếu chức năng tạo đợt quyết toán cho Seller (`POST /admin/settlements/batch`).
- **Giải pháp**:
  - Bổ sung `createSettlementBatch(payload, stepUpToken)` vào `admin-finance.api.js` (gọi `POST /admin/settlements/batch` với header `X-MFA-Step-Up`).
  - Xây dựng component `CreateSettlementBatchModal.jsx` với bộ lọc kỳ quyết toán (`period_start`, `period_end`), phạm vi gian hàng (`ALL` hoặc danh sách shop), ghi chú đợt quyết toán, và tích hợp `StepUpMfaModal`.
  - Thêm nút "Tạo đợt quyết toán" trên `AdminFinancePage.jsx` và cập nhật danh sách settlement batches sau khi tạo.

### Task 4: Báo Cáo Tài Chính Tổng Quan & Xuất Báo Cáo Toàn Sàn (`MISS-010`)
- **Vấn đề**: Admin Finance chưa có bộ lọc thời gian cho báo cáo tổng quan `GET /admin/finance/summary` và xuất báo cáo `GET /admin/finance/summary/export`.
- **Giải pháp**:
  - Cập nhật `getFinanceSummary(params)` và `exportFinanceSummary(params)` trong `admin-finance.api.js` nhận tham số `from`, `to`, `format`.
  - Bổ sung thanh công cụ chọn khoảng thời gian (`from`, `to`) trên `AdminFinancePage.jsx`, cho phép lọc động GMV, Doanh thu hoa hồng sàn, Phải trả seller, Reserve, Chargeback.
  - Cải tiến nút "Xuất báo cáo tài chính" hỗ trợ định dạng `.xlsx` / `.csv` và tải qua signed URL.

### Task 5: Quản Lý Voucher Toàn Sàn Dành Cho Admin (`MISS-011`)
- **Vấn đề**: Chưa có trang quản lý Voucher toàn sàn (`/admin/vouchers`) theo specs `order-commerce.md` §3.8.
- **Giải pháp**:
  - Xây dựng service `apps/admin/src/services/admin-voucher.api.js` với các methods:
    - `getAdminVouchers(params)`: `GET /admin/vouchers` (query `status`, `code`, `scope`, `page`, `size`)
    - `createAdminVoucher(payload, stepUpToken)`: `POST /admin/vouchers` (`scope: 'PLATFORM' | 'FREESHIP'`)
    - `updateAdminVoucher(voucherId, payload, stepUpToken)`: `PUT /admin/vouchers/{voucherId}`
    - `deleteAdminVoucher(voucherId, { version }, stepUpToken)`: `DELETE /admin/vouchers/{voucherId}` (soft archive)
  - Xây dựng component `CreatePlatformVoucherModal.jsx` hỗ trợ tạo và cập nhật voucher toàn sàn / freeship với validation và 2FA Step-Up.
  - Xây dựng trang `AdminVouchersPage.jsx` hiển thị thống kê voucher, danh sách phân loại tab, thanh tìm kiếm mã, tiến độ sử dụng (`used_count / usage_limit`), thao tác xem/sửa/ngừng phát hành.
  - Đăng ký route `/vouchers` trong `apps/admin/src/app/App.jsx`.

---

## 2. Tiêu Chí Xác Minh (DoD)
1. `npm run lint` đạt 0 lỗi, 0 cảnh báo trên toàn monorepo.
2. `npm run build:remotes` và `npm run build -w @taca/shell` thành công 100%.
3. Kiểm tra tính toàn vẹn của KYC: không có nút xóa tài liệu, các action duyệt/từ chối đều yêu cầu lý do hợp lệ và 2FA Step-up khi từ chối.
4. Kiểm tra trang Finance: loại bỏ nút phantom đối soát thủ công, tạo được lô quyết toán mới kèm 2FA Step-Up, lọc và xuất được báo cáo tài chính.
5. Kiểm tra trang Platform Vouchers: truy cập được qua sidebar Admin `/admin/vouchers`, tạo mới được voucher PLATFORM và FREESHIP, hiển thị chính xác tiến độ sử dụng.
6. Cập nhật đầy đủ bộ tài liệu báo cáo: `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, `REMAINING_WORK.md`, `FINDINGS_TRACKER.md`, `ROADMAP_STATUS.md`, `MASTER_PROGRESS.md`, `CHANGELOG.md`.
