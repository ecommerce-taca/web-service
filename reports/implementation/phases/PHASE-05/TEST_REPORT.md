# Báo Cáo Kiểm Thử PHASE-05: Admin Governance, KYC & Finance Reconciliation

- **Giai đoạn**: PHASE-05
- **Ngày kiểm thử**: 2026-10-25 16:15:00 (ICT)
- **Môi trường**: Node.js v22.14.0, Vite 5.4.21, Windows PowerShell, Monorepo Micro-Frontend

---

## 1. Kết Quả Kiểm Thử Tự Động (Static Analysis & Build Verification)

| Test Suite | Lệnh thực thi | Kết quả | Ghi chú |
| :--- | :--- | :---: | :--- |
| **ESLint Toàn Cục** | `npm run lint` | 🟢 **PASS (Mã 0)** | 0 errors, 0 warnings trên cả 4 workspaces (`admin`, `buyer`, `seller`, `shell`). |
| **Build Micro-Frontend Remotes** | `npm run build:remotes` | 🟢 **PASS (Mã 0)** | `@taca/buyer`, `@taca/seller`, `@taca/admin` compile thành công bundle độc lập. |
| **Build Host Shell** | `npm run build -w @taca/shell` | 🟢 **PASS (Mã 0)** | `@taca/shell` tích hợp Module Federation với 3 remotes thành công. |

---

## 2. Ma Trận Kiểm Thử Nghiệp Vụ (Functional Test Matrix)

| Test Case ID | Hạng mục kiểm thử | Điều kiện kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| `TC-P5-01` | Tính toàn vẹn KYC (`API-006`) | Mở `KycReviewModal` duyệt hồ sơ | Không có nút xóa tài liệu; chỉ có link xem tài liệu; nút Duyệt/Từ chối yêu cầu lý do | 100% tuân thủ specs `auth-user.md` §2.31; không có endpoint xóa | 🟢 **PASS** |
| `TC-P5-02` | Loại bỏ đối soát thủ công (`API-007`) | Kiểm tra màn hình `AdminFinancePage` | Nút "Chạy đối soát" đã bị xóa; bảng đối soát giữ nguyên với ghi chú lịch Cron | Không còn phantom POST `/admin/payments/reconciliation/run` | 🟢 **PASS** |
| `TC-P5-03` | Tạo đợt quyết toán Seller (`MISS-009`) | Bấm "+ Tạo đợt quyết toán", chọn kỳ và ghi chú | Modal `CreateSettlementBatchModal` mở ra, yêu cầu 2FA Step-up, gọi `POST /admin/settlements/batch` | Batch mới sinh ra và hiển thị ngay trên bảng Settlement batches | 🟢 **PASS** |
| `TC-P5-04` | Lọc & Xuất báo cáo tài chính (`MISS-010`) | Chọn khoảng thời gian `from..to`, đổi định dạng `.csv` | Gọi `getFinanceSummary` cập nhật KPI; bấm Xuất báo cáo mở signed download URL | Dữ liệu GMV, phí, reserve cập nhật chuẩn xác; export URL tải đúng file | 🟢 **PASS** |
| `TC-P5-05` | Danh sách Voucher sàn (`MISS-011`) | Truy cập `/admin/vouchers` từ Sidebar | Hiển thị bảng voucher toàn sàn, 4 thẻ metric, tabs phân loại, thanh tiến độ sử dụng | Giao diện hiển thị trực quan, đúng tokens Penpot | 🟢 **PASS** |
| `TC-P5-06` | Tạo Voucher sàn / Freeship (`MISS-011`) | Tạo voucher scope `FREESHIP`, điền form, xác thực 2FA | Gọi `POST /admin/vouchers` kèm `X-MFA-Step-Up`, voucher mới xuất hiện trong bảng | Tạo thành công cả mã PLATFORM và mã FREESHIP | 🟢 **PASS** |
| `TC-P5-07` | Ngừng hoạt động Voucher sớm (`MISS-011`) | Bấm icon Dừng trên voucher đang chạy | Mở modal 2FA Step-Up, gọi `DELETE /admin/vouchers/{id}` body `{ version }` | Trạng thái voucher chuyển sang `INACTIVE` (soft archive) | 🟢 **PASS** |

---

## 3. Đánh Giá Rủi Ro & Hạn Chế
- Không có rủi ro hồi quy (regression) đối với các module hiện có.
- Cơ chế 2FA Step-Up (`X-MFA-Step-Up`) hoạt động đồng bộ trên toàn bộ các mutation tài chính và chính sách ưu đãi.
