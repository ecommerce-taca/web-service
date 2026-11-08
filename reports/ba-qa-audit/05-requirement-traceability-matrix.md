# MA TRẬN TRUY XUẤT NGUỒN GỐC YÊU CẦU (REQUIREMENT TRACEABILITY MATRIX - RTM)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior Business Analyst (BA) & QA/QC Lead
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất ma trận (100% Traceability Covered)
- **Phạm vi**: 28 Yêu cầu nghiệp vụ (PC-REQ-001 đến PC-REQ-028)

---

## I. MỤC TIÊU MA TRẬN RTM

Ma trận truy xuất nguồn gốc yêu cầu (RTM) là công cụ kiểm soát chất lượng kỹ thuật quan trọng nhất để chứng minh rằng:
1. Mọi yêu cầu nghiệp vụ đều có mã nguồn Frontend đại diện (UI Page & Component).
2. Mọi chức năng giao diện đều gọi đúng Endpoint API do Backend cung cấp thông qua tầng Service & Adapter.
3. Mọi Endpoint API đều được xử lý bởi Controller, Service và lưu trữ vào Mongoose Collection tương ứng.
4. Mọi yêu cầu đều có Test Case cụ thể để kiểm thử và xác nhận trạng thái.

---

## II. BẢNG MA TRẬN TRUY XUẤT CHI TIẾT (END-TO-END RTM TABLE)

| Req ID | Tên & Tóm tắt nghiệp vụ | Frontend Page / Component | FE API Service / Adapter | HTTP Method & Endpoint | Backend Controller | Backend Service / Model | Test Case ID | Trạng thái triển khai |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **PC-REQ-001** | Cây danh mục đa cấp (Category Hierarchy) | `CategoryNav.jsx`, `AdminCategoriesPage.jsx` | `buyer-catalog.api.js`, `admin-catalog.api.js` | `GET /api/v1/categories/tree` | `CategoryTreeController.getTree` | `CategoryTreeService`, `categories` | TC-01 | **FULLY IMPLEMENTED** |
| **PC-REQ-002** | Thuế suất Basis Points (Tax Rate BPS) | `AdminCategoriesPage.jsx`, `ProductSpecsTable.jsx` | `product.adapter.js` (`tax_rate_bps`) | `PATCH /api/v1/admin/categories/:id` | `AdminCategoryController.update` | `CategoryService`, `categories` | TC-02 | **FULLY IMPLEMENTED** |
| **PC-REQ-003** | Mẫu thuộc tính danh mục (Category Attributes) | `ProductAttributesSection.jsx` | `seller-product.api.js` | `GET /api/v1/categories/:id/attributes` | `CategoryAttributeController.findAll` | `CategoryAttributeService`, `attributes` | TC-03 | **FULLY IMPLEMENTED** |
| **PC-REQ-004** | Tối ưu SEO Danh mục (Slug & Meta) | `CategoryPage.jsx` | `buyer-catalog.api.js` | `GET /api/v1/categories/by-slug/:slug` | `CategoryController.findBySlug` | `CategoryService`, `categories` | TC-04 | **FULLY IMPLEMENTED** |
| **PC-REQ-005** | Tạo bản nháp SPU (SPU Draft Creation) | `ProductCreatePage.jsx` | `seller-product.api.js` (`createProduct`) | `POST /api/v1/seller/products` | `SellerProductController.create` | `SellerProductService`, `products` | TC-05 | **FULLY IMPLEMENTED** |
| **PC-REQ-006** | Khóa lạc quan OCC (Version Control) | `ProductsPage.jsx`, `AdminProductsPage.jsx` | `product.adapter.js` (OCC version) | `PUT /api/v1/seller/products/:id` | `SellerProductController.update` | `ProductLifecycleService`, `products` | TC-06 | **FULLY IMPLEMENTED** |
| **PC-REQ-007** | Mô tả & Thông số kỹ thuật (Specs & Details) | `ProductSpecsTable.jsx`, `ProductDescription.jsx`| `product.adapter.js` (`specs`) | `PATCH /api/v1/seller/products/:id/specs` | `SellerProductController.updateSpecs` | `SellerProductService`, `products` | TC-07 | **FULLY IMPLEMENTED** |
| **PC-REQ-008** | Quản lý thương hiệu (Brand Filtering) | `ProductFilters.jsx` | `buyer-catalog.api.js` | `GET /api/v1/buyer/products?brand=...` | `BuyerProductController.findAll` | `BuyerProductService`, `products` | TC-08 | **FULLY IMPLEMENTED** |
| **PC-REQ-009** | Ma trận biến thể 2 chiều (SKU Matrix) | `SkuMatrixTable.jsx` | `seller-product.api.js` (`saveSkus`) | `PUT /api/v1/seller/products/:id/skus` | `SellerProductController.updateSkus` | `ProductVariantService`, `products.skus` | TC-09 | **FULLY IMPLEMENTED** |
| **PC-REQ-010** | Định giá & Giá so sánh (Price & Strikethrough)| `ProductPriceDisplay.jsx`, `ProductCard.jsx` | `formatCurrency.js` | `PUT /api/v1/seller/products/:id/skus` | `SellerProductController.updateSkus` | `ProductVariantService`, `products.skus` | TC-10 | **FULLY IMPLEMENTED** |
| **PC-REQ-011** | Quản lý tồn kho ban đầu (Initial Inventory) | `AddToCartButton.jsx` (`disabled={stock===0}`) | `product.adapter.js` (`stock`) | `PUT /api/v1/seller/products/:id/skus` | `SellerProductController.updateSkus` | `ProductVariantService`, `products.skus` | TC-11 | **FULLY IMPLEMENTED** |
| **PC-REQ-012** | Mã SKU duy nhất (Unique SKU Code) | `SkuMatrixTable.jsx` | `seller-product.api.js` | `POST /api/v1/seller/products/check-sku` | `SellerProductController.checkSku` | `ProductVariantService`, `products` | TC-12 | **FULLY IMPLEMENTED** |
| **PC-REQ-013** | Tải ảnh trực tiếp S3 Presigned URL | `ProductImageUploader.jsx` | `seller-media.api.js` | `POST /api/v1/media/presign-upload` | `MediaController.presignUpload` | `S3Service`, `media_assets` | TC-13 | **CONDITIONALLY IMPLEMENTED** *(Live S3 required)* |
| **PC-REQ-014** | Bộ sưu tập ảnh & Ảnh bìa (Cover Image) | `ProductImageGallery.jsx` | `seller-product.api.js` | `PUT /api/v1/seller/products/:id/media` | `SellerProductController.updateMedia` | `SellerProductService`, `products` | TC-14 | **FULLY IMPLEMENTED** |
| **PC-REQ-015** | Dọn dẹp ảnh mồ côi (Orphan Cleanup Cron) | *(Chức năng hệ thống ngầm)* | *(N/A - Background Job)* | *(Cron Trigger 00:00)* | `MediaCleanupTask` | `S3Service`, `media_assets` | TC-15 | **FULLY IMPLEMENTED** |
| **PC-REQ-016** | Gửi yêu cầu duyệt sản phẩm (Submit for Approval)| `ProductsPage.jsx` | `seller-product.api.js` (`submitProduct`) | `POST /api/v1/seller/products/:id/submit`| `SellerProductController.submit` | `ProductLifecycleService`, `outbox_events` | TC-16 | **FULLY IMPLEMENTED** |
| **PC-REQ-017** | Admin phê duyệt sản phẩm (Admin Approval) | `AdminProductsPage.jsx` | `admin-catalog.api.js` (`approveProduct`)| `POST /api/v1/admin/products/:id/approve` | `AdminProductController.approve` | `ProductLifecycleService`, `outbox_events` | TC-17 | **FULLY IMPLEMENTED** |
| **PC-REQ-018** | Admin từ chối kèm lý do (Admin Rejection) | `RejectReasonModal.jsx`, `RejectionAlert.jsx` | `admin-catalog.api.js` (`rejectProduct`) | `POST /api/v1/admin/products/:id/reject` | `AdminProductController.reject` | `ProductLifecycleService`, `outbox_events` | TC-18 | **FULLY IMPLEMENTED** |
| **PC-REQ-019** | Ẩn/Hiện sản phẩm & Gỡ vi phạm (Takedown) | `AdminProductsPage.jsx` (`flaggedOnly`) | `admin-catalog.api.js` | `PATCH /api/v1/admin/products/:id/flag` | `AdminProductController.flagProduct` | `AdminProductService`, `products` | TC-19 | **FULLY IMPLEMENTED** |
| **PC-REQ-020** | Phân trang danh sách sản phẩm (Pagination) | `CategoryPage.jsx`, `Pagination.jsx` | `buyer-catalog.api.js` | `GET /api/v1/buyer/products?page=1` | `BuyerProductController.findAll` | `BuyerProductService`, `products` | TC-20 | **FULLY IMPLEMENTED** |
| **PC-REQ-021** | Lọc đa chiều động (Faceted Filtering) | `ProductFilters.jsx` | `buyer-catalog.api.js` | `GET /api/v1/buyer/products?minPrice=...`| `BuyerProductController.findAll` | `BuyerProductService`, `products` | TC-21 | **FULLY IMPLEMENTED** |
| **PC-REQ-022** | Sắp xếp sản phẩm (Sorting Options) | `ProductSortDropdown.jsx` | `buyer-catalog.api.js` | `GET /api/v1/buyer/products?sort=...` | `BuyerProductController.findAll` | `BuyerProductService`, `products` | TC-22 | **FULLY IMPLEMENTED** |
| **PC-REQ-023** | Trang chi tiết sản phẩm PDP tương tác | `ProductDetailPage.jsx`, `VariantSelector.jsx` | `buyer-catalog.api.js` | `GET /api/v1/buyer/products/:slugOrId` | `BuyerProductController.findOne` | `BuyerProductService`, `products` | TC-23 | **FULLY IMPLEMENTED** |
| **PC-REQ-024** | Kiểm tra trạng thái bán & Thêm giỏ hàng | `AddToCartButton.jsx`, `CartContext.jsx` | `cart.api.js` | `POST /api/v1/cart/items` | `CartController.addItem` | `CartService`, `carts` | TC-24 | **FULLY IMPLEMENTED** |
| **PC-REQ-025** | Nhập sản phẩm hàng loạt (Bulk Excel Import) | `ProductImportModal.jsx` | `seller-product.api.js` (`bulkImport`) | `POST /api/v1/seller/products/bulk-import`| `BulkImportController.upload` | `BulkImportService`, `import_jobs` | TC-25 | **FULLY IMPLEMENTED** |
| **PC-REQ-026** | Xuất danh mục sản phẩm (Data Export) | `ProductsPage.jsx` | `seller-product.api.js` (`exportData`) | `GET /api/v1/seller/products/export` | `SellerProductController.export` | `SellerProductService`, `products` | TC-26 | **FULLY IMPLEMENTED** |
| **PC-REQ-027** | Nhật ký kiểm toán danh mục (Catalog Audits) | `AdminAuditLogsPage.jsx` (`Catalog Scope`) | `admin-catalog.api.js` (`getCatalogAudits`)| `GET /api/v1/admin/catalog/audits` | `AdminAuditController.getCatalogAudits` | `AuditLogService`, `audit_logs` | TC-27 | **FULLY IMPLEMENTED** |
| **PC-REQ-028** | Sự kiện Outbox & Streaming (Kafka Integration) | *(Hệ thống ngầm Event-Driven)* | *(N/A - Outbox Relayer Poller)* | *(Kafka Topic: product.events.v1)* | `OutboxRelayPoller` | `OutboxService`, `outbox_events` | TC-28 | **FULLY IMPLEMENTED** |

---

## III. TỔNG HỢP TRẠNG THÁI TRUY XUẤT NGUỒN GỐC

- **Tổng số yêu cầu kiểm toán**: 28 Yêu cầu (100% Coverage).
- **Yêu cầu đã liên kết đầy đủ FE ➔ API ➔ BE ➔ DB ➔ Test Case**: 28 / 28 (100%).
- **Trạng thái thực thi**:
  - `FULLY IMPLEMENTED`: 27 yêu cầu (96.4%).
  - `CONDITIONALLY IMPLEMENTED`: 1 yêu cầu (3.6%) [PC-REQ-013: Yêu cầu kết nối AWS S3 Staging thực tế để hoàn tất live upload binary].

