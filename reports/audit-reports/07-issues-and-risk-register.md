# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG – TACA ECOMMERCE
## PHẦN 07: BẢNG THEO DÕI VẤN ĐỀ VÀ SỔ ĐĂNG KÝ RỦI RO (ISSUES & RISK REGISTER)

---

### 1. PHÂN CẤP MỨC ĐỘ NGHIÊM TRỌNG (SEVERITY MATRIX)

| Mức độ | Định nghĩa tác động | Thời gian phản ứng mục tiêu (SLA) |
| :---: | :--- | :---: |
| **CRITICAL (P0)** | Ngừng trệ giao dịch cốt lõi, lỗi bảo mật nghiêm trọng, mất tính toàn vẹn dữ liệu | Khắc phục ngay lập tức (< 4 giờ) |
| **HIGH (P1)** | Thất bại một quy trình nghiệp vụ quan trọng, lỗi 400/409 diện rộng, chặn đường người dùng | Khắc phục trong ngày (< 24 giờ) |
| **MEDIUM (P2)** | Sai lệch định dạng dữ liệu, thiếu tính năng thứ cấp, trải nghiệm người dùng suy giảm | Khắc phục trong sprint (< 1 tuần) |
| **LOW (P3)** | Lỗi giao diện nhỏ, thiếu chú thích tooltip, cải tiến code clean | Đưa vào backlog bảo trì |
| **INFO** | Ghi nhận kiến trúc, đề xuất tối ưu hóa dài hạn | Tham khảo định hướng phát triển |

---

### 2. SỔ ĐĂNG KÝ RỦI RO VÀ DANH MỤC VẤN ĐỀ CHI TIẾT

#### ISS-01: Xung đột phiên bản kiểm soát đồng thời (OCC Version Conflict)
- **Mức độ**: **CRITICAL (P0)** | **Phân hệ**: Backend & Seller Frontend
- **Bằng chứng Backend**:
  - File: `modules/products/services/seller-products.service.ts`
  - Thao tác: `updateDraft()`, `updateCategories()`, `updateSkus()`, `publish()`, `archive()`.
  - Logic: Mongoose kiểm tra điều kiện `{ _id: id, version: dto.version }`. Nếu version không khớp, ném lỗi `ConflictException('PRODUCT_VERSION_CONFLICT')` kèm HTTP 409.
- **Bằng chứng Frontend**:
  - File: `apps/seller/src/features/products/components/ProductEditorModal.jsx`
- **Nguyên nhân gốc rễ**: Frontend ban đầu khi submit form không lưu lại và gửi kèm trường `version` nhận được từ API `GET /seller/products/{id}`.
- **Tác động thực tế**: Người bán không thể cập nhật sản phẩm, mỗi lần bấm Lưu đều bị báo lỗi hệ thống bí ẩn.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Lưu `version` trong state modal, đính kèm vào payload gửi lên. Khi gặp lỗi 409, hiển thị thông báo xung đột và tự động nạp lại dữ liệu mới nhất.
  - *Trạng thái*: **ĐÃ GIẢI QUYẾT (RESOLVED)** tại tầng Modal và API Service.

---

#### ISS-02: Bác bỏ Payload do vi phạm ValidationPipe nghiêm ngặt (Strict DTO Whitelist Rejection)
- **Mức độ**: **HIGH (P1)** | **Phân hệ**: Seller Frontend & Backend DTO
- **Bằng chứng Backend**:
  - File: `src/main.ts` cấu hình `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
  - DTO: `CreateProductDraftDto` chỉ cho phép các trường: `title`, `slug`, `brand`, `description`, `price_summary`.
- **Bằng chứng Frontend**:
  - File: `apps/seller/src/features/products/components/ProductEditorModal.jsx`
  - Form state cũ chứa các trường: `min_price`, `max_price`, `images`, `category_id`.
- **Nguyên nhân gốc rễ**: Form biểu mẫu gửi nguyên object state lên endpoint tạo bản nháp mà không qua bước lọc dữ liệu (Sanitization).
- **Tác động thực tế**: Toàn bộ thao tác tạo mới sản phẩm bị chặn với lỗi `400 Bad Request: property min_price should not exist`.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Khởi tạo payload sạch chỉ gồm các trường DTO hợp lệ, tách việc gán category và SKU sang các bước API riêng biệt theo đúng RESTful design của Backend.
  - *Trạng thái*: **ĐÃ GIẢI QUYẾT (RESOLVED)**.

---

#### ISS-03: Phụ thuộc bắt buộc Header định danh Tenant (`x-user-shop-scope`)
- **Mức độ**: **HIGH (P1)** | **Phân hệ**: API Gateway & Authentication
- **Bằng chứng Backend**:
  - File: `src/common/guards/shop-scope.guard.ts`
  - Logic: Kiểm tra `req.headers['x-user-shop-scope']`. Nếu rỗng, ném `ForbiddenException('SHOP_SCOPE_REQUIRED')` (HTTP 403).
- **Bằng chứng Frontend**:
  - File: `shared/utils/api-client.js`
- **Nguyên nhân gốc rễ**: Seller endpoints yêu cầu định danh gian hàng để đảm bảo tính cô lập dữ liệu đa người thuê (Multi-tenancy).
- **Tác động thực tế**: Nếu người dùng đăng nhập bằng tài khoản chưa tạo shop hoặc Gateway không phân giải được claim token, Seller bị từ chối truy cập toàn bộ trang quản lý.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Đảm bảo API Gateway luôn trích xuất `shop_id` từ token claims hoặc session; Frontend Shell có luồng onboarding chuyển hướng Seller chưa có shop đến trang đăng ký gian hàng trước.
  - *Trạng thái*: **ĐÃ KIỂM CHỨNG & BẢO VỆ (VERIFIED)**.

---

#### ISS-04: Quy trình Tải ảnh S3 Presigned URL 2 bước (Media Presigned Lifecycle)
- **Mức độ**: **HIGH (P1)** | **Phân hệ**: Seller Frontend & S3 Media Service
- **Bằng chứng Backend**:
  - Endpoints: `POST /seller/products/{id}/media/upload-url` và `POST /seller/products/{id}/media/complete`.
  - Yêu cầu: Checksum `sha256`, kích thước `size_bytes`, định dạng `content_type`.
- **Bằng chứng Frontend**:
  - File: `apps/seller/src/features/products/services/seller-product.api.js`
- **Nguyên nhân gốc rễ**: BE không cho phép upload file nhị phân trực tiếp qua máy chủ app để tránh quá tải I/O và nghẽn băng thông.
- **Tác động thực tế**: Giao diện upload ảnh sẽ không hoạt động nếu FE chỉ gửi multipart form thông thường đến endpoint SPU.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Triển khai luồng upload client-to-S3: FE xin link presigned -> PUT nhị phân trực tiếp lên S3 -> Báo hoàn tất để BE kích hoạt bản ghi media.
  - *Trạng thái*: **ĐÃ TÍCH HỢP HÀM SERVICE (SERVICE READY)**.

---

#### ISS-05: Sai lệch đơn vị Thuế suất Danh mục (`tax_rate_bps` vs Percentage)
- **Mức độ**: **MEDIUM (P2)** | **Phân hệ**: Category Management
- **Bằng chứng Backend**:
  - Mongoose Schema: `tax_rate_bps: { type: Number, required: true }` (Điểm cơ bản: 1000 = 10%).
- **Bằng chứng Frontend**:
  - File: `apps/admin/src/services/admin-catalog.api.js`
- **Nguyên nhân gốc rễ**: Backend sử dụng Basis Points (bps) để tránh sai số dấu phẩy động (Floating-point precision errors) trong tính toán tài chính.
- **Tác động thực tế**: Nếu Admin nhập số `10` với ý nghĩa là 10%, Backend sẽ hiểu là 10 bps (0.1%), gây thất thu thuế nghiêm trọng khi áp vào đơn hàng.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Tại tầng Adapter và Form, tự động quy đổi: `bps = inputPercentage * 100` khi gửi lên, và `percentage = bps / 100` khi hiển thị ra giao diện.
  - *Trạng thái*: **ĐÃ ĐỒNG BỘ TẦNG ADAPTER (RESOLVED)**.

---

#### ISS-06: Bất đồng bộ Tên trường Giá và Tên sản phẩm (`title` vs `name`, `base_price` vs `price`)
- **Mức độ**: **MEDIUM (P2)** | **Phân hệ**: Shared Adapter & Buyer/Seller UI
- **Bằng chứng Backend**:
  - Schema: `{ title: String, price_summary: { base_price: Number, currency: 'VND' } }`.
- **Bằng chứng Frontend**:
  - Các components UI cũ kỳ vọng: `{ name: String, price: Number }`.
- **Nguyên nhân gốc rễ**: Sự khác biệt về quy ước đặt tên giữa tài liệu kiến trúc ban đầu và thiết kế thực tế của Backend.
- **Tác động thực tế**: Giao diện hiển thị `undefined` cho tiêu đề và giá sản phẩm; giỏ hàng không tính được tiền.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Xây dựng tầng `shared/utils/adapters/product.adapter.js` với các hàm `normalizeProduct()` và `normalizeProductList()` chuyển đổi an toàn 2 chiều.
  - *Trạng thái*: **ĐÃ GIẢI QUYẾT TRIỆT ĐỂ (RESOLVED)**.

---

#### ISS-07: Khớp nối Nhãn thuộc tính biến thể tiếng Việt và Key tiếng Anh (Attribute Localization Matching)
- **Mức độ**: **MEDIUM (P2)** | **Phân hệ**: Buyer Product Purchase
- **Bằng chứng Backend**:
  - SKU Collection: `attributes: { "color": "Đỏ", "size": "XL" }`.
- **Bằng chứng Frontend**:
  - File: `apps/buyer/src/features/products/components/ProductPurchase.jsx`
- **Nguyên nhân gốc rễ**: Người bán nhập tên nhóm thuộc tính bằng tiếng Việt ("Màu sắc", "Kích cỡ"), trong khi hệ thống sinh SKU có thể sử dụng key chuẩn hóa tiếng Anh.
- **Tác động thực tế**: Khách hàng bấm chọn màu và size trên giao diện nhưng component không tìm thấy SKU ID tương ứng, nút "Mua ngay" bị vô hiệu hóa vô lý.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Bổ sung thuật toán tra cứu thuộc tính mờ (Fuzzy Normalizer) hỗ trợ đối chiếu cả key tiếng Anh và nhãn tiếng Việt tương đương.
  - *Trạng thái*: **ĐÃ GIẢI QUYẾT (RESOLVED)**.

---

#### ISS-08: Thiếu nút tải Báo cáo lỗi khi Nhập file Excel thất bại
- **Mức độ**: **MEDIUM (P2)** | **Phân hệ**: Seller Import Modal
- **Bằng chứng Backend**:
  - Endpoint: `GET /seller/products/import/jobs/{jobId}/result` trả về file `.xlsx` chứa chi tiết lỗi từng dòng.
- **Bằng chứng Frontend**:
  - File: `apps/seller/src/features/products/components/ProductImportModal.jsx`
- **Nguyên nhân gốc rễ**: Giao diện Import Modal mới chỉ dừng lại ở việc hiển thị số dòng lỗi (`error_count`), chưa có nút kích hoạt tải file lỗi.
- **Tác động thực tế**: Seller biết có 5 dòng sản phẩm bị lỗi nhưng không thể biết cụ thể dòng nào và vì sao sai để chỉnh sửa.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Bổ sung nút "Tải danh sách dòng lỗi" khi `status === 'COMPLETED' && error_count > 0` gọi endpoint result của Backend.
  - *Trạng thái*: **LÊN KẾ HOẠCH GIAI ĐOẠN 2 (SCHEDULED)**.

---

#### ISS-09: Thiếu Giao diện Trực quan Nhật ký Kiểm toán Catalog cho Admin
- **Mức độ**: **MEDIUM (P2)** | **Phân hệ**: Admin Portal
- **Bằng chứng Backend**:
  - Endpoint: `GET /admin/catalog/audits` đã sẵn sàng và kiểm thử thành công trong HTTP test suite.
- **Bằng chứng Frontend**:
  - File: `apps/admin/src/services/admin-catalog.api.js` đã có hàm `getCatalogAudits()`.
- **Nguyên nhân gốc rễ**: Chưa dựng trang UI riêng biệt để hiển thị dòng thời gian (Timeline) và diff của các bản ghi kiểm toán.
- **Tác động thực tế**: Admin cấp cao phải truy vấn qua Postman hoặc gọi API thủ công khi cần tra soát trách nhiệm người duyệt sản phẩm.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Xây dựng trang `AdminAuditLogsPage.jsx` hiển thị bảng lịch sử kiểm toán với bộ lọc theo `entity_id` và `actor_role`.
  - *Trạng thái*: **LÊN KẾ HOẠCH GIAI ĐOẠN 3 (SCHEDULED)**.

---

#### ISS-10: Tối ưu hóa Truy vấn Sản phẩm Flash Sale
- **Mức độ**: **LOW (P3)** | **Phân hệ**: Buyer Storefront
- **Bằng chứng Backend**:
  - `GET /products?sort=newest&size=8`
- **Bằng chứng Frontend**:
  - File: `apps/buyer/src/features/products/services/product.api.js`
- **Nguyên nhân gốc rễ**: Hệ thống Catalog chưa có service Flash Sale chuyên biệt, hiện tại đang tái sử dụng query catalog chung.
- **Tác động thực tế**: Hiển thị tốt trên UI nhưng trong tương lai cần service chuyên dụng để hỗ trợ đếm ngược thời gian thực và đồng bộ tồn kho chớp nhoáng.
- **Giải pháp & Trạng thái**:
  - *Giải pháp*: Tạm thời sử dụng query whitelist an toàn; chuẩn bị tích hợp sang Promotion/Flash-Sale Service khi backend phát hành.
  - *Trạng thái*: **HOẠT ĐỘNG ỔN ĐỊNH (OPTIMIZED)**.

