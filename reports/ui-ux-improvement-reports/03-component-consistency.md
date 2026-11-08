# BÁO CÁO RÀ SOÁT VÀ HOÀN THIỆN UI/UX FRONTEND
## PHẦN 03: TÍNH NHẤT QUÁN CỦA HỆ THỐNG COMPONENT (03-COMPONENT-CONSISTENCY)

---

### 1. NGUYÊN TẮC HỆ THỐNG COMPONENT DÙNG CHUNG

Toàn bộ các phân hệ Buyer, Seller, và Admin đều được định hướng tái sử dụng thư viện thành phần nguyên tử dùng chung tại package `@taca/ui-components` ([`shared/ui-components/src`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src)).

Việc tập trung hóa các components này mang lại 3 giá trị kỹ thuật cốt lõi:
1. **Đồng nhất 100% trải nghiệm thị giác**: Mọi nút bấm, ô nhập liệu hay badge trạng thái đều có cùng màu sắc, bo góc và hiệu ứng chuyển động.
2. **Loại bỏ trùng lặp mã nguồn (DRY - Don't Repeat Yourself)**: Không còn tình trạng mỗi page tự viết một kiểu button hoặc input riêng lẻ.
3. **Tuân thủ quy chuẩn Accessibility (A11y)**: Tích hợp sẵn các thuộc tính `aria-*`, bàn phím điều hướng và độ tương phản màu chuẩn WCAG 2.1 AA.

---

### 2. CHI TIẾT CÁC COMPONENT NGUYÊN TỬ VÀ CẢI TIẾN THI CÔNG

#### 2.1. Nút bấm (`Button.jsx`)
- **Đường dẫn**: [`shared/ui-components/src/components/Button.jsx`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/Button.jsx)
- **Các biến thể màu (Variants)**:
  - `primary`: Nền Indigo `#4F46E5`, chữ trắng, hover `#4338CA`.
  - `secondary`: Nền trắng, chữ đen `#0F172A`, viền xám `#E2E8F0`, hover nền `#F8FAFC`.
  - `outline`: Nền trong suốt, viền và chữ Indigo.
  - `destructive` / `danger`: Nền đỏ Rose `#E11D48`, hover đỏ đậm `#B91C1C` (dùng cho hành động xóa, khóa sản phẩm).
  - `ghost`: Nền trong suốt, không viền, hover nền xám nhạt (dùng cho nút icon).
- **Kích thước chuẩn (Sizes)**:
  - `sm`: Chiều cao 32px (`h-8`), padding ngang 12px, font 12px.
  - `md`: Chiều cao tối thiểu 40px (`min-h-[40px]`), padding ngang 16px, font 14px.
  - `lg`: Chiều cao 48px (`h-12`), padding ngang 24px, font 16px.
- **Cải tiến trong đợt rà soát**:
  - Bổ sung thuộc tính `loading`: Khi `loading=true`, tự động vô hiệu hóa nút (`disabled`), gắn cờ `aria-busy="true"` và chèn hiệu ứng quay tròn `LoaderCircle` từ `lucide-react`.

#### 2.2. Ô nhập liệu (`Input.jsx`)
- **Đường dẫn**: [`shared/ui-components/src/components/Input.jsx`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/Input.jsx)
- **Đặc tả hình học**: Chiều cao chuẩn 40px (`h-10`), bo góc 8px (`rounded-lg`), viền 1px `#E2E8F0`.
- **Trạng thái thông minh**:
  - Khi có lỗi (`error`): Viền tự động đổi sang đỏ `#E11D48`, hiển thị dòng thông báo lỗi bên dưới.
  - Khi có nhãn (`label`): Hiển thị font Label 12px đậm; nếu có prop `required`, tự động thêm dấu sao đỏ `*`.
  - Đối với trường mật khẩu (`type="password"`): Tự động hiển thị nút ẩn/hiện mật khẩu.
- **Cải tiến trong đợt rà soát**:
  - Xóa bỏ 100% các đoạn mã inline SVG tự vẽ cũ, thay thế bằng icon vector chuẩn `Eye` và `EyeOff` từ `lucide-react`, kèm nhãn `aria-label` hỗ trợ trình đọc màn hình.

#### 2.3. Huy hiệu trạng thái (`Badge.jsx`)
- **Đường dẫn**: [`shared/ui-components/src/components/Badge.jsx`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/Badge.jsx)
- **Đặc tả hình học**: Chữ in hoa 10px đậm (`text-[10px] font-bold uppercase tracking-wide`), bo góc 6px, padding `px-2 py-0.5`.
- **Biến thể ngữ cảnh**:
  - `success`: Nền xanh lá, viền xanh lá (dành cho `PUBLISHED`, `ACTIVE`).
  - `warning`: Nền vàng cam, viền cam (dành cho `PENDING_APPROVAL`, cảnh báo).
  - `sale` / `destructive`: Nền đỏ, viền đỏ (dành cho `REJECTED`, `BLOCKED`, giảm giá).
  - `official`: Nền Indigo (dành cho gian hàng chính hãng Taca Mall).
  - `default`: Nền xám nhạt (dành cho `DRAFT`, `UNPUBLISHED`).

#### 2.4. Khung hộp thoại (`Modal.jsx`)
- **Đường dẫn**: [`shared/ui-components/src/components/Modal.jsx`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/Modal.jsx)
- **Đặc tả kiến trúc**:
  - Lớp nền mờ (Backdrop): `bg-black/50 backdrop-blur-sm`, z-index cấp cao `z-[100]`.
  - Hộp nội dung: Bo góc 16px (`rounded-2xl`), đổ bóng lớn `shadow-2xl`, viền 2px `#E2E8F0`.
  - Khả năng tiếp cận: Tích hợp `role="dialog"` và `aria-modal="true"`.
  - Tương tác thông minh: Lắng nghe phím `Escape` để đóng modal, khóa cuộn trang (`body overflow: hidden`), và đóng khi click trực tiếp vào vùng backdrop.

#### 2.5. Trạng thái rỗng dùng chung (`EmptyState.jsx`) - Component mới chuẩn hóa
- **Đường dẫn**: [`shared/ui-components/src/components/EmptyState.jsx`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/components/EmptyState.jsx)
- **Lý do xây dựng**: Trước đây các trang tự tạo div rỗng không đồng nhất về kích thước, icon và thông điệp.
- **Cấu trúc thành phần**:
  - Khối icon trung tâm: Hộp bo góc mềm 56x56px (`w-14 h-14 rounded-2xl bg-slate-100 text-slate-400`).
  - Tiêu đề chính: Cỡ chữ 16px đậm `#0F172A`.
  - Đoạn hướng dẫn phụ: Cỡ chữ 13px màu trung tính `#475569`, giới hạn độ rộng `max-w-sm` tránh tràn dòng.
  - Nút kêu gọi hành động (Call-to-Action): Tự động render nút `Button` chính khi được truyền prop `actionText` và `onAction`.

---

### 3. TỔNG KẾT MỨC ĐỘ TÁI SỬ DỤNG
Toàn bộ 5 components nguyên tử trên đã được export chính thức tại [`shared/ui-components/src/index.js`](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/src/index.js), sẵn sàng phục vụ cho tất cả các micro-frontends của hệ thống Taca.

