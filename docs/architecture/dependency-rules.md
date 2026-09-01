# Dependency Rules (Micro-Frontend)

Trong kiến trúc Monorepo chia thành nhiều Micro-Apps của dự án Taca Ecommerce, các quy tắc về Dependencies (phụ thuộc) phải được tuân thủ nghiêm ngặt để tránh lỗi chéo (Cross-app side effects).

## 1. Quy tắc Cấm (Strict Rules)
1. **Không import chéo giữa các Remote Apps**: 
   - Tuyệt đối cấm code trong `apps/buyer` import trực tiếp các file từ `apps/seller` hay `apps/admin`. Nếu một tính năng cần dùng chung, tính năng đó PHẢI được chuyển xuống `shared/`.
2. **Không kết xuất (Expose) Global State tùy tiện**:
   - Các Remote Apps (Buyer, Seller) tự quản lý Local State và Feature State của riêng nó.
   - Nếu cần Share State (ví dụ: Thông tin User đăng nhập, Token), chỉ có **Shell App** mới được quyền quản lý và đẩy dữ liệu xuống thông qua props hoặc một Shared Context.

## 2. Quy tắc Chia sẻ (Shared Modules)
1. Theo cấu hình trong `vite.config.js`, các thư viện dùng chung lõi đều được chia sẻ (singleton) để tránh tải lại bộ nhớ nhiều lần:
   - `react`
   - `react-dom`
   - `react-router-dom`
2. Mọi UI Component, Utility, Constants dùng chung cho toàn bộ hệ thống phải được tạo bên trong thư mục **`shared/`** (ví dụ `shared/ui-components`, `shared/utils`). Các Apps sẽ import chúng thông qua alias `@taca/shared`.

## 3. Kiến trúc Luồng API
- `Shell App` xử lý lấy Token đăng nhập (Auth).
- Các `Remote App` tự gọi các API Service riêng biệt thuộc domain của mình (Product, Cart đối với Buyer).
- File API Client (Axios interceptors đính kèm Auth token) nên được nằm ở `shared/utils/api-client.js`.
