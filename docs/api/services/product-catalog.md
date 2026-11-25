# Product Catalog Service — API Contract & FE Alignment

> Nguồn đối chiếu: `ecommerce-taca/Product-Catalog-Service` (nhánh `develop`).  
> Mọi request từ Frontend đi qua API Gateway với prefix `/api`.

---

## 1. Quy tắc chung từ Backend

- **ValidationPipe (NestJS):** `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.  
  Mọi query param hoặc body field không nằm trong DTO của BE sẽ bị trả về **HTTP 400 Bad Request**.
- **Response Envelope (`response-envelope.interceptor.ts`):**
  ```json
  {
    "data": "<array | object>",
    "meta": {
      "request_id": "...",
      "as_of": "...",
      "page": 1,
      "size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
  ```
  Lưu ý: `apiClient` đã unwrap Axios `response.data`, nên các service ở FE nhận trực tiếp `{ data, meta }`.
- **Enum `ProductStatus` (`product.schema.ts`):**
  - `DRAFT`
  - `ACTIVE`
  - `INACTIVE`
  - `BLOCKED`
  - `ARCHIVED`
  *(BE không có `PENDING_APPROVAL` hay `REJECTED`.)*

---

## 2. Public Endpoints (Buyer)

- `GET /products` — Whitelist query (`QueryProductsDto`): `page`, `size`, `category_id`, `shop_id`, `min_price`, `max_price`, `sort`, `product_ids`.
- `GET /products/:productId`
- `GET /shops/:shopId/products` — Dùng cùng `QueryProductsDto` whitelist.
- `GET /categories`
- `GET /categories/:id`

**Lưu ý FE (`apps/buyer/src/features/products/services/product.api.js`):**
- Sử dụng `sanitizeCatalogQueryParams` và `CATALOG_SORT_MAP` để loại bỏ các field không thuộc `QueryProductsDto` trước khi gửi lên BE.
- Không gọi endpoint Flash Sale riêng trên Product Catalog Service (`getFlashSaleProducts` đã được loại bỏ vì BE không cung cấp).

---

## 3. Seller Endpoints

- `POST /seller/products`
- `GET /seller/products`
- `GET /seller/products/export`
- `GET /seller/products/:productId`
- `PATCH /seller/products/:productId`
- `PUT /seller/products/:productId/categories`
- `PUT /seller/products/:productId/skus`
- `GET /seller/products/:productId/skus`
- `POST /seller/products/:productId/media/upload-url`
- `POST /seller/products/:productId/media/complete`
- `GET /seller/products/:productId/media`
- `DELETE /seller/products/:productId/media/:mediaId`
- `POST /seller/products/:productId/publish`
- `POST /seller/products/:productId/unpublish`
- `POST /seller/products/:productId/archive`
- Import hàng loạt (`src/import/controllers/seller-import.controller.ts`):
  - `POST /seller/products/import/template` — Gửi `Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` để nhận binary `.xlsx` trực tiếp (mặc định trả JSON `{ download_url, filename, expires_at }`). Body `GenerateCustomTemplateDto`: `row_count` (5..200), `category_ids`, `product_ids`, `layout_mode` (`MULTI_SHEET` | `SINGLE_SHEET`).
  - `POST /seller/products/import` — `multipart/form-data` field `file`, chỉ nhận `.xlsx`, tối đa **2MB**. Trả `202 Accepted` với `{ job_id, status, total_rows, created_at, message }`.
  - `GET /seller/products/import/jobs/:jobId` — `ImportJobResponseDto`: `job_id`, `status` (`PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`), `total_rows`, `processed_rows`, `success_count`, `error_count`, `error_summary`.
  - `GET /seller/products/import/jobs/:jobId/result` — Gửi `Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` để tải binary `.xlsx` các dòng lỗi khi `error_count > 0` (hoặc `Accept: application/json` để lấy `result_file_url`).

*(BE không có `POST /seller/products/:productId/submit`, `PUT /media/sort`, hay `PATCH /media/:id/cover`.)*

---

## 4. Admin Endpoints

- `GET /admin/catalog/products`
- `GET /admin/catalog/products/:productId`
- `POST /admin/catalog/products/:productId/block`
- `POST /admin/catalog/products/:productId/unblock`
- `GET /admin/catalog/audits` — Whitelist query (`QueryAuditsDto`): `target_id`, `target_type` (`PRODUCT` | `SKU` | `CATEGORY` | `MEDIA`), `actor_user_id`, `action`, `page`, `size`. Schema `CatalogAudit` trả về `_id`, `actor_user_id`, `shop_id`, `action`, `target_type`, `target_id`, `changes`, `reason`, `occurred_at`.
- `GET /admin/catalog/categories`
- `POST /admin/catalog/categories`
- `PATCH /admin/catalog/categories/:id`
- `POST /admin/catalog/categories/:id/archive`

*(BE không có `/admin/catalog/products/:productId/approve` hay `/reject`; kiểm duyệt sản phẩm sử dụng `block` / `unblock`.)*
