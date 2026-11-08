# KỊCH BẢN KIỂM THỬ HỆ THỐNG (SYSTEM TEST SCENARIOS)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior Software Tester & QA/QC Lead
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất kịch bản kiểm thử (Completed)
- **Phạm vi**: 10 Kịch bản kiểm thử tích hợp toàn diện (TS-01 đến TS-10)

---

## I. MỤC TIÊU & CHIẾN LƯỢC KIỂM THỬ

Tài liệu này xác định 10 kịch bản kiểm thử hệ thống (System & Integration Test Scenarios) bao phủ toàn diện các luồng nghiệp vụ xuyên suốt giữa 4 tác nhân: Buyer, Seller, Admin và System. Các kịch bản này làm cơ sở để triển khai bộ 35 Test Cases chi tiết (Manual & Automated).

---

## II. DANH MỤC 10 KỊCH BẢN KIỂM THỬ HỆ THỐNG

### TS-01: QUẢN LÝ CÂY DANH MỤC & CẤU HÌNH THUẾ SUẤT BASIS POINTS
- **Scenario ID**: `TS-01`
- **Mục tiêu**: Xác minh khả năng tạo, sửa, sắp xếp cây danh mục đa cấp và tính kế thừa thuế suất `tax_rate_bps`.
- **Tác nhân**: Admin (Catalog Moderator), Buyer
- **Tiền điều kiện**: Tài khoản Admin đã đăng nhập và có quyền `ADMIN`.
- **Các bước thực thi**:
  1. Admin truy cập màn hình `/admin/categories`.
  2. Tạo danh mục gốc (Root Category): "Thiết bị điện tử", `tax_rate_bps: 1000` (10.00%).
  3. Tạo danh mục con cấp 1: "Điện thoại & Phụ kiện" (`parentId` trỏ về "Thiết bị điện tử").
  4. Tạo danh mục lá cấp 2: "Điện thoại thông minh" (`parentId` trỏ về "Điện thoại & Phụ kiện", `tax_rate_bps: 800`).
  5. Buyer truy cập trang chủ `/` và kiểm tra thanh điều hướng Category Tree Navigation.
- **Kỳ vọng**:
  - API `GET /api/v1/categories/tree` trả về cấu trúc lồng nhau đúng 3 cấp.
  - Danh mục lá mang đúng `tax_rate_bps = 800`.
  - Buyer nhìn thấy Breadcrumbs: Trang chủ > Thiết bị điện tử > Điện thoại & Phụ kiện > Điện thoại thông minh.
- **Biên & Ngoại lệ**: Thử tạo danh mục có `parentId` trỏ vào chính nó ➔ Server phải ném lỗi `400 Bad Request` chặn đệ quy vô tận.
- **Yêu cầu liên quan**: `PC-REQ-001`, `PC-REQ-002`, `PC-REQ-004`.

---

### TS-02: KHỞI TẠO BẢN NHÁP SẢN PHẨM SPU & CẬP NHẬT THÔNG SỐ KỸ THUẬT
- **Scenario ID**: `TS-02`
- **Mục tiêu**: Kiểm tra quy trình Seller khởi tạo sản phẩm cơ bản ở trạng thái `DRAFT` và lưu thông số kỹ thuật.
- **Tác nhân**: Seller
- **Tiền điều kiện**: Seller đã kích hoạt gian hàng (`shop_id: "SHOP_01"`).
- **Các bước thực thi**:
  1. Seller vào `/seller/products/create`.
  2. Nhập: Tên sản phẩm ("iPhone 15 Pro Max"), chọn Danh mục lá, Thương hiệu ("Apple").
  3. Nhập thông số kỹ thuật: Màn hình 6.7 inch, Chip Apple A17 Pro, Trọng lượng 221g.
  4. Bấm "Lưu bản nháp".
- **Kỳ vọng**:
  - Bản ghi được tạo với `status = DRAFT`, `version = 1`, `tax_rate_bps = 800` (kế thừa từ danh mục lá).
  - Sản phẩm hiển thị trong tab "Bản nháp" của Seller nhưng hoàn toàn không xuất hiện trên Buyer Storefront.
- **Biên & Ngoại lệ**: Nhập tên sản phẩm dưới 5 ký tự ➔ Client báo lỗi validation, không gửi request.
- **Yêu cầu liên quan**: `PC-REQ-005`, `PC-REQ-006`, `PC-REQ-007`, `PC-REQ-008`.

---

### TS-03: TẠO MA TRẬN BIẾN THỂ SKU 2 CHIỀU, ĐỊNH GIÁ & KIỂM TRA TỒN KHO
- **Scenario ID**: `TS-03`
- **Mục tiêu**: Kiểm tra cơ chế tự động sinh ma trận tổ hợp SKU, định giá bán, giá so sánh và tồn kho ban đầu.
- **Tác nhân**: Seller
- **Tiền điều kiện**: SPU đã tạo ở TS-02.
- **Các bước thực thi**:
  1. Thêm Nhóm 1: "Màu sắc" gồm [Titan Tự Nhiên, Titan Xanh].
  2. Thêm Nhóm 2: "Dung lượng" gồm [256GB, 512GB].
  3. Kiểm tra bảng ma trận sinh ra đủ 4 dòng SKU.
  4. Nhập giá và kho cho từng SKU:
     - SKU 1: 256GB - Titan Tự Nhiên: Giá `29.990.000 ₫`, Giá gốc `34.990.000 ₫`, Kho `50`.
     - SKU 2: 512GB - Titan Tự Nhiên: Giá `35.990.000 ₫`, Giá gốc `39.990.000 ₫`, Kho `30`.
     - SKU 3: 256GB - Titan Xanh: Giá `29.990.000 ₫`, Giá gốc `34.990.000 ₫`, Kho `0` (Hết hàng).
     - SKU 4: 512GB - Titan Xanh: Giá `35.990.000 ₫`, Giá gốc `39.990.000 ₫`, Kho `20`.
  5. Bấm "Lưu biến thể".
- **Kỳ vọng**:
  - Dữ liệu `skus` được lưu thành công vào SPU, `version` tăng lên `2`.
  - Tự động sinh `sku_code` duy nhất cho từng biến thể.
- **Biên & Ngoại lệ**: Cố tình nhập Giá bán `36.000.000 ₫` lớn hơn Giá gốc `35.000.000 ₫` ➔ Hệ thống chặn và báo lỗi `Giá bán không được lớn hơn giá gốc`.
- **Yêu cầu liên quan**: `PC-REQ-009`, `PC-REQ-010`, `PC-REQ-011`, `PC-REQ-012`.

---

### TS-04: TẢI ẢNH BẢO MẬT QUA S3 PRESIGNED URL VÀ XÁC NHẬN METADATA
- **Scenario ID**: `TS-04`
- **Mục tiêu**: Xác minh luồng upload trực tiếp S3 không qua server trung gian và bảo mật bằng SHA-256.
- **Tác nhân**: Seller, System
- **Tiền điều kiện**: Seller chọn tệp ảnh JPEG hợp lệ dung lượng 2.4MB.
- **Các bước thực thi**:
  1. Client tính hash SHA-256 của ảnh.
  2. Gửi request `POST /api/v1/media/presign-upload` với payload metadata.
  3. Nhận về Presigned PUT URL và `media_id`.
  4. Client thực hiện HTTP PUT binary lên S3 với header `x-amz-checksum-sha256`.
  5. Client gọi `POST /api/v1/media/confirm` để hoàn tất.
  6. Gán ảnh vừa tải lên làm ảnh bìa (Cover Image) cho sản phẩm.
- **Kỳ vọng**:
  - Trạng thái bản ghi media chuyển thành `CONFIRMED`.
  - URL ảnh hiển thị sắc nét trong khung xem trước của Seller.
- **Biên & Ngoại lệ**: Thử upload tệp thực thi `.exe` hoặc ảnh dung lượng 10MB ➔ Server chặn ngay ở bước 2 với `400 Bad Request`.
- **Yêu cầu liên quan**: `PC-REQ-013`, `PC-REQ-014`, `PC-REQ-015`.

---

### TS-05: GỬI YÊU CẦU KIỂM DUYỆT SẢN PHẨM & KHÓA LẠC QUAN OCC
- **Scenario ID**: `TS-05`
- **Mục tiêu**: Xác minh quy trình Submit for Approval và khả năng phát hiện xung đột phiên làm việc OCC.
- **Tác nhân**: Seller
- **Tiền điều kiện**: SPU đã có đủ Tên, Danh mục, 1 Ảnh bìa, 4 SKU hợp lệ; `version = 2`.
- **Các bước thực thi**:
  1. Seller mở danh sách sản phẩm, bấm "Gửi duyệt" tại dòng sản phẩm iPhone 15.
  2. Client gửi `POST /api/v1/seller/products/:id/submit` kèm `{ version: 2 }`.
- **Kỳ vọng**:
  - Trạng thái sản phẩm đổi từ `DRAFT` sang `PENDING_APPROVAL`, `version` tăng thành `3`.
  - Sản phẩm bị khóa không cho sửa đổi form nội dung trên Seller UI.
- **Biên & Ngoại lệ (OCC Conflict)**: Giả lập 2 tab cùng mở: Tab A gửi duyệt thành công (`version` thành `3`), Tab B gửi request cũ với `{ version: 2 }` ➔ Backend trả về `409 Conflict`, giao diện hiển thị cảnh báo dữ liệu đã thay đổi và nút tải lại.
- **Yêu cầu liên quan**: `PC-REQ-006`, `PC-REQ-016`.

---

### TS-06: QUY TRÌNH THẨM ĐỊNH NỘI DUNG & PHÊ DUYỆT / TỪ CHỐI CỦA ADMIN
- **Scenario ID**: `TS-06`
- **Mục tiêu**: Kiểm tra thẩm quyền kiểm duyệt của Admin, ghi nhận lý do từ chối và đẩy sự kiện Outbox.
- **Tác nhân**: Admin (Catalog Moderator), Seller
- **Tiền điều kiện**: Sản phẩm đang ở trạng thái `PENDING_APPROVAL` (`version = 3`).
- **Các bước thực thi**:
  - **Nhánh Từ chối (Rejection)**:
    1. Admin mở modal "Từ chối", nhập lý do: "Ảnh sản phẩm mờ, thiếu logo nhà phân phối chính hãng".
    2. Gửi request `POST /api/v1/admin/products/:id/reject` kèm `{ version: 3, reason: "..." }`.
    3. Trạng thái chuyển thành `REJECTED`, `version` thành `4`.
    4. Seller thấy thông báo cảnh báo đỏ kèm nội dung lý do từ chối.
  - **Nhánh Phê duyệt (Approval)**:
    1. Seller sửa lại ảnh sắc nét, gửi duyệt lại (`version = 5`).
    2. Admin kiểm tra và bấm "Phê duyệt" kèm `{ version: 5 }`.
    3. Trạng thái chuyển thành `ACTIVE`, `version` thành `6`.
- **Kỳ vọng**:
  - Ghi nhận bản ghi Outbox `ProductApprovedEvent` vào collection `outbox_events`.
  - Sản phẩm chính thức phát hành trên sàn.
- **Yêu cầu liên quan**: `PC-REQ-017`, `PC-REQ-018`, `PC-REQ-019`, `PC-REQ-028`.

---

### TS-07: TRẢI NGHIỆM TÌM KIẾM, LỌC ĐA CHIỀU & XEM CHI TIẾT BUYER PDP
- **Scenario ID**: `TS-07`
- **Mục tiêu**: Đảm bảo Buyer tìm kiếm, phân trang và tương tác với các biến thể mượt mà trên Storefront.
- **Tác nhân**: Buyer (Khách vãng lai / Khách đã đăng nhập)
- **Tiền điều kiện**: Sản phẩm đã `ACTIVE`.
- **Các bước thực thi**:
  1. Buyer vào trang danh mục "Điện thoại thông minh".
  2. Lọc theo Thương hiệu "Apple", Khoảng giá `25.000.000 - 40.000.000 ₫`.
  3. Danh sách hiển thị Card sản phẩm "iPhone 15 Pro Max" với giá `29.990.000 ₫`, giá gốc gạch ngang `34.990.000 ₫` và badge giảm giá `-14%`.
  4. Bấm vào Card để mở trang chi tiết PDP `/products/iphone-15-pro-max`.
  5. Bấm chọn màu "Titan Tự Nhiên" và dung lượng "512GB".
- **Kỳ vọng**:
  - Giá trên PDP tự động đổi sang `35.990.000 ₫`, tồn kho hiển thị "Còn 30 sản phẩm".
  - Chuyển sang chọn "Titan Xanh" và "256GB" (kho = 0) ➔ Nút "Thêm vào giỏ" chuyển sang trạng thái mờ (`disabled`) với nhãn "Hết hàng".
- **Yêu cầu liên quan**: `PC-REQ-020`, `PC-REQ-021`, `PC-REQ-022`, `PC-REQ-023`.

---

### TS-08: THÊM VÀO GIỎ HÀNG VÀ KIỂM TRA ĐIỀU KIỆN TỒN KHO SKU
- **Scenario ID**: `TS-08`
- **Mục tiêu**: Kiểm tra logic thêm giỏ hàng, ràng buộc số lượng mua tối đa với tồn kho khả dụng.
- **Tác nhân**: Buyer
- **Tiền điều kiện**: SKU đang chọn có tồn kho `30`.
- **Các bước thực thi**:
  1. Buyer nhập số lượng mua: `2`.
  2. Bấm "Thêm vào giỏ hàng".
  3. Hệ thống hiển thị Toast "Đã thêm sản phẩm vào giỏ hàng thành công".
  4. Badge số lượng trên icon Giỏ hàng ở Header tăng thêm `2`.
- **Biên & Ngoại lệ**: Buyer cố tình nhập số lượng mua `35` (lớn hơn tồn kho `30`) ➔ Form hiển thị cảnh báo đỏ "Số lượng vượt quá tồn kho khả dụng", không cho phép submit.
- **Yêu cầu liên quan**: `PC-REQ-011`, `PC-REQ-024`.

---

### TS-09: NHẬP SẢN PHẨM HÀNG LOẠT TỪ EXCEL VÀ TẢI BÁO CÁO LỖI
- **Scenario ID**: `TS-09`
- **Mục tiêu**: Kiểm tra tính năng Bulk Import bằng file Excel, xử lý dòng lỗi và tải file kết quả dạng Blob.
- **Tác nhân**: Seller
- **Tiền điều kiện**: File Excel chứa 5 dòng sản phẩm (3 dòng hợp lệ, 2 dòng vi phạm thiếu SKU hoặc giá bán lớn hơn giá gốc).
- **Các bước thực thi**:
  1. Seller mở modal "Nhập sản phẩm hàng loạt" tại `/seller/products`.
  2. Tải file mẫu và điền dữ liệu thử nghiệm.
  3. Upload file lên hệ thống (`POST /api/v1/seller/products/bulk-import`).
  4. Hệ thống phản hồi mã `jobId` đang xử lý.
  5. Modal hiển thị tiến trình hoàn tất: 3 thành công, 2 lỗi.
  6. Seller bấm nút "Tải báo cáo lỗi" ➔ Trình duyệt tự động tải xuống tệp `import_errors_{jobId}.xlsx`.
- **Kỳ vọng**: File báo cáo lỗi chỉ rõ số dòng và chi tiết vi phạm của 2 dòng lỗi để Seller chỉnh sửa.
- **Yêu cầu liên quan**: `PC-REQ-025`.

---

### TS-10: ĐỒNG BỘ SỰ KIỆN OUTBOX KAFKA VÀ NHẬT KÝ KIỂM TOÁN HỆ THỐNG
- **Scenario ID**: `TS-10`
- **Mục tiêu**: Xác minh quy trình ghi log kiểm toán Catalog và cơ chế chuyển tiếp sự kiện Outbox lên Kafka.
- **Tác nhân**: Admin, System (Cron Poller)
- **Tiền điều kiện**: Đã phát sinh hành động duyệt sản phẩm ở TS-06.
- **Các bước thực thi**:
  1. Admin mở trang `/admin/audit-logs`.
  2. Chuyển Scope Switcher sang tab "Danh mục & Sản phẩm" (Catalog Audits).
  3. Kiểm tra danh sách nhật ký: Thấy dòng ghi nhận Admin duyệt sản phẩm iPhone 15 kèm Timestamp, User ID và Diff thay đổi (`status: PENDING_APPROVAL ➔ ACTIVE`).
  4. Kiểm tra Outbox Cron: Bản ghi sự kiện trong MongoDB collection `outbox_events` đã chuyển trạng thái từ `PENDING` sang `SENT`.
- **Kỳ vọng**: Mọi thay đổi dữ liệu nhạy cảm đều minh bạch và không thể chối bỏ (Non-repudiation).
- **Yêu cầu liên quan**: `PC-REQ-027`, `PC-REQ-028`.

