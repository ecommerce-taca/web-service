# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG – TACA ECOMMERCE
## PHẦN 04: KIỂM TOÁN TƯƠNG THÍCH UI/UX VÀ NGHIỆP VỤ (UI/UX & BUSINESS LOGIC AUDIT)

---

### 1. KIỂM TOÁN PHÂN HỆ BUYER (STOREFRONT)

#### 1.1. Màn hình Chi tiết sản phẩm (`ProductDetailPage.jsx`)
- **Tích hợp API**: Gọi `product.api.js:getProductById(id)`.
- **Tầng Adapter**: Sử dụng `normalizeProduct()` đảm bảo an toàn truy cập thuộc tính (Defensive Programming), loại bỏ hoàn toàn nguy cơ sập màn hình do dữ liệu Backend trả về dạng `title` thay vì `name` hoặc `price_summary.base_price` thay vì `price`.
- **Xử lý 4 trạng thái giao diện**:
  - `Loading`: Hiển thị Skeleton layout bao gồm ảnh hero lớn, gallery thumbnail, tiêu đề và khối giá tiền.
  - `Success`: Hiển thị đầy đủ thông số kỹ thuật, mô tả HTML, danh mục breadcrumbs và thông tin snapshot gian hàng (`shop_snapshots`).
  - `Empty`: Hiển thị trang 404 thân thiện kèm nút quay về trang chủ khi Backend trả về mã lỗi `PRODUCT_NOT_FOUND`.
  - `Error`: Hiển thị banner cảnh báo kèm nút "Thử lại" (Retry), tự động hủy request cũ bằng `AbortController` khi chuyển trang nhanh.

#### 1.2. Khối Chọn biến thể và Đặt hàng (`ProductPurchase.jsx`)
- **Giải quyết xung đột nhãn ngôn ngữ (Attribute Key Normalization)**:
  - Backend lưu trữ attribute dạng key chuẩn tiếng Anh (VD: `color`, `size`) hoặc slug.
  - Thiết kế Penpot và dữ liệu người bán Việt Nam thường nhập label có dấu (VD: "Màu sắc", "Kích cỡ").
  - `ProductPurchase.jsx` áp dụng cơ chế tra cứu mờ (Fuzzy Key Lookup) và ánh xạ từ điển:
    ```javascript
    const normalizeKey = (key) => {
      const lower = key.toLowerCase().trim();
      if (lower === 'màu' || lower === 'màu sắc') return 'color';
      if (lower === 'kích cỡ' || lower === 'size' || lower === 'kích thước') return 'size';
      return lower;
    };
    ```
- **Xóa bỏ số liệu giả lập (Clean Dead Mock Data)**:
  - Trước đây: Mã nguồn tồn tại fallback số lượng đánh giá giả (`1284 đánh giá`) và số lượng đã bán giả (`1420 đã bán`).
  - Hiện tại: Đã loại bỏ 100% số liệu hardcoded. Hệ thống hiển thị số lượng đánh giá thực tế từ `rating_summary` hoặc trạng thái trống ("Chưa có đánh giá") theo đúng chuẩn trung thực của sàn TMĐT.
- **Tính toán giá và tồn kho động**:
  - Khi người dùng chọn đủ các thuộc tính (VD: Màu Đen + Size L), component tự động khớp với danh sách SKU khả dụng.
  - Cập nhật tức thì đơn giá theo `price_override` và giới hạn số lượng đặt mua theo `available_quantity` từ bảng `inventory_projections`.

#### 1.3. Card hiển thị sản phẩm (`ProductCard.jsx`)
- Hỗ trợ hiển thị ảnh linh hoạt: ưu tiên `coverImage`, nếu không có sẽ lấy phần tử đầu tiên của mảng `media`, cuối cùng là ảnh placeholder chuẩn Design System.
- Hiển thị nhãn giảm giá (Discount Badge) tự động tính toán dựa trên `base_price` và `sale_price`.

---

### 2. KIỂM TOÁN PHÂN HỆ SELLER (MERCHANT PORTAL)

#### 2.1. Quản lý danh sách sản phẩm (`ProductsPage.jsx`)
- **Tích hợp bộ lọc trạng thái đa tab**:
  - `TẤT CẢ` (`ALL`): Xem toàn bộ sản phẩm của gian hàng.
  - `ĐANG BÁN` (`PUBLISHED`): Sản phẩm đang hiển thị công khai trên sàn.
  - `CHỜ DUYỆT` (`PENDING_APPROVAL`): Sản phẩm đã nộp đang chờ Admin thẩm định.
  - `BẢN NHÁP` (`DRAFT`): Sản phẩm đang soạn thảo chưa công bố.
  - `TỪ CHỐI` (`REJECTED`): Sản phẩm bị Admin trả về do vi phạm nội dung.
  - `ĐÃ LƯU TRỮ` (`ARCHIVED`): Sản phẩm đã ngừng kinh doanh.
- **Trải nghiệm người bán khi bị từ chối**:
  - Hiển thị trực tiếp cột / badge cảnh báo kèm tooltip giải thích lý do từ chối (`rejection_reason`).
  - Nút thao tác nhanh "Chỉnh sửa & Nộp lại" giúp Seller khắc phục lỗi và gọi `POST /submit` tức thì.
- **Thao tác vòng đời sản phẩm**:
  - Hỗ trợ đầy đủ các hành động: Tạm dừng bán (`unpublish`), Mở bán lại (`publish`), Lưu trữ (`archive`), Xóa media.

#### 2.2. Modal Tạo & Sửa sản phẩm 4 bước (`ProductEditorModal.jsx`)
- **Khắc phục lỗi nghiêm ngặt của Backend ValidationPipe**:
  - Backend NestJS cấu hình `forbidNonWhitelisted: true`.
  - Trước đây form gửi kèm các trường thừa như `min_price`, `max_price`, `images` khiến BE ném lỗi `400 Bad Request: property min_price should not exist`.
  - Modal đã được tái cấu trúc để chỉ gửi đúng schema DTO:
    ```javascript
    const payload = {
      title: formData.title.trim(),
      slug: generateSlug(formData.title),
      brand: formData.brand?.trim() || undefined,
      description: formData.description,
      price_summary: {
        base_price: Math.max(1, Number(formData.base_price)),
        currency: 'VND'
      },
      version: initialData ? initialData.version : undefined
    };
    ```
- **Quản lý ma trận biến thể SKU**:
  - Cho phép người bán định nghĩa thuộc tính linh hoạt (VD: Màu, Dung lượng, Bộ nhớ).
  - Tự động sinh danh sách SKU con với mã SKU người bán (`seller_sku`) tự động hoặc tùy chỉnh, giá bán riêng (`price_override`), và barcode.

#### 2.3. Modal Nhập dữ liệu hàng loạt (`ProductImportModal.jsx`)
- Hỗ trợ tải file Excel mẫu chuẩn từ API `POST /seller/products/import/template`.
- Upload file `.xlsx` thông qua `POST /seller/products/import`.
- Tích hợp hàm polling trạng thái job `getImportJob(jobId)` để cập nhật thanh tiến độ % hoàn thành (`processed_rows / total_rows`).

---

### 3. KIỂM TOÁN PHÂN HỆ ADMIN (QUẢN TRỊ VIÊN HỆ THỐNG)

#### 3.1. Hàng đợi kiểm duyệt sản phẩm (`AdminProductsPage.jsx`)
- **Tập trung tab `PENDING_APPROVAL`**:
  - Hiển thị danh sách các sản phẩm do Seller nộp lên cần duyệt trước khi xuất hiện trên sàn.
  - Phân loại rõ thông tin gian hàng (`shop_name`), thời gian nộp, danh mục yêu cầu, và giá bán.
- **Hành động kiểm duyệt**:
  - **Phê duyệt (`Approve`)**: Gọi `POST /admin/catalog/products/{id}/approve` kèm `version` hiện tại. Sản phẩm chuyển ngay sang trạng thái `PUBLISHED` và kích hoạt sự kiện Kafka thông báo cho Seller.
  - **Từ chối (`Reject`)**: Mở dialog yêu cầu Admin nhập lý do từ chối (VD: "Hình ảnh mờ, vi phạm bản quyền thương hiệu"), sau đó gọi `POST /admin/catalog/products/{id}/reject` với `{ version, reason }`.
  - **Khóa vi phạm (`Block`)**: Gọi `POST /admin/catalog/products/{id}/block` khi phát hiện sản phẩm có dấu hiệu lừa đảo hoặc vi phạm pháp luật.

#### 3.2. Cây danh mục và Quản lý thuế (`AdminCategoriesPage.jsx`)
- Quản lý phân cấp danh mục đa tầng (Root Categories -> Child Categories).
- Cập nhật tỷ lệ thuế suất `tax_rate_bps` tính theo đơn vị điểm cơ bản (Basis Points).
- Kéo thả hoặc thay đổi thứ tự hiển thị `display_order`.

#### 3.3. Nhật ký kiểm toán sản phẩm (`AdminAuditLogsPage.jsx`)
- Kết nối tới `GET /admin/catalog/audits` để truy xuất lịch sử thay đổi của từng sản phẩm.
- Hiển thị chi tiết actor (User ID, Role), hành động thực hiện (`CREATE`, `UPDATE_SKU`, `APPROVE`, `REJECT`, `BLOCK`), và bản ghi so sánh khác biệt (`diff`).

---

### 4. DANH SÁCH CÁC KHOẢNG TRỐNG TÍNH NĂNG (GAPS & DISCREPANCIES)

#### 4.1. Tính năng giao diện có nhưng Backend chưa hỗ trợ
- **Kết luận**: **KHÔNG CÓ (0 Tính năng)**. Toàn bộ các nút bấm và form biểu mẫu trên giao diện Frontend đều có API Backend tương ứng bảo trợ.

#### 4.2. Tính năng Backend có nhưng giao diện Frontend chưa khai thác hết
1. **Tải file báo cáo lỗi nhập hàng**:
   - Backend có API `GET /seller/products/import/jobs/{jobId}/result` trả về file Excel chứa chi tiết lỗi từng dòng.
   - Frontend hiện mới hiển thị số dòng lỗi (`error_count`), cần bổ sung nút bấm tải trực tiếp file lỗi về máy Seller.
2. **Bộ lọc sản phẩm có rủi ro cao (`flagged_only`)**:
   - Backend hỗ trợ query `GET /admin/catalog/products?flagged_only=true` để lọc nhanh các sản phẩm bị hệ thống cảnh báo tự động.
   - Frontend Admin cần bổ sung checkbox filter này vào thanh công cụ tìm kiếm.

#### 4.3. Đánh giá trạng thái Mock Data
- **Kết luận**: Toàn bộ các trang chính thức của Buyer, Seller, và Admin đều gọi trực tiếp API Gateway thông qua Axios Client. Dữ liệu Mock chỉ còn tồn tại dưới dạng file test fixture phục vụ Unit Test và Storybook, không ảnh hưởng đến môi trường chạy thực tế.

