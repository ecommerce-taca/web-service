# Công Việc Còn Lại: PHASE-02 (Remaining Work)

*Cập nhật: 2026-10-25 15:00:00 (ICT)*  
*Chủ quản: Senior Software Engineer / Technical Lead & QA Engineer*

---

## 1. Trạng Thái Công Việc Thuộc PHASE-02

- **Số tasks được giao**: 4 tasks (`TASK-02-PAYMENT-FLOW`, `TASK-02-VOUCHER-SLOTS`, `TASK-02-MOCK-CONTROL`, `TASK-02-ISOLATE-SIM`)
- **Số tasks đã hoàn thành**: 4/4 (100%)
- **Số tasks còn lại trong Phase**: **0**
- **Blockers / Vướng mắc API**: **Không có**

---

## 2. Chi Tiết Các Hạng Mục

| Mã Task | Finding ID | Nội dung công việc | Trạng thái hiện tại | Ghi chú nghiệm thu |
| :---: | :---: | :--- | :---: | :--- |
| `TASK-02-PAYMENT-FLOW` | `API-003` | Tiếp nhận `payment_next_action` từ `POST /checkout` để điều hướng thanh toán | `HOÀN THÀNH` | Không còn lệnh gọi `POST /payments` nội bộ từ client; VNPAY mở modal QR, COD điều hướng đơn hàng. |
| `TASK-02-VOUCHER-SLOTS` | `API-004` | Hỗ trợ 3 slots voucher (`SHOP`, `PLATFORM`, `FREESHIP`) và gửi mảng `voucher_codes: string[]` | `HOÀN THÀNH` | `ApplyVoucherModal` có 3 danh mục rõ ràng; `CheckoutPage` tính chiết khấu freeship và gửi payload chuẩn specs. |
| `TASK-02-MOCK-CONTROL` | `MOCK-001` | Chuyển `isMockMode()` sang `false` mặc định, không nuốt lỗi ngầm trong `order.api.js` | `HOÀN THÀNH` | Đã gỡ bỏ khối catch ngụy tạo mock order; UI hiển thị Error Alert trung thực khi backend lỗi. |
| `TASK-02-ISOLATE-SIM` | `MOCK-002` | Cô lập VNPay Simulator, chặn xác nhận thanh toán giả lập trong môi trường thật | `HOÀN THÀNH` | Chỉ cho phép bấm "Tôi đã thanh toán (Test)" khi `isMockMode() === true`; chế độ thật chỉ dùng polling `GET /payments/{paymentId}`. |

---

## 3. Chuyển Giao Cho Phase Tiếp Theo

Theo đúng quy tắc của Master Prompt:
- Antigravity Agent **dừng lại tại đây** và **không tự ý triển khai `PHASE-03`** cho đến khi nhận được chỉ đạo tiếp theo từ người dùng.
- Công việc của Phase tiếp theo (`PHASE-03: Buyer Reviews & Order Tracking Alignment`) sẽ xử lý các findings:
  - `API-001`: Sửa endpoint review PDP sang `POST /products/{productId}/reviews`
  - `API-002`: Loại bỏ endpoint ảo `GET /reviews/pending` và `GET /reviews/completed`
  - `API-005`: Loại bỏ nút "Lưu voucher" gọi endpoint ma `POST /vouchers/save`
  - `API-008`: Dọn dẹp trường thừa `shop_id` trong payload `POST /cart/items`
  - `MISS-002`: Bổ sung API tra cứu hành trình vận chuyển `GET /orders/{orderId}/shipment`
  - `MISS-005`: Bổ sung hiển thị danh sách đánh giá sản phẩm trên PDP `GET /products/{productId}/reviews`
  - `MISS-012`: Bổ sung kiểm tra voucher `GET /vouchers/validate` và lịch sử dùng `GET /vouchers/redemptions`
