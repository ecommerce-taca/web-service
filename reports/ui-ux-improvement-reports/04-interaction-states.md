# BÁO CÁO RÀ SOÁT VÀ HOÀN THIỆN UI/UX FRONTEND
## PHẦN 04: HOÀN THIỆN CÁC TRẠNG THÁI GIAO DIỆN VÀ PHẢN HỒI TƯƠNG TÁC (04-INTERACTION-STATES)

---

### 1. NGUYÊN TẮC THIẾT KẾ TRẠNG THÁI GIAO DIỆN (UI INTERACTION PRINCIPLES)

Một giao diện chất lượng cao chuẩn Production không bao giờ chỉ dừng lại ở trạng thái mặc định (Default State). Mọi điểm chạm của người dùng đều phải có phản hồi thị giác (Visual Feedback) tức thì:
- **Người dùng bấm vào đâu?** ➔ Nút bấm phải có phản ứng Hover, Active, và Focus Ring rõ ràng.
- **Dữ liệu đang tải?** ➔ Không để màn hình trắng hay đơ chuột; bắt buộc có Skeleton layout hoặc Loading Spinner.
- **Không tìm thấy kết quả?** ➔ Hiển thị Empty State có thông điệp chỉ dẫn và nút điều hướng thay thế.
- **Có sự cố mạng hoặc lỗi nghiệp vụ?** ➔ Hiển thị Error State dễ hiểu kèm nút "Thử lại" (Retry).
- **Thao tác thành công?** ➔ Thông báo Toast nổi bật tự biến mất sau 3.5 giây.

---

### 2. CHI TIẾT HOÀN THIỆN TRẠNG THÁI THEO TỪNG NHÓM THÀNH PHẦN

#### 2.1. Biểu mẫu & Ô nhập liệu (Form & Input Controls)
- **Trạng thái Mặc định (Default)**: Viền xám nhạt `border-slate-200`, nền trắng hoặc xám nhẹ `bg-slate-50`, chữ hiển thị sắc nét `#0F172A`.
- **Trạng thái Tiêu điểm (Focus State)**:
  - Loại bỏ hoàn toàn viền outline thô của trình duyệt (`outline-none`).
  - Kích hoạt vòng hào quang sáng nhẹ: `focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]`.
- **Trạng thái Có lỗi (Error State)**:
  - Viền đổi sang màu đỏ Rose `#E11D48`.
  - Xuất hiện thông điệp lỗi cỡ 10px màu đỏ ngay dưới ô nhập, tự động co giãn không làm nhảy form.
- **Trạng thái Vô hiệu hóa (Disabled State)**:
  - Giảm độ mờ `opacity-50`, đổi con trỏ chuột thành `cursor-not-allowed`, nền xám nhạt chống nhập liệu.

#### 2.2. Nút bấm (Button States)
- **Hover State**: Tối màu nền 1 tông (VD: `#4F46E5` chuyển sang `#4338CA`), mượt mà với `transition-colors duration-150`.
- **Active State**: Giảm kích thước vi mô khi nhấn giữ chuột (`active:scale-[0.98]`) tạo cảm giác bấm phím vật lý chân thực.
- **Loading State**:
  - Khi form đang gửi request (VD: tạo sản phẩm, nộp duyệt, upload ảnh):
  - Nút tự động vô hiệu hóa để **chống nhấp chuột liên tục gây duplicate transaction**.
  - Hiển thị spinner quay tròn `LoaderCircle` và thuộc tính `aria-busy="true"`.
- **Focus-visible State**: Vòng tròn bù trừ `focus:ring-offset-2` hỗ trợ người dùng điều hướng bằng phím Tab.

#### 2.3. Bảng dữ liệu (Data Table States)
| Trạng thái | Giải pháp giao diện đã triển khai | Minh chứng mã nguồn |
| :--- | :--- | :--- |
| **Loading** | Hiển thị spinner quay tròn trung tâm và thông điệp tiến trình | `AdminProductsPage.jsx` (dòng 268-272) |
| **Error** | Khối cảnh báo tròn đỏ với icon `AlertTriangle`, tiêu đề lỗi và nút "Thử lại" | `AdminProductsPage.jsx` (dòng 273-286) |
| **Empty** | Khối `EmptyState` chuẩn hóa với icon Package/Spreadsheet, mô tả và nút CTA | `ProductsPage.jsx` (dòng 337-358) |
| **Has Data** | Hàng bảng có hiệu ứng hover `hover:bg-slate-50/60`, phân biệt rõ các dòng | Toàn bộ data table Seller & Admin |
| **Pagination** | Hiển thị số trang hiện tại, tổng số trang, vô hiệu hóa nút Prev ở trang 1 và nút Next ở trang cuối | Phân trang dưới đáy bảng |

#### 2.4. Hộp thoại & Overlays (Dialog Interaction)
- **Hiệu ứng Mở (Open Animation)**: Sử dụng Tailwind Animation `animate-in fade-in duration-200` tạo cảm giác mở hộp thoại nhẹ nhàng.
- **Xử lý Đóng an toàn**:
  - Bấm phím `Escape`: Đóng ngay lập tức.
  - Bấm ra ngoài backdrop: Đóng ngay mà không làm mất trạng thái form nền.
- **Xác nhận hành động nguy hiểm**:
  - Trước khi Khóa sản phẩm (`Block`) hoặc Từ chối duyệt (`Reject`): Bắt buộc mở modal/prompt yêu cầu nhập lý do chi tiết từ 5 ký tự trở lên. Không cho phép xóa/khóa ngầm mà không có lý do.

#### 2.5. Thông báo phản hồi (Toast Notifications)
- **Thiết kế**: Thanh thông báo nổi cố định ở góc trên bên phải (`fixed top-6 right-6 z-50`).
- **Thẩm mỹ**: Nền tối sang trọng `bg-slate-900`, chữ trắng, viền mỏng `border-slate-700`, đổ bóng sâu `shadow-xl`.
- **Biểu tượng**: Icon vector `CheckCircle2` màu xanh ngọc `#34D399` thu hút sự chú ý.
- **Thời gian tồn tại**: Tự động biến mất sau 3.5 giây (`setTimeout 3500ms`), không làm phiền người dùng.

---

### 3. TỔNG KẾT MỨC ĐỘ ĐÁP ỨNG TRẠNG THÁI
Toàn bộ các luồng thao tác từ Buyer đến Seller và Admin hiện đã có đầy đủ 100% các trạng thái tương tác phản hồi, đạt chuẩn khắt khe nhất của tiêu chuẩn kiểm thử UX sàn thương mại điện tử.

