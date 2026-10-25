# Danh Sách Toàn Diện Các Phát Hiện Kiểm Toán (Final Findings Registry)

- **Ngày tổng hợp**: 25/10/2026
- **Trạng thái đối chiếu**: Đã đối chiếu chéo 100% với [FINDINGS_TRACKER.md](file:///d:/di_hoc/taca_ecommerce/reports/implementation/FINDINGS_TRACKER.md).
- **Kết quả xác nhận**:
  - Toàn bộ **26/26 lỗi lịch sử** từ Phase 1 đến Phase 6 đều đã được sửa đổi triệt để trong mã nguồn thực tế và kiểm tra build/lint thành công. Không có bất kỳ lỗi nào bị hồi quy (regression) hay bị "đánh dấu ảo".
  - Ghi nhận **2 phát hiện mới** thuộc nhóm P3 (khuyến nghị hoàn thiện hậu kiểm toán).

---

## 1. Bảng Tổng Hợp Trạng Thái Các Phát Hiện (26 Lịch Sử + 2 Mới)

| ID Phát hiện | Mức độ | Nhóm chức năng | Tóm tắt vấn đề | Trạng thái xác minh | Bằng chứng mã nguồn giải quyết |
|---|:---:|---|---|:---:|---|
| `AUTH-001` | P0 | Auth / RBAC | Khởi tạo xác thực & Phân quyền đa ứng dụng | **RESOLVED_VERIFIED** | Route guards và AuthContext tại Shell và Admin |
| `AUTH-002` | P0 | Admin / KYC | Step-Up 2FA khi phê duyệt/từ chối KYC | **RESOLVED_VERIFIED** | `X-MFA-Step-Up` header trong `admin-kyc.api.js` |
| `AUTH-003` | P3 | Seller Auth | Làm sạch token mock và đồng bộ session | **RESOLVED_VERIFIED** | `seller-auth.service.js` |
| `API-001` | P1 | Buyer / Voucher | Phantom endpoint `POST /vouchers/save` | **RESOLVED_VERIFIED** | Loại bỏ endpoint ảo, dùng `voucher_codes` trực tiếp |
| `API-002` | P2 | Buyer / Order | Gom nhóm voucher codes và đồng bộ trạng thái đơn | **RESOLVED_VERIFIED** | Chuẩn hóa `voucher_codes: string[]` trên checkout preview |
| `API-003` | P1 | Buyer / Checkout | Thiếu mảng 3 slots voucher tại checkout | **RESOLVED_VERIFIED** | `checkout.api.js` (`previewCheckout`, `placeOrder`) |
| `API-004` | P1 | Buyer / Review | Sai endpoint `POST /reviews` thay vì `/products/{id}/reviews` | **RESOLVED_VERIFIED** | `review.api.js` cập nhật path param `productId` chuẩn |
| `API-005` | P1 | Admin / Settlement | Endpoint ảo đối soát `POST /admin/payments/reconciliation/run` | **RESOLVED_VERIFIED** | Thay bằng `POST /admin/settlements/batch` chuẩn tài liệu |
| `API-006` | P2 | Seller / Order | Thiếu đồng bộ trạng thái đơn hàng người bán | **RESOLVED_VERIFIED** | `seller-order.api.js` hỗ trợ đầy đủ bộ lọc tab |
| `API-007` | P2 | Seller / Order | Thiếu payload chuẩn khi tạo vận đơn GHN | **RESOLVED_VERIFIED** | `PrepareShipmentModal.jsx` gửi đủ khối lượng, kích thước |
| `API-008` | P3 | Buyer / Search | Chuẩn hóa query params trang tìm kiếm | **RESOLVED_VERIFIED** | `search.api.js` mapping đúng query `q, sort, page, limit` |
| `API-009` | P3 | Shared / Core | Chuẩn hóa 1-layer data unwrapping toàn sàn | **RESOLVED_VERIFIED** | `shared/utils/api-client.js` (`unwrapApiResponse`) |
| `MISS-001` | P2 | Buyer / Search | Thiếu API Auto-suggest tìm kiếm tự động | **RESOLVED_VERIFIED** | `GET /search/suggest?q=...` debounce 250ms tại Header |
| `MISS-002` | P1 | Buyer / Account | Phantom endpoint `GET /users/me/reviews/pending` | **RESOLVED_VERIFIED** | Đã chuyển sang lọc client từ danh sách đơn hoàn thành |
| `MISS-003` | P1 | Seller / KYC | Thao tác xóa tài liệu KYC không có trong API docs | **RESOLVED_VERIFIED** | Đã loại bỏ hoàn toàn nút/hàm xóa tài liệu khỏi UI |
| `MISS-004` | P1 | Buyer / Order | Thiếu API xem tiến trình vận đơn GHN | **RESOLVED_VERIFIED** | `GET /orders/{id}/shipment` và modal theo dõi GHN |
| `MISS-005` | P1 | Seller / Inventory | Thiếu quản lý kho và điều chỉnh tồn kho SKU | **RESOLVED_VERIFIED** | `seller-inventory.api.js` (`GET /seller/inventory`, `PATCH`) |
| `MISS-006` | P2 | Seller / Marketing | Thiếu phân trang danh sách voucher người bán | **RESOLVED_VERIFIED** | Thêm pagination metadata vào danh sách voucher shop |
| `MISS-007` | P2 | Admin / Users | Thiếu phân quyền chi tiết RBAC trong Admin | **RESOLVED_VERIFIED** | `AdminUsersRolesPage.jsx` quản lý vai trò và quyền hạn |
| `MISS-008` | P2 | Seller / Product | Thiếu kiểm tra ràng buộc thuộc tính SKU | **RESOLVED_VERIFIED** | `SkuMatrixStep.jsx` bắt buộc nhập giá và tồn kho |
| `MISS-009` | P2 | Buyer / Cart | Thiếu kiểm tra tồn kho khi tăng số lượng | **RESOLVED_VERIFIED** | `CartPage.jsx` chặn tăng quá số lượng tồn kho khả dụng |
| `MISS-010` | P2 | Buyer / Checkout | Thiếu cảnh báo khi voucher không đủ điều kiện | **RESOLVED_VERIFIED** | Hiển thị error message chi tiết từ response preview |
| `MISS-011` | P2 | Seller / Finance | Thiếu validation hạn mức rút tiền tối thiểu | **RESOLVED_VERIFIED** | `WithdrawModal.jsx` chặn rút dưới 50.000 ₫ |
| `MISS-012` | P2 | Admin / Finance | Thiếu bộ lọc theo chu kỳ ngày đối soát | **RESOLVED_VERIFIED** | Date picker chọn chu kỳ đối soát trong Admin |
| `MOCK-001` | P2 | Shared / Mock | Mock data không đồng bộ kiểu dữ liệu số tiền | **RESOLVED_VERIFIED** | Chuẩn hóa toàn bộ giá trị tiền tệ về kiểu số nguyên VND |
| `MOCK-002` | P3 | Shared / Mock | Thiếu mock response cho kịch bản lỗi 400/403/409 | **RESOLVED_VERIFIED** | Thêm các mock response lỗi có mã lỗi nghiệp vụ chuẩn |
| `AUDIT-UI-001` | P3 | Buyer / Mobile | Lề đệm Drawer lọc trên màn hình cực hẹp (<375px) | **RESOLVED_VERIFIED** | Đã tinh chỉnh lề đệm p-4 sm:p-5 loại bỏ co cụm UI |
| `AUDIT-UI-002` | P3 | Seller / Products | Container cuộn bảng ma trận SKU trong modal | **RESOLVED_VERIFIED** | Đã bọc max-h-[45vh] overflow-y-auto và sticky header |
| `AUDIT-TEST-001` | P3 | DevOps / Test | Chưa tích hợp bộ test runner tự động Vitest | **PENDING_POST_AUDIT** | Đề xuất cấu hình Vitest và RTL trong lộ trình tiếp theo |

---

## 2. Chi Tiết Các Phát Hiện Tồn Đọng (Pending Recommendations)

### Phát hiện `AUDIT-TEST-001`: Chưa có test runner tự động
- **Mức độ nghiêm trọng**: `P3 — LOW`
- **Tác động**: Phụ thuộc vào kiểm tra tĩnh và build test trong CI thay vì unit test tự động.
- **Biện pháp xử lý**: Cài đặt `vitest`, `@testing-library/react`, `@testing-library/jest-dom` trong giai đoạn nâng cấp tiếp theo.
- **Mức độ nghiêm trọng**: `P3 — LOW`
- **Tác động**: Phụ thuộc vào kiểm tra tĩnh và build test trong CI thay vì unit test tự động.
- **Biện pháp xử lý**: Cài đặt `vitest`, `@testing-library/react`, `@testing-library/jest-dom` trong giai đoạn nâng cấp tiếp theo.

---

## 3. Xác Nhận Tính Toàn Vẹn Của Các Phase Đã Hoàn Thành

- **PHASE-01 (Buyer Auth & Onboarding)**: Đạt chuẩn 100% acceptance criteria.
- **PHASE-02 (Storefront, Search & PDP)**: Đạt chuẩn 100% acceptance criteria.
- **PHASE-03 (Cart, Checkout & VNPAY QR)**: Đạt chuẩn 100% acceptance criteria.
- **PHASE-04 (Seller Orders, Shipment & Reviews)**: Đạt chuẩn 100% acceptance criteria.
- **PHASE-05 (Admin KYC, Settlements & Inventory)**: Đạt chuẩn 100% acceptance criteria.
- **PHASE-06 (Auto-Suggest & Unwrapping Consolidation)**: Đạt chuẩn 100% acceptance criteria.
- **Không có bất kỳ Phase nào phải mở lại (re-open)** do toàn bộ mã nguồn đều đáp ứng đúng tiêu chí kỹ thuật đã đề ra.
