# Taca Ecommerce Frontend Architecture Overview

Dự án này sử dụng kiến trúc **Micro-Frontend (Micro FE)** dựa trên **Vite Module Federation** và được quản lý theo mô hình **Monorepo** (npm workspaces).

## 1. Cấu trúc 4 Micro-Apps
Thay vì một ứng dụng nguyên khối (Monolith) khổng lồ, hệ thống được chia làm 4 ứng dụng Frontend hoạt động độc lập nhưng liên kết với nhau:

- **`@taca/shell`**: Ứng dụng Host (App Mẹ). Chịu trách nhiệm render Layout tổng thể (Header, Footer, Navigation chung), quản lý trạng thái đăng nhập toàn cục, và điều hướng (Routing) tới các Remote Apps khác.
- **`@taca/buyer`**: Remote App dành riêng cho luồng khách hàng mua sắm (Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Checkout).
- **`@taca/seller`**: Remote App đóng vai trò là Dashboard quản lý cửa hàng của người bán.
- **`@taca/admin`**: Remote App dùng cho Quản trị viên hệ thống của Taca.

## 2. Shared Workspace
Tất cả các thành phần UI chung (Button, Input, Modal), các hook dùng chung, hoặc cấu hình config (Tailwind, ESLint) sẽ được trừu tượng hoá và đưa vào workspace `@taca/shared` để cả 4 app có thể tái sử dụng mà không phải viết lại code.

## 3. Lợi ích của kiến trúc
- **Triển khai độc lập (Independent Deployment):** Team làm tính năng Buyer có thể deploy riêng mà không ảnh hưởng đến team làm Seller.
- **Scale dễ dàng:** Không lo conflict quá lớn khi code phình to.
- **Tách biệt Logic:** Tránh việc logic phức tạp của Dashboard lại dính líu đến Storefront của khách mua hàng.
