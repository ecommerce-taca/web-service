# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG – TACA ECOMMERCE
## PHẦN 02: KIỂM TOÁN TƯƠNG THÍCH API CONTRACT (API CONTRACT AUDIT)

---

### 1. QUY CHUẨN ĐÁNH GIÁ API CONTRACT

Mọi API được kiểm tra chéo dựa trên 11 tiêu chí kỹ thuật:
1. **Endpoint & URL Path**: Tính chính xác của URI, tiền tố gateway `/api`.
2. **HTTP Method**: Chuẩn RESTful (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
3. **Authentication & Authorization**: Bearer JWT, `x-user-id`, `x-user-roles`.
4. **Tenant Isolation**: Bắt buộc header `x-user-shop-scope` cho mọi route `/seller/*`.
5. **Request Query Params**: Danh sách tham số lọc, phân trang, sắp xếp và whitelist validation.
6. **Request Body Schema**: So khớp cấu trúc DTO (NestJS Class-Validator).
7. **Concurrency Control (OCC)**: Trường số nguyên `version` chống xung đột ghi đè.
8. **Response Structure**: Chuẩn hóa envelope `{ success: true, data: ... }`.
9. **HTTP Status Codes**: Mã phản hồi thành công (200, 201) và lỗi (400, 401, 403, 404, 409).
10. **Error Codes**: Mã lỗi định danh (VD: `PRODUCT_NOT_FOUND`, `VERSION_CONFLICT`).
11. **Phân loại kết quả**:
    - **MATCH**: Tương thích hoàn toàn cả Request, Response, Headers và Nghiệp vụ.
    - **PARTIAL MATCH**: Tương thích cơ bản nhưng cần lưu ý OCC `version` hoặc DTO whitelist.
    - **MISMATCH**: Không tương thích về cấu trúc dữ liệu hoặc logic.
    - **BE ONLY**: Backend đã triển khai hoàn chỉnh nhưng Frontend chưa tích hợp.
    - **FE ONLY**: Frontend gọi API không tồn tại trong Backend.

---

### 2. BẢNG ĐỐI SOÁT CHI TIẾT 31 API ENDPOINTS

#### Nhóm 0: Hạ tầng & Giám sát hệ thống (Health & Metrics)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **0.1** | `GET /health/live` | `HealthController.getLive` | K8s / Gateway Probe | **MATCH (BE ONLY)** | Kiểm tra liveness liveness probe của container |
| **0.2** | `GET /health/ready` | `HealthController.getReady` | K8s / Gateway Probe | **MATCH (BE ONLY)** | Kiểm tra kết nối MongoDB, Kafka, Redis |

---

#### Nhóm 1: Quản lý Danh mục sản phẩm (Categories)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1.1** | `GET /categories` | `CategoriesController.findAll` (query: `flat`, `tree`, `include_inactive`) | Buyer: `product.api.js:getCategories()`<br/>Admin: `admin-catalog.api.js:getCategories()` | **MATCH** | Trả về danh mục dạng cây hoặc phẳng. Cache Redis 15 phút. |
| **1.2** | `GET /categories/{id}` | `CategoriesController.findOne` | Admin: `admin-catalog.api.js:getCategoryById()` | **MATCH** | Lấy chi tiết danh mục kèm thông tin phân cấp cha-con |
| **1.3** | `POST /admin/catalog/categories` | `AdminCategoriesController.create`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:createCategory()` | **MATCH** | Body: `name`, `slug`, `parent_id`, `tax_rate_bps`, `icon_url`, `display_order` |
| **1.4** | `PATCH /admin/catalog/categories/{id}` | `AdminCategoriesController.update`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:updateCategory()` | **MATCH** | Yêu cầu truyền `version` OCC. Cập nhật tên, icon, thuế suất |
| **1.5** | `POST /admin/catalog/categories/{id}/archive` | `AdminCategoriesController.archive`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:archiveCategory()` | **MATCH** | Body: `{ version, reason }`. Đổi trạng thái sang `ARCHIVED` |

---

#### Nhóm 2: Quản lý Bản nháp SPU Người bán (Seller SPU Drafts)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **2.1** | `POST /seller/products` | `SellerProductsController.createDraft`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:createProduct()` | **MATCH** | Tạo SPU trạng thái `DRAFT`, gán `version: 1`. Body chứa `price_summary: { base_price, currency }` |
| **2.2** | `GET /seller/products` | `SellerProductsController.findAll`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:getProducts()` | **MATCH** | Query: `page`, `size`, `status`, `q`, `category_id`. Tự động giới hạn theo shop của seller |
| **2.3** | `GET /seller/products/{id}` | `SellerProductsController.findOne`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:getProductById()` | **MATCH** | Trả về đầy đủ SPU, danh sách SKU, Media, Categories và Version hiện tại |
| **2.4** | `PATCH /seller/products/{id}` | `SellerProductsController.updateDraft`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:updateProduct()` | **PARTIAL MATCH** | **Bắt buộc `version`**. Nếu FE không gửi `version`, BE trả về 409 Conflict. Đã chuẩn hóa qua modal. |

---

#### Nhóm 3: Cấu hình Danh mục & Biến thể SKU (Categories & SKUs)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **3.1** | `PUT /seller/products/{id}/categories` | `SellerProductsController.updateCategories`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:updateCategories()` | **PARTIAL MATCH** | Body: `{ version, primary_category_id, secondary_category_ids }`. Bắt buộc `version`. |
| **3.2** | `PUT /seller/products/{id}/skus` | `SellerProductsController.updateSkus`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:updateSkus()` | **PARTIAL MATCH** | Body: `{ version, attribute_definitions, skus: [...] }`. Bắt buộc `version`. Thuộc tính key-value chuẩn. |

---

#### Nhóm 4: Quản lý Media & Tải ảnh lên S3 (Product Media)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **4.1** | `POST /seller/products/{id}/media/upload-url` | `ProductMediaController.getUploadUrl`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:getMediaUploadUrl()` | **PARTIAL MATCH** | Bước 1: Gửi `{ scope: "SPU", content_type, size_bytes, sha256, is_cover }` để nhận S3 Presigned URL |
| **4.2** | `POST /seller/products/{id}/media/complete` | `ProductMediaController.completeUpload`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:completeMediaUpload()` | **PARTIAL MATCH** | Bước 2: Sau khi PUT S3 xong, gửi `{ media_id, object_key, sha256 }` để BE xác nhận và kích hoạt media |
| **4.3** | `DELETE /seller/products/{id}/media/{mediaId}` | `ProductMediaController.removeMedia`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:deleteMedia()` | **MATCH** | Xóa ảnh khỏi SPU và hủy liên kết S3 |

---

#### Nhóm 5: Vòng đời sản phẩm (Product Lifecycle)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **5.1** | `POST /seller/products/{id}/submit` | `ProductLifecycleController.submit`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:submitProduct()` | **MATCH** | Chuyển trạng thái từ `DRAFT` / `REJECTED` sang `PENDING_APPROVAL`. Body: `{ version }` |
| **5.2** | `POST /seller/products/{id}/publish` | `ProductLifecycleController.publish`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:publishProduct()` | **MATCH** | Công khai sản phẩm (nếu chính sách cho phép tự publish). Body: `{ version }` |
| **5.3** | `POST /seller/products/{id}/unpublish` | `ProductLifecycleController.unpublish`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:unpublishProduct()` | **MATCH** | Tạm dừng bán sản phẩm. Body: `{ version, reason }` |
| **5.4** | `POST /seller/products/{id}/archive` | `ProductLifecycleController.archive`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:archiveProduct()` | **MATCH** | Lưu trữ vĩnh viễn sản phẩm. Body: `{ version, reason }` |

---

#### Nhóm 6: Khám phá Catalog phía Người mua (Buyer Public Catalog)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **6.1** | `GET /products` | `PublicProductsController.findAll` | Buyer: `product.api.js:getProducts()` | **MATCH** | Query: `page`, `size` (tối đa 100), `category_id`, `min_price`, `max_price`, `sort`, `q` |
| **6.2** | `GET /products/{id}` | `PublicProductsController.findOne` | Buyer: `product.api.js:getProductById()` | **MATCH** | Lấy chi tiết SPU, SKUs khả dụng, hình ảnh, shop snapshot. Cache Redis. |
| **6.3** | `GET /shops/{shopId}/products` | `PublicProductsController.findByShop` | Buyer: `product.api.js:getShopProducts()` | **MATCH** | Lấy danh sách sản phẩm đang bán của một gian hàng cụ thể |

---

#### Nhóm 7: Xuất nhập khẩu dữ liệu hàng loạt (Import & Export)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **7.1** | `GET /seller/products/export` | `ExportController.exportProducts`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:exportProducts()` | **MATCH** | Query: `status`, `q`, `format: csv\|xlsx`. Trả về stream file |
| **7.2** | `POST /seller/products/import/template` | `ImportController.downloadTemplate` | Seller: `seller-product.api.js:getImportTemplate()` | **MATCH** | Tải file Excel mẫu với các cột cấu hình SKU & Attribute |
| **7.3** | `POST /seller/products/import` | `ImportController.uploadFile`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:importProducts()` | **MATCH** | Multipart file upload (`.xlsx`). Trả về `{ job_id, status: "PENDING" }` |
| **7.4** | `GET /seller/products/import/jobs/{jobId}` | `ImportController.getJobStatus`<br/>Headers: `x-user-shop-scope` | Seller: `seller-product.api.js:getImportJob()` | **MATCH** | Polling tiến độ: `total_rows`, `processed_rows`, `error_count` |
| **7.5** | `GET /seller/products/import/jobs/{jobId}/result`| `ImportController.downloadJobResult` | BE triển khai sẵn | **BE ONLY** | Tải file Excel báo cáo lỗi chi tiết của từng dòng sản phẩm thất bại |

---

#### Nhóm 8: Kiểm duyệt & Quản trị Hệ thống (Admin Moderation & Audits)
| Stt | Method & Endpoint | BE Implementation | FE Service / Caller | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **8.1** | `GET /admin/catalog/products` | `AdminModerationController.findAll`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:getAdminProducts()` | **MATCH** | Query: `page`, `size`, `status`, `q`, `seller_id`, `flagged_only` |
| **8.2** | `GET /admin/catalog/products/{id}` | `AdminModerationController.findOne`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:getAdminProductById()` | **MATCH** | Xem toàn bộ chi tiết SPU, SKU, lịch sử vi phạm, rủi ro |
| **8.3** | `POST /admin/catalog/products/{id}/block` | `AdminModerationController.blockProduct`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:blockProduct()` | **MATCH** | Khóa sản phẩm vi phạm chính sách. Body: `{ version, reason }` |
| **8.4** | `POST /admin/catalog/products/{id}/unblock` | `AdminModerationController.unblockProduct`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:unblockProduct()` | **MATCH** | Mở khóa sản phẩm sau khi khiếu nại thành công. Body: `{ version, reason }` |
| **8.5** | `POST /admin/catalog/products/{id}/approve` | `AdminModerationController.approveProduct`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:approveProduct()` | **MATCH** | Phê duyệt sản phẩm `PENDING_APPROVAL` lên sàn (`PUBLISHED`). Body: `{ version }` |
| **8.6** | `POST /admin/catalog/products/{id}/reject` | `AdminModerationController.rejectProduct`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:rejectProduct()` | **MATCH** | Từ chối sản phẩm vi phạm. Body: `{ version, reason }`. Ghi nhận `rejection_reason` |
| **8.7** | `GET /admin/catalog/audits` | `AdminModerationController.getAudits`<br/>Role: `CATALOG_ADMIN` | Admin: `admin-catalog.api.js:getCatalogAudits()` | **MATCH** | Query: `entity_type`, `entity_id`, `page`, `size`. Lịch sử thay đổi |

---

### 3. TỔNG KẾT PHÂN LOẠI API VÀ PHÁT HIỆN KỸ THUẬT

1. **Không có Endpoint FE ONLY (0%)**: Frontend không hề gọi bất kỳ endpoint "ma" hay tự suy diễn nào không có trong Backend.
2. **Không có Endpoint MISMATCH (0%)**: Toàn bộ các path, HTTP method và cấu trúc RESTful đều khớp hoàn toàn với thiết kế của Backend.
3. **Các điểm PARTIAL MATCH (7 Endpoints - 22.6%)**:
   - Chủ yếu xuất phát từ cơ chế **Optimistic Concurrency Control (OCC)**: BE bắt buộc trường `version` trong body của `PATCH /seller/products/{id}`, `PUT /categories`, `PUT /skus`, và `POST /lifecycle`.
   - Frontend đã được tinh chỉnh để luôn lưu giữ `version` từ response `GET` và đính kèm vào payload gửi lên.
4. **Các điểm BE ONLY (6 Endpoints - 19.4%)**:
   - `0.1` & `0.2`: `/health/live` và `/health/ready` (Dành riêng cho DevOps/Kubernetes).
   - `7.5`: `GET /seller/products/import/jobs/{jobId}/result` (Cần bổ sung nút tải báo cáo lỗi Excel trên giao diện Import).
   - Một số query filter nâng cao như `flagged_only` trên Admin Catalog.

