# BÁO CÁO RÀ SOÁT VÀ HOÀN THIỆN UI/UX FRONTEND
## PHẦN 01: ĐỐI SOÁT CHI TIẾT THIẾT KẾ PENPOT VÀ SOURCE CODE (01-DESIGN-COMPARISON)

---

### 1. ĐỐI SOÁT HỆ THỐNG DESIGN TOKENS (MÀU SẮC & TYPOGRAPHY)

#### 1.1. Bảng đối soát Màu sắc (Color Tokens)
Dựa trên trang "Taca Code Foundations" của Penpot và cấu hình `tailwind-preset.js` của dự án:

| Tên Token Penpot | Mã màu Hex | Phạm vi sử dụng | Tailwind Utility tương ứng | Đánh giá đối soát |
| :--- | :--- | :--- | :--- | :---: |
| **Primary** | `#4F46E5` | Nút bấm chính, active tab, liên kết | `bg-taca-primary` / `bg-indigo-600` | **MATCH DESIGN** |
| **Primary Hover**| `#4338CA` | Trạng thái hover của nút bấm chính | `hover:bg-taca-primary-hover` / `hover:bg-indigo-700` | **MATCH DESIGN** |
| **Sale / Error** | `#E11D48` | Nhãn giảm giá, nút xóa, thông báo lỗi | `bg-taca-sale` / `bg-rose-600` | **MATCH DESIGN** |
| **Warning** | `#D97706` | Cảnh báo, trạng thái chờ duyệt | `bg-taca-warning` / `bg-amber-600` | **MATCH DESIGN** |
| **Success** | `#059669` | Thành công, đang bán, huy hiệu chính hãng | `bg-taca-success` / `bg-emerald-600` | **MATCH DESIGN** |
| **Surface** | `#F8FAFC` | Nền trang phụ, nền thẻ card, table header | `bg-taca-surface` / `bg-slate-50` | **MATCH DESIGN** |
| **Text Main** | `#0F172A` | Tiêu đề, chữ nội dung chính | `text-taca-text-main` / `text-slate-900` | **MATCH DESIGN** |
| **Text Muted** | `#475569` | Phụ đề, mô tả phụ, nhãn thứ cấp | `text-taca-text-muted` / `text-slate-600` | **MATCH DESIGN** |
| **Border** | `#E2E8F0` | Đường phân cách, viền input, viền bảng | `border-taca-border` / `border-slate-200` | **MATCH DESIGN** |
| **Admin Dark** | `#0F172A` | Nền Sidebar quản trị Admin & Host header | `bg-slate-900` / `bg-slate-950` | **MATCH DESIGN** |

---

#### 1.2. Bảng đối soát Phông chữ và Thang tỷ lệ (Typography Hierarchy)
Dự án sử dụng thống nhất phông chữ **Plus Jakarta Sans** (`font-sans`):

| Token Penpot | Cỡ chữ | Độ đậm | Chiều cao dòng (Line-height) | Ứng dụng thực tế trong React | Đánh giá đối soát |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Display 32** | 32px | ExtraBold (800) | 1.35 (~43px) | Hero Banners, Tiêu đề giỏ hàng, Trang chủ | **MATCH DESIGN** |
| **Heading 24** | 24px | Bold (700) | 1.35 (~32px) | Tiêu đề danh mục, Tên sản phẩm trên PDP | **MATCH DESIGN** |
| **Heading 18** | 18px | Bold (700) | 1.35 (~24px) | Tiêu đề Modal, Tên Card sản phẩm, Tiêu đề bảng | **MATCH DESIGN** |
| **Body 14** | 14px | Regular (400) | 1.35 (~19px) | Đoạn văn bản mô tả, Nội dung review, Chat | **MATCH DESIGN** |
| **Label 12** | 12px | Bold (700) | 1.35 (~16px) | Nhãn nút bấm, Header bảng dữ liệu, Tabs | **MATCH DESIGN** |
| **Caption 10** | 10px | Medium (500) | 1.35 (~14px) | Badges trạng thái, Chú thích phụ, Metadata | **MATCH DESIGN** |

---

### 2. ĐỐI SOÁT BỐ CỤC KHÔNG GIAN (SPACING & LAYOUT GRID)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYOUT COMPOSITION COMPARISON                        │
├─────────────────┬──────────────────────┬───────────────────────────────┤
│ Phân hệ         │ Tiêu chuẩn Penpot    │ Triển khai thực tế trên FE    │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ Buyer Storefront│ Container max 1440px │ `max-w-[1440px] mx-auto`      │
│                 │ Padding 2 bên: 80px  │ `px-4 lg:px-[80px]` (Adaptive)│
│                 │ Grid 12 cột cân đối  │ `grid-cols-1 lg:grid-cols-12` │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ Seller Center   │ Sidebar cố định: 288px│ `w-72 (288px)` cố định       │
│                 │ Nội dung fluid scroll │ `flex-1 overflow-y-auto`      │
│                 │ Thẻ Card bo góc 16px │ `rounded-2xl border`          │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ Admin Portal    │ Sidebar tối màu: 288px│ `w-72 bg-slate-900 text-white`│
│                 │ Metric Cards 4 cột   │ `grid-cols-1 sm:grid-cols-4`  │
│                 │ Bảng mật độ cao      │ `text-xs py-3 px-4`           │
└─────────────────┴──────────────────────┴───────────────────────────────┘
```

---

### 3. MA TRẬN ĐỐI SOÁT THÀNH PHẦN GIAO DIỆN (COMPONENT-BY-COMPONENT)

| Thành phần | Đặc tả Penpot | Hiện trạng Source Code | Hành động thực hiện | Phân loại |
| :--- | :--- | :--- | :--- | :---: |
| **Nút bấm (Button)** | Nền Indigo/Trắng/Đỏ, bo góc 8px, font Label 12 | Có variants, nhưng thiếu trạng thái loading spinner | Bổ sung `loading` prop với `LoaderCircle` vector từ `lucide-react` | **IMPROVED** |
| **Ô nhập liệu (Input)** | Viền xám 1px, focus ring xanh, ẩn/hiện mật khẩu | Đã có label và error, nhưng dùng inline SVG cũ | Thay bằng `Eye` và `EyeOff` chính hãng `lucide-react` | **IMPROVED** |
| **Hộp thoại (Modal)** | Backdrop mờ, tiêu đề Heading 18, nút X góc phải | Đã có `shared/ui-components/Modal.jsx` hoàn chỉnh | Giữ nguyên, bảo toàn accessibility `aria-modal` | **MATCH DESIGN** |
| **Huy hiệu (Badge)** | Nhãn nhỏ 10px, in hoa, màu theo ngữ cảnh | Đã có `Badge.jsx` với các biến thể sale, success, warning | Đảm bảo đồng bộ nhãn `ProductStatus` | **MATCH DESIGN** |
| **Trạng thái rỗng (Empty)** | Biểu tượng trực quan, tiêu đề, mô tả và nút CTA | Các trang tự viết div riêng lẻ, không đồng nhất | Xây dựng component dùng chung `EmptyState.jsx` | **IMPROVED** |
| **Card Sản phẩm** | Ảnh tỷ lệ 1:1, nhãn sale, tiêu đề 2 dòng, giá VND | `ProductCard.jsx` xử lý linh hoạt `coverImage` và `media` | Đồng bộ format tiền tệ `vi-VN` chuẩn | **MATCH DESIGN** |
| **Bảng dữ liệu (Table)** | Header chữ in hoa nền xám nhạt, viền phân cách mỏng | Data grid trên Seller & Admin tuân thủ chuẩn Tailwind | Thêm thanh cuộn ngang an toàn `overflow-x-auto` | **MATCH DESIGN** |
| **Breadcrumbs** | Phân cấp trang chủ / ngành hàng / tên sản phẩm | Có trong `ProductDetailPage.jsx` | Rút gọn tên sản phẩm dài tránh tràn giao diện | **IMPROVED** |
| **Bộ lọc (Filter Bar)** | Tabs ngang kết hợp ô tìm kiếm và dropdown | Có trên cả Seller và Admin | Bổ sung nút toggle "Chỉ xem cảnh báo" | **IMPROVED** |

