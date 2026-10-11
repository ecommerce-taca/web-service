# MA TRẬN ĐỐI CHIẾU HỢP ĐỒNG API (AUTH & AUTHORIZATION MATRIX)
## Đối chiếu Toàn diện giữa Đặc tả Chuẩn (BE Spec), Triển khai Backend và Gọi từ Frontend

> **Tài liệu nguồn:** `ecommerce-taca/docs/auth-user-docs/docs/api/auth-user.md`  
> **Base Path:** `/api/v1`  
> **Phân loại kết quả:**
> - `MATCH`: Khớp hoàn toàn cả BE, FE và Đặc tả tài liệu.
> - `BE_ONLY`: API đã sẵn sàng ở Backend, phục vụ nền tảng hoặc client nội bộ.
> - `FE_ONLY`: Frontend có nhu cầu gọi nhưng backend chưa cung cấp hoặc dùng mock.
> - `CONTRACT_MISMATCH`: Khác biệt về tên trường hoặc cấu trúc payload/response.
> - `AUTH_MISMATCH`: Khác biệt về yêu cầu bảo mật / phân quyền token.
> - `VALIDATION_MISMATCH`: Khác biệt về điều kiện ràng buộc dữ liệu.
> - `DOCUMENTATION_MISMATCH`: Triển khai khác so với tài liệu mô tả ban đầu.

---

## Bảng Ma trận 47 Endpoints Hệ thống Auth-User

| # | Endpoint | Method | Quyền / Scope | BE Controller | FE Caller (Module/Component) | Kết quả | Hướng xử lý / Ghi chú |
|---:|---|:---:|---|---|---|:---:|---|
| 1 | `/auth/signup` | POST | Public | `AuthController` | Buyer: `auth.api.js` (`signup`) | **MATCH** | Tạo tài khoản Buyer, trả `user`, `tokens`, `verification`. |
| 2 | `/auth/signin` | POST | Public | `AuthController` | Buyer: `auth.api.js`, Seller: `seller-auth.api.js`, Admin: `admin-auth.api.js` | **MATCH** | Hỗ trợ đăng nhập email/phone; trả JWT token + refresh token. |
| 3 | `/auth/refresh` | POST | Public (Refresh Token) | `AuthController` | Shared: `api-client.js` response interceptor | **MATCH** | Cơ chế rotation tự động, chặn vòng lặp vô hạn. |
| 4 | `/auth/signout` | POST | Authenticated | `AuthController` | Buyer, Seller, Admin signout methods | **MATCH** | Revoke refresh token family phía server, xóa local storage. |
| 5 | `/auth/email/verify` | POST | Public (Opaque Token) | `AuthController` | Buyer: `auth.api.js` (`verifyEmail`) | **MATCH** | Kích hoạt cờ `email_verified = true`. |
| 6 | `/auth/email/resend` | POST | Authenticated | `AuthController` | Buyer: `auth.api.js` (`resendVerificationEmail`) | **MATCH** | Gửi lại email xác thực (rate limit 3 lần/giờ). |
| 7 | `/auth/phone/request-otp` | POST | Authenticated | `AuthController` | Buyer: `auth.api.js` (`requestPhoneOtp`) | **MATCH** | Yêu cầu mã OTP SMS/Zalo gửi về số điện thoại. |
| 8 | `/auth/phone/verify-otp` | POST | Authenticated | `AuthController` | Buyer: `PhoneVerificationModal.jsx` | **MATCH** | Xác thực 6 số OTP, cập nhật `phone_verified`. |
| 9 | `/auth/password/forgot` | POST | Public | `AuthController` | Buyer: `auth.api.js` (`forgotPassword`) | **MATCH** | Khởi tạo email đặt lại mật khẩu, không làm lộ email tồn tại. |
| 10 | `/auth/password/reset` | POST | Public (Reset Token) | `AuthController` | Buyer: `auth.api.js` (`resetPassword`) | **MATCH** | Đặt lại mật khẩu mới, hash Argon2id. |
| 11 | `/auth/2fa/setup` | POST | Admin Authenticated | `AuthController` | Admin: `admin-auth.api.js` | **MATCH** | Tạo secret TOTP và `otpauth_uri` cho quản trị viên. |
| 12 | `/auth/2fa/verify` | POST | MFA Challenge / Auth | `AuthController` | Admin: `admin-auth.api.js` | **MATCH** | Xác thực bước 2 cho tài khoản Admin có 2FA bật. |
| 13 | `/users/me` | GET | Authenticated | `UserController` | Buyer Account, Seller Header, Admin Header | **MATCH** | Đọc profile, kiểm tra trạng thái và danh sách roles. |
| 14 | `/users/me` | PUT | Authenticated | `UserController` | Buyer: `profile.api.js` | **MATCH** | Cập nhật họ tên, ngày sinh, số điện thoại. |
| 15 | `/users/me/addresses` | GET | Authenticated | `AddressController` | Buyer: `address.api.js` | **MATCH** | Lấy sổ địa chỉ giao hàng của người mua. |
| 16 | `/users/me/addresses` | POST | Authenticated | `AddressController` | Buyer: `address.api.js` | **MATCH** | Thêm địa chỉ mới; tự động gán default nếu là địa chỉ đầu tiên. |
| 17 | `/users/me/addresses/{id}` | PUT | Authenticated | `AddressController` | Buyer: `address.api.js` | **MATCH** | Sửa địa chỉ; đồng bộ lại cờ `is_default`. |
| 18 | `/users/me/addresses/{id}` | DELETE | Authenticated | `AddressController` | Buyer: `address.api.js` | **MATCH** | Soft-delete địa chỉ, tự động chọn default thay thế nếu xóa default. |
| 19 | `/users/register-seller` | POST | Authenticated + Email Ver | `ShopController` | Seller: `seller-shop.api.js` | **MATCH** | Đăng ký mở gian hàng, tạo shop trạng thái `DRAFT`. |
| 20 | `/seller/onboarding` | GET | Seller Owner | `OnboardingController`| Seller: `OnboardingPage.jsx` | **MATCH** | Đọc tiến độ 5 bước onboarding và danh sách blockers. |
| 21 | `/seller/onboarding/profile` | PUT | Seller Owner | `OnboardingController`| Seller: `OnboardingPage.jsx` (Step 1) | **MATCH** | Lưu thông tin định danh shop, mã số thuế. |
| 22 | `/seller/onboarding/warehouse` | PUT | Seller Owner | `OnboardingController`| Seller: `OnboardingPage.jsx` (Step 3) | **MATCH** | Lưu địa chỉ kho xuất hàng và hãng vận chuyển. |
| 23 | `/seller/onboarding/kyc/documents/presign` | POST | Seller Owner | `KycController` | Seller: `OnboardingPage.jsx` (Step 2) | **MATCH** | Cấp signed upload URL S3/MinIO cho tài liệu KYC. |
| 24 | `/seller/onboarding/kyc/documents/complete` | POST | Seller Owner | `KycController` | Seller: `OnboardingPage.jsx` (Step 2) | **MATCH** | Xác nhận upload file hoàn tất kèm checksum SHA256. |
| 25 | `/seller/onboarding/kyc/submit` | POST | Seller Owner | `KycController` | Seller: `OnboardingPage.jsx` (Step 2) | **MATCH** | Nộp hồ sơ KYC, chuyển `kyc_status` sang `PENDING`. |
| 26 | `/seller/onboarding/bank` | PUT | Seller Owner | `OnboardingController`| Seller: `OnboardingPage.jsx` (Step 4) | **MATCH** | Lưu tài khoản ngân hàng nhận tiền bán hàng. |
| 27 | `/seller/shop` | GET | Seller / Staff | `ShopController` | Seller: `SellerSettingsPage.jsx` | **MATCH** | Lấy thông tin shop đầy đủ của người bán. |
| 28 | `/seller/shop` | PUT | Seller Owner | `ShopController` | Seller: `SellerSettingsPage.jsx` | **MATCH** | Cập nhật tên hiển thị, mô tả, logo shop. |
| 29 | `/admin/shops/kyc` | GET | `KYC_READ` | `AdminKycQueueController`| Admin: `admin-kyc.api.js` (`getKycQueue`) | **MATCH** | Danh sách hàng đợi KYC với filter, phân trang, sort. |
| 30 | `/admin/shops/{shopId}/kyc` | GET | `KYC_READ` | `AdminKycDetailController`| Admin: `admin-kyc.api.js` (`getKycDetail`) | **MATCH** | Chi tiết hồ sơ và danh sách file kèm signed link tải. |
| 31 | `/admin/shops/{shopId}/kyc/review` | POST | `KYC_DECIDE` + 2FA | `AdminKycReviewController`| Admin: `admin-kyc.api.js` (`reviewKyc`) | **MATCH** | Quyết định duyệt: `APPROVED`, `NEEDS_INFO`, `REJECTED`. |
| 32 | `/admin/users/{userId}/roles` | GET | `ROLE_READ` | `AdminUserController` | Admin: `admin-kyc.api.js` (`getUserRoles`) | **MATCH** | Xem danh sách roles/permissions của user. |
| 33 | `/admin/users/{userId}/roles` | PATCH | `ROLE_ASSIGN` + 2FA | `AdminUserController` | Admin: `admin-kyc.api.js` (`updateUserRole`) | **MATCH** | Cấp hoặc thu hồi role người dùng. |
| 34 | `/admin/users/{userId}/status` | PATCH | `USER_SUSPEND` + 2FA | `AdminUserController` | Admin: `admin-kyc.api.js` (`updateUserStatus`) | **MATCH** | Khóa tạm (`SUSPENDED`) hoặc mở khóa (`ACTIVE`) user. |
| 35 | `/admin/audit-logs` | GET | Audit permissions | `AdminAuditController`| Admin: `admin-kyc.api.js` (`getAuditLogs`) | **MATCH** | Tra cứu nhật ký hành động nghiệp vụ nhạy cảm. |
| 36 | `/.well-known/jwks.json` | GET | Public | `JwksEndpoint` | API Gateway, Internal Microservices | **BE_ONLY** | Cung cấp Public Key RS256 để Gateway verify JWT. |
| 37 | `/users/me/favorites` | GET | Authenticated | `FavoriteController` | Buyer: `favorite.api.js` | **MATCH** | Lấy danh sách ID sản phẩm người mua đã lưu yêu thích. |
| 38 | `/users/me/favorites` | POST | Authenticated | `FavoriteController` | Buyer: `favorite.api.js` | **MATCH** | Thêm sản phẩm vào yêu thích (idempotent). |
| 39 | `/users/me/favorites/{id}` | DELETE | Authenticated | `FavoriteController` | Buyer: `favorite.api.js` | **MATCH** | Xóa sản phẩm khỏi danh sách yêu thích. |
| 40 | `/users/me/favorites/contains` | GET | Authenticated | `FavoriteController` | Buyer: `favorite.api.js` | **MATCH** | Kiểm tra hàng loạt sản phẩm đã tim hay chưa. |
| 41 | `/shops/{shopId}/follow` | POST | Authenticated | `ShopFollowController`| Buyer: `shop.api.js` | **MATCH** | Theo dõi gian hàng. |
| 42 | `/shops/{shopId}/follow` | DELETE | Authenticated | `ShopFollowController`| Buyer: `shop.api.js` | **MATCH** | Bỏ theo dõi gian hàng. |
| 43 | `/users/me/following` | GET | Authenticated | `ShopFollowController`| Buyer: `account.api.js` | **MATCH** | Danh sách gian hàng đang theo dõi. |
| 44 | `/shops/{shopId}/followers/count` | GET | Public | `ShopFollowController`| Buyer: `shop.api.js` | **MATCH** | Đếm số lượng người theo dõi công khai. |
| 45 | `/shops/{shopId}` | GET | Public | `ShopController` | Buyer: `shop.api.js` | **MATCH** | Hồ sơ gian hàng công khai (tra cứu qua UUID hoặc Slug). |
| 46 | `/health/live` | GET | Internal / Ops | Spring Boot Actuator | Ops Monitoring / Kubernetes Probe | **BE_ONLY** | Kiểm tra liveness process service. |
| 47 | `/health/ready` | GET | Internal / Ops | Spring Boot Actuator | Ops Monitoring / Kubernetes Probe | **BE_ONLY** | Kiểm tra readiness kết nối MySQL, Redis, Kafka. |
