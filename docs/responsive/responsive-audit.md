# Báo Cáo Khảo Sát Responsive Toàn Diện (Phase 1 Audit) — Taca Ecommerce System

> **Vị trí tài liệu:** `docs/responsive/responsive-audit.md`  
> **Phiên bản:** 1.0.0 (Phase 1 - Audit & Baseline Assessment)  
> **Trạng thái:** Hoàn thành khảo sát (Chưa sửa code)  
> **Nguyên tắc cốt lõi:** Bảo toàn 100% UI/UX Desktop, giữ nguyên Design Tokens/Màu sắc/Typography/Penpot và toàn bộ Business Logic/API.

---

## 1. Giới thiệu & Mục tiêu

Tài liệu này ghi nhận kết quả khảo sát chi tiết hiện trạng Responsive trên toàn bộ kiến trúc Monorepo Micro-Frontend của Taca Ecommerce (`@taca/shell`, `@taca/buyer`, `@taca/seller`, `@taca/admin`).

Mục tiêu chính:
1. Xác định chính xác các điểm gãy giao diện (layout break), tràn viền ngang (horizontal overflow), chèn ép nội dung hoặc mất khả năng tương tác khi thu hẹp viewport.
2. Thiết lập ma trận tiêu chuẩn trên 7 kích thước viewport đại diện.
3. Đề xuất phạm vi sửa đổi tối thiểu bằng CSS/Tailwind (không can thiệp logic nghiệp vụ, không redesign).

---

## 2. Tiêu chuẩn Viewport Kiểm Thử Tham Chiếu

| Thiết bị | Viewport tham khảo | Mục tiêu & Kỳ vọng |
|---|---|---|
| **Desktop lớn** | `1440 × 900` | **Baseline gốc**: Giữ nguyên 100% giao diện, padding, spacing hiện tại. |
| **Laptop** | `1366 × 768` | Hiển thị trọn vẹn, không tràn ngang, thanh điều hướng cân đối. |
| **Tablet ngang** | `1024 × 768` | Bố cục thích nghi không gian (`lg` breakpoint), sidebar/menu co dãn chuẩn. |
| **Tablet dọc** | `768 × 1024` | Không tràn ngang, các cột grid chuyển từ 4 cột sang 2 cột mượt mà. |
| **Mobile lớn** | `430 × 932` | iPhone 14/15/16 Pro Max: Nội dung vừa vặn, nút bấm thao tác dễ dàng. |
| **Mobile phổ biến** | `390 × 844` | iPhone 12/13/14, Galaxy S23/S24: Thẻ sản phẩm, giỏ hàng cân đối. |
| **Mobile nhỏ** | `320 × 568` | iPhone SE / Galaxy Z Flip (màn ngoài): Giới hạn không gian hẹp nhất, không bị vỡ font, không tràn trang. |

---

## 3. Bảng Khảo Sát Hiện Trạng Responsive (Survey Matrix)

| Trang / Component | Vấn đề responsive | Nguyên nhân kỹ thuật | Mức độ | Phạm vi sửa dự kiến |
|---|---|---|---|---|
| **`BuyerLayout.jsx`** | Toàn bộ các trang Buyer bị ép chặt còn 160px chiều rộng trên màn hình mobile 320px | Hardcoded gutter padding `px-[80px]` (80px trái + 80px phải = 160px padding) | **CRITICAL** | Chuyển thành `px-4 sm:px-6 md:px-8 lg:px-[80px]`. Giữ nguyên 80px trên desktop `lg:` trở lên. |
| **`Buyer/Header.jsx`** | Logo, thanh tìm kiếm, link Kênh người bán, Đăng nhập và Giỏ hàng đè lên nhau, gây tràn ngang trang | `px-[80px]` cố định; `h-[78px]` cố định; thiếu `flex-wrap` hoặc ẩn nhãn phụ trên mobile; thanh danh mục (`CategoryNav`) thiếu `overflow-x-auto` | **CRITICAL** | Giảm padding trên mobile (`px-4 sm:px-6 lg:px-[80px]`); thêm `overflow-x-auto no-scrollbar` cho subnav danh mục; ẩn nhãn chữ phụ của nút Người bán/User trên `< sm`. |
| **`CampaignBanner.jsx`** | Gây tràn ngang toàn trang web trên tất cả thiết bị mobile (320px, 390px) | Chiều rộng cứng `w-[400px]` vượt quá kích thước màn hình mobile | **CRITICAL** | Đổi thành `w-full lg:w-[400px]`. Desktop giữ đúng 400px, mobile chiếm trọn bề ngang khung chứa. |
| **`CartPage.jsx`** | Hàng sản phẩm bị méo mó, bộ tăng giảm số lượng (104px) bị ép vào cột 56px gây đè chữ và vỡ khung | Bảng giỏ hàng chia cột theo tỷ lệ cứng `w-1/2`, `w-1/6`, `w-1/6`, `w-1/6` trên mọi kích thước màn hình | **HIGH** | Giữ nguyên tỷ lệ `w-1/2`, `w-1/6` trên `md:`/`lg:`. Trên mobile (`< md`), chuyển cách dàn trang dạng card linh hoạt cho từng item. |
| **`AccountLayout.jsx` & `AccountSidebar.jsx`** | Màn hình Tài khoản bị tràn ngang nghiêm trọng trên mobile; Sidebar 250px và nội dung bị ép song song | `px-[80px]` cứng; container dùng `flex` mà thiếu `flex-col lg:flex-row`, ép sidebar và nội dung đứng song song | **HIGH** | Đổi sang `flex-col lg:flex-row gap-6`; điều chỉnh padding `px-4 sm:px-6 lg:px-[80px]`; trên mobile cho thanh menu cuộn ngang dạng tab chip. |
| **`CategoryLandingPage.jsx`** | Người dùng trên Tablet và Mobile không thể lọc sản phẩm theo nhu cầu / mức giá / thương hiệu | Thanh bên bộ lọc `FilterSidebar` bị ẩn cứng bằng lớp `hidden lg:block` mà không có nút bật Drawer/Sheet thay thế | **MEDIUM** | Bổ sung nút bấm "Bộ lọc" trên mobile/tablet để mở Filter Drawer (giữ nguyên toàn bộ logic lọc và component `FilterSidebar`). |
| **`ProductPurchase.jsx`** | Dòng thông tin đánh giá / đã bán / thương hiệu và dòng cam kết chân trang bị tràn ngang trên màn hình 320px | Khối `flex items-center gap-3` và `gap-6` thiếu `flex-wrap` | **MEDIUM** | Thêm `flex-wrap gap-y-2` để chữ tự động xuống dòng mượt mà khi màn hình hẹp, giữ nguyên hàng đơn trên desktop. |
| **`ProfilePage.jsx`** | Nhãn form "Họ và tên", "Email", "Số điện thoại" bị bóp méo, input bị thu hẹp quá mức trên 320px | Sử dụng lưới cố định `grid-cols-[120px_1fr]` trên mọi viewport | **MEDIUM** | Điều chỉnh thành `grid-cols-1 sm:grid-cols-[120px_1fr]` để nhãn nằm trên input ở mobile và ngang hàng ở desktop. |
| **`Shell/App.jsx`** | Thanh công cụ QA / Developer (`isDevNavVisible`) kéo dài gây thanh cuộn ngang trang khi chạy thử trên mobile | Thanh `<nav>` thiếu `overflow-x-auto` và có các nút dài không thu gọn | **LOW** | Thêm `overflow-x-auto` và cho phép thu nhỏ nhãn trên màn hình cực nhỏ để không ảnh hưởng kiểm thử QA. |
| **`AdminLayout.jsx` & `AdminSidebar.jsx`** | Trang Quản trị Admin bị mất không gian hiển thị trên mobile/tablet, sidebar 260px chiếm trọn màn hình | Sidebar Admin `w-[260px]` cố định luôn hiển thị song song với `main` mà không có cơ chế thu gọn (off-canvas) | **HIGH** | Trên màn hình `< lg`, chuyển `AdminSidebar` thành off-canvas drawer có nút toggle ở `AdminHeader`, desktop giữ nguyên thanh bên 260px. |
| **`SellerHeader.jsx`** | Các nút chuyển kênh "Xem cửa hàng ↗" và "← Kênh người mua" đè vào menu tài khoản trên mobile < 480px | Khối action bên phải thiếu responsive hiding cho text phụ | **LOW** | Ẩn bớt text dài trên mobile (`hidden sm:inline`), giữ lại icon liên kết. |
| **Modals (`CreateVoucherModal`, `ProductEditorModal`)** | Các form bước và lưới nhập liệu bị bó hẹp trên màn hình mobile nhỏ | Lưới chia cột `grid-cols-2` và padding lớn `p-8` chưa tối ưu cho màn hình 320px | **LOW** | Chuyển thành `grid-cols-1 sm:grid-cols-2` và `p-4 sm:p-6/8`. |

---

## 4. Kế Hoạch Triển Khai Theo Giai Đoạn (Proposed Phasing)

Sau khi được phê duyệt, công việc sẽ được chia thành các phase độc lập, kiểm tra hồi quy sau từng bước:

### Giai đoạn 2A: Khung nền tảng Layout & Header (Buyer & Shell)
- **Files:** `apps/buyer/src/layouts/BuyerLayout.jsx`, `apps/buyer/src/components/layout/Header.jsx`, `apps/buyer/src/components/layout/Footer.jsx`, `apps/shell/src/app/App.jsx`.
- **Mục tiêu:** Xóa bỏ hoàn toàn lỗi tràn ngang cấp trang do `px-[80px]`, giúp toàn bộ storefront vừa vặn với mọi viewport từ 320px đến 1440px.

### Giai đoạn 2B: Trang chủ & Chi tiết sản phẩm (Home & Product Details)
- **Files:** `apps/buyer/src/features/home/components/CampaignBanner.jsx`, `apps/buyer/src/features/home/components/HeroSection.jsx`, `apps/buyer/src/features/home/components/BenefitsBar.jsx`, `apps/buyer/src/features/products/components/ProductPurchase.jsx`.
- **Mục tiêu:** Co giãn banner thông minh, cho phép wrap các dòng thông số/cam kết và responsive các nút CTA mua hàng.

### Giai đoạn 2C: Trang danh mục & Giỏ hàng (Category & Cart)
- **Files:** `apps/buyer/src/features/products/pages/CategoryLandingPage.jsx`, `apps/buyer/src/features/cart/pages/CartPage.jsx`.
- **Mục tiêu:** Cung cấp trải nghiệm giỏ hàng tối ưu trên mobile (bộ đếm số lượng không bị đè, giá hiển thị rõ ràng), hỗ trợ lọc sản phẩm trên tablet/mobile.

### Giai đoạn 2D: Trung tâm tài khoản Buyer (Profile & Orders)
- **Files:** `apps/buyer/src/features/account/layouts/AccountLayout.jsx`, `apps/buyer/src/features/account/components/AccountSidebar.jsx`, `apps/buyer/src/features/account/pages/ProfilePage.jsx`, `apps/buyer/src/features/account/pages/SellerRegisterPage.jsx`.
- **Mục tiêu:** Xếp chồng dọc sidebar/content trên màn hình nhỏ, form thông tin tài khoản hiển thị thoáng đãng trên mobile.

### Giai đoạn 2E: Kênh Người bán & Cổng Quản trị Admin (Seller & Admin)
- **Files:** `apps/admin/src/layouts/AdminLayout.jsx`, `apps/admin/src/components/layout/AdminSidebar.jsx`, `apps/admin/src/components/layout/AdminHeader.jsx`, `apps/seller/src/components/layout/SellerHeader.jsx`, các modal trong Seller (`CreateVoucherModal.jsx`, `ProductEditorModal.jsx`).
- **Mục tiêu:** Hỗ trợ ngăn kéo điều hướng (drawer) cho Admin trên tablet/mobile; bảng dữ liệu cho phép cuộn ngang có kiểm soát (`overflow-x-auto`).

---

## 5. Cam Kết Bảo Vệ UI/UX & Logic

1. **Desktop Invariance (Bất biến trên Desktop):**
   - Mọi class thay đổi đều sử dụng tiền tố responsive của Tailwind (`sm:`, `md:`, `lg:`).
   - Ở kích thước `>= 1024px` và `>= 1440px`, toàn bộ giá trị padding `px-[80px]`, chiều rộng `w-[400px]`, cấu trúc cột `w-1/6` đều được giữ nguyên 100%.
2. **Không thay đổi Business Logic:**
   - Không can thiệp vào state, hooks, context (`CartProvider`, `useAuth`, `useFavorites`).
   - Không thay đổi bất kỳ URL, endpoint API, request/response contract hay cấu trúc validation nào.
3. **Không Redesign:**
   - Giữ nguyên toàn bộ bảng màu (Indigo `#4f46e5`, Dark Slate `#0f172a`, Sale Rose `#e11d48`), font chữ Plus Jakarta Sans, bo góc và icon Lucide.

---

## 6. Kết Quả Triển Khai Thực Tế & Kiểm Tra (Implementation & Verification)

### 6.1. Danh Sách File Đã Tối Ưu

1. **`apps/buyer/src/layouts/BuyerLayout.jsx`**: Thay `px-[80px]` cố định bằng `px-4 sm:px-6 md:px-8 lg:px-[80px]`.
2. **`apps/buyer/src/components/layout/Footer.jsx`**: Thay `px-[80px]` bằng `px-4 sm:px-6 md:px-8 lg:px-[80px]`.
3. **`apps/buyer/src/components/layout/Header.jsx`**:
   - Container co dãn `px-4 sm:px-6 lg:px-[80px]` và `min-h-[64px] sm:h-[78px]`.
   - Ô tìm kiếm co dãn `h-[38px] sm:h-[44px]` kèm nút tìm kiếm icon trên mobile.
   - Nhóm action: Tự động ẩn text dài (Người bán, Tài khoản, Giỏ hàng) trên mobile nhỏ, chỉ giữ lại icon/avatar với badge đầy đủ.
   - Subnav danh mục: Hỗ trợ cuộn ngang mượt mà bằng CSS `overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`.
4. **`apps/shell/src/app/App.jsx`**:
   - Thanh Dev QA Top Nav được bổ sung `overflow-x-auto` và nhãn rút gọn trên mobile để không làm giãn màn hình khi test.
5. **`apps/buyer/src/features/home/components/CampaignBanner.jsx`**: Thay `w-[400px]` thành `w-full lg:w-[400px] min-w-0`, xóa triệt để horizontal overflow trên mobile.
6. **`apps/buyer/src/features/home/components/HeroSection.jsx`**: Padding linh hoạt `px-5 sm:px-10`, tiêu đề `text-[22px] sm:text-[30px]`.
7. **`apps/buyer/src/features/home/components/BenefitsBar.jsx`**: Lưới responsive `grid-cols-1 xs:grid-cols-2 md:grid-cols-4`.
8. **`apps/buyer/src/features/products/components/ProductPurchase.jsx`**:
   - Dòng rating/stats/brand và dòng cam kết: Thêm `flex-wrap gap-y-1.5/2` để không tràn trên màn hình 320px.
   - Nút hành động: `flex-col sm:flex-row gap-3 sm:gap-4` giúp người dùng mobile dễ bấm nút Thêm vào giỏ / Mua ngay.
9. **`apps/buyer/src/features/cart/pages/CartPage.jsx`**:
   - Desktop (`md:`/`lg:`): Giữ nguyên 100% tỷ lệ bảng (`w-1/2`, `w-1/6`, `w-1/6`, `w-1/6`).
   - Mobile (`< md`): Tự động dàn dòng thành card linh hoạt với ảnh + tên sản phẩm ở trên, giá và stepper số lượng (+/-) ở dưới.
10. **`apps/buyer/src/features/products/pages/CategoryLandingPage.jsx`**:
    - Bổ sung nút bấm và off-canvas Filter Drawer trên mobile/tablet (`lg:hidden`).
    - Lưới sản phẩm: `gap-3 sm:gap-4`.
11. **`apps/buyer/src/features/account/layouts/AccountLayout.jsx`**: Container `flex-col lg:flex-row`, padding `px-4 sm:px-6 lg:px-[80px]`.
12. **`apps/buyer/src/features/account/components/AccountSidebar.jsx`**:
    - Desktop (`lg:`): Giữ nguyên vertical sidebar `w-[250px]`.
    - Mobile/Tablet (`< lg`): Chuyển thành hàng tab cuộn ngang tiện lợi, có thanh chỉ báo active dưới đáy.
13. **`apps/buyer/src/features/account/pages/ProfilePage.jsx`**: Chuyển lưới form sang `grid-cols-1 sm:grid-cols-[120px_1fr]` giúp nhãn nằm trên input trên mobile, ngang hàng trên desktop.
14. **`apps/buyer/src/features/account/pages/SellerRegisterPage.jsx`**: Đổi các padding cứng `p-8` thành `p-4 sm:p-6 md:p-8`.
15. **`apps/seller/src/components/layout/SellerHeader.jsx`**: Rút gọn nhãn phụ trên mobile nhỏ, giữ nguyên icon và liên kết.
16. **`apps/seller/src/features/vouchers/components/CreateVoucherModal.jsx`**: Chuyển lưới `grid-cols-2` thành `grid-cols-1 sm:grid-cols-2`.
17. **`apps/admin/src/components/layout/AdminSidebar.jsx`**: Hỗ trợ nút đóng `×` và sự kiện click đóng drawer trên mobile.
18. **`apps/admin/src/components/layout/AdminHeader.jsx`**: Bổ sung nút hamburger menu `☰` trên mobile, tìm kiếm co dãn `w-36 sm:w-64`.
19. **`apps/admin/src/layouts/AdminLayout.jsx`**: Tích hợp backdrop bán trong suốt và cơ chế trượt mở drawer `AdminSidebar` trên tablet/mobile.

### 6.2. Kết Quả Kiểm Tra Tự Động (Quality & Build Gate)
- **ESLint (`npm run lint`):** ✅ Passed (0 lỗi trên toàn bộ `@taca/admin`, `@taca/buyer`, `@taca/seller`, `@taca/shell`).
- **Remote Build (`npm run build:remotes`):** ✅ Passed (Bundle thành công 100% Vite Module Federation cho cả 3 remote).
- **Host Build (`npm run build -w @taca/shell`):** ✅ Passed.
- **Bảo toàn Desktop:** 100% bố cục và tỷ lệ desktop tại `1440px` và `1024px` giữ nguyên giá trị gốc.
- **Bảo toàn Logic:** Không có bất kỳ thay đổi nào đối với state, API service, context hay validation.
