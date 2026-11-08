# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 3: AUDIT TƯƠNG THÍCH UI/UX, THIẾT KẾ PENPOT VÀ TÀI LIỆU

---

### 1. PHÂN TÍCH UI DƯ THỪA & DỮ LIỆU GIẢ LẬP (REDUNDANT & FAKE UI)

Quá trình rà soát phát hiện nhiều thành phần giao diện đang hiển thị thông tin giả mạo (hardcoded/mock metrics), không có backend tương ứng hoặc gửi thừa các trường dữ liệu gây xung đột nghiêm trọng.

#### UI-RED-01: Chỉ số Social Proof giả mạo (Fake Review & Sold Counts)
- **Tên màn hình**: Trang chi tiết sản phẩm (Product Detail Page - PDP).
- **Component**: `ProductDetailPage.jsx`.
- **File path**: `apps/buyer/src/features/products/pages/ProductDetailPage.jsx` (dòng 105 - 110).
- **Hiện trạng mã nguồn**:
  ```javascript
  const reviewCount = product?.rating_summary?.review_count || 1284;
  const soldCount = product?.rating_summary?.sold_count || 1420;
  ```
- **Tài liệu đối soát**: `api/product-catalog.md#2` quy định `rating_summary` chỉ chứa `{ avg: number, count: number }`. Không hề có `review_count` hay `sold_count`.
- **Lý do dư thừa**: Fallback hardcode trực tiếp số liệu `1284` đánh giá và `1420` đã bán. Mọi sản phẩm mới tạo (chưa bán được đơn nào) khi người dùng truy cập đều hiển thị con số giả mạo 1,284 đánh giá và 1,420 đã bán.
- **Ảnh hưởng nghiệp vụ**: Gian lận số liệu người dùng, vi phạm tính trung thực của sàn TMĐT, gây sai lệch niềm tin của khách hàng.
- **Đề xuất**: **SỬA NGAY**. Đổi sang đọc đúng trường `rating_summary?.count || 0`. Nếu số lượng bán do Order Service quản lý chưa tích hợp thì ẩn chỉ số đã bán hoặc hiển thị `product?.sold_count || 0`.

---

#### UI-RED-02: Bộ lọc trạng thái "Hết hàng" (OUT_OF_STOCK) giả lập
- **Tên màn hình**: Quản lý danh sách sản phẩm người bán (Seller Products Page).
- **Component**: `ProductsPage.jsx`.
- **File path**: `apps/seller/src/features/products/pages/ProductsPage.jsx` (dòng 24 - 31).
- **Hiện trạng mã nguồn**:
  ```javascript
  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'ACTIVE', label: 'Đang bán' },
    { id: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
    { id: 'OUT_OF_STOCK', label: 'Hết hàng' },
    { id: 'INACTIVE', label: 'Đã ẩn' },
  ];
  ```
- **Tài liệu đối soát**: `db/product-catalog.md#products` định nghĩa `ProductStatus` chỉ gồm 5 giá trị enum: `DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `INACTIVE`, `REJECTED`, `ARCHIVED`. Tồn kho là thuộc tính động tính toán từ `inventory_projections`, không phải là trạng thái trong bảng `products`.
- **Lý do dư thừa**: Khi người bán bấm tab "Hết hàng", FE gửi query param `?status=OUT_OF_STOCK` lên BE. Backend NestJS sẽ báo lỗi HTTP 400 `PRODUCT_INVALID_STATUS` hoặc trả về kết quả rỗng.
- **Ảnh hưởng nghiệp vụ**: Người bán không thể lọc được các sản phẩm hết hàng thật sự, gây nhầm lẫn quy trình quản trị kho.
- **Đề xuất**: **LOẠI BỎ** tab `OUT_OF_STOCK` khỏi query `status`. Nếu muốn lọc hết hàng, cần gọi API chuyên biệt của Inventory Service hoặc bổ sung query param `stock_status=out_of_stock` trên BE.

---

#### UI-RED-03: Trường giá `min_price` và `max_price` dư thừa trong Modal tạo sản phẩm
- **Tên màn hình**: Modal tạo & chỉnh sửa sản phẩm người bán.
- **Component**: `ProductEditorModal.jsx`.
- **File path**: `apps/seller/src/features/products/components/ProductEditorModal.jsx` (dòng 85 - 94).
- **Hiện trạng mã nguồn**:
  ```javascript
  price_summary: {
    base_price: form.basePrice,
    sale_price: form.salePrice || null,
    min_price: form.minPrice || 0,   // DƯ THỪA - BỊ CẤM
    max_price: form.maxPrice || 0,   // DƯ THỪA - BỊ CẤM
    currency: 'VND',
  }
  ```
- **Tài liệu & Backend đối soát**: `Product-Catalog-Service/src/product/dto/price-summary.dto.ts` chỉ cho phép 3 trường:
  ```typescript
  export class PriceSummaryDto {
    @IsNumber() @Min(1) base_price: number;
    @IsOptional() @IsNumber() sale_price?: number;
    @IsOptional() @IsString() currency?: string;
  }
  ```
- **Lý do dư thừa & Nguy cơ**: Backend sử dụng NestJS `ValidationPipe` với cờ `forbidNonWhitelisted: true`. Bất kỳ request nào chứa `min_price` hoặc `max_price` đều lập tức bị quăng lỗi **HTTP 400 Bad Request: property min_price should not exist**. Hơn nữa, việc truyền `minPrice: 0` vi phạm ràng buộc `@Min(1)`.
- **Ảnh hưởng nghiệp vụ**: Người bán hoàn toàn **KHÔNG THỂ TẠO SẢN PHẨM** trên hệ thống khi kết nối Backend thực tế.
- **Đề xuất**: **LOẠI BỎ NGAY** `min_price` và `max_price` khỏi payload gửi đi của `ProductEditorModal.jsx`.

---

### 2. PHÂN TÍCH UI CÒN THIẾU (MISSING UI & UX GAPS)

Đối chiếu với các yêu cầu bắt buộc trong `AGENTS.md` (Xử lý đầy đủ 4 trạng thái: Loading, Success, Empty, Error) và nghiệp vụ sàn TMĐT:

#### UI-MISS-01: Thiếu hiển thị lý do từ chối sản phẩm (`rejection_reason`) cho Người bán
- **Vị trí**: `apps/seller/src/features/products/pages/ProductsPage.jsx`.
- **Mô tả thiếu sót**: Khi Admin từ chối duyệt sản phẩm với lý do cụ thể (quy định tại API `POST /admin/catalog/products/{id}/reject` kèm payload `{ reason: string }`), trạng thái sản phẩm chuyển thành `REJECTED`. Tuy nhiên, trên giao diện danh sách sản phẩm của Người bán chỉ hiển thị badge màu đỏ "Bị từ chối", **hoàn toàn không có tooltip, popup hay modal hiển thị lý do bị từ chối**.
- **Hậu quả UX**: Người bán không biết sản phẩm vi phạm chính sách gì (hình ảnh sai quy chuẩn, nội dung cấm, hay giá ảo) để chỉnh sửa và nộp duyệt lại (`submit for review`).
- **Yêu cầu bổ sung**: Thêm nút icon thông tin cạnh badge trạng thái `REJECTED`, khi click mở Dialog hiển thị chi tiết lý do từ chối và thời điểm từ chối.

---

#### UI-MISS-02: Thiếu Empty State chuẩn Penpot khi tìm kiếm / lọc không có dữ liệu
- **Vị trí**:
  - `apps/seller/src/features/products/pages/ProductsPage.jsx` (bảng sản phẩm).
  - `apps/buyer/src/features/products/pages/ProductListPage.jsx` (lưới sản phẩm).
- **Mô tả thiếu sót**: Khi danh sách trả về mảng rỗng `items: []`, Seller UI chỉ render một dòng chữ nhỏ hoặc để bảng trống trơn. Quy chuẩn Penpot và `AGENTS.md` quy định bắt buộc phải có Empty State Component bao gồm:
  1. Hình minh họa trực quan (Empty illustration / Box icon).
  2. Dòng thông điệp chính: "Chưa có sản phẩm nào phù hợp".
  3. Dòng gợi ý phụ: "Thử điều chỉnh bộ lọc hoặc thêm mới sản phẩm".
  4. Nút kêu gọi hành động (CTA): "Thêm sản phẩm ngay" (Seller) hoặc "Khám phá danh mục khác" (Buyer).
- **Yêu cầu bổ sung**: Tích hợp component `<EmptyState />` chuẩn từ `@taca/ui-components`.

---

#### UI-MISS-03: Thiếu tính năng Xóa hình ảnh / video chuyên biệt (Media Deletion)
- **Vị trí**: `apps/seller/src/features/products/components/ProductEditorModal.jsx`.
- **Mô tả thiếu sót**: Backend cung cấp endpoint `DELETE /seller/products/{productId}/media/{mediaId}` nhằm tối ưu hóa việc quản lý bộ sưu tập ảnh S3 và CDN. Tuy nhiên trên giao diện FE chỉ có thao tác xóa ảnh khỏi mảng local state của React, không hề kích hoạt lệnh gọi xóa media trên server khi người bán đang biên tập sản phẩm đã lưu.
- **Hậu quả**: Các file rác (orphan media) vẫn tồn tại vĩnh viễn trên database MongoDB và S3 Bucket, gây lãng phí dung lượng lưu trữ.

---

#### UI-MISS-04: Thiếu màn hình Xem Lịch sử Kiểm toán Danh mục (Admin Catalog Audits)
- **Vị trí**: `apps/admin/src/pages/`.
- **Mô tả thiếu sót**: Backend và DB Schema định nghĩa chi tiết collection `catalog_audits` lưu vết mọi hành vi phê duyệt, đình chỉ, thay đổi giá, đổi trạng thái của Admin và Seller (`GET /admin/catalog/audits`). Tuy nhiên trong mã nguồn Admin Portal (`apps/admin`), hoàn toàn **chưa có trang hoặc tab Audit Log** nào được xây dựng.
- **Hậu quả**: Admin cấp cao (Super Admin) không thể kiểm tra lịch sử thao tác của các nhân viên điều hành khi xảy ra sự cố tranh chấp hoặc kiểm duyệt sai.

---

### 3. ĐỐI CHIẾU THIẾT KẾ PENPOT (PENPOT VISUAL & DESIGN SYSTEM COMPLIANCE)

Đối chiếu theo các quy chuẩn thiết kế tại `docs/design/PENPOT_MAPPING.md` và `shared/ui-components/AGENTS.md`:

#### 3.1. Hệ thống Icon (Icon System Compliance)
- **Quy tắc**: Tuyệt đối không dùng emoji văn bản (`📦`, `⭐`, `❌`, `✅`) giả lập UI; 100% icon phải dùng từ thư viện `lucide-react`.
- **Kết quả kiểm toán**:
  - `apps/buyer`: Đã tuân thủ 100% (sử dụng `Star`, `ShoppingCart`, `ShieldCheck`, `Truck`, `Heart` từ `lucide-react`).
  - `apps/seller`: Đã tuân thủ 100% (sử dụng `Plus`, `Edit`, `Trash2`, `Search`, `Eye`, `EyeOff` từ `lucide-react`).
  - `apps/admin`: Đã tuân thủ 100% (sử dụng `CheckCircle`, `XCircle`, `AlertTriangle`, `FolderTree` từ `lucide-react`).
  - **Đánh giá**: 🟢 **ĐẠT CHUẨN ICON SYSTEM**.

#### 3.2. Bảng ma trận tổ hợp biến thể SKU (SKU Matrix Table UX)
- **Penpot Spec**: Thiết kế Penpot yêu cầu bảng tổ hợp SKU phân cấp (Ví dụ: Màu sắc [Đen, Trắng] $\times$ Kích thước [S, M, L] tạo thành 6 dòng SKU), cho phép:
  - Nhập hàng loạt (Bulk edit giá và tồn kho cho toàn bộ tổ hợp).
  - Chỉnh sửa chi tiết từng SKU (Giá bán lẻ, Tồn kho ban đầu, Mã Barcode).
- **Hiện trạng trên FE (`SkuMatrixTable.jsx`)**:
  - FE đã có bảng tổ hợp, tuy nhiên khi co màn hình xuống kích thước Tablet/Mobile (`< 1024px`), bảng bị tràn khung ngang (overflow) mà không có thanh cuộn ngang chuyên biệt `overflow-x-auto` chuẩn.
  - Các ô nhập số (`input type="number"`) thiếu định dạng tiền tệ tức thì (currency mask VND), gây khó khăn cho người bán khi nhập các con số hàng triệu đồng (dễ nhầm lẫn số chữ số 0).
  - **Đề xuất**: Bổ sung wrapper `overflow-x-auto` và component `MoneyInput` từ `@taca/ui-components`.

#### 3.3. Typography & Spacing Hierarchy
- **Penpot Spec**: Base font size 14px, heading H1 24px semi-bold, khoảng cách margin/padding tuân thủ thang 4px (p-4 = 16px, gap-6 = 24px).
- **Hiện trạng trên FE**:
  - Sử dụng Tailwind CSS v3 hoàn toàn đồng bộ với theme tokens.
  - Không phát hiện các giá trị arbitrary bừa bãi (như `w-[137px]`).
  - **Đánh giá**: 🟢 **ĐẠT CHUẨN DESIGN TOKENS**.

