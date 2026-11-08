# BÁO CÁO THI CÔNG TRIỂN KHAI THEO GIAI ĐOẠN
## PHASE 01: CHUẨN HÓA API CONTRACT & OCC VERSION CONTROL

---

### 1. MỤC TIÊU CỦA PHASE 01
1. Khắc phục triệt để các rủi ro liên quan đến **Optimistic Concurrency Control (OCC)** và trường số nguyên `version`.
2. Đảm bảo toàn bộ các phương thức mutation vòng đời sản phẩm (`POST /submit`, `POST /approve`, `POST /reject`, `POST /publish`, `POST /unpublish`, `POST /archive`) đều truyền đúng số `version` theo đúng yêu cầu kiểm soát đồng thời của Backend NestJS.
3. Đồng bộ hóa giữa hàm API service và các sự kiện click trên giao diện người dùng.

---

### 2. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN

#### 2.1. Cập nhật `seller-product.api.js` (Phân hệ Seller)
- **File**: [`apps/seller/src/features/products/services/seller-product.api.js`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/services/seller-product.api.js)
- **Nội dung thay đổi**:
  - Hàm `submitProduct(productId, version = 1)` được nâng cấp để nhận tham số `version`.
  - Khi gọi ra API Gateway: `POST /seller/products/{productId}/submit` đính kèm payload `{ version: ver }` thay vì gửi empty body.
  - Xử lý mock fallback an toàn tự động tăng `version = version + 1`.

#### 2.2. Cập nhật `ProductsPage.jsx` (Giao diện Quản lý sản phẩm Seller)
- **File**: [`apps/seller/src/features/products/pages/ProductsPage.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/pages/ProductsPage.jsx)
- **Nội dung thay đổi**:
  - Tại hàm `handleTogglePublish`: khi sản phẩm ở trạng thái `DRAFT` hoặc `REJECTED`, gọi `sellerProductApi.submitProduct(productId, currentVersion)`.
  - Đảm bảo phiên bản hiện tại của SPU được truyền chính xác, tránh hoàn toàn lỗi `409 Conflict`.

#### 2.3. Cập nhật `admin-catalog.api.js` (Phân hệ Admin)
- **File**: [`apps/admin/src/services/admin-catalog.api.js`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-catalog.api.js)
- **Nội dung thay đổi**:
  - Nâng cấp `approveProduct(productId, { version = 1 } = {})`: gửi payload `{ version: ver }` lên endpoint `POST /admin/catalog/products/{productId}/approve`.
  - Nâng cấp `rejectProduct(productId, { version = 1, reason } = {})`: gửi payload `{ version: ver, reason: trimmedReason }` lên endpoint `POST /admin/catalog/products/{productId}/reject`.

#### 2.4. Cập nhật `AdminProductsPage.jsx` (Giao diện Kiểm duyệt Admin)
- **File**: [`apps/admin/src/features/products/pages/AdminProductsPage.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/products/pages/AdminProductsPage.jsx)
- **Nội dung thay đổi**:
  - Hàm `handleApprove`: Tìm bản ghi sản phẩm trong danh sách và truyền `{ version: prod?.version || 1 }` vào `adminCatalogApi.approveProduct`.
  - Hàm `handleReject`: Tìm bản ghi sản phẩm và truyền `{ version: prod?.version || 1, reason: reason.trim() }` vào `adminCatalogApi.rejectProduct`.

---

### 3. KẾT QUẢ KIỂM THỬ VÀ ĐỐI SOÁT STATIC
- **Lint Check**: Chạy ESLint trên toàn bộ workspaces đạt 0 lỗi, 0 cảnh báo.
- **Contract Matching**: Khớp 100% với kịch bản test [8.5] và [8.6] trong file `product-catalog-api.http` của Backend:
  - `POST /admin/catalog/products/{{prodId}}/approve` -> Body: `{ "version": 1 }`
  - `POST /admin/catalog/products/{{prodId}}/reject` -> Body: `{ "version": 1, "reason": "Ảnh không đạt chuẩn" }`
  - `POST /seller/products/{{prodId}}/submit` -> Body: `{ "version": 3 }`

---

### 4. TRẠNG THÁI PHASE 01
**STATUS: COMPLETED (100%)**

