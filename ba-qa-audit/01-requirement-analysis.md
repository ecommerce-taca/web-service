# BÁO CÁO PHÂN TÍCH YÊU CẦU NGHIỆP VỤ (REQUIREMENT ANALYSIS REPORT)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior Business Analyst (BA) & Technical Auditor
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất phân tích (Completed)
- **Phạm vi đối soát**:
  - Backend: `ecommerce-taca/Product-Catalog-Service` (Branch `develop`, Commit `6572ece`)
  - Frontend: `taca_ecommerce` Monorepo (`apps/buyer`, `apps/seller`, `apps/admin`, `shared/`)
  - Documentation: `docs/product-catalog-docs/`

---

## I. MỤC TIÊU & PHƯƠNG PHÁP PHÂN TÍCH

Báo cáo này phân rã và chuẩn hóa toàn bộ 28 yêu cầu nghiệp vụ (Requirements) của phân hệ **Product Catalog** trong sàn thương mại điện tử Taca Ecommerce. Mỗi yêu cầu được đặc tả theo chuẩn quốc tế IEEE 830 / Agile User Story với đầy đủ các thuộc tính: Actor, Precondition, Main Flow, Alternate Flows, Exception Flows, Business Rules, Expected Result và Acceptance Criteria (AC).

Đồng thời, báo cáo cung cấp bằng chứng kỹ thuật (Technical Evidence) trực tiếp từ source code Backend (NestJS Controller/Service/Model) và Frontend (React Page/Component/API Service) để xác định mức độ sẵn sàng thực tế.

---

## II. MA TRẬN PHÂN QUYỀN VÀ TÁC NHÂN (ACTORS & ROLES)

| Tác nhân (Actor) | Định danh kỹ thuật | Phạm vi truy cập & Ngữ cảnh |
| :--- | :--- | :--- |
| **Buyer (Guest / User)** | `BUYER` (hoặc `anonymous`) | Duyệt danh mục, tìm kiếm, lọc sản phẩm `ACTIVE`, xem chi tiết SKU, xem giá bán và khuyến mãi. |
| **Seller (Merchant)** | `SELLER` | Quản lý vòng đời sản phẩm thuộc sở hữu của shop (`x-user-shop-scope`), tạo SPU/SKU, tải ảnh, yêu cầu duyệt. |
| **Admin (Catalog Mod / Superadmin)** | `ADMIN`, `CATALOG_MODERATOR` | Quản lý cây danh mục, phê duyệt/từ chối sản phẩm (`PENDING_APPROVAL`), xem nhật ký kiểm toán (Audit Logs). |
| **System (Worker / Cron / Queue)** | `SYSTEM` (Kafka Worker / Job) | Xử lý Outbox Event, xử lý tệp import/export Excel bất đồng bộ, dọn dẹp ảnh nháp mồ côi. |

---

## III. ĐẶC TẢ CHI TIẾT 28 YÊU CẦU NGHIỆP VỤ (PC-REQ-001 ĐẾN PC-REQ-028)

### NHÓM 1: QUẢN LÝ DANH MỤC & THUẾ SUẤT (CATEGORY & TAX MANAGEMENT)

#### PC-REQ-001: Cây danh mục đa cấp (Multi-level Category Hierarchy)
- **Actor**: Admin (Quản trị viên), Buyer (Khách mua), Seller (Người bán)
- **Precondition**: Hệ thống đã khởi tạo danh mục gốc (Root Category).
- **Main Flow**:
  1. Admin gửi yêu cầu tạo/sửa danh mục kèm `parentId` (nếu là cấp con) và `tax_rate_bps`.
  2. Hệ thống kiểm tra cấu trúc danh mục, tính toán đường dẫn phân cấp `path` và độ sâu `level`.
  3. Buyer/Seller gọi API lấy cây danh mục dạng lồng nhau (Tree hierarchy).
  4. Hệ thống trả về cấu trúc phân cấp đầy đủ phục vụ Breadcrumbs và Category Tree Navigation.
- **Alternate Flow**: Admin kích hoạt/vô hiệu hóa một nhánh danh mục (`isActive: false`), tất cả danh mục con tự động ẩn khỏi Buyer.
- **Exception Flow**:
  - `parentId` trỏ vào chính ID của danh mục hoặc tạo vòng lặp vô tận (Cyclic reference) ➔ Hệ thống ném lỗi `400 Bad Request`.
- **Business Rules**:
  - Độ sâu cây danh mục không vượt quá 4 cấp (Root ➔ Level 1 ➔ Level 2 ➔ Leaf).
  - Chỉ danh mục lá (Leaf Category) mới được phép gán sản phẩm.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: API `GET /api/v1/categories/tree` trả về cấu trúc lồng nhau đầy đủ `children: []`.
  - [x] AC-02: FE hiển thị Breadcrumbs chính xác theo đường dẫn phân cấp.
- **Evidence**:
  - BE: `CategoryTreeController`, `category.schema.ts` (`path`, `level`, `parentId`).
  - FE: `apps/buyer/src/features/catalog/components/CategoryNav.jsx`, `apps/admin/src/features/categories/pages/AdminCategoriesPage.jsx`.

---

#### PC-REQ-002: Kế thừa và áp dụng thuế suất (Tax Rate BPS Inheritance)
- **Actor**: Admin, System
- **Precondition**: Danh mục cha hoặc danh mục hiện tại đã được cấu hình thuế suất.
- **Main Flow**:
  1. Admin gán `tax_rate_bps` cho danh mục (đơn vị: Basis Points, ví dụ: 800 = 8.00%, 1000 = 10.00%).
  2. Khi Seller tạo sản phẩm thuộc danh mục, hệ thống tự động gán `tax_rate_bps` kế thừa từ danh mục lá.
  3. Khi tính toán giá thanh toán, hệ thống sử dụng chính xác `tax_rate_bps` để tính thuế VAT.
- **Exception Flow**: Admin nhập giá trị `tax_rate_bps < 0` hoặc `> 10000` ➔ Hệ thống chặn với `400 Bad Request`.
- **Business Rules**: `tax_rate_bps` lưu dạng số nguyên nguyên thủy (Basis Points), tuyệt đối không lưu số thực float để tránh lỗi làm tròn tài chính.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Trường `tax_rate_bps` tồn tại trên Category và Product Model.
  - [x] AC-02: FE Admin cung cấp giao diện nhập và hiển thị phần trăm thuế quy đổi chính xác.
- **Evidence**:
  - BE: `CategoryDto` validation `@Min(0) @Max(10000)`, `product.schema.ts` (`tax_rate_bps: Number`).
  - FE: `shared/utils/adapters/product.adapter.js` (chuẩn hóa `tax_rate_bps`).

---

#### PC-REQ-003: Thuộc tính đặc tả danh mục (Category Attribute Templates)
- **Actor**: Admin, Seller
- **Precondition**: Danh mục đã được tạo và kích hoạt.
- **Main Flow**:
  1. Admin cấu hình danh sách thuộc tính động (Attributes: RAM, Dung lượng, Chất liệu...) cho từng danh mục.
  2. Khi Seller chọn danh mục để đăng sản phẩm, Form tự động nạp các trường thuộc tính tương ứng.
  3. Seller nhập giá trị phù hợp (Text, Dropdown hoặc Multiselect).
- **Business Rules**: Thuộc tính đánh dấu `isRequired: true` bắt buộc Seller phải điền trước khi gửi duyệt.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Seller UI render đúng các trường input động dựa trên danh mục được chọn.
- **Evidence**:
  - BE: `category-attribute.schema.ts`.
  - FE: `apps/seller/src/features/products/components/ProductAttributesSection.jsx`.

---

#### PC-REQ-004: Tối ưu SEO cho danh mục (Category Slug & SEO Meta)
- **Actor**: Admin, System
- **Precondition**: Tên danh mục hợp lệ.
- **Main Flow**:
  1. Admin nhập tên danh mục tiếng Việt (ví dụ: "Thiết bị điện tử").
  2. Hệ thống tự động sinh `slug` chuẩn hóa không dấu ("thiet-bi-dien-tu").
  3. Buyer truy cập URL `/category/thiet-bi-dien-tu` ➔ Hệ thống định tuyến chính xác.
- **Business Rules**: `slug` là duy nhất trên toàn hệ thống danh mục.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Slug tự động tạo và URL Buyer thân thiện chuẩn SEO.
- **Evidence**:
  - BE: Regex slug validator trong Category Service.
  - FE: `apps/buyer/src/features/catalog/pages/CategoryPage.jsx`.

---

### NHÓM 2: KHỞI TẠO VÀ VÒNG ĐỜI SẢN PHẨM SPU (SPU LIFECYCLE)

#### PC-REQ-005: Tạo bản nháp sản phẩm SPU (SPU Draft Creation)
- **Actor**: Seller
- **Precondition**: Seller đã đăng nhập và shop ở trạng thái `ACTIVE`.
- **Main Flow**:
  1. Seller nhập thông tin cơ bản: Tên sản phẩm, Danh mục, Thương hiệu, Mô tả.
  2. Seller nhấn "Lưu bản nháp" (Save Draft).
  3. Hệ thống tạo bản ghi Product với trạng thái `DRAFT` và `version: 1`.
  4. Hệ thống trả về `productId` cho Seller tiếp tục chỉnh sửa.
- **Exception Flow**:
  - Tên sản phẩm dưới 5 ký tự hoặc trống ➔ Lỗi `400 Bad Request`.
  - Token người dùng không có `shop_id` ➔ Lỗi `403 Forbidden`.
- **Business Rules**: Sản phẩm ở trạng thái `DRAFT` hoàn toàn vô hình đối với Buyer.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Sản phẩm mới tạo có `status = DRAFT`.
  - [x] AC-02: Header `x-user-shop-scope` được tự động kiểm tra và gán vào `shop_id`.
- **Evidence**:
  - BE: `POST /api/v1/seller/products` tại `SellerProductController`.
  - FE: `apps/seller/src/features/products/pages/ProductCreatePage.jsx`.

---

#### PC-REQ-006: Khóa lạc quan (Optimistic Concurrency Control - OCC)
- **Actor**: Seller, Admin, System
- **Precondition**: Sản phẩm đã tồn tại trong database với số `version` hiện tại.
- **Main Flow**:
  1. Client gửi request cập nhật (PUT/PATCH/POST action) kèm trường `version` trong Body.
  2. Backend kiểm tra `version` gửi lên có khớp với `version` trong Database hay không.
  3. Nếu khớp: Backend cập nhật dữ liệu, tăng `version` lên +1 và phản hồi `200 OK`.
- **Exception Flow**:
  - Nếu `version` gửi lên khác `version` trong Database (do phiên làm việc khác đã lưu trước) ➔ Backend từ chối cập nhật và trả về `409 Conflict`.
- **Business Rules**: Mọi thao tác cập nhật SPU/SKU hoặc chuyển đổi trạng thái (Submit, Approve, Reject) bắt buộc phải truyền `version`.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Mọi endpoint mutation yêu cầu trường `version: number`.
  - [x] AC-02: FE xử lý lỗi `409 Conflict`, hiển thị thông báo cảnh báo và cung cấp nút nạp lại dữ liệu mới nhất.
- **Evidence**:
  - BE: `UpdateProductDto` `@IsInt() version`, Mongoose OCC pre-save plugin.
  - FE: `shared/utils/adapters/product.adapter.js` (bảo toàn `version`), `seller-product.api.js`, `admin-catalog.api.js`.

---

#### PC-REQ-007: Cập nhật chi tiết mô tả và thông số kỹ thuật (Product Details & Specs)
- **Actor**: Seller
- **Precondition**: Sản phẩm thuộc quyền sở hữu của Seller và ở trạng thái cho phép sửa (`DRAFT`, `REJECTED`).
- **Main Flow**:
  1. Seller chỉnh sửa mô tả chi tiết (Rich text / Markdown) và các thông số kỹ thuật (Specifications).
  2. Hệ thống kiểm tra chống mã độc XSS trong nội dung HTML mô tả.
  3. Lưu thông số kỹ thuật dưới dạng mảng cặp `key-value` chuẩn hóa.
- **Business Rules**: Không cho phép chèn thẻ `<script>` hoặc mã thực thi vào mô tả.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Dữ liệu thông số kỹ thuật lưu dạng JSON mảng và hiển thị bảng thông số trực quan trên Buyer PDP.
- **Evidence**:
  - BE: `ProductSpecificationDto`, Sanitize HTML middleware.
  - FE: `apps/buyer/src/features/product-detail/components/ProductSpecsTable.jsx`.

---

#### PC-REQ-008: Quản lý thương hiệu sản phẩm (Brand Management)
- **Actor**: Seller, Buyer
- **Precondition**: Thương hiệu thuộc danh sách đối tác hoặc nhãn hiệu được duyệt.
- **Main Flow**:
  1. Seller chọn thương hiệu từ danh sách gợi ý hoặc nhập thương hiệu mới.
  2. Buyer có thể lọc danh sách sản phẩm theo thương hiệu tại màn hình Catalog.
- **Business Rules**: Nếu không có thương hiệu, mặc định hiển thị "No Brand" (Thương hiệu không xác định).
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Bộ lọc Brand hoạt động đồng bộ giữa Seller và Buyer.
- **Evidence**:
  - BE: `ProductQueryDto` (`brand: string`).
  - FE: `apps/buyer/src/features/catalog/components/ProductFilters.jsx`.

---

### NHÓM 3: MA TRẬN PHÂN LOẠI SKU, GIÁ & TỒN KHO (SKU VARIANT MATRIX)

#### PC-REQ-009: Ma trận biến thể 2 chiều (2-Dimensional Variant Matrix)
- **Actor**: Seller
- **Precondition**: Sản phẩm SPU đang ở trạng thái chỉnh sửa.
- **Main Flow**:
  1. Seller cấu hình Nhóm biến thể 1 (ví dụ: Màu sắc: Đỏ, Xanh) và Nhóm biến thể 2 (ví dụ: Kích thước: S, M, L).
  2. Hệ thống tự động tính tích Descartes (Cartesian Product) để sinh ra ma trận các SKU phân loại (2 x 3 = 6 SKU).
  3. Mỗi tổ hợp SKU được gắn mã duy nhất `sku_code`, tên biến thể ghép và hình ảnh đại diện riêng.
- **Exception Flow**: Seller tạo quá 2 nhóm biến thể hoặc vượt quá 50 biến thể con ➔ Hệ thống chặn với `400 Bad Request`.
- **Business Rules**: Số lượng nhóm biến thể tối đa là 2; tổng số biến thể con không vượt quá 50 SKU trên mỗi SPU.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Seller UI tự động sinh ma trận bảng bảng nhập SKU ngay khi chọn thuộc tính.
  - [x] AC-02: Backend lưu trữ cấu trúc SKU mảng con trong Product Model hoặc SKU Collection độc lập.
- **Evidence**:
  - BE: `CreateSkuDto`, `ProductVariantService`.
  - FE: `apps/seller/src/features/products/components/SkuMatrixTable.jsx`.

---

#### PC-REQ-010: Định giá bán và giá so sánh (Price & Original Strikethrough Price)
- **Actor**: Seller, Buyer
- **Precondition**: SKU đang được cấu hình giá.
- **Main Flow**:
  1. Seller nhập `price` (giá bán thực tế) và `original_price` (giá niêm yết/giá so sánh).
  2. Hệ thống kiểm tra: `original_price >= price`.
  3. Buyer nhìn thấy giá bán hiện tại kèm giá gạch ngang và nhãn giảm giá phần trăm (% discount badge).
- **Exception Flow**: `price > original_price` ➔ Hệ thống ném lỗi validation `400 Bad Request` ("Giá bán không được lớn hơn giá gốc").
- **Business Rules**:
  - `price` và `original_price` phải là số nguyên dương (đơn vị: VNĐ).
  - Phần trăm giảm giá được tính: `Math.round((1 - price / original_price) * 100)`.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Validate chặt chẽ quan hệ giá tại cả Client và Server.
  - [x] AC-02: Buyer PDP hiển thị giá gạch ngang và badge giảm giá chính xác.
- **Evidence**:
  - BE: Custom validator `@IsOriginalPriceValid` trong Sku DTO.
  - FE: `shared/utils/formatCurrency.js`, `apps/buyer/src/features/product-detail/components/ProductPriceDisplay.jsx`.

---

#### PC-REQ-011: Quản lý tồn kho ban đầu (Initial Inventory Stock)
- **Actor**: Seller, System
- **Precondition**: SKU được khởi tạo.
- **Main Flow**:
  1. Seller nhập số lượng tồn kho `stock` cho từng SKU (ví dụ: 100).
  2. Hệ thống ghi nhận số lượng tồn kho khả dụng (`available_stock`).
  3. Khi Buyer đặt hàng, hệ thống phát sự kiện trừ kho (Inventory Reservation).
- **Business Rules**: `stock` phải là số nguyên không âm (`stock >= 0`).
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Hiển thị trạng thái "Hết hàng" (Out of Stock) khi `stock === 0` và vô hiệu hóa nút "Thêm vào giỏ".
- **Evidence**:
  - BE: `stock: { type: Number, min: 0 }`.
  - FE: `apps/buyer/src/features/product-detail/components/AddToCartButton.jsx` (`disabled={stock === 0}`).

---

#### PC-REQ-012: Mã định danh SKU duy nhất (Unique SKU Code Generation)
- **Actor**: Seller, System
- **Precondition**: Seller nhập mã SKU hoặc để hệ thống tự động sinh.
- **Main Flow**:
  1. Nếu Seller không nhập mã SKU, hệ thống tự sinh mã theo công thức: `{SHOP_ID}-{SPU_SHORT}-{VARIANT_COMBO}`.
  2. Hệ thống kiểm tra tính duy nhất (Uniqueness) của mã SKU trong phạm vi shop.
- **Business Rules**: Hai SKU khác nhau trong cùng một Shop không được phép trùng mã SKU.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Bắt lỗi trùng SKU code tại database bằng Unique Compound Index `(shop_id, sku_code)`.
- **Evidence**:
  - BE: Mongoose Index `{ shop_id: 1, sku_code: 1 }, { unique: true }`.
  - FE: Gợi ý mã SKU tự động trên giao diện Seller.

---

### NHÓM 4: QUẢN LÝ TÀI NGUYÊN HÌNH ẢNH & PRESIGNED S3 UPLOAD

#### PC-REQ-013: Tải ảnh trực tiếp lên Cloud Storage qua Presigned URL (Presigned S3 Upload)
- **Actor**: Seller, Admin
- **Precondition**: Người dùng đã xác thực phiên làm việc hợp lệ.
- **Main Flow**:
  1. Client tính mã băm SHA-256 của tệp ảnh và gửi metadata (`fileName`, `fileSize`, `contentType`, `checksumSha256`) lên API presign.
  2. Backend kiểm tra loại tệp (JPEG, PNG, WEBP), dung lượng (<= 5MB) và sinh AWS S3 Presigned URL (hết hạn sau 15 phút).
  3. Client dùng phương thức `PUT` gửi trực tiếp binary của ảnh lên URL S3 vừa nhận kèm header `x-amz-checksum-sha256`.
  4. Client nhận `ETag` từ S3 và gọi API xác nhận tải ảnh lên Backend (`POST /api/v1/media/confirm`).
- **Exception Flow**:
  - Dung lượng tệp > 5MB hoặc định dạng không phải ảnh ➔ Lỗi `400 Bad Request`.
  - Mã băm SHA-256 không khớp giữa Client và S3 ➔ S3 từ chối lưu tệp.
- **Business Rules**: Backend không đóng vai trò nhận file trực tiếp (No Multipart Upload to App Server) để tối ưu băng thông và bảo mật máy chủ.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: API `POST /api/v1/media/presign-upload` và `POST /api/v1/media/confirm` hoạt động đúng contract.
  - [!] AC-02: Client thực hiện upload luồng chuẩn S3 (Cần môi trường AWS S3 Staging thực tế để hoàn tất live upload).
- **Evidence**:
  - BE: `MediaController`, `S3Service.getPresignedPutUrl()`.
  - FE: `apps/seller/src/features/products/services/seller-media.api.js`.

---

#### PC-REQ-014: Quản lý thư viện hình ảnh và ảnh bìa sản phẩm (Product Gallery & Cover Image)
- **Actor**: Seller, Buyer
- **Precondition**: Các ảnh đã được xác nhận tải lên thành công.
- **Main Flow**:
  1. Seller chọn 1 ảnh làm ảnh đại diện chính (Cover / Thumbnail).
  2. Seller sắp xếp thứ tự hiển thị các ảnh trong bộ sưu tập (Gallery: tối đa 8 ảnh).
  3. Buyer lướt xem ảnh phóng to và danh sách thumbnail trên PDP.
- **Business Rules**: Mỗi sản phẩm bắt buộc phải có ít nhất 1 ảnh đại diện hợp lệ trước khi gửi duyệt.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Validate tối thiểu 1 ảnh bìa trước khi kích hoạt nút "Gửi duyệt".
  - [x] AC-02: Buyer Image Gallery hỗ trợ chọn xem ảnh kích thước lớn mượt mà.
- **Evidence**:
  - BE: `@ArrayMinSize(1)` trên trường `images` của DTO.
  - FE: `apps/seller/src/features/products/components/ProductImageUploader.jsx`, `apps/buyer/src/features/product-detail/components/ProductImageGallery.jsx`.

---

#### PC-REQ-015: Dọn dẹp ảnh mồ côi (Orphan Image Cleanup Cron)
- **Actor**: System (Cron Job)
- **Precondition**: Ảnh đã upload lên S3 nhưng không gắn vào bất kỳ SPU/SKU nào sau 24 giờ.
- **Main Flow**:
  1. Định kỳ 00:00 hàng ngày, Cron Job quét bảng `media_assets` tìm các bản ghi có `status = PENDING_CONFIRMATION` hoặc `product_id = null` tạo quá 24h.
  2. Hệ thống gọi lệnh `DeleteObject` sang S3 và xóa bản ghi metadata trong database.
- **Business Rules**: Tiết kiệm chi phí lưu trữ cloud và bảo vệ tài nguyên hệ thống.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Cron job được đăng ký trong NestJS Schedule Module.
- **Evidence**:
  - BE: `MediaCleanupTask` (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`).

---

### NHÓM 5: QUY TRÌNH DUYỆT SẢN PHẨM & MÁY TRẠNG THÁI (MODERATION WORKFLOW)

#### PC-REQ-016: Gửi yêu cầu phê duyệt sản phẩm (Submit for Approval)
- **Actor**: Seller
- **Precondition**: Sản phẩm thuộc sở hữu của Seller, ở trạng thái `DRAFT` hoặc `REJECTED`, đã đủ điều kiện tối thiểu (Tên, Danh mục, 1 Ảnh, ít nhất 1 SKU có giá và tồn kho).
- **Main Flow**:
  1. Seller nhấn "Gửi duyệt" trên danh sách sản phẩm hoặc trang chi tiết.
  2. Client gửi `POST /api/v1/seller/products/:id/submit` kèm `{ version: currentVersion }`.
  3. Backend kiểm tra điều kiện nghiệp vụ, cập nhật trạng thái sang `PENDING_APPROVAL`, tăng `version` lên +1.
  4. Hệ thống ghi nhật ký Outbox Event `ProductSubmittedEvent`.
- **Exception Flow**:
  - Sản phẩm thiếu ảnh hoặc thiếu SKU ➔ Backend trả về `400 Bad Request` kèm lý do cụ thể.
  - Trạng thái hiện tại không phải `DRAFT` hoặc `REJECTED` ➔ Backend trả về `400 Bad Request` ("Invalid state transition").
- **Business Rules**: Không cho phép sửa đổi nội dung sản phẩm khi đang ở trạng thái `PENDING_APPROVAL`.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Trạng thái sản phẩm chuyển sang `PENDING_APPROVAL`.
  - [x] AC-02: FE vô hiệu hóa nút chỉnh sửa khi sản phẩm đang chờ duyệt.
- **Evidence**:
  - BE: `SellerProductService.submitForApproval()`.
  - FE: `apps/seller/src/features/products/pages/ProductsPage.jsx`.

---

#### PC-REQ-017: Admin phê duyệt sản phẩm (Admin Approval Workflow)
- **Actor**: Admin (Catalog Moderator)
- **Precondition**: Sản phẩm đang ở trạng thái `PENDING_APPROVAL`.
- **Main Flow**:
  1. Admin mở chi tiết sản phẩm chờ duyệt trong Portal Admin.
  2. Admin kiểm tra hình ảnh, nội dung, thương hiệu và tính hợp pháp.
  3. Admin nhấn "Phê duyệt" (Approve) ➔ Client gửi `POST /api/v1/admin/products/:id/approve` kèm `{ version }`.
  4. Backend chuyển trạng thái sang `ACTIVE`, tăng `version`, đồng thời phát sự kiện Outbox `ProductApprovedEvent` để đẩy lên Kafka sang Search Service & Notification Service.
- **Business Rules**: Chỉ tài khoản có Role `ADMIN` hoặc `CATALOG_MODERATOR` mới được gọi API này.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Sản phẩm chuyển sang trạng thái `ACTIVE` và ngay lập tức có thể tìm kiếm được trên Buyer Storefront.
- **Evidence**:
  - BE: `AdminProductController.approve()`, RolesGuard(`Role.ADMIN`).
  - FE: `apps/admin/src/features/products/pages/AdminProductsPage.jsx`.

---

#### PC-REQ-018: Admin từ chối phê duyệt kèm lý do (Admin Rejection with Reason)
- **Actor**: Admin
- **Precondition**: Sản phẩm đang ở trạng thái `PENDING_APPROVAL`.
- **Main Flow**:
  1. Admin nhấn "Từ chối" (Reject) trên giao diện.
  2. Modal hiển thị yêu cầu Admin nhập lý do từ chối (bắt buộc, từ 10 đến 500 ký tự).
  3. Client gửi `POST /api/v1/admin/products/:id/reject` kèm `{ version, reason: "Hình ảnh mờ, vi phạm bản quyền" }`.
  4. Backend chuyển trạng thái sang `REJECTED`, lưu `rejection_reason`, tăng `version`.
  5. Seller nhận được thông báo kèm lý do từ chối để chỉnh sửa lại.
- **Exception Flow**: Admin để trống lý do từ chối ➔ Client chặn tại Form và Server trả về `400 Bad Request`.
- **Business Rules**: Bắt buộc phải có lý do cụ thể khi từ chối sản phẩm.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Lý do từ chối được lưu trữ và hiển thị rõ ràng trên Seller Dashboard.
- **Evidence**:
  - BE: `RejectProductDto` `@IsNotEmpty() @Length(10, 500) reason`.
  - FE: `apps/admin/src/features/products/components/RejectReasonModal.jsx`, `apps/seller/src/features/products/components/RejectionAlert.jsx`.

---

#### PC-REQ-019: Ẩn/Hiện sản phẩm do Seller hoặc Admin (Deactivation / Takedown)
- **Actor**: Seller, Admin
- **Precondition**: Sản phẩm đang ở trạng thái `ACTIVE` hoặc `INACTIVE`.
- **Main Flow**:
  1. Seller tạm ẩn sản phẩm của mình khi hết hàng hoặc tạm ngừng kinh doanh (`status: INACTIVE`).
  2. Hoặc Admin cưỡng chế hạ sản phẩm (Takedown/Flagged) khi phát hiện dấu hiệu vi phạm quyền tác giả hoặc hàng cấm.
  3. Sản phẩm ngay lập tức bị loại khỏi kết quả tìm kiếm và danh mục của Buyer.
- **Business Rules**: Nếu Admin gắn cờ vi phạm (`is_flagged = true`), Seller không được phép tự ý kích hoạt lại cho đến khi Admin gỡ cờ.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Bộ lọc `flaggedOnly` trên Admin Portal cho phép kiểm soát nhanh các sản phẩm vi phạm.
  - [x] AC-02: Sản phẩm ẩn không thể truy cập trực tiếp bằng đường dẫn PDP (trả về 404 hoặc thông báo tạm ngừng).
- **Evidence**:
  - BE: `ProductStatusEnum.INACTIVE`, `is_flagged: Boolean`.
  - FE: `apps/admin/src/features/products/pages/AdminProductsPage.jsx` (`flaggedOnly` toggle filter).

---

### NHÓM 6: TRẢI NGHIỆM MUA SẮM BUYER & TÌM KIẾM/LỌC (STOREFRONT & SEARCH)

#### PC-REQ-020: Danh sách sản phẩm phân trang (Product Pagination Catalog)
- **Actor**: Buyer
- **Precondition**: Hệ thống có sản phẩm ở trạng thái `ACTIVE`.
- **Main Flow**:
  1. Buyer mở trang chủ hoặc trang danh mục.
  2. Client gửi request: `GET /api/v1/buyer/products?page=1&limit=20`.
  3. Backend trả về payload chuẩn hóa Envelope:
     `{ data: [...], pagination: { total, page, limit, totalPages } }`.
  4. Buyer chuyển trang (Next/Prev/Page Number) ➔ URL cập nhật Query Param không reload trang.
- **Business Rules**: Chỉ hiển thị sản phẩm có `status = ACTIVE` và thuộc shop `status = ACTIVE`.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Phân trang mượt mà, hỗ trợ deep-linking URL `?page=X`.
- **Evidence**:
  - BE: `BuyerProductController.findAll()`, `PaginationDto`.
  - FE: `apps/buyer/src/features/catalog/pages/CategoryPage.jsx`, `shared/ui-components/Pagination.jsx`.

---

#### PC-REQ-021: Lọc đa chiều động (Dynamic Faceted Filtering)
- **Actor**: Buyer
- **Precondition**: Danh sách sản phẩm có nhiều thuộc tính và khoảng giá khác nhau.
- **Main Flow**:
  1. Buyer chọn các tiêu chí lọc bên Sidebar: Khoảng giá (`minPrice`, `maxPrice`), Thương hiệu (`brand`), Đánh giá tối thiểu (`minRating`).
  2. Client debounce (300ms) và gọi API kèm các tham số lọc.
  3. Backend thực hiện truy vấn tổng hợp và trả về kết quả chính xác.
- **Business Rules**: Nếu không tìm thấy kết quả phù hợp, hiển thị Empty State với nút "Xóa bộ lọc".
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Bộ lọc phản hồi tức thì, kết hợp đồng thời nhiều tiêu chí (AND logic).
- **Evidence**:
  - BE: Query builder trong `BuyerProductService`.
  - FE: `apps/buyer/src/features/catalog/components/ProductFilters.jsx`.

---

#### PC-REQ-022: Sắp xếp sản phẩm (Product Sorting Options)
- **Actor**: Buyer
- **Precondition**: Buyer đang ở trang danh mục hoặc tìm kiếm.
- **Main Flow**:
  1. Buyer chọn tiêu chí sắp xếp từ Dropdown:
     - Mới nhất (`sort=newest` hoặc `createdAt:desc`)
     - Giá thấp đến cao (`sort=price_asc`)
     - Giá cao đến thấp (`sort=price_desc`)
     - Bán chạy nhất (`sort=popular`)
  2. Danh sách sản phẩm được tải lại đúng thứ tự đã chọn.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Backend sắp xếp đúng index Mongoose/Database, FE mapping chuẩn enum.
- **Evidence**:
  - BE: `ProductSortEnum`.
  - FE: `apps/buyer/src/features/catalog/components/ProductSortDropdown.jsx`.

---

#### PC-REQ-023: Trang chi tiết sản phẩm tương tác (Interactive PDP - Product Detail Page)
- **Actor**: Buyer
- **Precondition**: Sản phẩm đang ở trạng thái `ACTIVE`.
- **Main Flow**:
  1. Buyer bấm vào Card sản phẩm hoặc truy cập URL `/products/:slugOrId`.
  2. Giao diện tải thông tin chi tiết: Ảnh lớn, Tiêu đề, Giá, Danh sách tùy chọn biến thể (Màu, Size).
  3. Buyer bấm chọn từng biến thể ➔ Giao diện cập nhật:
     - Giá hiển thị theo SKU được chọn.
     - Số lượng tồn kho khả dụng tương ứng.
     - Hình ảnh đại diện chuyển sang ảnh của biến thể đó (nếu có).
- **Exception Flow**: Buyer truy cập sản phẩm không tồn tại hoặc đã bị ẩn ➔ Hiển thị trang 404 thân thiện kèm gợi ý sản phẩm khác.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Lựa chọn biến thể thay đổi trạng thái giá/kho/ảnh tức thời không giật lag.
- **Evidence**:
  - BE: `GET /api/v1/buyer/products/:slugOrId`.
  - FE: `apps/buyer/src/features/product-detail/pages/ProductDetailPage.jsx`.

---

#### PC-REQ-024: Kiểm tra trạng thái bán và thêm vào giỏ hàng (Add to Cart Validation)
- **Actor**: Buyer
- **Precondition**: Đã chọn đầy đủ các biến thể bắt buộc trên PDP.
- **Main Flow**:
  1. Buyer nhập số lượng mua (ví dụ: 2) và nhấn "Thêm vào giỏ hàng".
  2. Client kiểm tra số lượng mua `<= stock` của SKU hiện tại.
  3. Client phát hành động thêm vào Cart Context / gọi API Cart Service.
  4. Hiển thị Toast thông báo thành công và cập nhật số lượng trên Badge Giỏ hàng ở Header.
- **Exception Flow**: Số lượng nhập vào vượt quá tồn kho khả dụng ➔ Chặn thao tác và cảnh báo "Số lượng vượt quá tồn kho".
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Chặn chọn biến thể đã hết hàng (`disabled`), kiểm tra boundary tồn kho chính xác.
- **Evidence**:
  - FE: `apps/buyer/src/features/product-detail/components/AddToCartButton.jsx`, `apps/buyer/src/features/cart/context/CartContext.jsx`.

---

### NHÓM 7: VẬN HÀNH NÂNG CAO, BULK EXCEL & NHẬT KÝ KIỂM TOÁN (OPS & AUDIT)

#### PC-REQ-025: Nhập sản phẩm hàng loạt từ Excel (Bulk Product Import via Excel)
- **Actor**: Seller
- **Precondition**: Seller có file dữ liệu mẫu (.xlsx) đúng định dạng hệ thống.
- **Main Flow**:
  1. Seller tải tệp Excel mẫu từ trang quản lý sản phẩm.
  2. Seller điền thông tin các sản phẩm, SKU, giá, tồn kho và upload file lên hệ thống.
  3. Backend nhận file, khởi tạo `ImportJob` ở trạng thái `PROCESSING` và xử lý ngầm (Background Worker).
  4. Hệ thống parse từng dòng, kiểm tra validation logic.
- **Alternate Flow**:
  - Nếu có dòng dữ liệu sai: Hệ thống ghi nhận lỗi vào file báo cáo kết quả và đánh dấu dòng lỗi.
  - Seller tải file kết quả (`import_errors_{jobId}.xlsx`) để xem chi tiết lỗi từng dòng.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: API `POST /api/v1/seller/products/bulk-import` và API `GET /api/v1/seller/products/import-jobs/:id/report` hoạt động chuẩn xác.
  - [x] AC-02: FE hỗ trợ tải trực tiếp file báo cáo lỗi Excel bằng Blob stream.
- **Evidence**:
  - BE: `BulkImportService`, `ImportJob` model.
  - FE: `apps/seller/src/features/products/components/ProductImportModal.jsx` (`handleDownloadResultReport`).

---

#### PC-REQ-026: Xuất danh sách sản phẩm ra tệp (Product Data Export)
- **Actor**: Seller, Admin
- **Precondition**: Có dữ liệu sản phẩm thỏa mãn điều kiện lọc.
- **Main Flow**:
  1. Người dùng chọn phạm vi xuất dữ liệu (Tất cả hoặc theo bộ lọc hiện tại).
  2. Bấm "Xuất dữ liệu" (Export Excel/CSV).
  3. Hệ thống stream dữ liệu hoặc trả về file download trực tiếp.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Xuất đúng định dạng file bảng tính với đầy đủ cột SKU, Tên, Giá, Tồn kho, Trạng thái.
- **Evidence**:
  - BE: `GET /api/v1/seller/products/export`.
  - FE: `apps/seller/src/features/products/pages/ProductsPage.jsx`.

---

#### PC-REQ-027: Nhật ký kiểm toán danh mục và sản phẩm (Catalog & Product Audit Logs)
- **Actor**: Admin (Kiểm soát viên)
- **Precondition**: Đã phát sinh các hành động thay đổi dữ liệu danh mục/sản phẩm (Create, Update, Approve, Reject).
- **Main Flow**:
  1. Mọi thao tác thay đổi dữ liệu nhạy cảm đều được ghi nhận vào Collection `audit_logs` kèm: `userId`, `action`, `resourceType`, `resourceId`, `oldValue`, `newValue`, `timestamp`, `ipAddress`.
  2. Admin truy cập trang Nhật ký kiểm toán (`/admin/audit-logs`).
  3. Admin chọn Scope "Danh mục & Sản phẩm" (Catalog Audits).
  4. Hệ thống tải dữ liệu từ API `GET /api/v1/admin/catalog/audits` và hiển thị chi tiết thay đổi.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Ghi log tự động qua Interceptor/Mongoose Middleware.
  - [x] AC-02: Giao diện Admin có Scope Switcher chuyên biệt xem Catalog Audits.
- **Evidence**:
  - BE: `AuditLogInterceptor`, `AdminAuditController`.
  - FE: `apps/admin/src/features/audit/pages/AdminAuditLogsPage.jsx`.

---

#### PC-REQ-028: Sự kiện Outbox và tích hợp Kafka (Transactional Outbox & Event Streaming)
- **Actor**: System (Transactional Outbox Pattern)
- **Precondition**: Cơ sở dữ liệu ghi nhận thành công một mutation sản phẩm.
- **Main Flow**:
  1. Trong cùng một MongoDB Session/Transaction, bản ghi sự kiện được lưu vào bảng `outbox_events`.
  2. Outbox Relay Poller định kỳ đọc các bản ghi chưa gửi (`status = PENDING`).
  3. Gửi Message lên Kafka Topic (ví dụ: `product.events.v1` với key là `productId`).
  4. Khi Kafka xác nhận đã nhận (ACK), cập nhật Outbox thành `SENT`.
- **Business Rules**: Đảm bảo tính nhất quán cuối cùng (Eventual Consistency) theo nguyên tắc At-least-once delivery; các consumer (Search Service, Notification Service) phải xử lý idempotent.
- **Acceptance Criteria (AC)**:
  - [x] AC-01: Bảng `outbox_events` lưu đầy đủ metadata sự kiện.
- **Evidence**:
  - BE: `OutboxService`, `OutboxRelayCron`, `outbox.schema.ts`.

---

## IV. TỔNG HỢP TIẾN ĐỘ THỰC HIỆN THEO CHỈ SỐ BA

```text
Tổng số yêu cầu nghiệp vụ: 28 Requirements
├── Triển khai đầy đủ & đã kiểm chứng tĩnh/mock (Fully Implemented): 27/28 (96.4%)
└── Triển khai có điều kiện môi trường Live (Conditionally Implemented): 1/28 (3.6%) [PC-REQ-013: Live S3]
```

### Kết luận từ Senior BA:
Toàn bộ 28 yêu cầu nghiệp vụ của Product Catalog đã được thiết kế kiến trúc hoàn chỉnh, phân rã ranh giới Actor rõ ràng, áp dụng chặt chẽ các quy tắc thương mại điện tử hiện đại (OCC Versioning, Multi-tenancy Isolation, Category Tax BPS, SPU-SKU Hierarchy) và có mã nguồn tương ứng tại cả hai đầu Backend và Frontend.

