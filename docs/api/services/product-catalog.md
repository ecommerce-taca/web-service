# Product Catalog Service API Specification

> **Dịch vụ Upstream:** `Product-Catalog-Service` (Port nội bộ `8083`)  
> **Prefix Gateway:** `/api/v1/products/**`, `/api/v1/categories/**`, `/api/v1/shops/{shopId}/products`, `/api/v1/seller/products/**`, `/api/v1/admin/catalog/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/product-catalog-docs/docs/api/product-catalog.md`

---

## 1. Công Khai Cho Người Mua (Public Storefront Catalog)

### 1.1 `GET /products`
- **Query Params:**
  - `page` (default: 1), `size` (default: 20, max: 100)
  - `category_id`, `shop_id`, `min_price`, `max_price`
  - `sort`: `newest`, `price_asc`, `price_desc`
  - `product_ids`: Danh sách ID phân tách bằng dấu phẩy (tối đa 100 IDs) dùng để hydrate thẻ sản phẩm cho giỏ hàng và danh sách yêu thích.
- **Response 200 (Item Card):**
  ```json
  {
    "data": [
      {
        "product_id": "product-01912f31",
        "title": "Apple iPhone 16 Pro Max 256GB",
        "slug": "apple-iphone-16-pro-max-256gb",
        "shop": { "shop_id": "shop-01912f30", "name": "Taca Apple Store", "slug": "taca-apple-store" },
        "primary_category_id": "category-01912f20",
        "tax_rate_bps": 1000,
        "price": { "base_price": 34990000, "sale_price": 29490000, "currency": "VND" },
        "cover_media": { "url": "https://cdn.taca.vn/ip16.webp" },
        "rating_summary": { "avg": 4.9, "count": 1284 },
        "stock_display": { "status": "IN_STOCK" }
      }
    ],
    "meta": { "page": 1, "size": 20, "total": 142, "total_pages": 8 }
  }
  ```

### 1.2 `GET /products/{productId}`
- **Response 200:** Chi tiết toàn bộ SPU, định nghĩa thuộc tính (`attributes`), danh sách các biến thể SKUs và giá bán tương ứng.

### 1.3 `GET /categories` & `GET /categories/{categoryId}`
- Trả về cây danh mục sản phẩm đa cấp (`depth <= 5`, `children[]`, `tax_rate_bps`). Dùng trực tiếp cho MegaMenu và bộ lọc danh mục.

### 1.4 `GET /shops/{shopId}/products`
- Danh sách sản phẩm của một shop cụ thể (truy vấn bằng `shopId` dạng UUID).

---

## 2. Kênh Người Bán (Seller Product Management)

### 2.1 Tạo & Quản lý Sản phẩm (`POST`, `GET`, `PATCH`, `DELETE`)
- `POST /seller/products`: Khởi tạo sản phẩm mới ở trạng thái `DRAFT` `{ title, slug, description, brand, price_summary }`.
- `GET /seller/products`: Lấy danh sách sản phẩm của shop (`status`, `sku_count`, `updated_at`).
- `GET /seller/products/{id}`: Xem chi tiết màn hình chỉnh sửa sản phẩm (Editor).
- `PATCH /seller/products/{id}`: Cập nhật thông tin SPU cơ bản (hỗ trợ `version` chống xung đột ghi đè).
- `GET /seller/products/export`: Xuất danh sách sản phẩm ra tệp `.xlsx` hoặc `.csv` qua Presigned URL.

### 2.2 Quản lý Ma trận Biến thể SKU (`PUT /seller/products/{id}/skus`)
- Thay thế hoặc cập nhật toàn bộ tập SKU của sản phẩm theo ma trận Cartesian.
- **Request Body:**
  ```json
  {
    "version": 3,
    "attribute_definitions": [
      { "key": "color", "label": "Màu sắc", "type": "ENUM", "is_variant_dimension": true, "allowed_values": ["Titan Sa Mạc", "Titan Đen"] },
      { "key": "storage", "label": "Dung lượng", "type": "ENUM", "is_variant_dimension": true, "allowed_values": ["256GB", "512GB", "1TB"] }
    ],
    "skus": [
      {
        "sku_id": "sku-ip16-sa-mac-256",
        "seller_sku": "IP16-SM-256",
        "attributes": { "color": "Titan Sa Mạc", "storage": "256GB" },
        "price_override": 29490000,
        "status": "ACTIVE"
      }
    ]
  }
  ```

### 2.3 Quá trình Xuất Bản & Vòng Đời Sản Phẩm
- `PUT /seller/products/{id}/categories`: Gán 1 danh mục chính (Primary) + tối đa 2 danh mục phụ (Secondary).
- `POST /seller/products/{id}/publish`: Xuất bản sản phẩm ra trạng thái kinh doanh `ACTIVE`.
  - *Điều kiện tiên quyết:* Shop phải có KYC `APPROVED`, có ít nhất 1 SKU `ACTIVE`, có 1 ảnh bìa READY.
- `POST /seller/products/{id}/unpublish`: Tạm dừng bán chuyển về `INACTIVE`.
- `POST /seller/products/{id}/archive`: Lưu trữ ngừng kinh doanh.

### 2.4 Tải lên Hình ảnh / Video Đa phương tiện (Media Upload)
- `POST /seller/products/{id}/media/upload-url`: Lấy Signed Upload URL gửi trực tiếp lên Object Storage (S3/MinIO), không đi qua Gateway.
- `POST /seller/products/{id}/media/complete`: Xác nhận tải ảnh lên thành công để chuyển trạng thái sang `READY`.

### 2.5 Nhập Sản Phẩm Hàng Loạt Bằng Excel (Bulk Import)
- `POST /seller/products/import/template`: Tải mẫu Excel tùy biến theo danh mục.
- `POST /seller/products/import`: Upload file Excel (Bất đồng bộ, dung lượng $\le 2\text{ MB}$, $\le 100\text{ SPUs}$). Nhận về `job_id`.
- `GET /seller/products/import/jobs/{jobId}`: Tra cứu tiến độ xử lý (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED`).
- `GET /seller/products/import/jobs/{jobId}/result`: Tải file Excel báo cáo chi tiết các dòng lỗi.

---

## 3. Cổng Quản Trị (Admin Catalog Moderation)

- `GET /admin/catalog/products`: Danh sách kiểm duyệt sản phẩm toàn hệ thống.
- `POST /admin/catalog/products/{id}/block`: Khóa sản phẩm vi phạm chính sách kèm lý do và yêu cầu 2FA.
- `POST /admin/catalog/products/{id}/unblock`: Mở khóa đưa sản phẩm về trạng thái an toàn `INACTIVE`.
- `GET /admin/catalog/categories` & `POST /admin/catalog/categories`: Quản trị cây danh mục toàn sàn.
- `PATCH /admin/catalog/categories/{id}`: Điều chỉnh thuế suất VAT danh mục (`tax_rate_bps`).
