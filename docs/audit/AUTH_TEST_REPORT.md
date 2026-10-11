# BÁO CÁO KIỂM THỬ HỆ THỐNG AUTHENTICATION & AUTHORIZATION (PHASE 7 TEST REPORT)
## Admin · Seller · Buyer | Unit, Integration & API Contract Verification

> **Ngày thực hiện:** 2026-10-11  
> **Chuyên viên:** Senior Security & QA Engineer  
> **Phạm vi kiểm thử:** Toàn bộ luồng đăng ký, đăng nhập, phân quyền, duyệt KYC, và bảo vệ tài nguyên trên 3 vai trò (Buyer, Seller, Admin).  

---

## 1. Test Matrix & Kết quả Thực thi

### 1.1 Kiểm thử Luồng Khách hàng (Buyer)

| ID | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|:---:|
| BY-01 | Đăng ký tài khoản hợp lệ | Họ tên, email, password >= 12 ký tự | Trả về 201, tạo user role BUYER, gửi email xác thực | Response 201 Created, `roles: ["BUYER"]`, `email_sent: true` | **PASS** |
| BY-02 | Đăng ký với email đã tồn tại | Email đã có trong hệ thống | Trả về lỗi 409 `AUTH_EMAIL_EXISTS` | Response 409, message cảnh báo email đã được sử dụng | **PASS** |
| BY-03 | Đăng ký với mật khẩu yếu (< 12 ký tự) | Password ngắn | Trả về lỗi 400 `AUTH_INVALID_INPUT` | Form validation chặn ngay tại FE, BE trả 400 nếu bypass | **PASS** |
| BY-04 | Đăng nhập thành công (Email/Password) | Credential chính xác | Trả về 200, cấp cặp JWT Access (15m) + Refresh Token (30d) | Lưu `taca_access_token` và `taca_refresh_token` trong storage | **PASS** |
| BY-05 | Đăng nhập sai thông tin | Mật khẩu sai hoặc email không tồn tại | Trả về lỗi 401 `AUTH_INVALID_CREDENTIALS` | Response 401, không tiết lộ email có tồn tại hay không | **PASS** |
| BY-06 | Xác thực email qua link/token | Token xác thực hợp lệ | Trả về 200, cập nhật `email_verified: true` | Kích hoạt cờ verified, chuyển hướng đăng nhập thành công | **PASS** |
| BY-07 | Tự động Refresh Token khi hết hạn | Access token hết hạn 15m, gửi Refresh token | Trả về 200, xoay vòng cặp token mới | Interceptor tự động lấy token mới và retry request êm đềm | **PASS** |
| BY-08 | Đăng xuất người dùng | Gửi request `POST /auth/signout` | Trả về 204, revoke refresh token family | Xóa sạch storage, hủy session, phát event `auth:logout` | **PASS** |

### 1.2 Kiểm thử Luồng Người bán (Seller)

| ID | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|:---:|
| SL-01 | Đăng ký mở gian hàng khi email chưa xác thực | User chưa verify email | Trả về 403 `AUTH_EMAIL_NOT_VERIFIED` | Hệ thống chặn và yêu cầu hoàn tất xác thực email trước | **PASS** |
| SL-02 | Đăng ký mở gian hàng hợp lệ | Tên shop, MST hợp lệ, tên pháp nhân | Trả về 201, tạo shop `status: DRAFT`, gán role SELLER | Shop được khởi tạo, tiến trình chuyển sang Step 1 Onboarding | **PASS** |
| SL-03 | Upload tài liệu KYC qua presigned URL | File PDF/JPG <= 10MB, SHA256 checksum | Cấp signed upload URL S3/MinIO, xác nhận complete | Hoàn tất lưu metadata tài liệu `VERIFIED` | **PASS** |
| SL-04 | Nộp hồ sơ KYC phê duyệt | Đầy đủ hồ sơ và tài liệu KYC | Trả về 200, `kyc_status: PENDING` | Trạng thái hồ sơ chuyển sang Chờ duyệt, ghi nhận `kyc_case_id` | **PASS** |
| SL-05 | Kiểm soát quyền khi đang chờ duyệt | Shop đang `PENDING` truy cập xuất bản sản phẩm | Bị chặn thao tác công khai sản phẩm ra sàn | Hiển thị banner trạng thái chờ Admin duyệt, bảo vệ catalog | **PASS** |
| SL-06 | Truy cập đầy đủ khi đã được duyệt | Shop đã được `APPROVED` | Mở khóa toàn bộ Seller Dashboard, quản lý SKU, đơn hàng | Truy cập bình thường, badge xác thực màu xanh lá | **PASS** |

### 1.3 Kiểm thử Luồng Quản trị viên (Admin & KYC Approval)

| ID | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|:---:|
| AD-01 | Đăng nhập Admin thành công | Tài khoản có role `ADMIN`/`SUPER_ADMIN` | Trả về 200, cho phép vào Admin Console | Mở khóa giao diện quản trị, hiển thị "Super Admin · 2FA ON" | **PASS** |
| AD-02 | Chặn người dùng thường vào Admin | Tài khoản role `BUYER` hoặc `SELLER` | Trả về lỗi thẩm quyền, chặn truy cập | Modal báo lỗi "Không có thẩm quyền truy cập Admin Console" | **PASS** |
| AD-03 | Xem hàng đợi duyệt KYC | Gọi `GET /admin/shops/kyc` với bộ lọc | Trả về danh sách hồ sơ kèm số liệu KPI (284 chờ, 62 rủi ro) | Hiển thị bảng table đầy đủ cột CỬA HÀNG, MST, RỦI RO, NỘP LÚC | **PASS** |
| AD-04 | Mở modal xem xét chi tiết KYC | Chọn shop trong danh sách | Hiển thị `Overlay / KYC review` chuẩn Penpot (680x690) | Hiển thị pháp nhân, MST, CCCD, link xem file presigned | **PASS** |
| AD-05 | Phê duyệt hồ sơ KYC (`APPROVED`) | Nhấn "Phê duyệt KYC" | Gọi `POST /admin/shops/{id}/kyc/review`, cập nhật trạng thái | Cập nhật `APPROVED`, hàng đợi làm mới ngay lập tức | **PASS** |
| AD-06 | Yêu cầu bổ sung hồ sơ (`NEEDS_INFO`) | Nhập lý do >= 10 ký tự, bấm Yêu cầu bổ sung | Trả về 200, chuyển trạng thái sang `NEEDS_INFO` | Lưu lý do vào audit log, yêu cầu seller nộp lại tài liệu | **PASS** |
| AD-07 | Từ chối hồ sơ không hợp lệ (`REJECTED`)| Nhập lý do từ chối, bấm Từ chối | Trả về 200, chuyển trạng thái sang `REJECTED` | Từ chối thành công, khóa tính năng bán hàng của shop | **PASS** |
| AD-08 | Chặn quyết định thiếu lý do | Quyết định `REJECTED` nhưng để trống lý do | Chặn gửi request, báo lỗi tại giao diện | Báo lỗi "Vui lòng nhập lý do tối thiểu 10 ký tự" | **PASS** |
| AD-09 | Phân quyền người dùng (RBAC) | Cấp quyền `SELLER_STAFF` cho user | Gọi `PATCH /admin/users/{id}/roles` | Cập nhật danh sách role thành công | **PASS** |
| AD-10 | Khóa tài khoản vi phạm | Chọn "Khóa user" (`SUSPENDED`) | Thu hồi toàn bộ refresh token, vô hiệu hóa đăng nhập | Trạng thái chuyển thành SUSPENDED, token bị chặn | **PASS** |

---

## 2. Kiểm thử An toàn & Bảo mật (Security Audit)

1. **Phòng chống Privilege Escalation (Nâng quyền trái phép):**
   - Payload đăng ký `POST /auth/signup` không chấp nhận trường `roles` từ client. Server mặc định gán `BUYER`.
   - Payload cập nhật thông tin cá nhân `PUT /users/me` cấm tuyệt đối client truyền `roles`, `status` hoặc `email`.
2. **Bảo mật Token & Credential:**
   - Password được băm bằng thuật toán **Argon2id** với memory cost cao, chống brute-force và rainbow table.
   - Access token JWT ký bằng thuật toán phi đối xứng **RS256**. Gateway xác thực token qua Public Key mà không cần gọi database.
   - Refresh token được băm trước khi lưu trữ trong MySQL. Khi đổi token, áp dụng cơ chế **Refresh Token Rotation**.
3. **Phòng chống Brute-Force & User Enumeration:**
   - Khi đăng nhập sai, endpoint trả về lỗi chung `AUTH_INVALID_CREDENTIALS`, không tiết lộ email/phone có tồn tại hay không.
   - Quên mật khẩu `POST /auth/password/forgot` luôn trả về HTTP 202 cùng thông báo an toàn, chống rà quét danh sách tài khoản.
4. **Bảo vệ Tài liệu KYC:**
   - Tài liệu giấy phép kinh doanh, CCCD không lưu trữ public trên web server mà lưu trữ trong S3/MinIO bucket riêng tư.
   - Client tải tài liệu thông qua presigned URL có thời hạn ngắn (TTL 10 phút) và chỉ cấp cho người dùng có quyền `KYC_READ`.
