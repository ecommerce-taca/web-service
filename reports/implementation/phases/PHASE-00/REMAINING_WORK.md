# Danh Mục Công Việc Còn Lại: Chuyển Tiếp Sang PHASE-01 (Remaining Work)

## 1. Tóm Tắt Trạng Thái
Toàn bộ công việc thuộc phạm vi của `PHASE-00` đã hoàn thành 100%. Danh sách dưới đây là các findings được chuyển tiếp cho các Phase thực thi code tiếp theo (`PHASE-01` đến `PHASE-06`).

---

## 2. Danh Sách Nhiệm Vụ & Findings Chuyển Tiếp

| Task / Finding ID | Mô tả tóm tắt | Nguyên nhân còn lại | Phụ thuộc (Dependency) | Ưu tiên | Hành động tiếp theo | Tiêu chí nghiệm thu tương ứng |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| `AUTH-001` | Thiếu header `X-MFA-Step-Up` cho các mutation nhạy cảm Admin & Seller | Thuộc phạm vi `PHASE-01` | Sẵn sàng triển khai | 🔴 Critical | Tạo modal nhập OTP và tự động đính kèm header khi gọi service | Request gửi lên API có header `X-MFA-Step-Up` hợp lệ |
| `AUTH-002` | RBAC route guard Admin kiểm tra quyền qua `localStorage` | Thuộc phạm vi `PHASE-01` | Sẵn sàng triển khai | 🔴 Critical | Kiểm tra role qua claims token JWT và auth context | Không thể vượt qua guard bằng cách sửa localStorage |
| `AUTH-003` | Axios response interceptor refresh token chưa chống race condition | Thuộc phạm vi `PHASE-01` | Sẵn sàng triển khai | 🟢 Low | Thêm cơ chế hàng đợi queue cho các request 401 đồng thời | Nhiều API cùng 401 chỉ kích hoạt 1 lần refresh duy nhất |
| `API-003`, `API-004`, `MOCK-001`, `MOCK-002` | Luồng thanh toán Checkout, 3 slots voucher, kiểm soát Mock | Thuộc phạm vi `PHASE-02` | Hoàn thành `PHASE-01` | 🟠 High | Cập nhật checkout payload và xử lý payment redirection | Checkout gửi mảng voucher chuẩn, không gọi thẳng `POST /payments` |
| `API-001`, `API-002`, `MISS-002`, `MISS-005`, `API-005`, `MISS-012`, `API-008` | Chuẩn hóa Review, Order Tracking và Voucher Buyer | Thuộc phạm vi `PHASE-03` | Hoàn thành `PHASE-02` | 🟠 High / 🟡 Medium | Điều chỉnh endpoint review, bổ sung tracking timeline và hiển thị PDP reviews | Đăng và xem review đúng contract, theo dõi vận chuyển mượt mà |
| `MISS-003`, `MISS-004`, `MISS-006`, `MISS-007`, `MISS-008` | Tồn kho Seller, Carrier comparison, Xuất/Hủy đơn | Thuộc phạm vi `PHASE-04` | Hoàn thành `PHASE-03` | 🟠 High / 🟡 Medium | Xây dựng màn hình kho, tích hợp chọn carrier và xuất đơn | Seller chủ động quản lý tồn kho và fulfillment |
| `API-006`, `API-007`, `MISS-009`, `MISS-010`, `MISS-011` | Dọn dẹp API ma, Quyết toán doanh thu & Báo cáo tài chính Admin | Thuộc phạm vi `PHASE-05` | Hoàn thành `PHASE-04` | 🟡 Medium | Gỡ bỏ button vô hiệu, tích hợp batch settlement và finance summary | Portal Admin vận hành chính xác theo đúng tài liệu BE |
| `MISS-001`, `API-009` | Gợi ý tìm kiếm, dọn dẹp unwrapping response & E2E Verification | Thuộc phạm vi `PHASE-06` | Hoàn thành `PHASE-05` | 🟡 Medium / 🟢 Low | Tích hợp search suggest và test hồi quy toàn diện | Toàn bộ ứng dụng sạch lint, build production thành công 100% |

---

## 3. Hành Động Tiếp Theo Ngay Lập Tức
Chờ lệnh phê duyệt chính thức từ người dùng để khởi động `PHASE-01`:
```text
Thực hiện PHASE-01 theo MASTER PROMPT. Phạm vi: các task đã được phê duyệt trong roadmap. Sau khi làm xong, kiểm thử, cập nhật toàn bộ báo cáo và dừng lại.
```
