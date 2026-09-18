# Xác thực (Authentication)

## Trạng thái triển khai
- **Hoàn thành UI**: AuthModal (Login, Register), Forgot Password, Verify Email, OTP overlay.
- **Hoàn thành API**: `/auth/signin`, `/auth/signup`, `/auth/signout`, OTP & Forgot Password.
- **State Management**: Sử dụng `AuthContext` (useReducer) lưu `user`, `isAuthenticated`, tự động lưu token vào `localStorage`.
- **Luồng xử lý**: Modal có thể bật popup ở mọi trang (thông qua `openAuthModal`). Đăng nhập thành công trả về token và cập nhật icon header.
