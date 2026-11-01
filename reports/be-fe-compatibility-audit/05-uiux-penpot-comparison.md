# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 05. Đối Chiếu Giao Diện UI/UX Với Thiết Kế Penpot (Penpot UI/UX Comparison)

**Nguồn tham chiếu thiết kế (Design Truth)**:
- Không gian làm việc Penpot: File `taca` (ID: `40e06342-8830-80d6-8008-8f83031f9fb5`).
- Bản đồ ánh xạ: `docs/design/PENPOT_MAPPING.md`, `docs/design/PAGES.md`, `DESIGN_SYSTEM.md`.
- Phạm vi: 7 Pages, 16 Artboards, 3 Ứng dụng chính (Buyer, Seller, Admin).

---

### 1. Bản Đồ So Khớp Màn Hình (Screen-by-Screen Coverage)

| Mã Màn Hình | Tên Bản Vẽ Penpot (Board Name) | Component / Route Frontend Tương Ứng | Tình Trạng So Khớp | Đánh Giá Tương Thích |
|:---|:---|:---|:---|:---|
| `SCR-BUY-01` | `board_homepage` | `apps/buyer/.../HomePage.jsx` | Khớp 95% | Bố cục Banner, Danh mục, Sản phẩm gợi ý đạt chuẩn |
| `SCR-BUY-02` | `board_pdp` | `apps/buyer/.../ProductDetailPage.jsx` | Khớp 85% | Bị lỗi phân loại thuộc tính SKU do lệch contract BE |
| `SCR-BUY-03` | `board_cart` | `apps/buyer/.../CartPage.jsx` | Khớp 90% | Thừa nút "Xóa toàn bộ giỏ" (Penpot chỉ có xóa mục chọn) |
| `SCR-BUY-04` | `board_checkout` | `apps/buyer/.../CheckoutPage.jsx` | Khớp 80% | Thiếu đồng hồ đếm ngược 15p VNPAY QR theo Penpot |
| `SCR-BUY-05` | `board_order_tracking` | `apps/buyer/.../OrderDetailPage.jsx` | Khớp 90% | Timeline vận chuyển hiển thị chuẩn theo `shipment-docs` |
| `SCR-BUY-06` | `board_seller_register`| `apps/buyer/.../SellerRegisterPage.jsx`| Khớp 92% | Form 4 bước đạt chuẩn; cần đồng bộ navigation sang Seller |
| `SCR-SEL-01` | `board_seller_dashboard`| `apps/seller/.../DashboardPage.jsx` | Khớp 85% | Dữ liệu KPI đang đọc từ mock object |
| `SCR-SEL-02` | `board_seller_products` | `apps/seller/.../ProductListPage.jsx` | Khớp 95% | Bảng sản phẩm, bộ lọc trạng thái khớp Penpot |
| `SCR-SEL-03` | `board_seller_orders` | `apps/seller/.../OrderManagementPage.jsx`| Khớp 88% | Thao tác bulk fulfillment mới chỉ hiện thông báo tạm |
| `SCR-SEL-04` | `board_seller_finance` | `apps/seller/.../FinancePage.jsx` | Khớp 75% | Thiếu biểu đồ cột doanh thu 7 ngày so với thiết kế Penpot |
| `SCR-ADM-01` | `board_admin_kyc` | `apps/admin/.../AdminKycPage.jsx` | Khớp 85% | Bảng duyệt KYC khớp; modal duyệt thiếu preview ảnh CCCD phóng to |
| `SCR-ADM-02` | `board_admin_categories`| `apps/admin/.../AdminCategoryPage.jsx` | Khớp 92% | Cây danh mục đạt chuẩn |
| `SCR-ADM-03` | `board_admin_settlement`| `apps/admin/.../AdminSettlementPage.jsx` | Khớp 80% | Thừa nút "Tạo đợt quyết toán" (BE chạy tự động) |

---

### 2. Chi Tiết Các Điểm Không Đồng Nhất (Discrepancies & Gaps)

#### 2.1. Thành Phần Frontend Tự Thêm (Vượt Ngoài Thiết Kế Penpot)

1. **Nút "Tạo Đợt Quyết Toán Mới" (`AdminSettlementPage.jsx`)**:
   - **Thực tế Penpot**: Thiết kế chỉ bao gồm bảng lịch sử các chu kỳ quyết toán tự động, bộ lọc ngày, và nút "Xem chi tiết" / "Thử lại lỗi".
   - **Frontend hiện tại**: Tự thêm nút mở Modal tạo đợt quyết toán thủ công kèm 2 trường ngày `cycle_start`, `cycle_end`. Chức năng này không có trong thiết kế và Backend cũng không hỗ trợ endpoint.
   - **Xử lý**: Ẩn nút tạo thủ công; thay bằng badge chú thích "Chu kỳ quyết toán tự động: 02:00 sáng Thứ Hai hàng tuần".

2. **Chức Năng Xóa Trắng Giỏ Hàng (`clearCart`)**:
   - **Thực tế Penpot**: Chỉ thiết kế checkbox "Chọn tất cả" và nút "Xóa các mục đã chọn" (gọi `DELETE /cart/items/{id}` tuần tự hoặc bulk theo danh sách ID).
   - **Frontend hiện tại**: Tự khai báo hàm `clearCart` gọi `DELETE /cart`.
   - **Xử lý**: Loại bỏ hàm gọi endpoint `DELETE /cart`.

---

#### 2.2. Thành Phần Thiết Kế Penpot Chưa Được Triển Khai Đầy Đủ

1. **Biểu Đồ Doanh Thu Ví Người Bán (`FinancePage.jsx`)**:
   - **Thiết kế Penpot**: Board `board_seller_finance` có biểu đồ cột (Bar Chart) trực quan thể hiện doanh thu theo tuần/tháng.
   - **Frontend hiện tại**: Chỉ hiển thị 3 thẻ số dư (`Available`, `Pending`, `Total Earnings`) và bảng danh sách giao dịch văn bản thuần túy.

2. **Bộ Đếm Thời Gian Hết Hạn Thanh Toán VNPAY (15 Phút)**:
   - **Thiết kế Penpot**: Màn hình `board_checkout` có modal hiển thị mã QR VNPAY kèm đồng hồ đếm ngược `14:59` và cảnh báo "Đơn hàng sẽ tự động hủy nếu không thanh toán trước thời gian này".
   - **Frontend hiện tại**: Chưa tích hợp đồng hồ đếm ngược; khi mở link thanh toán thì chuyển hướng trực tiếp ra trang cổng hoặc đóng modal mà không theo dõi thời gian hiệu lực của Payment URL.

3. **Lightbox Xem Chi Tiết Giấy Tờ KYC (`KycReviewModal.jsx`)**:
   - **Thiết kế Penpot**: Board `board_admin_kyc` thiết kế cửa sổ xem nhanh ảnh 2 mặt CCCD và Giấy phép kinh doanh có nút phóng to (Zoom In/Out) để Admin đối chiếu thông tin pháp lý.
   - **Frontend hiện tại**: Mới chỉ hiển thị các thẻ ảnh thu nhỏ hoặc đường link URL đơn giản.

---

#### 2.3. Trùng Lặp Điều Hướng Giữa Kênh Người Mua & Người Bán (Routing Conflict)

- **Vấn đề ghi nhận**:
  - Tại Header của Buyer có liên kết "Kênh Người Bán" (`/seller`).
  - Trong menu Profile của Buyer (`/account`) có mục "Đăng ký bán hàng" (`/account/seller-register`).
  - Khi một tài khoản đã được Admin phê duyệt hồ sơ KYC (đã là Seller), nếu người dùng vẫn bấm vào "Đăng ký bán hàng" từ trang cá nhân, FE hiện tại vẫn cho phép vào lại form đăng ký `SellerRegisterPage.jsx`.
- **Yêu cầu đối chiếu**:
  - Theo thiết kế Penpot và luồng nghiệp vụ chuẩn: Nếu tài khoản đã có quyền `SELLER`, hệ thống phải tự động điều hướng sang Cổng quản trị người bán (`/seller/dashboard`), hoặc hiển thị thông báo trạng thái "Gian hàng của bạn đang hoạt động - Vào kênh người bán".
  - Nếu tài khoản đang có hồ sơ ở trạng thái `PENDING`, hiển thị màn hình chờ thẩm định (Under Review) kèm timeline, không cho nộp form mới.
