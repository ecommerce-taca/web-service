# Kế hoạch tiếp theo (Next Session)

**Nhánh hiện tại:** `feature/account-details`
**Trạng thái:** Đã hoàn thành Layout chính của phần Tài khoản và trang Hồ sơ & địa chỉ (Profile Page).

## Mục tiêu (Goal)
Hoàn thiện toàn bộ các trang chức năng phụ bên trong mục Tài khoản (Account) và ghép nối luồng Đăng nhập thật (Auth).

## Chi tiết công việc (Tasks)

1. **Giao diện trang Đơn mua (Orders Page)**
   - Xây dựng component danh sách Đơn hàng.
   - Chức năng lọc đơn hàng theo trạng thái: *Tất cả, Đang giao, Đã hoàn thành, Đã hủy...* theo thiết kế Penpot.

2. **Giao diện trang Đánh giá & Voucher (Reviews & Vouchers)**
   - Khung danh sách đánh giá sản phẩm.
   - Thẻ hiển thị Voucher giảm giá của tôi.

3. **Giao diện Sản phẩm yêu thích (Wishlist)**
   - Re-use lại `ProductCard` để hiển thị dạng lưới các sản phẩm đã thả tim.

4. **Tích hợp Auth (Gắn dữ liệu thật)**
   - Đợi nhánh `epic/auth` (chứa các tính năng Đăng nhập) được gộp (merge) vào nhánh `develop`.
   - Cập nhật lại (rebase/merge) `develop` vào nhánh `feature/account-details` hiện tại.
   - Thay thế biến `user` giả (Mock) trong `AccountSidebar.jsx` bằng Hook `useAuth()` thật.
   - Xử lý điều hướng: Nếu user chưa đăng nhập mà ấn vào icon Tài Khoản hoặc truy cập `/account`, hệ thống sẽ tự động hiển thị Popup Đăng nhập thay vì cho vào trang Profile.

## Quy trình làm việc
- Đọc tiếp các khung hình (frames) tương ứng trong bản vẽ Penpot.
- Code từng component cho các tab trên.
- Đảm bảo tính nhất quán của Tailwind (`rounded-lg`, màu `#4f46e5`).
