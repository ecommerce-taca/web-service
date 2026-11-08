# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG – TACA ECOMMERCE
## PHẦN 05: KIỂM TOÁN CÁC LUỒNG THỰC THI ĐẦU CUỐI (END-TO-END FLOW AUDIT)

---

### 1. LUỒNG 1: NGƯỜI BÁN TẠO VÀ NỘP DUYỆT SẢN PHẨM (SELLER SPU CREATION & SUBMISSION)

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Người bán (Seller)
    participant Modal as ProductEditorModal (FE)
    participant Svc as seller-product.api.js
    participant GW as API Gateway
    participant BE as Product-Catalog-Service
    participant S3 as Amazon S3 Bucket
    participant DB as MongoDB Cluster
    participant Kafka as Kafka Event Bus

    Seller->>Modal: Điền thông tin cơ bản (Tên, Mô tả, Giá)
    Modal->>Svc: createProduct(payload)
    Svc->>GW: POST /api/seller/products (x-user-shop-scope)
    GW->>BE: Forward Request + Shop Scope
    BE->>DB: Lưu SPU (status: DRAFT, version: 1)
    DB-->>BE: Saved SPU
    BE-->>Modal: Trả về product_id & version: 1

    Seller->>Modal: Chọn danh mục chính & phụ
    Modal->>Svc: updateCategories(id, { version: 1, primary_category_id, secondary_category_ids })
    Svc->>GW: PUT /api/seller/products/{id}/categories
    GW->>BE: Validate version == 1 -> Cập nhật DB
    BE->>DB: Lưu categories, tăng version = 2
    BE-->>Modal: Thành công, version: 2

    Seller->>Modal: Cấu hình ma trận biến thể (Màu, Size, Giá riêng, SKU)
    Modal->>Svc: updateSkus(id, { version: 2, attribute_definitions, skus })
    Svc->>GW: PUT /api/seller/products/{id}/skus
    GW->>BE: Validate version == 2 -> Tạo SKU documents
    BE->>DB: Lưu các SKU con, tăng version = 3
    BE-->>Modal: Thành công, version: 3

    Seller->>Modal: Chọn ảnh tải lên
    Modal->>Svc: getMediaUploadUrl(id, { scope: "SPU", content_type, size, sha256, is_cover: true })
    Svc->>GW: POST /api/seller/products/{id}/media/upload-url
    GW->>BE: Sinh S3 Presigned URL
    BE-->>Modal: Trả về presigned_url & media_id
    Modal->>S3: PUT direct upload binary image lên S3
    S3-->>Modal: HTTP 200 OK
    Modal->>Svc: completeMediaUpload(id, { media_id, object_key, sha256 })
    Svc->>GW: POST /api/seller/products/{id}/media/complete
    GW->>BE: Xác nhận hoàn tất upload media
    BE->>DB: Cập nhật media status = COMPLETED
    BE-->>Modal: Media kích hoạt thành công

    Seller->>Modal: Bấm nút "Nộp duyệt sản phẩm"
    Modal->>Svc: submitProduct(id, { version: 3 })
    Svc->>GW: POST /api/seller/products/{id}/submit
    GW->>BE: Kiểm tra điều kiện (Có đủ SKU, danh mục, ảnh cover)
    BE->>DB: Cập nhật status = PENDING_APPROVAL, tăng version = 4
    BE->>Kafka: Phát sự kiện ProductSubmittedEvent
    BE-->>Modal: Nộp duyệt thành công! Trạng thái chuyển sang Chờ duyệt.
```

- **Đánh giá rủi ro luồng 1**:
  - Nếu Seller tắt trình duyệt giữa chừng, sản phẩm vẫn được lưu dưới dạng `DRAFT` và có thể chỉnh sửa tiếp tại danh sách sản phẩm.
  - Kiểm soát đồng thời `version` tăng dần từ 1 -> 2 -> 3 -> 4 đảm bảo không bị ghi đè dữ liệu.

---

### 2. LUỒNG 2: QUẢN TRỊ VIÊN KIỂM DUYỆT SẢN PHẨM (ADMIN MODERATION FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên (Admin)
    participant Page as AdminProductsPage (FE)
    participant Svc as admin-catalog.api.js
    participant GW as API Gateway
    participant BE as Product-Catalog-Service
    participant DB as MongoDB Cluster
    participant Redis as Redis Cache
    participant Kafka as Kafka Event Bus

    Admin->>Page: Mở Tab "Chờ kiểm duyệt" (PENDING_APPROVAL)
    Page->>Svc: getAdminProducts({ status: 'PENDING_APPROVAL' })
    Svc->>GW: GET /api/admin/catalog/products?status=PENDING_APPROVAL
    GW->>BE: Forward + Role Check (CATALOG_ADMIN)
    BE->>DB: Query products where status == 'PENDING_APPROVAL'
    DB-->>BE: Danh sách sản phẩm chờ duyệt
    BE-->>Page: Render danh sách kèm thông tin gian hàng & ảnh

    Admin->>Page: Bấm xem chi tiết & thẩm định nội dung
    Page->>Svc: getAdminProductById(id)
    Svc->>GW: GET /api/admin/catalog/products/{id}
    GW->>BE: Trả về chi tiết SPU, SKUs, Media, Lịch sử

    alt Kịch bản 1: Sản phẩm đạt yêu cầu (Phê duyệt)
        Admin->>Page: Bấm "Phê duyệt" (Approve)
        Page->>Svc: approveProduct(id, { version })
        Svc->>GW: POST /api/admin/catalog/products/{id}/approve
        GW->>BE: Atomic Update: status = PUBLISHED, version += 1
        BE->>DB: Lưu trạng thái PUBLISHED
        BE->>Redis: Xóa cache danh mục & public products
        BE->>Kafka: Phát sự kiện ProductApprovedEvent
        BE-->>Page: Phê duyệt thành công. Sản phẩm xuất hiện trên sàn ngay lập tức!
    else Kịch bản 2: Sản phẩm vi phạm (Từ chối)
        Admin->>Page: Bấm "Từ chối" (Reject) -> Nhập lý do vi phạm
        Page->>Svc: rejectProduct(id, { version, reason: 'Ảnh mờ, thiếu tem phụ' })
        Svc->>GW: POST /api/admin/catalog/products/{id}/reject
        GW->>BE: Atomic Update: status = REJECTED, rejection_reason, version += 1
        BE->>DB: Lưu trạng thái REJECTED kèm lý do
        BE->>Kafka: Phát sự kiện ProductRejectedEvent (Gửi thông báo tới Seller)
        BE-->>Page: Đã từ chối sản phẩm. Trả về cho Seller sửa lại.
    end
```

---

### 3. LUỒNG 3: KHÁCH HÀNG KHÁM PHÁ VÀ ĐẶT HÀNG (BUYER CATALOG DISCOVERY & PURCHASE)

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Khách hàng (Buyer)
    participant Store as Buyer Storefront (FE)
    participant Purchase as ProductPurchase Component
    participant Svc as product.api.js
    participant GW as API Gateway
    participant BE as Product-Catalog-Service
    participant Redis as Redis Cache
    participant Cart as Cart Service

    Buyer->>Store: Tìm kiếm theo từ khóa hoặc chọn Danh mục
    Store->>Svc: getProducts({ category_id: 12, sort: 'newest', page: 1 })
    Svc->>GW: GET /api/products?...
    GW->>BE: Check Redis Cache -> Nếu miss thì query MongoDB
    BE-->>Store: Trả về mảng sản phẩm (Đã filter chỉ lấy PUBLISHED)
    Store->>Store: Chuẩn hóa qua normalizeProductList() -> Render ProductCards

    Buyer->>Store: Click chọn sản phẩm -> Chuyển sang ProductDetailPage
    Store->>Svc: getProductById(id)
    Svc->>GW: GET /api/products/{id}
    GW->>BE: Lấy SPU + SKUs + Media + Shop Snapshot (Từ cache Redis)
    BE-->>Store: Trả về chi tiết sản phẩm

    Buyer->>Purchase: Chọn "Màu Đen" và "Size XL"
    Purchase->>Purchase: Khớp thuộc tính với SKU Matrix -> Tìm ra sku_id tương ứng
    Purchase->>Purchase: Cập nhật giá theo price_override & kiểm tra tồn kho available_quantity

    Buyer->>Purchase: Bấm "Thêm vào giỏ hàng"
    Purchase->>Cart: POST /api/cart/items ({ product_id, sku_id, quantity: 1 })
    Cart-->>Purchase: Thêm giỏ hàng thành công
    Purchase-->>Buyer: Hiển thị Toast thông báo và cập nhật Badge giỏ hàng
```

---

### 4. LUỒNG 4: NHẬP SẢN PHẨM HÀNG LOẠT (BULK EXCEL IMPORT FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Người bán (Seller)
    participant Modal as ProductImportModal (FE)
    participant Svc as seller-product.api.js
    participant GW as API Gateway
    participant BE as Product-Catalog-Service
    participant Worker as Background Import Worker
    participant DB as MongoDB Cluster

    Seller->>Modal: Bấm "Tải file mẫu Excel"
    Modal->>Svc: getImportTemplate()
    Svc->>GW: POST /api/seller/products/import/template
    GW->>BE: Tạo file .xlsx mẫu chuẩn kèm hướng dẫn cột
    BE-->>Seller: Tải file template về máy

    Seller->>Modal: Kéo thả file Excel đã điền dữ liệu -> Bấm "Bắt đầu nhập"
    Modal->>Svc: importProducts(formData)
    Svc->>GW: POST /api/seller/products/import (multipart/form-data)
    GW->>BE: Nhận file, lưu tạm, tạo bản ghi import_jobs (status: PENDING)
    BE->>Worker: Đẩy job_id vào hàng đợi xử lý ngầm (Queue)
    BE-->>Modal: Trả về { job_id: "job_9981", status: "PENDING" }

    loop Polling tiến độ mỗi 2 giây
        Modal->>Svc: getImportJob("job_9981")
        Svc->>GW: GET /api/seller/products/import/jobs/job_9981
        GW->>BE: Đọc trạng thái từ collection import_jobs
        BE-->>Modal: Trả về { status: "PROCESSING", processed_rows: 45, total_rows: 100, error_count: 2 }
        Modal->>Modal: Cập nhật thanh tiến trình 45%
    end

    Worker->>DB: Hoàn tất chèn 98 sản phẩm, 2 dòng lỗi ghi vào error file
    Worker->>DB: Cập nhật status = COMPLETED, error_file_url

    Modal->>Svc: getImportJob("job_9981")
    BE-->>Modal: Trả về status: "COMPLETED"
    Modal-->>Seller: Báo hoàn tất: 98 thành công, 2 lỗi. Hiển thị nút tải file kết quả lỗi.
```

---

### 5. LUỒNG 5: ĐỒNG BỘ TỒN KHO VÀ SỰ KIỆN QUA KAFKA (INVENTORY & OUTBOX SYNC)

```mermaid
sequenceDiagram
    autonumber
    participant Order as Order / Warehouse Service
    participant Kafka as Kafka Event Broker
    participant BE as Product-Catalog-Service
    participant Debezium as Debezium CDC Connector
    participant Outbox as Outbox Collection
    participant Proj as Inventory Projection Collection

    Order->>Kafka: Phát sự kiện OrderCreatedEvent / StockReservedEvent
    Kafka->>BE: Consumer lắng nghe topic 'inventory.stock.events'
    BE->>Proj: Cập nhật available_quantity = available_quantity - reserved
    Proj-->>BE: Cập nhật thành công projection trong MongoDB

    Note over BE,Outbox: Khi Seller cập nhật giá hoặc danh mục sản phẩm:
    BE->>Outbox: Ghi sự kiện ProductPriceChangedEvent trong cùng Mongo Transaction
    Debezium->>Outbox: Giám sát Oplog MongoDB
    Debezium->>Kafka: Đẩy message sang topic 'catalog.product.events'
    Kafka->>Order: Consumer Order Service đồng bộ lại giá sản phẩm
```

- **Kết luận kiến trúc**:
  - Mô hình Transactional Outbox kết hợp Debezium CDC giải quyết triệt để vấn đề mất tính nhất quán giữa Database và Message Broker (Dual-write problem).
  - Tách bạch giữa dữ liệu gốc Catalog (`products`, `skus`) và bảng chiếu tồn kho (`inventory_projections`) giúp tốc độ truy vấn trang sản phẩm của Buyer đạt dưới **50ms**.

