# SỔ ĐĂNG KÝ LỖI VÀ RỦI RO KỸ THUẬT (BUG & RISK REGISTER)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior QA/QC Lead & Technical Auditor
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Hoàn tất cập nhật (Completed)
- **Tổng số mục ghi nhận**: 12 Mục (8 Bugs đã xử lý dứt điểm + 4 Rủi ro vận hành hạ tầng)

---

## I. MA TRẬN PHÂN LOẠI MỨC ĐỘ NGHIÊM TRỌNG (SEVERITY MATRIX)

| Mức độ | Định nghĩa tác động kỹ thuật | Số lượng | Tỷ lệ | Trạng thái xử lý |
| :--- | :--- | :---: | :---: | :--- |
| **CRITICAL** | Gây sập hệ thống, xung đột ghi đè dữ liệu (OCC), rò rỉ IDOR, sai lệch tài chính | 3 | 25.0% | **ĐÃ GIẢI QUYẾT 100% (RESOLVED)** |
| **HIGH** | Không gọi được API, lỗi 400 do thừa field, thiếu xử lý 4 trạng thái | 3 | 25.0% | **ĐÃ GIẢI QUYẾT 100% (RESOLVED)** |
| **MEDIUM** | Cảnh báo React hook, icon không đồng nhất, thiếu empty state | 2 | 16.7% | **ĐÃ GIẢI QUYẾT 100% (RESOLVED)** |
| **RISK (INFRA)** | Phụ thuộc AWS S3 thực tế, kết nối Kafka Staging, kiểm thử tải | 4 | 33.3% | **ĐÃ CÓ KẾ HOẠCH GIẢM THIỂU (MITIGATED)** |

---

## II. CHI TIẾT CÁC LỖI ĐÃ PHÁT HIỆN VÀ KHẮC PHỤC TRIỆT ĐỂ (RESOLVED BUGS)

### 1. BUG-001: Mất trường số phiên bản OCC dẫn đến lỗi 400 Bad Request khi gửi duyệt
- **Mức độ nghiêm trọng**: **CRITICAL**
- **Vị trí phát hiện**: `shared/utils/adapters/product.adapter.js` & `apps/seller/src/features/products/services/seller-product.api.js`
- **Hiện tượng**: Khi Seller nhấn "Gửi duyệt" sản phẩm, API Backend trả về lỗi `400 Bad Request: version must be an integer number`.
- **Nguyên nhân gốc rễ (RCA)**: Hàm `normalizeProduct` ở Frontend trước đây không sao chép trường `version` từ payload Backend, khiến `product.version` bị `undefined`. Khi API Service gửi `{ version }`, body trở thành `{ version: undefined }`, vi phạm kiểm thực DTO `@IsInt() version`.
- **Giải pháp đã thực thi**:
  - Bổ sung `version: typeof raw.version === 'number' ? raw.version : 1` vào `normalizeProduct`.
  - Cập nhật `submitProduct(productId, version = 1)` truyền đúng số nguyên phiên bản.
- **Trạng thái**: **RESOLVED** (Kiểm tra thực tế: Mã 200/201 thành công).

---

### 2. BUG-002: Thừa trường dữ liệu lạ gây kích hoạt lỗi `forbidNonWhitelisted`
- **Mức độ nghiêm trọng**: **CRITICAL**
- **Vị trí phát hiện**: `apps/seller/src/features/products/pages/ProductCreatePage.jsx`
- **Hiện tượng**: Khi gửi form tạo/sửa sản phẩm, Backend ném lỗi `400 Bad Request: property fake_rating should not exist`.
- **Nguyên nhân gốc rễ (RCA)**: Giao diện FE sử dụng dữ liệu mẫu (mock template) chứa các field không có trong Schema Backend (`fake_rating`, `review_count`, `sold_count`). Trong khi đó, Backend bật chế độ bảo mật `forbidNonWhitelisted: true`, lập tức từ chối mọi payload chứa field lạ.
- **Giải pháp đã thực thi**: Làm sạch toàn bộ form payload; chỉ gửi các trường đúng theo `CreateProductDto`.
- **Trạng thái**: **RESOLVED**.

---

### 3. BUG-003: Lỗi đồng thời ghi đè dữ liệu khi Admin duyệt và Seller sửa cùng lúc
- **Mức độ nghiêm trọng**: **CRITICAL**
- **Vị trí phát hiện**: `apps/admin/src/services/admin-catalog.api.js`
- **Hiện tượng**: Admin phê duyệt sản phẩm nhưng không gửi kèm số phiên bản, dẫn đến nếu Seller vừa sửa giá SKU trước đó 1 giây, hành động duyệt sẽ ghi đè đè lên trạng thái cũ mà không biết có thay đổi.
- **Nguyên nhân gốc rễ (RCA)**: API Service Admin không yêu cầu tham số `version`.
- **Giải pháp đã thực thi**: Cập nhật `approveProduct(id, version)` và `rejectProduct(id, version, reason)` bắt buộc truyền `version`. Giao diện hiển thị cảnh báo nếu nhận mã `409 Conflict`.
- **Trạng thái**: **RESOLVED**.

---

### 4. BUG-004: Tải file báo cáo lỗi Import Excel bị lỗi hiển thị ký tự rác
- **Mức độ nghiêm trọng**: **HIGH**
- **Vị trí phát hiện**: `apps/seller/src/features/products/components/ProductImportModal.jsx`
- **Hiện tượng**: Bấm "Tải báo cáo lỗi" thì trình duyệt mở một trang trắng hiển thị chuỗi ký tự nhị phân vô nghĩa thay vì tải file `.xlsx`.
- **Nguyên nhân gốc rễ (RCA)**: Axios Client gọi API dạng JSON thông thường thay vì cấu hình `responseType: 'blob'`.
- **Giải pháp đã thực thi**: Triển khai hàm `handleDownloadResultReport` thiết lập `responseType: 'blob'`, tạo URL ảo `window.URL.createObjectURL(new Blob([data]))` và kích hoạt thẻ `<a>` tải ngầm.
- **Trạng thái**: **RESOLVED**.

---

### 5. BUG-005: Bộ lọc phân loại trạng thái sản phẩm bị sai lệch trên Buyer App
- **Mức độ nghiêm trọng**: **HIGH**
- **Vị trí phát hiện**: `apps/buyer/src/features/catalog/components/ProductFilters.jsx`
- **Hiện tượng**: Sidebar của Buyer hiển thị dropdown chọn trạng thái: "Tất cả, Đang duyệt, Bản nháp, Đang bán".
- **Nguyên nhân gốc rễ (RCA)**: Copy nhầm component bộ lọc từ Seller App sang Buyer App. Buyer là người mua, tuyệt đối không được phép biết hoặc lọc trạng thái nội bộ của sản phẩm.
- **Giải pháp đã thực thi**: Xóa bỏ hoàn toàn bộ lọc trạng thái khỏi Buyer App; cố định truy vấn chỉ lấy `status = ACTIVE`.
- **Trạng thái**: **RESOLVED**.

---

### 6. BUG-006: Thiếu Scope xem Audit Logs riêng cho danh mục sản phẩm trên Admin Portal
- **Mức độ nghiêm trọng**: **HIGH**
- **Vị trí phát hiện**: `apps/admin/src/features/audit/pages/AdminAuditLogsPage.jsx`
- **Hiện tượng**: Trang Audit Logs chỉ hiển thị log đăng nhập và KYC tài khoản; không thể xem lịch sử ai đã thêm/sửa/duyệt sản phẩm nào.
- **Nguyên nhân gốc rễ (RCA)**: Thiếu nút chuyển Scope (Scope Switcher) để gọi API chuyên biệt `GET /api/v1/admin/catalog/audits`.
- **Giải pháp đã thực thi**: Bổ sung Scope Tabs ("Danh mục & Sản phẩm" vs "Hệ thống & KYC") cho phép Admin chuyển đổi linh hoạt.
- **Trạng thái**: **RESOLVED**.

---

### 7. BUG-007: Cảnh báo ESLint `react-hooks/set-state-in-effect` vi phạm quy tắc render
- **Mức độ nghiêm trọng**: **MEDIUM**
- **Vị trí phát hiện**: `apps/admin/src/features/audit/pages/AdminAuditLogsPage.jsx:143:5`
- **Hiện tượng**: Lệnh `npm run lint` cảnh báo lỗi gọi `setLoading(true)` đồng bộ ngay trong body của `useEffect`.
- **Nguyên nhân gốc rễ (RCA)**: Gọi cập nhật state trước khi bắt đầu tác vụ bất đồng bộ trong effect khiến React phải kích hoạt render kép không cần thiết.
- **Giải pháp đã thực thi**: Khởi tạo giá trị mặc định của state `loading = true` và loại bỏ lệnh gọi đồng bộ thừa. Lệnh `npm run lint` sau đó thoát với mã 0.
- **Trạng thái**: **RESOLVED**.

---

### 8. BUG-008: Thiếu Primitive EmptyState tái sử dụng và dùng icon rác
- **Mức độ nghiêm trọng**: **MEDIUM**
- **Vị trí phát hiện**: Toàn bộ gói `@taca/ui-components`
- **Hiện tượng**: Mỗi trang tự dựng một kiểu thông báo rỗng khác nhau, một số nơi dùng icon text hoặc inline SVG không chuẩn.
- **Giải pháp đã thực thi**: Tạo component chuẩn hóa [EmptyState.jsx](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/EmptyState.jsx) và chuẩn hóa 100% icon bằng `lucide-react`.
- **Trạng thái**: **RESOLVED**.

---

## III. SỔ ĐĂNG KÝ RỦI RO HẠ TẦNG VÀ GIẢI PHÁP GIẢM THIỂU (RESIDUAL RISKS)

| Mã rủi ro | Mô tả rủi ro | Mức độ rủi ro | Tác động tiềm tàng | Giải pháp giảm thiểu (Mitigation Strategy) | Trạng thái |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **RISK-01** | **Thiếu môi trường AWS S3 Live Staging** | **HIGH** | Không thể test live việc đẩy binary ảnh thật lên S3 bucket trong môi trường dev cục bộ. | Thiết lập container LocalStack (Mock S3) trong `docker-compose.yml` cho dev, hoặc cấp S3 Bucket Staging riêng. | **MITIGATED (Có giải pháp thay thế)** |
| **RISK-02** | **Nghẽn hàng đợi Outbox khi tải cao** | **MEDIUM** | Nếu số lượng sản phẩm duyệt cùng lúc tăng đột biến, Cron 5s quét 50 bản ghi có thể bị trễ. | Chuyển đổi từ Poller Cron sang Debezium Change Data Capture (CDC) đọc trực tiếp MongoDB Oplog khi lên Production. | **PLANNED (Lộ trình tối ưu)** |
| **RISK-03** | **Kích thước file Import Excel quá lớn** | **MEDIUM** | Seller tải file Excel 10.000 dòng có thể gây nghẽn RAM của Worker. | Giới hạn dung lượng file import tối đa 10MB (khoảng 2.000 dòng/file); chia nhỏ job xử lý chunk 200 dòng. | **MITIGATED (Đã cấu hình chặn)** |
| **RISK-04** | **Trễ đồng bộ giữa Catalog và Search Service** | **LOW** | Buyer có thể phải chờ 1-2 giây mới tìm thấy sản phẩm vừa được Admin duyệt. | Trạng thái hiển thị tức thì trên PDP bằng ID; Search Engine chỉ phục vụ trang tìm kiếm danh sách lớn. | **ACCEPTED (Đặc thù Eventual Consistency)** |

