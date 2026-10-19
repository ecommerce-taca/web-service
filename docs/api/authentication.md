# Đặc Tả Xác Thực & Phân Quyền (Authentication & Authorization)

> **Phạm vi:** Cơ chế quản lý danh tính, phân quyền và bảo mật phiên đăng nhập trên toàn bộ nền tảng Taca Ecommerce.  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/auth-user-docs` và `shared/utils/security.js`.

---

## 1. Kiến Trúc Xác Thực JWT

Toàn bộ hệ thống sử dụng cơ chế xác thực không trạng thái (Stateless Authentication) dựa trên chuẩn **JSON Web Token (JWT)** với thuật toán mã hóa bất đối xứng **RS256**:

```text
  [Client] (Buyer / Seller / Admin)
     │
     ├── 1. POST /auth/signin { email, password }
     ▼
  [API Gateway] ──(Proxy)──► [Auth & User Service]
                                  │
                                  ├─ Xác thực mật khẩu (Argon2id/Bcrypt)
                                  ├─ Tạo cặp Access Token + Refresh Token
                                  ▼
  [Client] ◄────── Nhận { accessToken, refreshToken, user }
     │
     ├── 2. Mọi Request kế tiếp kèm Header:
     │      Authorization: Bearer <accessToken>
     ▼
  [API Gateway]
     │
     ├─ Xác thực chữ ký RS256 qua JWKS public key nội bộ (tốc độ < 1ms)
     ├─ Giải mã Claims: User ID, Roles, Permissions, Shop Scope
     ├─ Gán các header bảo mật: X-User-ID, X-User-Roles
     ▼
  [Microservices Upstream] (Order, Product, Payment...)
```

---

## 2. Cấu Trúc Token Payload (Claims Contract)

### 2.1 Access Token Claims
Access Token có thời hạn ngắn (mặc định **15 phút**) để giảm thiểu rủi ro khi bị rò rỉ:

```json
{
  "iss": "https://auth.taca.vn",
  "aud": "taca-ecommerce-api",
  "sub": "usr-01912f31-7a1b-7c12",
  "email": "seller.demo@taca.vn",
  "roles": ["SELLER"],
  "permissions": [
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "ORDER_FULFILL",
    "WALLET_WITHDRAW"
  ],
  "shop_id": "shp-01912f31-99aa",
  "kyc_status": "APPROVED",
  "exp": 1792000900,
  "iat": 1792000000,
  "jti": "tok-01912f31-uuid"
}
```

### 2.2 Refresh Token Flow & Tự Động Làm Mới Phiên
- Refresh Token có thời hạn dài (**7 ngày**) và chỉ được dùng duy nhất để gọi endpoint `POST /auth/refresh`.
- **Cơ chế Silent Refresh trong `shared/utils/api-client.js`**:
  1. Khi Access Token hết hạn, API Gateway trả về mã `401 GATEWAY_TOKEN_EXPIRED`.
  2. Axios response interceptor bắt lỗi này, tạm thời xếp các request gửi sau vào một hàng đợi (Queue).
  3. Kích hoạt request làm mới token: `POST /auth/refresh` kèm `refreshToken`.
  4. Nhận Access Token mới, cập nhật vào bộ nhớ Client.
  5. Phát lại (Replay) tất cả các request trong hàng đợi với token mới mà người dùng không bị gián đoạn thao tác.
  6. Nếu Refresh Token cũng hết hạn: Xóa sạch bộ nhớ phiên và điều hướng về trang đăng nhập tương ứng.

---

## 3. Ma Trận Phân Quyền (Role-Based Access Control - RBAC)

Hệ thống định nghĩa 4 cấp độ vai trò chính:

| Vai Trò | Quyền Hạn Trong Hệ Thống | Không Gian Làm Việc |
| :--- | :--- | :--- |
| **GUEST** (Chưa đăng nhập) | - Xem danh mục sản phẩm, tìm kiếm, xem trang chủ<br>- Thêm sản phẩm vào giỏ hàng cục bộ (Local Cart) | `apps/buyer` |
| **BUYER** (Khách hàng) | - Quản lý hồ sơ cá nhân, sổ địa chỉ nhận hàng<br>- Đặt hàng, thanh toán VNPAY QR, quản lý đơn hàng đã mua<br>- Viết đánh giá sản phẩm, lưu voucher, bấm theo dõi shop | `apps/buyer` |
| **SELLER** (Nhà bán hàng) | - Hoàn tất Onboarding 4 bước và nộp hồ sơ KYC<br>- Đăng bán và chỉnh sửa ma trận biến thể sản phẩm SKU<br>- Xác nhận đơn hàng, bàn giao vận chuyển, in vận đơn<br>- Quản lý số dư ví, gửi yêu cầu rút tiền về tài khoản ngân hàng | `apps/seller` |
| **ADMIN** (Quản trị viên) | - Thẩm định hồ sơ định danh KYC nhà bán (duyệt / từ chối)<br>- Quản lý tài khoản, khóa/mở tài khoản, phân quyền vai trò<br>- Cấu hình tỷ lệ phí sàn, bảng thuế khấu trừ<br>- Chạy đối soát lô thanh toán (Settlement Batches)<br>- Tra cứu nhật ký kiểm toán hệ thống (Audit Logs) | `apps/admin` |

> **Nguyên tắc bảo mật**: Việc ẩn/hiện nút bấm trên giao diện React chỉ phục vụ mục đích trải nghiệm người dùng (UX). **Toàn bộ quyết định cấp quyền thực tế nằm ở API Gateway và Microservices**.

---

## 4. Xác Thực Hai Yếu Tố (Two-Factor Authentication - 2FA)

Áp dụng bắt buộc cho các tài khoản Quản trị viên (`ADMIN`) khi thực hiện các thao tác nhạy cảm:

1. **Khởi tạo 2FA (`POST /admin/auth/2fa/setup`)**:
   - Backend sinh khóa bí mật và mã QR chuẩn TOTP.
   - Quản trị viên quét mã QR bằng ứng dụng Authenticator (Google Authenticator, Microsoft Authenticator).
2. **Xác thực và Kích hoạt (`POST /admin/auth/2fa/verify`)**:
   - Nhập mã 6 chữ số sinh ra từ ứng dụng.
   - Khi kích hoạt thành công, các hành động như: **Duyệt/từ chối KYC**, **Thay đổi biểu phí sàn**, **Khóa tài khoản người dùng**, **Quyết toán tiền ví** đều yêu cầu kèm mã OTP qua header `X-2FA-Code`.

---

## 5. Quy Chuẩn Bảo Mật Mã Nguồn Phía Client

- **Không hardcode**: Không lưu giữ mật khẩu, API key bí mật, chữ ký HMAC hoặc private key trong source code JavaScript.
- **Che giấu nhật ký**: Tuyệt đối không `console.log()` mã OTP, mật khẩu người dùng hoặc chuỗi Token đầy đủ.
- **Xóa sạch phiên khi Đăng xuất**: Gọi `POST /auth/signout` đồng thời xóa sạch token trong bộ nhớ Client và giỏ hàng tạm.
