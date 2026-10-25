# Báo Cáo Triển Khai: PHASE-01 (Implementation Report)

## 1. Tóm Tắt Phase
- **Phase ID**: `PHASE-01`
- **Tên Phase**: Security & Auth Hardening (Củng cố An toàn & Phân quyền Xác thực)
- **Trạng thái cuối cùng**: `COMPLETE_VERIFIED`
- **Mục tiêu**: Xử lý triệt để 2 lỗi nghiêm trọng (`Critical`) và 1 lỗi Token (`Low`) liên quan đến bảo mật phiên, xác thực tăng cường MFA Step-Up và thẩm định quyền truy cập RBAC Admin.

---

## 2. Các Task Đã Làm & Chi Tiết Thay Đổi Mã Nguồn

### TASK-01-MFA: Triển khai Cơ chế Xác thực Tăng cường (MFA Step-Up — `AUTH-001`)
- **API Spec tuân thủ**: `auth-user.md` §1.1, §2.12, §2.31, §2.33, §2.34; `payment-wallet-service` §3.6.
- **Chi tiết thực hiện**:
  1. **Khởi tạo Component Modal Tái Sử Dụng** [StepUpMfaModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/common/StepUpMfaModal.jsx):
     - Xây dựng giao diện nhập mã OTP 6 chữ số theo chuẩn thẩm mỹ Penpot & Tailwind v3.
     - Tự động gọi `verify2FA({ purpose: 'STEP_UP', method: 'TOTP', code })` lấy `step_up_token`.
     - Trả về token cho hàm gọi thực thi mutation.
  2. **Tiêm Header `X-MFA-Step-Up` trong Service Admin** [admin-kyc.api.js](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-kyc.api.js):
     - `reviewKyc(shopId, { decision, reason }, stepUpToken)`: Đính kèm `headers['X-MFA-Step-Up']`.
     - `updateUserRole(userId, { action, role, shop_id, reason }, stepUpToken)`: Đính kèm `headers['X-MFA-Step-Up']`.
     - `updateUserStatus(userId, { status, reason }, stepUpToken)`: Đính kèm `headers['X-MFA-Step-Up']`.
  3. **Tích hợp Luồng Step-Up vào UI Quản Trị**:
     - [AdminUsersRolesPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/users/pages/AdminUsersRolesPage.jsx): Khi Admin cấp/thu hồi vai trò hoặc khóa/mở khóa người dùng, modal xác thực 2FA Step-Up sẽ kích hoạt để bảo vệ thao tác.
     - [KycReviewModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/kyc/components/KycReviewModal.jsx): Khi Admin từ chối hồ sơ người bán (`REJECTED`), hệ thống yêu cầu mã OTP 2FA trước khi gửi quyết định lên server theo spec §2.31.
  4. **Thắt chặt Luồng Rút Tiền Seller** [WithdrawModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx):
     - Kiểm tra và bắt buộc nhập mã xác thực OTP 2FA (6 chữ số) trước khi gọi `sellerFinanceApi.requestPayout` với header `X-MFA-Step-Up`.

---

### TASK-01-RBAC: Củng cố Chốt Chặn Phân Quyền Admin Guard (`AUTH-002`)
- **Chi tiết thực hiện**:
  1. **Hàm Giải mã & Xác thực JWT Claims** [admin-auth.api.js](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-auth.api.js):
     - Xây dựng tiện ích `parseJwt(token)` phân tích an toàn cấu trúc payload token JWT.
     - Cập nhật hàm `getAdminUser()`:
       - Kiểm tra sự tồn tại của `taca_access_token`. Nếu không có token, lập tức trả về `null`.
       - Kiểm tra hạn sử dụng `payload.exp * 1000 > Date.now()`.
       - Xác minh danh sách roles trong JWT (`ADMIN`, `SUPER_ADMIN`, `RISK_MANAGER`).
       - Loại bỏ hoàn toàn lỗ hổng kẻ tấn công sửa đổi trực tiếp chuỗi JSON trong `localStorage.getItem('taca_user')` để leo thang đặc quyền.
  2. **Bảo vệ Vùng Render Viewport** [AdminLayout.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/layouts/AdminLayout.jsx):
     - Đặt điều kiện bảo vệ nghiêm ngặt: Khi `!adminUser`, tuyệt đối không render `<Outlet />` trong `<main>` để tránh việc component nội bộ bị kích hoạt và gọi API ngầm phía sau modal đăng nhập.
     - Thay thế bằng giao diện cảnh báo `ShieldAlert` yêu cầu xác thực phiên quản trị viên hợp lệ.

---

### TASK-01-REFRESH: Phòng Chống Race Condition trong Hàng Đợi Token Refresh (`AUTH-003`)
- **Chi tiết thực hiện**:
  1. **Tối ưu Hàng đợi Request Lỗi** [api-client.js](file:///d:/di_hoc/taca_ecommerce/shared/utils/api-client.js):
     - Xây dựng helper `setAuthHeader(config, token)` tương thích hoàn hảo với cả `AxiosHeaders` class trong axios hiện đại và plain object headers.
     - Bổ sung `isAuthEndpoint` loại trừ thêm `/auth/signout`.
     - Bỏ qua các request bị hủy bởi client (`axios.isCancel(error)`).
     - Xử lý mượt mà kịch bản token mock (`isMockMode() || refreshToken.startsWith('mock-')`), tự động tạo token mới và xả hàng đợi `processQueue(null, newAccessToken)` mà không làm văng phiên đăng nhập khi chạy dev/mock.

---

## 3. Danh Sách Tệp Tin Đã Tạo / Sửa Đổi
| Đường dẫn file | Thao tác | Mô tả thay đổi |
| :--- | :---: | :--- |
| [shared/utils/api-client.js](file:///d:/di_hoc/taca_ecommerce/shared/utils/api-client.js) | Sửa đổi | Củng cố hàng đợi refresh token, hỗ trợ AxiosHeaders, kiểm soát mock refresh |
| [apps/admin/src/services/admin-auth.api.js](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-auth.api.js) | Sửa đổi | Bổ sung `parseJwt`, thẩm định JWT claims và hạn dùng token trong `getAdminUser` |
| [apps/admin/src/layouts/AdminLayout.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/layouts/AdminLayout.jsx) | Sửa đổi | Chặn render `<Outlet />` khi chưa xác thực quyền admin, hiển thị guard screen |
| [apps/admin/src/services/admin-kyc.api.js](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/services/admin-kyc.api.js) | Sửa đổi | Đính kèm `X-MFA-Step-Up` cho `reviewKyc`, `updateUserRole`, `updateUserStatus` |
| [apps/admin/src/components/common/StepUpMfaModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/common/StepUpMfaModal.jsx) | Tạo mới | Modal nhập OTP 2FA và lấy step-up token cho các thao tác nhạy cảm |
| [apps/admin/src/features/users/pages/AdminUsersRolesPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/users/pages/AdminUsersRolesPage.jsx) | Sửa đổi | Tích hợp modal Step-Up MFA khi gán quyền hoặc khóa tài khoản người dùng |
| [apps/admin/src/features/kyc/components/KycReviewModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/kyc/components/KycReviewModal.jsx) | Sửa đổi | Tích hợp modal Step-Up MFA khi từ chối hồ sơ KYC |
| [apps/seller/src/features/finance/components/WithdrawModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx) | Sửa đổi | Thêm kiểm tra hợp lệ 6 chữ số OTP 2FA trước khi gửi yêu cầu rút tiền |

---

## 4. Xử Lý Findings
- **Findings đã xử lý thành công và xác minh**:
  - `AUTH-001` (Critical) -> `RESOLVED`
  - `AUTH-002` (Critical) -> `RESOLVED`
  - `AUTH-003` (Low) -> `RESOLVED`
- **Findings còn tồn tại**: 23 findings (thuộc phạm vi các Phase 2-6 tiếp theo).

---

## 5. Kết Luận
Toàn bộ 3 nhiệm vụ kỹ thuật của `PHASE-01` đã được hoàn thành đúng quy chuẩn kiến trúc, chuẩn hợp đồng API GitHub docs, không có code thừa và bảo toàn 100% các file uncommitted của người dùng.
