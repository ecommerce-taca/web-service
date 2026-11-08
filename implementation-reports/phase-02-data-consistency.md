# BÁO CÁO THI CÔNG TRIỂN KHAI THEO GIAI ĐOẠN
## PHASE 02: ĐỒNG BỘ DATA MODEL, ADAPTER & ENUMS

---

### 1. MỤC TIÊU CỦA PHASE 02
1. Thiết lập một **nguồn chân lý duy nhất (Single Source of Truth)** cho mô hình dữ liệu sản phẩm, biến thể SKU và danh mục trên toàn bộ Frontend Monorepo.
2. Xóa bỏ hoàn toàn các lỗi `undefined` khi truy cập thuộc tính do sai lệch tên trường giữa Backend NestJS và Frontend React (`title` vs `name`, `price_summary.base_price` vs `price`, `media` vs `images`).
3. Chuẩn hóa tỷ lệ thuế suất `tax_rate_bps` từ điểm cơ bản (Basis Points) sang phần trăm hiển thị.
4. Đảm bảo trường kiểm soát đồng thời `version` luôn được trích xuất và bảo toàn trong mọi đối tượng dữ liệu.

---

### 2. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN

#### 2.1. Nâng cấp Tầng Adapter Dùng Chung (`product.adapter.js`)
- **File**: [`shared/utils/adapters/product.adapter.js`](file:///d:/di_hoc/taca_ecommerce/shared/utils/adapters/product.adapter.js)
- **Các hàm & hằng số được bổ sung / hoàn thiện**:
  1. `PRODUCT_STATUS`: Enum chuẩn hóa 7 trạng thái của Backend: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `UNPUBLISHED`, `BLOCKED`, `REJECTED`, `ARCHIVED`.
  2. `PRODUCT_STATUS_LABELS`: Bản đồ ánh xạ nhãn hiển thị tiếng Việt chính quy cho từng trạng thái.
  3. `normalizeProduct(raw)`:
     - Giữ nguyên cả `id`, `productId`, `product_id`.
     - Giữ nguyên cả `title` và `name`.
     - Lưu trữ object `price_summary: { base_price, sale_price, currency }` và trường `price` trực tiếp.
     - **Bổ sung bắt buộc `version: Number(raw.version || 1)`** phục vụ OCC.
     - Map mảng `skus`: chuẩn hóa `seller_sku`, `price_override`, `attributes`, `stock`, `barcode`.
     - Map `primary_category_id` và `secondary_category_ids`.
     - Trích xuất `rejection_reason` phục vụ hiển thị lý do từ chối kiểm duyệt.
  4. `normalizeProductList(rawList)`:
     - Nhận diện linh hoạt cấu trúc trả về từ Backend: mảng thuần `[...]`, bọc envelope `{ data: [...] }`, hoặc `{ items: [...] }`.
  5. `normalizeCategory(raw)`:
     - Chuẩn hóa trường thuế suất: `tax_rate_bps` -> `tax` (thập phân, vd: 0.10) và `taxPercentage` (phần trăm, vd: 10%).
     - Chuẩn hóa `version`, `icon_url`, `display_order`, và đệ quy mảng `children`.

---

### 3. KẾT QUẢ ĐỐI SOÁT DATA MODEL
- **Khả năng tương thích 2 chiều**: Cả Buyer (`ProductDetailPage`, `ProductPurchase`), Seller (`ProductsPage`, `ProductEditorModal`), và Admin (`AdminProductsPage`) đều có thể tiêu thụ dữ liệu chuẩn hóa mà không sợ vỡ giao diện.
- **Bảo mật và kiểm soát**: Trường `version` luôn sẵn sàng để cung cấp cho bất kỳ thao tác mutation nào tiếp theo.

---

### 4. TRẠNG THÁI PHASE 02
**STATUS: COMPLETED (100%)**

