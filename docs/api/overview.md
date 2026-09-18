# Tổng quan API đã tích hợp (Buyer App)

Dưới đây là danh sách các API đã được tích hợp thực tế vào mã nguồn frontend (`apps/buyer/src/features/**/*.api.js`):

## 1. Auth & User API (`features/auth/services/auth.api.js`)
- `POST /auth/signup`: Đăng ký tài khoản.
- `POST /auth/signin`: Đăng nhập.
- `POST /auth/signout`: Đăng xuất.
- `POST /auth/email/verify`: Xác thực email.
- `POST /auth/email/resend`: Gửi lại email xác thực.
- `POST /auth/phone/request-otp`: Yêu cầu mã OTP SMS.
- `POST /auth/phone/verify-otp`: Xác thực mã OTP.
- `POST /auth/password/forgot`: Quên mật khẩu.
- `POST /auth/password/reset`: Đặt lại mật khẩu.
- `GET /users/me`: Lấy thông tin cá nhân.
- `PUT /users/me`: Cập nhật thông tin cá nhân.

## 2. Favorites API (`features/products/services/favorites.api.js`)
- `GET /users/me/favorites`: Lấy danh sách sản phẩm yêu thích.
- `POST /users/me/favorites`: Thêm vào yêu thích.
- `DELETE /users/me/favorites/{productId}`: Xóa khỏi yêu thích.
- `GET /users/me/favorites/contains`: Kiểm tra danh sách ID có trong yêu thích không (dùng batch check).

## 3. Shop API (`features/shops/services/shop.api.js`)
- `POST /shops/{shopId}/follow`: Theo dõi shop.
- `DELETE /shops/{shopId}/follow`: Bỏ theo dõi shop.
- `GET /users/me/following`: Danh sách shop đang theo dõi.
- `GET /shops/{shopId}/followers/count`: Lấy số lượng follower của shop.
- `GET /shops/{shopId}`: Lấy thông tin shop.

## 4. Address API (`features/account/services/address.api.js`)
- `GET /users/me/addresses`: Lấy danh sách địa chỉ.
- `POST /users/me/addresses`: Thêm địa chỉ mới.
- `PUT /users/me/addresses/{addressId}`: Cập nhật địa chỉ.
- `DELETE /users/me/addresses/{addressId}`: Xóa địa chỉ.

## 5. Order API (`features/account/services/order.api.js`)
- `GET /orders/me`: Lấy danh sách đơn hàng.
- `GET /orders/{orderId}`: Lấy chi tiết đơn hàng.

## 6. Review & Voucher API (`features/account/services/*.api.js`)
- `GET /users/me/reviews/pending`: Chờ đánh giá.
- `GET /users/me/reviews/completed`: Đã đánh giá.
- `POST /reviews`: Viết đánh giá.
- `GET /vouchers`: Lấy danh sách voucher.
- `POST /vouchers/save`: Lưu voucher.
