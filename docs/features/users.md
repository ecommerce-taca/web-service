# users.md (Quản lý Người dùng & Tài khoản)

## 1. Cấu trúc trang Tài Khoản (Buyer)
Giao diện quản lý cá nhân của người dùng được chia thành các luồng (tab) sau:
- **Tổng quan (Overview):** *Sắp ra mắt.*
- **Hồ sơ & Địa chỉ (Profile):** Quản lý thông tin cá nhân (Tên, Email, SĐT, Ngày sinh, Giới tính) và sổ địa chỉ giao hàng.
- **Đơn mua (Orders):** Liên kết với module Orders (Xem chi tiết ở `orders.md`).
- **Đánh giá (Reviews):** Các sản phẩm người dùng đã mua và cần đánh giá / đã đánh giá. Trạng thái: `pending` hoặc `completed`.
- **Voucher của tôi (Vouchers):** Các mã giảm giá (Freeship, Giảm %). Dữ liệu cần có: Mức giảm, đơn tối thiểu, ngày hết hạn.
- **Sản phẩm yêu thích (Wishlist):** Danh sách thả tim. Cho phép lọc theo (Đang giảm giá, Sắp hết hàng).

## 2. Phân quyền (Roles)
- **Buyer:** Khách mua hàng.
- **Seller:** Người bán hàng (Sử dụng `@taca/seller`).
- **Admin:** Quản trị viên (Sử dụng `@taca/admin`).

*Đang chờ ghép nối với Auth Service (JWT).*
