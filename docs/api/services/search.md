# Search Service API Specification

> **Dịch vụ Upstream:** `search-service` (Port nội bộ `8089`)  
> **Prefix Gateway:** `/api/v1/search/**`, `/api/v1/products/search`, `/api/v1/admin/search/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/search-docs/docs/api/search.md`

---

## 1. Tìm Kiếm Nâng Cao & Gợi Ý Từ Khóa (Storefront Search)

### 1.1 `GET /search/suggest` (Gợi ý tức thì / Autocomplete)
- **Quyền:** Public
- **Query:** `q` (chuỗi từ khóa tối thiểu 2 ký tự)
- **Response 200:**
  ```json
  {
    "data": {
      "keywords": ["iphone 16 pro max", "iphone 16 plus", "ốp lưng iphone 16"],
      "categories": [{ "id": "cat-01912", "name": "Điện thoại Apple" }],
      "topProducts": [
        { "id": "prd-01912", "title": "iPhone 16 Pro Max 256GB", "price": 29490000, "thumbnail": "https://cdn.taca.vn/ip16.jpg" }
      ]
    }
  }
  ```

### 1.2 `GET /search` (Tìm kiếm toàn văn kết hợp Facet Filter)
- **Query Params:**
  - `q`: Từ khóa tìm kiếm
  - `category_id`: Lọc theo ngành hàng
  - `min_price`, `max_price`: Khoảng giá VND
  - `rating`: Đánh giá tối thiểu (ví dụ `4` = từ 4 sao trở lên)
  - `in_stock`: `true` | `false`
  - `sort`: `relevance` (độ liên quan), `price_asc`, `price_desc`, `newest`, `top_sales`
- **Response 200:**
  ```json
  {
    "data": [
      {
        "productId": "prd-01912f31",
        "title": "Apple iPhone 16 Pro Max 256GB",
        "price": 29490000,
        "rating": 4.9,
        "salesCount": 3500,
        "location": "TP. Hồ Chí Minh"
      }
    ],
    "facets": {
      "categories": [{ "id": "cat-phones", "name": "Điện thoại", "count": 120 }],
      "brands": [{ "name": "Apple", "count": 85 }, { "name": "Anker", "count": 35 }],
      "priceRanges": [
        { "label": "Dưới 5 triệu", "from": 0, "to": 5000000, "count": 12 },
        { "label": "Trên 20 triệu", "from": 20000000, "to": null, "count": 48 }
      ]
    },
    "meta": { "page": 1, "size": 20, "total": 142 }
  }
  ```

---

## 2. Quản Trị Chỉ Mục (Admin Search Indexing)

- `POST /admin/search/reindex`: Quản trị viên kích hoạt tái đánh chỉ mục Elasticsearch toàn sàn hoặc theo danh mục khi có thay đổi cấu trúc dữ liệu.
