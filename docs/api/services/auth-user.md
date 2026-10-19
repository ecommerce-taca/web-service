# Auth & User Service API Specification

> **Dịch vụ Upstream:** `user-auth-service` (Port nội bộ `8082`)  
> **Prefix Gateway:** `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/shops/**`, `/api/v1/seller/onboarding/**`, `/api/v1/admin/users/**`, `/api/v1/admin/shops/**`, `/api/v1/admin/audit-logs`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/auth-user-docs/docs/api/auth-user.md`

---

## 1. Xác Thực & Phục Hồi Mật Khẩu (Authentication)

### 1.1 `POST /auth/signup`
- **Quyền:** Public
- **Body:** `{ email, password, fullName, phone? }`
- **Response 201:** `{ data: { userId, email, fullName, isEmailVerified: false } }`

### 1.2 `POST /auth/signin`
- **Quyền:** Public
- **Body:** `{ email, password }`
- **Response 200:** `{ data: { accessToken, refreshToken, user: { id, email, fullName, roles: ["BUYER"] } } }`

### 1.3 `POST /auth/refresh`
- **Quyền:** Public
- **Body:** `{ refreshToken }`
- **Response 200:** `{ data: { accessToken, refreshToken } }`

### 1.4 `POST /auth/signout`
- **Quyền:** Authenticated
- **Body:** `{ refreshToken? }`
- **Response 204:** No Content

### 1.5 `POST /auth/email/verify` & `POST /auth/email/resend`
- **Verify Body:** `{ token }` ➔ Kích hoạt tài khoản.
- **Resend Body:** `{ email }` ➔ Gửi lại email kèm token xác thực.

### 1.6 `POST /auth/phone/request-otp` & `POST /auth/phone/verify-otp`
- **Request OTP:** `{ phone }` ➔ Gửi SMS OTP 6 số (TTL 2 phút).
- **Verify OTP:** `{ phone, otp }` ➔ Trả về xác nhận hợp lệ.

### 1.7 `POST /auth/password/forgot` & `POST /auth/password/reset`
- **Forgot Body:** `{ email }` ➔ Gửi link đặt lại mật khẩu.
- **Reset Body:** `{ token, newPassword }` ➔ Cập nhật mật khẩu mới.

---

## 2. Hồ Sơ Người Dùng & Sổ Địa Chỉ (Profile & Address)

### 2.1 `GET /users/me` & `PUT /users/me`
- **GET Response 200:** Hồ sơ chi tiết (Họ tên, SĐT, ngày sinh, giới tính, avatar URL).
- **PUT Body:** `{ fullName, dob, gender, avatarUrl }`

### 2.2 Sổ Địa Chỉ Giao Hàng (`/users/me/addresses`)
- `GET /users/me/addresses`: Danh sách địa chỉ nhận hàng.
- `POST /users/me/addresses`: Thêm mới `{ recipientName, phone, provinceCode, wardCode, streetAddress, isDefault }`.
- `PUT /users/me/addresses/{addressId}`: Cập nhật địa chỉ.
- `DELETE /users/me/addresses/{addressId}`: Xóa địa chỉ.

---

## 3. Danh Sách Yêu Thích & Theo Dõi Shop (Favorites & Following)

### 3.1 Yêu thích (`/users/me/favorites`)
- `GET /users/me/favorites?page=1&size=20`: Danh sách sản phẩm đã lưu.
- `POST /users/me/favorites`: `{ productId }`
- `DELETE /users/me/favorites/{productId}`: Xóa khỏi yêu thích.
- `GET /users/me/favorites/contains?product_ids=id1,id2`: Batch check trạng thái yêu thích.

### 3.2 Shop & Theo dõi Shop
- `GET /shops/{shopId}`: Thông tin hồ sơ cửa hàng (Tên, logo, rating, tổng sản phẩm).
- `GET /shops/{shopId}/followers/count`: Số lượng follower của shop.
- `POST /shops/{shopId}/follow`: Bấm theo dõi.
- `DELETE /shops/{shopId}/follow`: Hủy theo dõi.
- `GET /users/me/following`: Danh sách các shop đang theo dõi.

---

## 4. Kênh Người Bán: Onboarding & KYC Nhà Bán Hàng

- `GET /seller/onboarding/progress`: Trạng thái tiến độ 4 bước (`step`, `isCompleted`).
- `POST /seller/onboarding/profile`: Bước 1 — Thiết lập thông tin cơ bản shop `{ shopName, slug, contactPhone, businessEmail }`.
- `POST /seller/onboarding/kyc`: Bước 2 — Tải thông tin định danh `{ businessType: "INDIVIDUAL"|"ENTERPRISE", idCardNumber, frontImageUrl, backImageUrl, taxCode }`.
- `POST /seller/onboarding/bank`: Bước 3 — Liên kết ngân hàng thụ hưởng `{ bankCode, accountNumber, accountHolderName }`.
- `POST /seller/onboarding/warehouse`: Bước 4 — Đăng ký địa chỉ lấy hàng `{ contactName, phone, provinceCode, wardCode, streetAddress }`.
- `GET /seller/onboarding/kyc/status`: Trạng thái phê duyệt (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`, lý do từ chối nếu có).

---

## 5. Quản Trị Hệ Thống (Admin Portal)

- `POST /admin/auth/signin`: Đăng nhập quản trị viên.
- `POST /admin/auth/2fa/setup` & `verify`: Khởi tạo & xác thực mã OTP 2FA.
- `GET /admin/users`: Danh sách toàn bộ tài khoản (phân trang, lọc theo vai trò, trạng thái).
- `PATCH /admin/users/{id}/status`: Khóa (`LOCKED`) hoặc kích hoạt lại (`ACTIVE`) tài khoản.
- `GET /admin/roles` & `PUT /admin/users/{id}/roles`: Quản lý phân quyền RBAC.
- `GET /admin/kyc/requests`: Danh sách hồ sơ định danh người bán chờ xét duyệt.
- `GET /admin/kyc/requests/{id}`: Xem chi tiết ảnh chụp giấy tờ CCCD/ĐKKD.
- `POST /admin/kyc/requests/{id}/approve`: Phê duyệt kích hoạt cửa hàng.
- `POST /admin/kyc/requests/{id}/reject`: Từ chối hồ sơ kèm `{ reasonCode, note }`.
- `GET /admin/audit-logs`: Nhật ký kiểm toán toàn bộ hành vi nhạy cảm của quản trị viên.
