# Kế Hoạch Triển Khai: PHASE-01 (Phase Plan)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-01`
- **Tên Phase**: Security & Auth Hardening (Củng cố An toàn & Phân quyền Xác thực)
- **Trạng thái**: `NOT_STARTED`
- **Mục tiêu**: Xử lý triệt để 2 lỗi nghiêm trọng (`Critical`) và 1 lỗi tối ưu hoá token (`Low`) liên quan đến bảo mật phiên và thẩm định quyền thao tác:
  1. `AUTH-001` (Critical): Cơ chế Step-Up Authentication (`X-MFA-Step-Up`).
  2. `AUTH-002` (Critical): Củng cố phân quyền RBAC cho Admin route guards.
  3. `AUTH-003` (Low): Chống race condition khi refresh token đồng thời.

---

## 2. Phạm Vi Được Phê Duyệt & Tasks Chi Tiết

| Task ID | Finding ID | Ứng dụng | File / Module dự kiến ảnh hưởng | Mô tả thay đổi dự kiến |
| :---: | :---: | :---: | :--- | :--- |
| `TASK-01-MFA` | `AUTH-001` | Admin, Seller | - `shared/utils/api-client.js`<br>- `apps/admin/src/services/`<br>- `apps/seller/src/services/seller-payout.api.js`<br>- `apps/admin/src/components/common/MfaModal.jsx` | - Thêm helper/modal nhập mã OTP Step-Up khi gọi API nhạy cảm (`PUT /admin/fees`, `PATCH /admin/users/{id}/*`, `POST /seller/payouts`).<br>- Gửi kèm header `X-MFA-Step-Up: <token>` theo đúng specs `docs/api-specs/auth/README.md`. |
| `TASK-01-RBAC` | `AUTH-002` | Admin | - `apps/admin/src/routes/AdminRouteGuard.jsx`<br>- `apps/admin/src/contexts/AdminAuthContext.jsx` | - Không đọc quyền chỉ từ `localStorage.getItem('role')`.<br>- Giải mã và thẩm định claims role từ JWT access token có trong session state trước khi render route con. |
| `TASK-01-REFRESH` | `AUTH-003` | Shared / All | - `shared/utils/api-client.js` | - Bổ sung biến cờ `isRefreshing` và hàng đợi `failedQueue` trong axios response interceptor.<br>- Đảm bảo khi có nhiều request đồng thời gặp 401, chỉ có 1 request refresh token duy nhất được gửi lên server. |

---

## 3. Rủi Ro & Biện Pháp Phòng Ngừa
- **Rủi ro**: Can thiệp vào `shared/utils/api-client.js` có thể ảnh hưởng đến các service khác nếu không xử lý kỹ Promise queue.
- **Biện pháp**: Viết hàm xử lý hàng đợi chuẩn tắc; giữ nguyên cấu trúc request config; kiểm tra kỹ flow cả khi refresh thành công lẫn thất bại.

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. Các API nhạy cảm có header `X-MFA-Step-Up` theo đúng hợp đồng.
2. Việc thay đổi thủ công giá trị role trong `localStorage` không thể qua mặt được Admin Route Guard.
3. Luồng refresh token giải quyết mượt mà nhiều request đồng thời, không gây gián đoạn phiên người dùng.
4. `npm run lint` và build toàn bộ apps vượt qua không lỗi.

---

## 5. Kế Hoạch Kiểm Thử (Test Plan)
- **Kiểm tra tĩnh**: Chạy `npm run lint` trên toàn monorepo.
- **Kiểm tra build**: Chạy `npm run build:remotes` và build shell.
- **Kiểm tra code diff**: Soát lại Git diff đảm bảo không chỉnh sửa ngoài phạm vi 3 task trên.
