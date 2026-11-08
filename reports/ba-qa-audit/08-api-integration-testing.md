# BÁO CÁO KIỂM THỬ TÍCH HỢP HỢP ĐỒNG API (API CONTRACT & INTEGRATION TESTING)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior Technical Auditor & Integration Lead
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất kiểm thử hợp đồng (100% Contract Audit Passed)
- **Mục tiêu**: Rà soát tính tương thích toàn diện giữa 31 Endpoints Backend và các Feature API Services của Frontend.

---

## I. MỤC TIÊU KIỂM THỬ HỢP ĐỒNG API

Kiểm thử hợp đồng API (API Contract Testing) nhằm đảm bảo:
1. Frontend gọi chính xác URL, HTTP Method và Query Parameters mà Backend cung cấp.
2. Request Body tuân thủ nghiêm ngặt cấu trúc DTO và không gửi các trường bị cấm (tránh lỗi `forbidNonWhitelisted`).
3. Response Envelope được Frontend bóc tách (unwrap) chính xác, không gây lỗi `undefined` khi truy cập dữ liệu.
4. Xử lý chuẩn xác các mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 409).

---

## II. QUY CHUẨN CẤU TRÚC PHẢN HỒI (ENVELOPE STANDARDS)

### 1. Envelope Thành công (Success Response):
```json
{
  "success": true,
  "data": { ... }, // Object hoặc Array
  "pagination": {  // Tùy chọn, chỉ có ở các endpoint danh sách
    "page": 1,
    "limit": 20,
    "total": 128,
    "totalPages": 7
  },
  "timestamp": "2026-11-08T08:30:00.000Z"
}
```

### 2. Envelope Thất bại (Error Response):
```json
{
  "statusCode": 409,
  "message": "Dữ liệu sản phẩm đã bị thay đổi bởi phiên làm việc khác. Vui lòng tải lại trang.",
  "error": "Conflict",
  "timestamp": "2026-11-08T08:30:00.000Z",
  "path": "/api/v1/seller/products/prod_123/submit"
}
```

### 3. Tương thích Axios Client Frontend:
Tệp [shared/utils/api-client.js](file:///d:/di_hoc/taca_ecommerce/shared/utils/api-client.js) cài đặt Interceptor tự động bóc tách tầng `response.data`, giúp các component truy cập trực tiếp `res.data` hoặc `res.pagination` mà không phải viết lặp lại mã unwrap.

---

## III. BẢNG ĐỐI SOÁT CHI TIẾT 31 ENDPOINTS GIỮA BE VÀ FE

| STT | HTTP Method | Endpoint URL | Phân quyền (Role/Scope) | FE Service tương ứng | Đánh giá tính tương thích |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | `GET` | `/api/v1/categories/tree` | Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 2 | `GET` | `/api/v1/categories/by-slug/:slug` | Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 3 | `GET` | `/api/v1/categories/:id` | Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 4 | `GET` | `/api/v1/buyer/products` | Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 5 | `GET` | `/api/v1/buyer/products/:slugOrId`| Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 6 | `GET` | `/api/v1/buyer/products/:id/recommendations` | Public | `buyer-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 7 | `POST` | `/api/v1/seller/products` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 8 | `GET` | `/api/v1/seller/products` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 9 | `GET` | `/api/v1/seller/products/:id` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 10 | `PUT` | `/api/v1/seller/products/:id` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 11 | `PATCH` | `/api/v1/seller/products/:id/specs` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 12 | `PUT` | `/api/v1/seller/products/:id/skus` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 13 | `PUT` | `/api/v1/seller/products/:id/media`| `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 14 | `POST` | `/api/v1/seller/products/:id/submit`| `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 15 | `POST` | `/api/v1/seller/products/:id/withdraw`| `SELLER` (`x-user-shop-scope`)| `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 16 | `PATCH` | `/api/v1/seller/products/:id/status`| `SELLER` (`x-user-shop-scope`)| `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 17 | `DELETE` | `/api/v1/seller/products/:id` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 18 | `POST` | `/api/v1/seller/products/check-sku` | `SELLER` (`x-user-shop-scope`)| `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 19 | `POST` | `/api/v1/seller/products/bulk-import` | `SELLER` (`x-user-shop-scope`)| `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 20 | `GET` | `/api/v1/seller/products/import-jobs/:id/report` | `SELLER` | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 21 | `GET` | `/api/v1/seller/products/export` | `SELLER` (`x-user-shop-scope`) | `seller-product.api.js` | **TƯƠNG THÍCH 100%** |
| 22 | `POST` | `/api/v1/media/presign-upload` | `SELLER` / `ADMIN` | `seller-media.api.js` | **TƯƠNG THÍCH 100%** |
| 23 | `POST` | `/api/v1/media/confirm` | `SELLER` / `ADMIN` | `seller-media.api.js` | **TƯƠNG THÍCH 100%** |
| 24 | `GET` | `/api/v1/admin/products` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 25 | `POST` | `/api/v1/admin/products/:id/approve` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 26 | `POST` | `/api/v1/admin/products/:id/reject` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 27 | `PATCH` | `/api/v1/admin/products/:id/flag` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 28 | `POST` | `/api/v1/admin/categories` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 29 | `PATCH` | `/api/v1/admin/categories/:id` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 30 | `GET` | `/api/v1/admin/catalog/audits` | `ADMIN` | `admin-catalog.api.js` | **TƯƠNG THÍCH 100%** |
| 31 | `GET` | `/health` | Public | System Monitoring | **TƯƠNG THÍCH 100%** |

---

## IV. ĐỐI CHIẾU KIỂU DỮ LIỆU & ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 1. Bảng ánh xạ kiểu dữ liệu (Data Type Mapping):

| Tên trường dữ liệu | Kiểu dữ liệu Backend (Mongo/NestJS) | Kiểu dữ liệu Frontend (JS/React) | Quy tắc chuyển đổi |
| :--- | :--- | :--- | :--- |
| `id` / `_id` | `mongoose.Schema.Types.ObjectId` (String) | `string` | Adapter chuẩn hóa: `raw.id || raw._id` |
| `shop_id` | `string` | `string` | Đồng bộ 100% |
| `version` | `number` (Integer, bắt đầu từ 1) | `number` | Adapter giữ nguyên giá trị để phục vụ OCC |
| `tax_rate_bps` | `number` (Basis Points: 0 - 10000) | `number` | Hiển thị người dùng: `tax_rate_bps / 100 + '%'` |
| `price` | `number` (VNĐ, Số nguyên) | `number` | Định dạng hiển thị qua `formatCurrency(val)` |
| `stock` | `number` (Số nguyên >= 0) | `number` | Điều khiển logic `disabled` của nút giỏ hàng |
| `images` | `Array<string>` (URLs) | `Array<string>` | Fallback ảnh mặc định nếu mảng rỗng |
| `status` | `enum ProductStatus` | `string` (`PRODUCT_STATUS`) | Dùng chung Enum chuẩn hóa tại Adapter |

### 2. Đánh giá tính toàn vẹn:
- Không còn bất kỳ sự lệch pha (mismatch) nào về tên trường (ví dụ: `categoryId` vs `category_id` đã được Adapter xử lý trọn vẹn).
- Các giá trị số nhạy cảm (tiền tệ, thuế suất, phiên bản) được giữ nguyên vẹn kiểu dữ liệu số nguyên (integer), tuyệt đối không bị convert nhầm sang chuỗi hoặc số thực.

---

## V. KẾT LUẬN KIỂM THỬ HỢP ĐỒNG API

- **Tổng số Endpoints**: 31 / 31 (Đạt 100% độ phủ).
- **Trạng thái hợp đồng**: **100% COMPATIBLE (HOÀN TOÀN TƯƠNG THÍCH)**.
- **Rủi ro còn lại**: Cần kiểm thử tải thực tế với mạng phân tán tại môi trường Staging khi kết nối đồng thời với các dịch vụ vệ tinh (Search Service, Payment Service).

