# Kiểm Toán Thiết Kế UI/UX & Design Tokens (UI/UX Design Audit)

- **Ngày kiểm toán**: 25/10/2026
- **Hệ quy chiếu thiết kế**: Penpot Workspace, Design Tokens (`docs/design/TOKENS.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/design/PENPOT_MAPPING.md`), Icon System Audit (`docs/ui/icon-library-audit.md`).
- **Phạm vi đối chiếu**: 22 Màn hình trải dài trên 3 ứng dụng chính (Buyer, Seller, Admin) và Shell Container.
- **Phương pháp xác minh**: `STATIC_REVIEW` kết hợp phân tích CSS Tokens, Component Hierarchy, và đối chiếu quy chuẩn thiết kế Penpot.

---

## 1. Danh Mục Màn Hình & Mức Độ Khớp Thiết Kế (Screen Inventory)

| STT | Ứng dụng & Tuyến đường (Route) | Tên chức năng màn hình | Component / Page nguồn | Frame Penpot tương ứng | Kích thước Viewport chuẩn | Mức độ khớp | Phương pháp xác minh |
|:---:|---|---|---|---|:---:|:---:|:---:|
| 1 | Buyer: `/` | Trang chủ sàn Taca | `HomePage.jsx` | `Buyer / Desktop / Home` | 1440 × 900 (Desktop) | MATCH_VERIFIED | STATIC_REVIEW |
| 2 | Buyer: `/products/:id` | Chi tiết sản phẩm & SKU | `ProductDetailPage.jsx` | `Buyer / Desktop / PDP` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 3 | Buyer: `/categories/:id` | Danh mục ngành hàng | `CategoryLandingPage.jsx` | `Buyer / Desktop / Category` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 4 | Buyer: `/search` | Tìm kiếm & Bộ lọc linh hoạt | `SearchPage.jsx` | `Buyer / Desktop / Search` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 5 | Buyer: `/cart` | Giỏ hàng người mua | `CartPage.jsx` | `Buyer / Desktop / Cart` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 6 | Buyer: `/checkout` | Đặt hàng & Thanh toán VNPAY | `CheckoutPage.jsx` | `Buyer / Desktop / Checkout` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 7 | Buyer: `/checkout/success` | Xác nhận đơn hàng thành công | `CheckoutSuccessPage.jsx` | `Buyer / Desktop / Order Success` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 8 | Buyer: `/account/orders` | Danh sách đơn mua & Tab lọc | `OrdersPage.jsx` | `Buyer / Account / Orders` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 9 | Buyer: `/account/orders/:id` | Chi tiết đơn & Hành trình GHN | `OrderDetailPage.jsx` | `Buyer / Account / Order Detail` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 10 | Buyer: `/account/profile` | Thông tin cá nhân & Địa chỉ | `ProfilePage.jsx` | `Buyer / Account / Profile` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 11 | Buyer: `/account/vouchers` | Kho voucher người mua | `VouchersPage.jsx` | `Buyer / Account / Vouchers` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 12 | Seller: `/seller` | Dashboard tổng quan người bán | `DashboardPage.jsx` | `Seller / Dashboard / Overview` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 13 | Seller: `/seller/onboarding` | Đăng ký & Onboarding 4 bước | `OnboardingPage.jsx` | `Seller / Onboarding / Stepper` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 14 | Seller: `/seller/products` | Quản lý SPU, SKU & Tồn kho | `ProductsPage.jsx` | `Seller / Products / Catalog` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 15 | Seller: `/seller/orders` | Quản lý đơn & Đóng gói GHN | `OrdersPage.jsx` | `Seller / Orders / Management` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 16 | Seller: `/seller/finance` | Ví người bán & Rút tiền | `FinancePage.jsx` | `Seller / Finance / Wallet` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 17 | Seller: `/seller/vouchers` | Quản lý khuyến mãi gian hàng | `VouchersPage.jsx` | `Seller / Marketing / Vouchers` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 18 | Seller: `/seller/settings` | Cấu hình Shop, Kho, Vận chuyển | `SettingsPage.jsx` | `Seller / Settings / Shop` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 19 | Admin: `/admin` | Tổng quan hệ thống sàn | `AdminDashboardPage.jsx` | `Admin / Portal / Overview` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 20 | Admin: `/admin/kyc` | Thẩm định KYC người bán | `AdminKycPage.jsx` | `Admin / Portal / KYC Review` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 21 | Admin: `/admin/finance` | Đối soát & Chạy quyết toán lô | `AdminFinancePage.jsx` | `Admin / Portal / Reconciliation` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |
| 22 | Admin: `/admin/audit-logs` | Nhật ký kiểm toán bảo mật | `AdminAuditLogsPage.jsx` | `Admin / Portal / Audit Logs` | 1440 × 900 | MATCH_VERIFIED | STATIC_REVIEW |

---

## 2. Kiểm Toán Hệ Thống Design Tokens & CSS

### 2.1 Bảng Màu Nhận Diện Thương Hiệu (Color Tokens)
- **Màu thương hiệu chủ đạo (`taca.primary`)**: `#4f46e5` (Indigo-600) và Hover `#4338ca` (Indigo-700).
- **Màu khuyến mãi / Flash Sale (`taca.sale`)**: `#e11d48` (Rose-600).
- **Màu cảnh báo (`taca.warning`)**: `#d97706` (Amber-600).
- **Màu thành công (`taca.success`)**: `#059669` (Emerald-600).
- **Màu nền giao diện (`taca.surface`)**: `#f8fafc` (Slate-50).
- **Màu chữ chính (`taca.text.main`)**: `#0f172a` (Slate-900).
- **Màu chữ phụ (`taca.text.muted`)**: `#475569` (Slate-600).
- **Màu đường viền (`taca.border`)**: `#e2e8f0` (Slate-200).
- **Màu nền Admin Portal (`taca.adminDark`)**: `#0f172a` (Slate-900).
*Kết quả*: 100% các thành phần tuân thủ bảng màu chuẩn đã cấu hình trong `tailwind.config.js`.

### 2.2 Kiểu Chữ (Typography Tokens)
- **Font Family**: `Plus Jakarta Sans`, `sans-serif` được cấu hình làm font sans mặc định trên toàn bộ 4 micro-applications.
- **Font Hierarchy**:
  - `Display / H1`: `text-2xl` đến `text-3xl font-bold` (24px - 30px) cho các tiêu đề trang chính.
  - `H2 / Section Title`: `text-lg` đến `text-xl font-semibold` (18px - 20px).
  - `Body / Normal`: `text-sm font-normal` (14px) với `leading-relaxed` (line-height ~20px).
  - `Caption / Subtext`: `text-xs text-slate-500` (12px).

### 2.3 Bo Góc & Khung Hình Học (Border Radius)
- Theo đúng Penpot Foundation: Bố cục sử dụng ngôn ngữ thiết kế sắc nét hiện đại với bo góc `0px` (`rounded-none` / `rounded-DEFAULT: 0px`) cho các container, card, và bảng dữ liệu chính, tạo sự phân cách mạch lạc và nghiêm túc cho sàn thương mại điện tử chuyên nghiệp.
- Các nút bấm (Buttons) và Badges sử dụng bo viền nhẹ (`rounded-md` ~4px) để tối ưu hóa trải nghiệm bấm trên thiết bị cảm ứng và chuột.

---

## 3. Kiểm Toán Hệ Thống Biểu Tượng (Icon System Audit)

- **Thư viện icon duy nhất**: `lucide-react` (phiên bản `^0.435.0`).
- **Tuân thủ quy chuẩn**:
  - **100% Icon giao diện** trong toàn bộ Header, Sidebar, Step, Button, Modal, Status Badge, Notification, và Empty State đều sử dụng Lucide Icon components.
  - **0 Emoji pseudo-icons**: Tuyệt đối không sử dụng các emoji unicode như `✓`, `×`, `📦`, `⚠️`, `▦`, `⌕`, `♙` để giả lập icon.
  - Toàn bộ các icon đều có thuộc tính trợ năng `aria-hidden="true"` hoặc bọc trong nút có `aria-label` tương ứng.

---

## 4. Kiểm Toán Khả Năng Phản Hồi Responsive (Breakpoints)

- **Các breakpoint chuẩn Tailwind CSS được áp dụng**:
  - Mobile: `< 640px` (Mặc định).
  - Tablet: `sm: 640px` và `md: 768px`.
  - Desktop: `lg: 1024px` và `xl: 1280px`.
- **Hành vi đáp ứng**:
  - **Mega Menu & Header**: Co gọn thanh điều hướng thành Hamburger Drawer (`<Menu />`) trên màn hình `< 1024px`.
  - **Sidebar Bộ lọc (Search / Category)**: Ẩn sidebar cố định trên mobile, chuyển thành Filter Drawer trượt từ cạnh màn hình.
  - **Bảng dữ liệu (Tables)**: Hỗ trợ cuộn ngang mềm (`overflow-x-auto`) không làm vỡ viewport toàn trang.
  - **Form nhập liệu (Checkout / Product Editor)**: Chuyển đổi từ bố cục 2 cột sang 1 cột linh hoạt trên màn hình điện thoại.
