# BÁO CÁO HIỆN TRẠNG KIẾN TRÚC AUTHENTICATION & AUTHORIZATION (PHASE 1 AUDIT)
## Hệ thống Ecommerce Taca (Admin · Seller · Buyer)

> **Ngày thực hiện:** 2026-10-11  
> **Chuyên viên:** Senior Full-Stack Architect & Security Engineer  
> **Môi trường & Chi nhánh:** Workspace Monorepo `d:\di_hoc\taca_ecommerce`, Git Branch `feature/seller-portal` (Commit SHA: `2405c9a`)  
> **Tài liệu tham chiếu chuẩn:**
> - Backend API Spec: `auth-user-docs/docs/api/auth-user.md` (Base path: `/api/v1`)
> - Backend Service: `ecommerce-taca/user-auth-service` (Java 21 / Spring Boot 3 / RS256 JWT / Argon2id / MySQL 8 / Redis)
> - Thiết kế Penpot: File `taca` (ID: `40e06342-8830-80d6-8008-8f83031f9fb5`), Pages:
>   - `01 · Taca Buyer · Code Match` (Board `Overlay / Sign in`, `Taca Buyer / Account`)
>   - `02 · Taca Seller · Code Match` (Board `Overlay / Seller onboarding`, `Taca Seller / Dashboard`, `Taca Seller / Settings`)
>   - `03 · Taca Admin · Code Match` (Board `Taca Admin / Shops / KYC`, `Overlay / KYC review`, `Taca Admin / Users / Roles`)

---

## 1. Tổng quan Kiến trúc Hệ thống

Hệ thống thương mại điện tử Taca được triển khai theo mô hình **Microservices Backend + Micro-Frontend (MFE) Host Architecture** với Module Federation:

```text
                                  [ Browser Client ]
                                           │
                       ┌───────────────────┴───────────────────┐
                       ▼                                       ▼
             [ Shell Host (:5173) ]                   [ API Gateway (:8080) ]
        ┌──────────────┼──────────────┐                        │
        ▼              ▼              ▼                        ├─► auth-user-service (:8081)
 [ Buyer MFE ]  [ Seller MFE ]  [ Admin MFE ]                  ├─► product-catalog-service (:8082)
    (:5174)        (:5175)        (:5176)                      ├─► order-commerce-service
                                                               └─► inventory / shipment ...
```

### 1.1 Cơ chế Nhận diện & Xác thực (Authentication)
1. **Access Token:**
   - Định dạng: JWT RS256 (ký bằng private key của `user-auth-service`, public key exposed qua `/.well-known/jwks.json`).
   - Thời hạn hiệu lực: **15 phút (900 giây)**.
   - Chứa claims chuẩn: `sub` (User UUID canonical v7/v4), `iss`, `aud`, `exp`, `roles`, `email`, `email_verified`.
2. **Refresh Token:**
   - Định dạng: Opaque token (43–512 ký tự ngẫu nhiên entropy cao, hash lưu trong database).
   - Thời hạn hiệu lực: **30 ngày (2.592.000 giây)**.
   - Chính sách Rotation: Mỗi lần gọi `POST /auth/refresh`, refresh token cũ bị thu hồi (revoked) và một cặp token mới được cấp phát.
   - Family Revocation: Nếu phát hiện refresh token đã thu hồi được tái sử dụng (`AUTH_REFRESH_REUSED`), toàn bộ token family của phiên bị hủy lập tức.
3. **Phân cấp Phân quyền (Authorization & RBAC):**
   - **BUYER:** Khách hàng mua sắm cá nhân. Role mặc định khi đăng ký qua `POST /auth/signup`.
   - **SELLER / SELLER_STAFF:** Người bán hàng. Được khởi tạo khi tài khoản Buyer gửi yêu cầu `POST /users/register-seller` và hoàn thành Onboarding KYC.
   - **ADMIN / SUPER_ADMIN / RISK_MANAGER:** Quản trị viên hệ thống. Không thể tự đăng ký công khai; được cấp qua seed bảo mật hoặc endpoint `PATCH /admin/users/{userId}/roles` có yêu cầu xác thực 2FA / `X-MFA-Step-Up`.

---

## 2. Đánh giá Hiện trạng Từng Nhóm Vai trò

### 2.1 Nhóm Buyer (Storefront Customer)
* **Luồng Đăng ký (`POST /auth/signup`):**
  - Hiện trạng: Đã xây dựng form tại `apps/buyer/src/features/auth/components/AuthModal.jsx`.
  - Hỗ trợ nhập Họ tên, Email, Mật khẩu, Số điện thoại.
  - Phù hợp với API contract: password yêu cầu tối thiểu 12 ký tự, hash Argon2id ở backend.
  - Sau khi đăng ký thành công, server trả về `email_sent: true`.
* **Luồng Đăng nhập (`POST /auth/signin`):**
  - Nhận `identifier` (email hoặc phone) và `password`.
  - Lưu trữ token đồng bộ trong `localStorage` (`taca_access_token`, `taca_refresh_token`, `taca_user`).
* **Đăng xuất (`POST /auth/signout`):**
  - Gửi `refresh_token` lên BE để revoke session, dọn dẹp storage và phát event `auth:logout`.
* **Điểm cần hoàn thiện:**
  - Đồng bộ modal `Overlay / Sign in` chuẩn Penpot (500x520px, typography Plus Jakarta Sans).
  - Tích hợp điều hướng tab chuyển đổi mượt mà giữa Đăng nhập, Đăng ký và Quên mật khẩu.

### 2.2 Nhóm Seller (Merchant / Store Owner)
* **Luồng Đăng ký Gian hàng (`POST /users/register-seller`):**
  - Yêu cầu: Đã đăng nhập và email đã được xác minh (`email_verified = true`).
  - Thu thập: Tên gian hàng, Tên pháp nhân kinh doanh (`business_name`), Mã số thuế (`tax_code`), slug.
* **Luồng Onboarding 5 bước (`/seller/onboarding/*`):**
  - **Step 1 — Hồ sơ:** `PUT /seller/onboarding/profile`
  - **Step 2 — KYC:**
    - Lấy presigned URL S3/MinIO: `POST /seller/onboarding/kyc/documents/presign`
    - Upload trực tiếp file tài liệu (Giấy ĐKKD, CCCD, Sao kê ngân hàng)
    - Xác nhận hoàn tất upload: `POST /seller/onboarding/kyc/documents/complete`
    - Submit hồ sơ duyệt: `POST /seller/onboarding/kyc/submit` -> trạng thái chuyển sang `PENDING`.
  - **Step 3 — Kho & Vận chuyển:** `PUT /seller/onboarding/warehouse`
  - **Step 4 — Ngân hàng:** `PUT /seller/onboarding/bank` (lưu mã ngân hàng, số tài khoản masked)
  - **Step 5 — Sản phẩm đầu tiên:** Đưa sản phẩm đầu tiên lên sàn.
* **Quy tắc Kiểm soát Truy cập Nghiệp vụ Bán hàng:**
  - Nếu `kyc_status === 'PENDING'`: Seller được phép đăng nhập để xem trạng thái onboarding nhưng **bị chặn** thực hiện các thao tác bán hàng chính thức (không thể công khai SPU ra sàn).
  - Nếu `kyc_status === 'APPROVED'`: Mở khóa toàn quyền truy cập Seller Dashboard, Quản lý SKU, Vận chuyển, Tài chính.
  - Nếu `kyc_status === 'NEEDS_INFO'`: Hiển thị yêu cầu bổ sung hồ sơ kèm lý do từ Admin.
  - Nếu `kyc_status === 'REJECTED'`: Hiển thị thông báo từ chối và hướng dẫn liên hệ hỗ trợ.

### 2.3 Nhóm Admin (Platform Operations & KYC Review)
* **Hiện trạng tại Frontend `apps/admin`:**
  - `apps/admin/src/app/App.jsx` hiện chỉ là placeholder tĩnh, **chưa có code chức năng**.
  - Thiếu trang Quản lý Hàng đợi Duyệt KYC (`ShopsKycPage.jsx`) gọi `GET /admin/shops/kyc`.
  - Thiếu Modal Xem & Duyệt KYC (`KycReviewModal.jsx`) chuẩn Penpot board `Overlay / KYC review` (680x690) gọi `GET /admin/shops/{shopId}/kyc` và `POST /admin/shops/{shopId}/kyc/review`.
  - Thiếu trang Quản lý Vai trò Người dùng (`AdminUsersRolesPage.jsx`) gọi `/admin/users/{userId}/roles`.
  - Thiếu Guard kiểm tra quyền truy cập Role `ADMIN` / `SUPER_ADMIN`.

---

## 3. Khoảng trống (Gaps) và Rủi ro Cần Khắc phục

| STT | Khu vực | Hiện trạng | Khoảng trống / Rủi ro | Giải pháp thực hiện |
|---|---|---|---|---|
| 1 | **Admin Portal** | `apps/admin` chỉ có placeholder | Chưa có UI duyệt KYC, chưa có API client cho admin, chưa có xác thực | Xây dựng toàn bộ Admin Layout, KYC Queue, KYC Review Modal theo Penpot |
| 2 | **Seller State** | Onboarding đã có form KYC | Chưa hiển thị rõ banner thông báo trạng thái `PENDING` khi chờ Admin duyệt | Thêm banner cảnh báo trạng thái KYC ở Seller Header & Dashboard |
| 3 | **Buyer UI** | Modal Auth có tính năng | Cần tinh chỉnh visual so với Penpot `Overlay / Sign in` (500x520) | Tối ưu hóa UI/UX modal theo đúng tỷ lệ và design tokens Penpot |
| 4 | **API Client** | Đã có interceptor Bearer | Cần đảm bảo tương thích 100% với response envelope `{ data, meta }` | Kiểm chứng hàm unwrap dữ liệu trong `shared/utils/api-client.js` |
| 5 | **RBAC Guard** | Thiếu guard trên FE Admin | Bất kỳ ai vào port 5176 hoặc `/admin` đều nhìn thấy portal | Thêm `AdminAuthGuard` kiểm tra role `ADMIN`/`SUPER_ADMIN`, chặn Buyer/Seller |
