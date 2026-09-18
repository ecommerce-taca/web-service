# Current Task

**Trạng thái:** Hoàn tất rà soát toàn bộ UI và API của ứng dụng Buyer.

**Chi tiết công việc đã hoàn thành trong phiên hiện tại:**
- Sửa lỗi UI bị crash hoặc trắng màn hình ở các trang sản phẩm, trang danh mục do lỗi padding và layout thừa.
- Khắc phục lỗi điều hướng bằng React Router (chuyển `window.location.href` thành `useNavigate`).
- Phát triển tính năng Favorite (API 40): Xây dựng custom hook `useFavorites` (tự bỏ qua gọi API khi user chưa login), component `FavoriteButton`, tích hợp vào Product Card và Product Detail.
- Cập nhật Route cho trang Danh mục để hỗ trợ URL đa cấp (`/category/:categorySlug/:subCategorySlug`).
- Rà soát toàn bộ hệ thống API Client hiện có, liệt kê danh sách endpoint đã tích hợp (Auth, Product, Account, Shop, Order) và cập nhật đồng bộ các file tài liệu trong thư mục `docs/`.
