# BÁO CÁO RÀ SOÁT VÀ HOÀN THIỆN UI/UX FRONTEND
## PHẦN 02: BÁO CÁO CẢI TIẾN BỐ CỤC VÀ KHÔNG GIAN (02-LAYOUT-IMPROVEMENTS)

---

### 1. NGUYÊN TẮC BỐ CỤC THEO THIẾT KẾ PENPOT

Mọi trang trong hệ thống Taca Ecommerce tuân thủ nguyên tắc bố cục trực quan:
1. **Trục dọc nhịp nhàng (Vertical Rhythm)**: Khoảng cách giữa các khối lớn là 24px (`space-y-6` / `gap-6`), giữa tiêu đề và nội dung là 8px đến 16px.
2. **Căn lề chuẩn mực (Alignment)**: Mọi thành phần form và icon đều được căn giữa theo trục dọc (`items-center`), các số liệu tiền tệ căn phải hoặc căn đều theo font số đơn cách (tabular numbers).
3. **Phân cấp thị giác rõ ràng (Visual Hierarchy)**:
   - Cấp 1 (Primary): Nội dung cốt lõi (Chi tiết sản phẩm, bảng dữ liệu kiểm duyệt).
   - Cấp 2 (Secondary): Thanh công cụ lọc, thanh tìm kiếm, tabs trạng thái.
   - Cấp 3 (Tertiary): Phụ đề, ghi chú thời gian, mã định danh SKU/ID.

---

### 2. CHI TIẾT CẢI TIẾN BỐ CỤC TỪNG TRANG CHÍNH

#### 2.1. Trang Chi tiết sản phẩm (`apps/buyer/.../ProductDetailPage.jsx`)
- **Vấn đề ban đầu**:
  - Tên sản phẩm quá dài trên breadcrumb làm vỡ dòng (wrap) trên màn hình tablet/laptop.
  - Khoảng cách giữa khối hình ảnh gallery và khối chọn biến thể bị lệch trục khi người dùng cuộn trang.
- **Giải pháp căn chỉnh theo Penpot**:
  - Áp dụng cấu trúc lưới 12 cột cân đối: Khối Gallery chiếm 5 cột (`lg:col-span-5`), Khối Đặt hàng chiếm 7 cột (`lg:col-span-7`).
  - Breadcrumb: Thêm lớp cắt ngắn văn bản `truncate max-w-[280px]` cho tên sản phẩm, giữ nguyên đường dẫn phân cấp Trang chủ / Ngành hàng.
  - Thiết lập khối Gallery dạng `sticky top-24` giúp ảnh sản phẩm luôn nằm trong tầm mắt khi khách hàng cuộn đọc bảng thông số kỹ thuật.
- **Kết quả**: Bố cục trang mua hàng đạt độ cân đối hoàn hảo, trải nghiệm xem ảnh và chọn biến thể mượt mà.

#### 2.2. Trang Quản trị sản phẩm Người bán (`apps/seller/.../ProductsPage.jsx`)
- **Vấn đề ban đầu**:
  - Hàng nút thao tác trên cùng ("Thêm sản phẩm", "Nhập Excel", "Xuất Excel") bị dồn cục khi thu hẹp cửa sổ trình duyệt.
  - Bảng danh sách sản phẩm tràn viền gây vỡ thanh sidebar.
- **Giải pháp căn chỉnh theo Penpot**:
  - Tách header thành 2 khối flexbox: Tiêu đề trang bên trái và cụm nút thao tác bên phải với `flex-wrap gap-2.5`.
  - Bao bọc toàn bộ thẻ `<table>` trong vùng chứa `overflow-x-auto [scrollbar-width:thin]`.
  - Thiết lập chiều rộng cố định cho các cột quan trọng: Cột SPU (tối thiểu 280px), Cột Biến thể SKU (180px), Cột Thao tác (140px).
- **Kết quả**: Bảng dữ liệu co giãn linh hoạt, không làm xô lệch sidebar cố định 288px của Seller Center.

#### 2.3. Modal Tạo & Sửa sản phẩm 4 bước (`ProductEditorModal.jsx`)
- **Vấn đề ban đầu**:
  - Modal chứa nhiều nội dung (Basic Info, Categories, SKU Matrix, Media) khiến modal bị tràn màn hình theo chiều dọc, nút "Lưu" bị đẩy khỏi tầm nhìn.
- **Giải pháp căn chỉnh theo Penpot**:
  - Khóa chiều cao tối đa của modal: `max-h-[90vh] flex flex-col`.
  - Tách modal thành 3 vùng độc lập:
    1. **Sticky Header**: Tiêu đề và nút đóng X cố định.
    2. **Scrollable Body**: Vùng nội dung các bước cuộn độc lập (`overflow-y-auto px-6 py-4 flex-1`).
    3. **Sticky Footer**: Nút "Quay lại" và nút "Tiếp tục / Lưu sản phẩm" luôn nằm cố định ở đáy modal, có viền phân cách mỏng `border-t border-slate-200`.
- **Kết quả**: Người bán luôn nhìn thấy nút bấm chuyển bước mà không cần phải cuộn chuột xuống đáy trang.

#### 2.4. Trang Kiểm duyệt Quản trị viên (`apps/admin/.../AdminProductsPage.jsx`)
- **Vấn đề ban đầu**:
  - Các tabs trạng thái (`ALL`, `PENDING_APPROVAL`, `ACTIVE`, `BLOCKED`, `REJECTED`) và ô tìm kiếm bị chồng lấn khi xuất hiện thêm nút lọc cảnh báo.
- **Giải pháp căn chỉnh theo Penpot**:
  - Phân tầng thanh công cụ thành 2 hàng logic trên mobile/tablet và 1 hàng rộng trên desktop:
    - Bên trái: Hàng tabs cuộn ngang mượt mà (`overflow-x-auto [scrollbar-width:none]`).
    - Bên phải: Cụm nút toggle "Chỉ xem cảnh báo" và ô tìm kiếm SPU có icon `Search` chìm trong input.
  - Bảng kiểm duyệt: Căn giữa các badge trạng thái, cột hành động căn phải tạo khoảng cách an toàn với dữ liệu văn bản.

#### 2.5. Trang Nhật ký kiểm toán (`apps/admin/.../AdminAuditLogsPage.jsx`)
- **Vấn đề ban đầu**:
  - Chỉ phục vụ một danh sách log duy nhất, chưa phân biệt được log hệ thống và log sản phẩm.
- **Giải pháp căn chỉnh theo Penpot**:
  - Bổ sung thanh chuyển đổi phạm vi (Scope Switcher) với 2 nút Tab rõ ràng có icon `Layers` (Catalog Audits) và `ShieldCheck` (System & KYC Audits).
  - Tích hợp 4 thẻ tóm tắt số liệu (Metric Cards) ở đầu trang với màu sắc ngữ cảnh: Tổng sự kiện (Xanh dương), Sự kiện KYC (Xanh ngọc), Xác thực 2FA (Chàm), Cảnh báo rủi ro (Đỏ).

---

### 3. TỔNG KẾT PHÂN LOẠI CẢI TIẾN BỐ CỤC
- **MATCH DESIGN**: 100% Cấu trúc container (1440px Buyer, 288px Sidebar Seller/Admin).
- **IMPROVED**: Tối ưu sticky header/footer trong Modal, xử lý text overflow trên Breadcrumbs, và thanh cuộn bảng an toàn.
- **NEEDS REVIEW**: Không có thành phần nào cần xem xét lại.

