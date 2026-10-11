# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG AUTHENTICATION & AUTHORIZATION (PHASE 2 PLAN)
## Admin · Seller · Buyer | Full-Stack Implementation & Penpot Alignment

> **Phiên bản:** 1.0  
> **Chịu trách nhiệm:** Senior Full-Stack Architect  
> **Thời gian dự kiến hoàn thành:** 2026-10-11  

---

## 1. Mục tiêu Cốt lõi
Xây dựng và hoàn thiện trọn vẹn luồng Authentication & Authorization xuyên suốt cho 3 nhóm đối tượng:
1. **Buyer:** Đăng ký, đăng nhập, bảo mật session JWT, quản lý địa chỉ và profile, đăng xuất sạch sẽ.
2. **Seller:** Đăng ký gian hàng (`/users/register-seller`), hoàn thành 5 bước Onboarding với KYC upload presigned S3, hiển thị trạng thái chờ duyệt và bảo vệ nghiệp vụ bán hàng.
3. **Admin:** Hệ thống quản trị Admin Portal (`apps/admin`) hoàn chỉnh:
   - Đăng nhập Admin bảo mật với kiểm tra role `ADMIN` / `SUPER_ADMIN`.
   - Bảng điều khiển KYC Queue theo Penpot board `Taca Admin / Shops / KYC` (`GET /admin/shops/kyc`).
   - Modal Phê duyệt & Yêu cầu bổ sung KYC theo Penpot board `Overlay / KYC review` (`GET /admin/shops/{shopId}/kyc` & `POST /admin/shops/{shopId}/kyc/review`).
   - Quản lý phân quyền người dùng theo Penpot board `Taca Admin / Users / Roles` (`GET /admin/users/{userId}/roles` & `PATCH /admin/users/{userId}/roles`).

---

## 2. Kế hoạch Triển khai theo Từng Giai đoạn

### Giai đoạn 1: Chuẩn bị Dịch vụ API Client cho Admin
- **File tạo mới:** `apps/admin/src/services/admin-auth.api.js`
  - Đăng nhập Admin (`/auth/signin`), Đăng xuất (`/auth/signout`), Lấy thông tin Admin (`/users/me`).
  - Kiểm tra thẩm quyền Role: chỉ cho phép `ADMIN`, `SUPER_ADMIN`, `RISK_MANAGER`.
  - Hỗ trợ Demo Quick Login cho môi trường thử nghiệm độc lập.
- **File tạo mới:** `apps/admin/src/services/admin-kyc.api.js`
  - `getKycQueue(params)`: Gọi `GET /admin/shops/kyc` hỗ trợ filter `status`, phân trang `page`, `size`, tìm kiếm `q`, sắp xếp `sort`.
  - `getKycDetail(shopId)`: Gọi `GET /admin/shops/{shopId}/kyc` lấy chi tiết pháp nhân, mã số thuế, danh sách tài liệu và link presigned tải file.
  - `reviewKyc(shopId, { decision, reason })`: Gọi `POST /admin/shops/{shopId}/kyc/review` với quyết định `APPROVED`, `NEEDS_INFO`, hoặc `REJECTED`.
  - `getUserRoles(userId)`: Gọi `GET /admin/users/{userId}/roles`.
  - `updateUserRole(userId, payload)`: Gọi `PATCH /admin/users/{userId}/roles`.
  - `updateUserStatus(userId, payload)`: Gọi `PATCH /admin/users/{userId}/status`.

### Giai đoạn 2: Xây dựng Giao diện & Layout Quản trị Admin
- **File tạo mới:** `apps/admin/src/components/layout/AdminSidebar.jsx`
  - Khớp 100% Penpot `Taca Admin / Shops / KYC` Sidebar (Board `557dad51-8d8f-80ae-8008-8c20f936ba8f`):
    - Logo: "taca" + "ADMIN CONSOLE"
    - Danh mục: Dashboard, Campaigns, Categories, Shops / KYC (active indicator), Products / SKU, Fees / Taxes, Finance, Orders / Disputes, Vouchers, Users / Roles, Settings.
    - Chân trang: Avatar quản trị viên, Tên quản trị, Badge "Super Admin · 2FA ON", Nút Đăng xuất.
- **File tạo mới:** `apps/admin/src/components/layout/AdminHeader.jsx`
  - Tiêu đề màn hình, thanh tìm kiếm hệ thống (`⌕ Tìm trong hệ thống`), nút "Quy tắc rủi ro", Chuông thông báo, Profile toggle.
- **File tạo mới:** `apps/admin/src/components/common/AdminLoginModal.jsx`
  - Form xác thực Admin có validation, thông báo lỗi bảo mật, shortcut test cho tester.

### Giai đoạn 3: Xây dựng Tính năng Duyệt KYC của Admin
- **File tạo mới:** `apps/admin/src/features/kyc/pages/AdminKycPage.jsx`
  - Bảng thống kê KPI theo Penpot: Chờ KYC (284), Đã xác minh (48.216), Rủi ro cao (62), SLA trung bình (3h 24m).
  - Thanh Tabs lọc trạng thái (`Tất cả`, `Chờ duyệt (PENDING)`, `Yêu cầu bổ sung (NEEDS_INFO)`, `Đã duyệt (APPROVED)`, `Từ chối (REJECTED)`).
  - Bảng hàng đợi `KYC review queue` hiển thị đầy đủ cột: CỬA HÀNG, LOẠI (Doanh nghiệp/Cá nhân), MST / CCCD, RỦI RO, NỘP LÚC, THAO TÁC.
  - Xử lý các trạng thái: Đang tải dữ liệu (Loading skeleton), Dữ liệu trống (Empty state), Lỗi mạng (Error state).
- **File tạo mới:** `apps/admin/src/features/kyc/components/KycReviewModal.jsx`
  - Khớp 100% Penpot `Overlay / KYC review` (Board `557dad51-8d8f-80ae-8008-8c21d4064a99`, kích thước 680x690):
    - Tiêu đề: "KYC REVIEW · [TÊN CỬA HÀNG]"
    - Badge đánh giá rủi ro (Rủi ro cao / Rủi ro trung bình / Rủi ro thấp).
    - Thông tin pháp nhân: Loại pháp nhân, Mã số thuế, Người đại diện, Địa chỉ kinh doanh, Thông tin tài khoản ngân hàng.
    - Danh sách tài liệu đính kèm (Giấy phép ĐKKD, CCCD, Xác nhận tài khoản) có nút "Xem" mở file qua signed URL.
    - Cảnh báo rủi ro hệ thống ("Tín hiệu: IP trùng 2 shop bị khóa · Ngân hàng xác minh hợp lệ").
    - Hộp nhập lý do (bắt buộc khi chọn Yêu cầu bổ sung hoặc Từ chối).
    - 3 Nút hành động chuẩn nghiệp vụ:
      1. `Yêu cầu bổ sung` (`NEEDS_INFO`)
      2. `Từ chối` (`REJECTED`)
      3. `Phê duyệt KYC` (`APPROVED`)
- **File tạo mới:** `apps/admin/src/features/users/pages/AdminUsersRolesPage.jsx`
  - Khớp Penpot `Taca Admin / Users / Roles` (Board `557dad51-8d8f-80ae-8008-8c21c6aab358`).
  - Danh sách người dùng, xem và gán role (`SELLER_STAFF`, `ADMIN`, `SUPER_ADMIN`), khóa / mở khóa tài khoản (`SUSPENDED`/`ACTIVE`).

### Giai đoạn 4: Cập nhật Router và Auth Guard tại `apps/admin/src/app/App.jsx`
- Thiết lập React Router với các route quản trị:
  - `/admin` và `/admin/shops/kyc`: Trang Duyệt KYC gian hàng.
  - `/admin/users/roles`: Trang Quản lý người dùng và phân quyền.
  - `/admin/dashboard`: Bảng điều khiển tổng quan.
- Tích hợp kiểm tra quyền tự động: Nếu chưa đăng nhập hoặc role không thuộc nhóm Admin, kích hoạt `AdminLoginModal` để bảo vệ portal.

### Giai đoạn 5: Củng cố Trạng thái Onboarding & Duyệt KYC tại Seller Portal (`apps/seller`)
- Đảm bảo `OnboardingPage.jsx` khi submit hồ sơ KYC hiển thị trạng thái `PENDING` rõ ràng.
- Hiển thị banner thông báo "Hồ sơ của bạn đang được Admin xem xét và phê duyệt" tại Seller Header & Dashboard khi `kyc_status === 'PENDING'`, chặn công khai sản phẩm khi chưa được duyệt.

### Giai đoạn 6: Kiểm thử, Tối ưu hóa và Nghiệm thu
- Kiểm tra toàn bộ luồng bằng test scripts, kiểm tra build độc lập và monorepo: `npm run lint`, `npm run build:remotes`.
- So khớp pixel-perfect giao diện với Penpot design.
- Lập bộ tài liệu nghiệm thu chi tiết gồm:
  - `docs/audit/AUTH_API_CONTRACT_MATRIX.md`
  - `docs/audit/AUTH_TEST_REPORT.md`
  - `docs/audit/AUTH_FINAL_REPORT.md`
