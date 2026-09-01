# products.md (Sản phẩm & Tìm kiếm)

## 1. Tìm kiếm (Global Search)
Khách hàng có thể tìm kiếm sản phẩm từ thanh Header (Search bar).
Luồng: Nhập từ khóa -> Gợi ý (nếu có) -> Chuyển sang `/search?q=keyword`.

## 2. Bộ lọc (Filter Sidebar)
Trang Tìm kiếm và Danh mục sử dụng `FilterSidebar` với các tiêu chí lọc:
- **Danh mục (Category):** Lọc theo ngành hàng con.
- **Nơi bán (Location):** TP.HCM, Hà Nội, v.v.
- **Khoảng giá (Price Range):** Giá tối thiểu và tối đa.
- **Thương hiệu (Brand):** Checkbox chọn nhiều thương hiệu.
- **Đánh giá (Rating):** Từ 3 đến 5 sao.
- **Dịch vụ (Services):** Freeship, Hỏa tốc.

## 3. Cấu trúc Hiển thị (Product Card)
Component `ProductCard` được tái sử dụng ở Trang chủ, Tìm kiếm, và Wishlist.
Các trường bắt buộc: `id`, `name`, `price`, `image`.
Các trường tùy chọn: `originalPrice`, `discount` (%), `isOfficial` (Hàng chính hãng), `rating`, `sold`.
