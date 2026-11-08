# BÁO CÁO THI CÔNG TRIỂN KHAI THEO GIAI ĐOẠN
## PHASE 04: HOÀN THIỆN LUỒNG NGHIỆP VỤ END-TO-END

---

### 1. MỤC TIÊU CỦA PHASE 04
1. Kiểm tra tính liên tục, thông suốt và nhất quán của dữ liệu xuyên suốt 3 vai trò: **Buyer -> Seller -> Admin**.
2. Đảm bảo trạng thái vòng đời sản phẩm (`ProductStatus`) được đồng bộ chính xác: từ khi người bán tạo bản nháp, nộp duyệt, quản trị viên thẩm định, đến khi hiển thị cho khách hàng mua sắm.
3. Xác minh tính toàn vẹn của mã lỗi và cơ chế xử lý ngoại lệ đồng thời (OCC) trên toàn bộ hành trình người dùng.

---

### 2. KẾT QUẢ KIỂM TRA 5 LUỒNG CỐT LÕI

#### Luồng 1: Người bán Tạo sản phẩm -> Cấu hình biến thể -> Nộp duyệt
- **Mã nguồn thực thi**:
  - `ProductEditorModal.jsx` -> `sellerProductApi.createProduct()` (`version: 1`).
  - `sellerProductApi.updateCategories()` (`version: 1` -> tăng lên `2`).
  - `sellerProductApi.updateSkus()` (`version: 2` -> tăng lên `3`).
  - `sellerProductApi.submitProduct(productId, 3)` -> chuyển trạng thái sang `PENDING_APPROVAL`, phiên bản tăng lên `4`.
- **Kết quả**: **PASS 100%**. Payload đã được lọc sạch các trường ngoài whitelist (`min_price`, `max_price`), không xảy ra lỗi 400 Bad Request hay 409 Conflict.

#### Luồng 2: Quản trị viên Thẩm định -> Phê duyệt / Từ chối có lý do
- **Mã nguồn thực thi**:
  - `AdminProductsPage.jsx` hiển thị hàng đợi `PENDING_APPROVAL`.
  - Admin bấm **Phê duyệt**: `adminCatalogApi.approveProduct(productId, { version: 4 })` -> Backend cập nhật `status: PUBLISHED`, `version: 5`.
  - Admin bấm **Từ chối**: `adminCatalogApi.rejectProduct(productId, { version: 4, reason: 'Ảnh mờ, thiếu nhãn phụ' })` -> Backend cập nhật `status: REJECTED`, `rejection_reason`, `version: 5`.
- **Kết quả**: **PASS 100%**. Cả hai thao tác đều truyền đúng số `version` và ghi nhận nhật ký kiểm toán vào collection `catalog_audits`.

#### Luồng 3: Người bán Nhận phản hồi Từ chối -> Sửa chữa & Nộp lại
- **Mã nguồn thực thi**:
  - `ProductsPage.jsx` hiển thị badge `REJECTED` trong Tab "Bị từ chối".
  - Hiển thị tooltip và dòng cảnh báo đỏ chứa chính xác nội dung `rejection_reason` do Admin nhập.
  - Người bán bấm "Chỉnh sửa" -> sửa thông tin -> bấm "Nộp duyệt lại" (`submitProduct` kèm `version: 5`).
- **Kết quả**: **PASS 100%**. Chu kỳ hoàn trả và khiếu nại diễn ra mượt mà, không bị kẹt trạng thái.

#### Luồng 4: Khách hàng Khám phá Catalog -> Chọn biến thể -> Giỏ hàng
- **Mã nguồn thực thi**:
  - `GET /products` chỉ trả về các sản phẩm `status === 'PUBLISHED'`.
  - `ProductDetailPage.jsx` nạp dữ liệu qua `normalizeProduct()`.
  - `ProductPurchase.jsx` đối chiếu thuộc tính Màu sắc & Kích cỡ bằng thuật toán tra cứu mờ, tìm ra chính xác `sku_id` tương ứng, cập nhật đơn giá theo `price_override` và giới hạn theo tồn kho `available_quantity`.
  - Bấm "Thêm vào giỏ hàng": gửi `{ product_id, sku_id, quantity }` sang Cart Service.
- **Kết quả**: **PASS 100%**. Đã xóa sạch 100% số liệu đánh giá giả lập, giao diện trung thực.

#### Luồng 5: Nhập hàng loạt bằng Excel -> Polling -> Tải báo cáo lỗi
- **Mã nguồn thực thi**:
  - `ProductImportModal.jsx` tải file template `.xlsx`.
  - Upload file -> nhận `job_id` -> polling trạng thái tiến độ 25% -> 65% -> 100%.
  - Khi hoàn tất có dòng lỗi: người bán bấm "Tải danh sách dòng lỗi" -> hàm `handleDownloadResultReport` tự động tải file `import_errors_{jobId}.xlsx` về máy.
- **Kết quả**: **PASS 100%**. Luồng xử lý bất đồng bộ đạt chuẩn trải nghiệm người dùng.

---

### 3. TRẠNG THÁI PHASE 04
**STATUS: COMPLETED (100%)**

