# Admin Portal — Engineering Rules

## 1. VAI TRÒ & PHẠM VI

`apps/admin` là **System Administration Portal** dành cho ban quản trị vận hành sàn thương mại điện tử Taca Ecommerce.

- **Port phát triển**: `5176`
- **Prefix Route**: `/admin/*` (qua Shell Host)
- **Expose Federation**: `./App` trỏ vào `./src/app/App.jsx`
- **Mục tiêu**: Cung cấp công cụ quản trị bảo mật, phân quyền nghiêm ngặt, xét duyệt định danh người bán, đối soát tài chính và theo dõi nhật ký kiểm toán hệ thống.

---

## 2. CẤU TRÚC TÍNH NĂNG (FEATURE-BASED ARCHITECTURE)

Mọi mã nguồn quản trị được phân chia rõ ràng theo các domain nghiệp vụ tại `src/features/<feature_name>/`:

```text
apps/admin/src/features/
├── audit/        # Nhật ký kiểm toán (Audit Logs) ghi nhận mọi thao tác nhạy cảm trong hệ thống
├── finance/      # Quản lý cấu hình phí sàn, biểu thuế và giám sát các đợt đối soát thanh toán
├── kyc/          # Xét duyệt hồ sơ định danh người bán (Xem CCCD/ĐKKD, phê duyệt hoặc từ chối)
└── users/        # Quản lý tài khoản người dùng, phân quyền vai trò (RBAC), khóa/mở tài khoản
```

---

## 3. NGUYÊN TẮC BẢO MẬT & NGHIỆP VỤ

1. **Bảo mật & Kiểm soát Truy cập (RBAC & 2FA)**:
   - Các hành động nhạy cảm của Admin (phê duyệt KYC, cấu hình biểu phí sàn, khóa tài khoản) yêu cầu xác thực 2 yếu tố (2FA qua `Admin2FASetupModal.jsx`).
   - Luôn kiểm tra vai trò (Role/Permission) trước khi hiển thị nút thao tác hoặc cho phép thực thi chức năng.
   - Tuyệt đối không log thông tin xác thực, token hoặc dữ liệu cá nhân nhạy cảm ra console.

2. **Quy trình Thẩm định KYC (`KycReviewModal.jsx`)**:
   - Khi từ chối hồ sơ người bán, bắt buộc phải chọn hoặc nhập lý do từ chối cụ thể để trả về cho Seller biết và bổ sung.
   - Trạng thái cập nhật phải đồng bộ qua `admin-kyc.api.js` và gửi thông báo tới Seller.

3. **Quản lý Tài chính & Đối soát (`admin-finance.api.js`)**:
   - Quản lý các lô quyết toán (Settlement Batches) và bảng quy tắc thuế/phí sàn (`AdminFeesTaxesPage.jsx`).
   - Mọi thay đổi về tỷ lệ phí sàn phải hiển thị cảnh báo xác nhận rõ ràng về ngày hiệu lực.

4. **Nhật ký Kiểm toán (Audit Logging)**:
   - Tất cả các thao tác thay đổi dữ liệu phải được lưu vết trong `AdminAuditLogsPage.jsx` với đầy đủ: `Thời gian`, `Tác nhân (Admin Email)`, `Hành động`, `Đối tượng bị tác động`, `Địa chỉ IP / User Agent`.

---

## 4. QUY TẮC GIAO DIỆN & TRẢI NGHIỆM

1. **Layout Chuẩn Quản Trị**:
   - Sử dụng duy nhất `AdminLayout` (`src/layouts/AdminLayout.jsx`) kết hợp `AdminHeader` và `AdminSidebar`.
   - Tuyệt đối không import các layout của Buyer (`BuyerLayout`) hay các header/footer công cộng.
2. **Thiết kế Bảng Dữ liệu (Data Density & Tables)**:
   - Giao diện Admin ưu tiên bố cục dạng bảng (Table/Grid) tối ưu mật độ thông tin, hỗ trợ tìm kiếm nhanh, lọc theo trạng thái, sắp xếp cột và phân trang rõ ràng.
3. **Thư viện Giao diện**:
   - Sử dụng icon từ `lucide-react`.
   - Sử dụng component primitives (`Button`, `Input`, `Modal`, `Badge`) từ package `@taca/ui-components`.

---

## 5. KIỂM TRA CHẤT LƯỢNG TRƯỚC KHI BÀN GIAO

- Lệnh kiểm tra bắt buộc:
  ```bash
  npm run lint -w @taca/admin
  npm run build -w @taca/admin
  ```
- Kiểm tra xử lý đầy đủ các trạng thái loading spinner, bảng rỗng (empty state) và modal xác nhận đối với các thao tác nguy hiểm (xóa/khóa tài khoản).
