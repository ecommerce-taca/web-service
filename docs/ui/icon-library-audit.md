# Báo cáo Kiểm toán và Chuẩn hóa Icon (Icon Library Audit)

## 1. Thông tin chung
- **Hệ thống**: Taca Ecommerce Frontend (Kiến trúc Micro Frontend: Buyer, Seller, Admin, Shell)
- **Mục tiêu**: Quét toàn bộ source code FE, phát hiện các emoji / ký tự Unicode do AI tự chèn để giả lập icon trong UI và thay thế toàn bộ bằng component icon chuẩn từ thư viện icon đã được tích hợp trong dự án.
- **Thư viện icon chính thức phát hiện và sử dụng**: `lucide-react` (phiên bản `^0.435.0`).
- **Phạm vi tác động**: Giao diện JSX (Header, Sidebar, Navigation, Button, Modal, Step, Form, Status Badge, Notification Banner, Empty State).
- **Ràng buộc tuân thủ**: Giữ nguyên toàn bộ layout, typography, màu sắc, responsive classes Tailwind CSS, kích thước, và logic nghiệp vụ. Đảm bảo thuộc tính trợ năng (`aria-hidden="true"`, `aria-label`).

---

## 2. Bảng ánh xạ Emoji / Ký tự sang Lucide Icon

| Ký tự / Emoji gốc | Ngữ cảnh UI giả lập | Lucide Icon Component | Thuộc tính / Classes chuẩn hóa |
|---|---|---|---|
| `×`, `✕` | Nút Đóng Modal, Xóa tag thuộc tính, Xóa ảnh | `<X />` | `w-3 h-3` đến `w-5 h-5`, kèm `aria-label` |
| `✓`, `✓ Đã xác thực`, `✓ Hoàn thành` | Checkmark trạng thái thành công, stepper completed | `<Check />`, `<CheckCircle2 />` | `w-3.5 h-3.5`, `w-4 h-4`, `text-emerald-600` |
| `⚠️`, `⚠` | Cảnh báo trạng thái, vi phạm SPU, lỗi KYC | `<AlertTriangle />` | `w-4 h-4` đến `w-6 h-6`, `text-amber-600` / `text-rose-600` |
| `📦` | Nút Chuẩn bị hàng, Xử lý hàng loạt, Placeholder | `<Package />` | `w-4 h-4` đến `w-6 h-6` |
| `📥` | Nút Tải xuống / Xuất file Excel, Sao lưu | `<Download />` | `w-4 h-4` |
| `💳` | Nút Yêu cầu rút tiền, Quản lý tài chính | `<CreditCard />` | `w-4 h-4` |
| `💬` | Nút Chat với người mua (Buyer) | `<MessageSquare />` | `w-3.5 h-3.5` |
| `📱` | Placeholder sản phẩm điện thoại | `<Package />` | `w-7 h-7 text-slate-400` |
| `📍`, `⌖` | Địa chỉ kho lấy hàng, chọn vị trí | `<MapPin />` | `w-4 h-4` |
| `📷` | Nút / Dropzone tải ảnh sản phẩm | `<Camera />` | `w-6 h-6` đến `w-10 h-10` |
| `🔄`, `⟳` | Sinh lại bảng SKU, Đồng bộ dữ liệu | `<RefreshCw />` | `w-3.5 h-3.5` |
| `🔒`, `🔐` | Đăng nhập bắt buộc, 2FA, Quyền riêng tư | `<Lock />`, `<KeyRound />`, `<ShieldCheck />` | `w-4 h-4` đến `w-8 h-8` |
| `⚡` | Nút Đăng nhập nhanh Demo | `<Zap />` | `w-3.5 h-3.5 text-amber-500` / `text-emerald-600` |
| `📊`, `📄` | Nút / Dropzone nhập & xuất tệp Excel, Danh sách hồ sơ | `<FileSpreadsheet />`, `<FileText />`, `<UploadCloud />` | `w-3.5 h-3.5` đến `w-6 h-6` |
| `📋` | Tiêu đề khối tổng kết, Empty state đơn hàng | `<ClipboardList />` | `w-4 h-4` đến `w-10 h-10` |
| `🎟️` | Empty state mã giảm giá / Voucher | `<Ticket />` | `w-10 h-10 text-slate-300` |
| `🔔` | Tab Cài đặt thông báo | `<Bell />` | `w-8 h-8 text-slate-400` |
| `↗` | Mở trang Người Mua (External Link) | `<ExternalLink />` | `w-3.5 h-3.5` |
| `🍎` | Fallback logo gian hàng chưa có ảnh bìa | `<Store />` | `w-8 h-8 text-white` / `text-slate-400` |
| `🎉` | Thông báo phê duyệt realtime | `<PartyPopper />` | `w-5 h-5 text-emerald-600` |
| `⌕` | Thanh tìm kiếm Header | `<Search />` | `w-4 h-4 text-slate-400` |
| `♙` | Nút Profile người dùng Header | `<UserRound />` | `w-4 h-4` |
| `▣` | Giỏ hàng Header | `<ShoppingCart />` | `w-4 h-4` |
| `≡`, `☰` | Menu di động Header / Sidebar toggle | `<Menu />` | `w-5 h-5` |
| `▾`, `▼`, `▲` | Dropdown chevron mở/đóng danh mục | `<ChevronDown />`, `<ChevronUp />` | `w-3.5 h-3.5` |
| `▦` | Toàn bộ 12 Navigation Items trong Admin Sidebar | `<LayoutDashboard>`, `<Megaphone>`, `<Layers>`, `<Store>`, `<Package>`, `<Receipt>`, `<WalletCards>`, `<ShoppingCart>`, `<Ticket>`, `<Users>`, `<ScrollText>`, `<Settings>` | `w-4 h-4 shrink-0` |
| `🛍`, `🏪`, `⚙` | Header switch role (Buyer, Seller, Admin) | `<ShoppingBag>`, `<Store>`, `<Settings>` | `w-4 h-4` |

---

## 3. Danh sách chi tiết các File đã chuẩn hóa

### A. Shared & Common (`shared/`)
1. [ErrorBoundary.jsx](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/ErrorBoundary.jsx): Thay `⚠️` thành `AlertTriangle`.

### B. Shell Host App (`apps/shell/`)
2. [Header.jsx](file:///d:/di_hoc/taca_ecommerce/apps/shell/src/components/layout/Header.jsx): Thay `⌕, ⌖, ♙, ▾, ▣, ≡` thành `Search, MapPin, UserRound, ChevronDown, ShoppingCart, Menu`.
3. [App.jsx](file:///d:/di_hoc/taca_ecommerce/apps/shell/src/app/App.jsx): Thay `🛍, 🏪, ⚙, ✕, ✓, 📌, ▼, ▲` thành `ShoppingBag, Store, Settings, X, Check, Pin, ChevronDown, ChevronUp`.

### C. Buyer App (`apps/buyer/`)
4. [CheckoutPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/pages/CheckoutPage.jsx): Thay `⚠️` thành `AlertTriangle`.
5. [SellerRegisterPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/seller-registration/pages/SellerRegisterPage.jsx): Thay `⏳` thành `Clock`.

### D. Admin App (`apps/admin/`)
6. [AdminSidebar.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/layout/AdminSidebar.jsx): Thay 12 icon `▦` ở Sidebar nav, `×` close, `🛍, 🏪, ↗, 🔐` thành Lucide icons tương ứng.
7. [AdminHeader.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/layout/AdminHeader.jsx): Thay `☰, ⌕, ⚠, 🔔, ▾` thành `Menu, Search, AlertTriangle, Bell, ChevronDown`.
8. [Header.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/layout/Header.jsx): Đồng bộ icon header người dùng/giỏ hàng/tìm kiếm.
9. [Admin2FASetupModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/auth/components/Admin2FASetupModal.jsx): Thay `🔐, ✕, ✓` thành `ShieldCheck, X, Check`.
10. [AdminLoginModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/auth/components/AdminLoginModal.jsx): Thay `✕, ⚡, 🔒` thành `X, Zap, Lock`.
11. [AdminAuditLogsPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/audit-logs/pages/AdminAuditLogsPage.jsx): Thay `🔍` thành `Search`.
12. [AdminFeesTaxesPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/fees-taxes/pages/AdminFeesTaxesPage.jsx): Thay `✓` thành `Check`.
13. [AdminFinancePage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/finance/pages/AdminFinancePage.jsx): Thay `📥, ✓, ✓ Khớp hoàn toàn, ⚠ Lệch dữ liệu` thành `Download, Check, CheckCircle2, AlertTriangle`.
14. [AdminKycPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/kyc/pages/AdminKycPage.jsx): Thay `✓` empty state thành `CheckCircle2`.
15. [KycReviewModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/kyc/components/KycReviewModal.jsx): Thay `✕, ✓, ⚠` thành `X, CheckCircle2, AlertTriangle`.
16. [AdminUsersRolesPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/users-roles/pages/AdminUsersRolesPage.jsx): Thay `✓` thông báo lưu quyền thành `Check`.

### E. Seller App (`apps/seller/`)
17. [Header.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/layout/Header.jsx): Thay `⌕, ⌖, ♙, ▾, ▣, ≡` thành `Search, MapPin, UserRound, ChevronDown, ShoppingCart, Menu`.
18. [SellerHeader.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/layout/SellerHeader.jsx): Thay `✓, ↗` thành `Check, ExternalLink`.
19. [SellerLayout.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/layout/SellerLayout.jsx): Thay `✓, ⏳, 🔒, ⟳, ⚠️, ✕, 📝, 🏪, ↗` thành Lucide icons tương ứng.
20. [SellerLoginModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/components/common/SellerLoginModal.jsx): Thay `✕, ⚡` thành `X, Zap`.
21. [DashboardPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/dashboard/pages/DashboardPage.jsx): Thay `🎉, ⚠️, 📋, ✕, ✓, 📥, 🛡️, ↗` thành Lucide icons.
22. [WithdrawModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx): Thay `×, ✓` thành `X, CheckCircle2`.
23. [FinancePage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/pages/FinancePage.jsx): Thay `📥, 💳, ✓` thành `Download, CreditCard, CheckCircle2`.
24. [OnboardingAlerts.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/components/OnboardingAlerts.jsx): Thay `⚠️/✕, ⚠️` thành `AlertTriangle, XCircle`.
25. [OnboardingStepper.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/components/OnboardingStepper.jsx): Thay `✓` hoàn thành step thành `Check`.
26. [BankStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/components/steps/BankStep.jsx): Thay `✓ Đã xác thực, 📋, ✓ Đã có tài liệu, ⚠️ Chưa có tài liệu` thành `Check, ClipboardList, AlertTriangle`.
27. [KycStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/components/steps/KycStep.jsx): Thay `✓ ĐÃ TẢI, 📄, ✕ Xóa` thành `Check, FileText, Trash2`.
28. [WarehouseStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/components/steps/WarehouseStep.jsx): Thay `📍` thành `MapPin`.
29. [OnboardingPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/onboarding/pages/OnboardingPage.jsx): Thay `✕` close, `🎉, ⚠️, 📋` realtime type thành `X, PartyPopper, AlertTriangle, ClipboardList`; làm sạch tiền tố `✓` trong chuỗi toast.
30. [OrderDetailModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/OrderDetailModal.jsx): Thay `×, 💬, 📱, ✓ Đã sao chép, ✓ Action` thành `X, MessageSquare, Package, Check, CheckCircle2`.
31. [PrepareShipmentModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/components/PrepareShipmentModal.jsx): Thay `×, 📦, ✓` thành `X, Package, CheckCircle2`.
32. [OrdersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/orders/pages/OrdersPage.jsx): Thay `📦, ✕, 📋` thành `Package, X, ClipboardList`.
33. [AddAttributeModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/components/AddAttributeModal.jsx): Thay `×, ✓` thành `X, Check`.
34. [AttributesStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/steps/AttributesStep.jsx): Thay `×, ＋, 🔄` thành `X, Plus, RefreshCw`.
35. [BasicInfoStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/steps/BasicInfoStep.jsx): Thay `×, 📷` thành `X, Camera`.
36. [ShippingStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/steps/ShippingStep.jsx): Thay `📷, ✓` thành `Camera, CheckCircle2`.
37. [SkuMatrixStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/steps/SkuMatrixStep.jsx): Thay `🔄, ⚠️` thành `RefreshCw, AlertTriangle`.
38. [ProductEditorModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/ProductEditorModal.jsx): Thay `×, ✓` thành `X, CheckCircle2`; làm sạch tiền tố `✓` trong chuỗi notification.
39. [ProductImportModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/ProductImportModal.jsx): Thay `×, 📥, 📊, 📄, ⚠️` thành `X, Download, FileSpreadsheet, UploadCloud, AlertTriangle`.
40. [ProductsPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/pages/ProductsPage.jsx): Thay `📄, 📊, 🔒, ⚡, ⚠️` thành `FileSpreadsheet, Download, Lock, Zap, AlertTriangle`.
41. [BrandingTab.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/components/tabs/BrandingTab.jsx): Thay `🍎, ✓, ↗` thành `Store, Check, ExternalLink`.
42. [NotificationsTab.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/components/tabs/NotificationsTab.jsx): Thay `🔔` thành `Bell`.
43. [PaymentTab.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/components/tabs/PaymentTab.jsx): Thay `✓` thành `Check`.
44. [ShippingTab.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/components/tabs/ShippingTab.jsx): Thay `✓` thành `Check`.
45. [ShopInfoTab.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/components/tabs/ShopInfoTab.jsx): Thay `🍎` logo fallback thành `Store`.
46. [SettingsPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/settings/pages/SettingsPage.jsx): Thay `📋, ✕` thành `ClipboardList, X`; làm sạch tiền tố `✓` trong chuỗi success toast.
47. [VouchersPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/pages/VouchersPage.jsx): Thay `✕, 🎟️` thành `X, Ticket`.
48. [CreateVoucherModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/vouchers/components/CreateVoucherModal.jsx): Thay `×, 🔒, ✓` thành `X, Lock, CheckCircle2`.

---

## 4. Các vị trí cố ý giữ nguyên và lý do

Theo Mục 3 của yêu cầu nhiệm vụ (*Phân loại chính xác*):
1. **Dấu nhân kích thước toán học trong chuỗi dữ liệu SKU**:
   - `apps/seller/src/features/products/services/seller-product.api.js` (L38): `'6 SKU · 3 dung lượng × 2 màu'`.
   - `apps/seller/src/services/seller.mock.js` (L67): `'6 SKU · 3 dung lượng × 2 màu'`.
   - `apps/seller/src/services/seller.mock.js` (L202): `'ROI 8,4×'`.
   - **Lý do**: Đây là ký tự phép nhân toán học (`×`), mang ý nghĩa dữ liệu nghiệp vụ, không phải icon giao diện.
2. **Tiêu đề thông báo mẫu trong mock backend SSE**:
   - `apps/seller/src/hooks/useSellerRealtimeStatus.js` (L25, 31, 39): `'🎉 Hồ sơ Người Bán đã được phê duyệt!'`, v.v.
   - **Lý do**: Đây là dữ liệu text phản hồi mô phỏng từ server / event payload, không phải icon trực tiếp được nhúng vào JSX template.
3. **Các ký tự tiền tệ và số liệu**: Ký tự `₫`, `%`, `+`, `-` trong các chuỗi tài chính và giá thành được giữ nguyên 100%.

---

## 5. Các vị trí chưa thể xử lý
- **Không có**: Toàn bộ icon emoji và ký tự giả lập icon trong tất cả các ứng dụng đã được giải quyết triệt để.

---

## 6. Kết quả Kiểm tra Lint & Build

| Bước kiểm tra | Lệnh thực thi | Kết quả | Ghi chú |
|---|---|---|---|
| **Lint toàn bộ dự án** | `npm run lint` | **PASS (Exit 0)** | Không có lỗi ESLint trên cả 4 micro-apps (`buyer`, `seller`, `admin`, `shell`). |
| **Build Remote Apps** | `npm run build:remotes` | **PASS (Exit 0)** | `@taca/buyer`: hoàn thành (4.07s)<br>`@taca/seller`: hoàn thành (3.59s)<br>`@taca/admin`: hoàn thành (3.03s) |
| **Build Host Shell** | `npm run build -w @taca/shell` | **PASS (Exit 0)** | `@taca/shell`: hoàn thành (2.53s) |

---

## 7. Đánh giá ngoài phạm vi
- Không phát hiện bất kỳ thay đổi nào làm ảnh hưởng đến routing, API contracts, backend communication hoặc auth state.
- Không phát hiện lỗi layout shift hay lệch baseline giao diện người dùng.
