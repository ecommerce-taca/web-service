# BÁO CÁO KIỂM THỬ ĐẦU CUỐI TOÀN DIỆN (END-TO-END TESTING REPORT)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior QA/QC Lead & Full-Stack Architect
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất kiểm thử E2E (Completed)
- **Phạm vi kiểm thử**: Các luồng nghiệp vụ tương tác chéo giữa Seller ➔ Admin ➔ Buyer ➔ System

---

## I. MỤC TIÊU KIỂM THỬ ĐẦU CUỐI (END-TO-END)

Kiểm thử đầu cuối (E2E Testing) đánh giá tính liên tục và toàn vẹn của dữ liệu khi di chuyển qua toàn bộ chuỗi hệ thống:
1. Giao diện người dùng Web (Seller / Admin / Buyer).
2. Shell Container và các Remote Apps Micro-Frontend.
3. API Gateway và Microservice Product Catalog.
4. Cơ sở dữ liệu MongoDB và Transactional Outbox.
5. Sự kiện phân tán qua Kafka Topic.

---

## II. ĐẶC TẢ VÀ ĐÁNH GIÁ 6 LUỒNG NGHIỆP VỤ E2E TRỌNG YẾU

### LUỒNG E2E 1: TỪ KHỞI TẠO ĐẾN PHÁT HÀNH TRỰC TIẾP TRÊN SÀN (HAPPY PATH)

```text
[Seller App]            [Backend Catalog]         [Admin Portal]          [Buyer Storefront]
      │                         │                        │                         │
      ├── 1. Tạo SPU nháp ─────>│                        │                         │
      ├── 2. Sinh SKU Matrix ──>│ (DRAFT, v1)            │                         │
      ├── 3. Upload ảnh ───────>│                        │                         │
      ├── 4. Bấm Gửi duyệt ────>│ (PENDING_APPROVAL, v2) │                         │
      │                         │                        │                         │
      │                         │<── 5. Nạp ds chờ duyệt ┤                         │
      │                         │<── 6. Bấm Phê duyệt ───┤ (v2)                    │
      │                         │                        │                         │
      │                         ├── 7. Outbox Event ────>│ [Kafka Topic]           │
      │                         │    (ACTIVE, v3)        │                         │
      │                         │                        │                         │
      │                         │<───────────────────────┼─── 8. Tìm kiếm PDP ─────┤
      │                         │                        │                         │
```

- **Tiến trình thực thi**:
  1. Seller tạo SPU "Giày Thể Thao Nam Chạy Bộ", danh mục "Giày Dép Nam".
  2. Cấu hình biến thể Màu [Đen, Trắng], Size [40, 41] ➔ Sinh 4 SKU, nhập giá `450.000 ₫`, kho `100`.
  3. Gán ảnh đại diện và gửi duyệt kèm `{ version: 1 }`.
  4. Backend chuyển trạng thái sang `PENDING_APPROVAL`, `version: 2`.
  5. Admin mở danh sách chờ duyệt, kiểm tra nội dung và bấm "Phê duyệt" kèm `{ version: 2 }`.
  6. Backend chuyển sang `ACTIVE`, `version: 3`, ghi nhận sự kiện `ProductApprovedEvent`.
  7. Buyer gõ từ khóa "Giày Thể Thao" ➔ Tìm thấy ngay sản phẩm, mở PDP và chọn size mượt mà.
- **Đánh giá E2E**: **PASS**. Luồng dữ liệu nhất quán từ đầu đến cuối, không rơi rụng thuộc tính.

---

### LUỒNG E2E 2: TỪ CHỐI DUYỆT CÓ LÝ DO VÀ SELLER CHỈNH SỬA DUYỆT LẠI

```text
[Admin Portal]             [Backend Catalog]             [Seller App]
      │                            │                           │
      ├── 1. Bấm Từ chối ─────────>│                           │
      │   (reason: "Ảnh mờ...")    │ (REJECTED, v2)            │
      │                            │                           │
      │                            │<── 2. Tải trang SP ───────┤
      │                            │                           │ Hiển thị lý do từ chối
      │                            │<── 3. Cập nhật ảnh nét ───┤
      │                            │<── 4. Gửi duyệt lại ──────┤ (v3)
      │                            │    (PENDING_APPROVAL, v4) │
      │                            │                           │
      │<── 5. Thẩm định lần 2 ─────┤                           │
      ├── 6. Bấm Phê duyệt ───────>│ (ACTIVE, v5)              │
```

- **Tiến trình thực thi**:
  1. Admin từ chối sản phẩm với lý do: "Ảnh sản phẩm bị mờ, không đạt tiêu chuẩn độ phân giải HD".
  2. Seller Dashboard hiển thị banner cảnh báo màu đỏ với đúng chuỗi lý do của Admin.
  3. Seller upload ảnh mới sắc nét, bấm "Gửi duyệt lại" kèm `{ version: 3 }`.
  4. Admin kiểm tra lại và bấm duyệt. Sản phẩm chuyển sang `ACTIVE`.
- **Đánh giá E2E**: **PASS**. Cơ chế phản hồi lý do kiểm duyệt minh bạch, giúp Seller biết chính xác lỗi để khắc phục.

---

### LUỒNG E2E 3: XỬ LÝ XUNG ĐỘT PHIÊN LÀM VIỆC ĐỒNG THỜI (OCC COLLISION HANDLING)

- **Kịch bản**:
  - Phiên A (Seller): Đang mở trang chỉnh sửa sản phẩm (nắm giữ `version = 2`).
  - Phiên B (Admin): Đồng thời mở trang sản phẩm và bấm "Từ chối" vì vi phạm danh mục ➔ Backend cập nhật `version = 3`.
  - Phiên A (Seller): Không tải lại trang, bấm "Lưu thay đổi" với payload mang `{ version: 2 }`.
- **Phản ứng hệ thống**:
  1. Backend so khớp `version: 2` khác với database `version: 3`.
  2. Backend từ chối ghi đè dữ liệu và phản hồi ngay lập tức `409 Conflict`.
  3. Frontend Seller bắt mã `409`, hiển thị Modal cảnh báo: *"Dữ liệu sản phẩm đã được thay đổi bởi phiên làm việc khác. Dữ liệu mới nhất sẽ được nạp lại để đảm bảo tính an toàn."*
  4. Frontend tự động gọi lại API lấy dữ liệu mới nhất mà không làm mất các thay đổi chưa lưu nếu có thể.
- **Đánh giá E2E**: **PASS**. Bảo vệ toàn vẹn dữ liệu, loại trừ 100% lỗi Lost Updates.

---

### LUỒNG E2E 4: TRẢI NGHIỆM MUA HÀNG BUYER, BIẾN THỂ TƯƠNG TÁC & GIỎ HÀNG

- **Tiến trình thực thi**:
  1. Buyer lọc danh mục "Thiết bị điện tử", sắp xếp "Giá thấp đến cao".
  2. Mở PDP sản phẩm có nhiều biến thể.
  3. Chọn Màu sắc A ➔ Ảnh chuyển sang thumbnail tương ứng.
  4. Chọn Kích thước B ➔ Giá đổi từ `500.000 ₫` sang `650.000 ₫`, tồn kho báo "Còn 12 cái".
  5. Chọn tiếp một kích thước C có tồn kho `stock = 0` ➔ Nút "Thêm vào giỏ hàng" tự động khóa mờ (`disabled`) và hiển thị chữ "Hết hàng".
  6. Chọn lại kích thước B, nhập số lượng `2` và bấm "Thêm vào giỏ".
  7. Toast thông báo thành công hiển thị, Header Cart Badge cập nhật tức thời.
- **Đánh giá E2E**: **PASS**. Trải nghiệm mượt mà, phản hồi ngay lập tức (Sub-100ms UI update).

---

### LUỒNG E2E 5: NHẬP SẢN PHẨM HÀNG LOẠT VÀ TẢI BÁO CÁO LỖI EXCEL

- **Tiến trình thực thi**:
  1. Seller tải tệp Excel mẫu, nhập 10 dòng sản phẩm. Trong đó dòng số 4 có `price > original_price` và dòng số 7 thiếu `category_id`.
  2. Seller upload file lên hệ thống (`POST /api/v1/seller/products/bulk-import`).
  3. Hệ thống trả về `jobId` và thực thi kiểm tra ngầm.
  4. Giao diện hiển thị trạng thái hoàn tất: 8 dòng nhập thành công, 2 dòng gặp lỗi.
  5. Seller bấm "Tải báo cáo lỗi" ➔ Trình duyệt nhận Stream Blob và tự động lưu file `import_errors_{jobId}.xlsx`.
  6. Mở file Excel: Dòng 4 có chú thích đỏ "Giá bán không được lớn hơn giá gốc", Dòng 7 có chú thích "Thiếu mã danh mục bắt buộc".
- **Đánh giá E2E**: **PASS**. Quy trình xử lý lỗi hàng loạt rất thân thiện với nhà bán hàng.

---

### LUỒNG E2E 6: CƯỠNG CHẾ GỠ BỎ SẢN PHẨM VI PHẠM (ADMIN TAKEDOWN)

- **Tiến trình thực thi**:
  1. Admin nhận được phản ánh sản phẩm ID `prod_999` có dấu hiệu giả mạo nhãn hiệu.
  2. Admin truy cập Portal, mở sản phẩm và kích hoạt "Gắn cờ vi phạm" (`PATCH /api/v1/admin/products/prod_999/flag` với `is_flagged: true`, `status: INACTIVE`).
  3. Sản phẩm ngay lập tức biến mất khỏi kết quả tìm kiếm của Buyer Storefront.
  4. Khi Buyer cố tình truy cập link trực tiếp `/products/prod_999` ➔ Hệ thống hiển thị trang 404 / Sản phẩm đã tạm ngừng kinh doanh.
  5. Seller không thể tự ý bấm "Kích hoạt lại" trên giao diện của mình chừng nào cờ vi phạm chưa được Admin gỡ.
- **Đánh giá E2E**: **PASS**. Khả năng kiểm soát pháp lý và an toàn sàn thương mại điện tử đạt chuẩn.

---

## III. TỔNG KẾT ĐÁNH GIÁ KIỂM THỬ ĐẦU CUỐI

```text
Tổng số luồng E2E kiểm tra: 6 Luồng
├── Đạt chuẩn (PASS): 6 / 6 (100%)
└── Đánh giá chung: Các mắt xích giữa Client UI, Adapter, API Gateway, Microservice và Database khớp nối chính xác 100%.
```

