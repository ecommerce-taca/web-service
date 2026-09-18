# Quản lý Sản phẩm (Products)

## Trạng thái triển khai
- **Trang Chi tiết sản phẩm (ProductDetailPage)**: 
  - Khung gallery ảnh sản phẩm, chọn biến thể (Màu sắc, Dung lượng).
  - Tích hợp nút `FavoriteButton` (Gọi API 40 - Batch Check và Toggle Favorite).
  - Phần Đánh giá (Reviews) và thông tin gian hàng (Shop card).
  - Nút Mua ngay (Sử dụng `useNavigate` tới trang `/checkout`).
- **Trang Danh mục (CategoryLandingPage)**:
  - Hỗ trợ breadcrumb động `/category/:categorySlug/:subCategorySlug`.
  - Có thanh lọc (FilterSidebar) và danh sách sản phẩm Grid hiển thị nút Yêu thích (Tim).
