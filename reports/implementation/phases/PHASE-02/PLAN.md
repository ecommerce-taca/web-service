# Kế Hoạch Triển Khai: PHASE-02 (Phase Plan)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-02`
- **Tên Phase**: Core Checkout & Payment API Alignment (Chuẩn Hóa API Thanh Toán & Giảm Giá)
- **Trạng thái**: `NOT_STARTED`
- **Mục tiêu**: Chuẩn hóa luồng thanh toán và áp dụng khuyến mãi của người mua theo đúng hợp đồng API Gateway và Order/Payment specs trên GitHub docs:
  1. `API-003` (High): Sửa luồng checkout nhận kết quả từ `POST /checkout` để điều hướng thanh toán thay vì gọi thẳng endpoint nội bộ `POST /payments`.
  2. `API-004` (High): Cập nhật payload `POST /checkout` truyền mảng 3 slot `voucher_codes: string[]` (hỗ trợ voucher sàn, shop, freeship) thay vì 1 mã chuỗi đơn lẻ.
  3. `MOCK-001` (Medium): Chuyển giá trị mặc định của `FALLBACK_TO_MOCK` sang `false`, đảm bảo UI hiển thị trung thực Error State khi backend lỗi thay vì nuốt lỗi ngầm.
  4. `MOCK-002` (Low): Tách component giả lập VNPay Simulator ra khỏi luồng thanh toán chính thức của người mua.

---

## 2. Phạm Vi Được Phê Duyệt & Tasks Chi Tiết

| Task ID | Finding ID | Ứng dụng | File / Module dự kiến ảnh hưởng | Mô tả thay đổi dự kiến |
| :---: | :---: | :---: | :--- | :--- |
| `TASK-02-PAYMENT-FLOW` | `API-003` | Buyer | - `apps/buyer/src/features/checkout/pages/CheckoutPage.jsx`<br>- `apps/buyer/src/services/order.api.js`<br>- `apps/buyer/src/services/payment.api.js` | - Khi submit checkout, gọi `POST /checkout`.<br>- Lấy `payment_url` hoặc `payment_id` từ response để điều hướng người mua sang cổng VNPay / sandbox chuẩn Gateway.<br>- Xóa bỏ việc gọi trực tiếp `POST /payments` nội bộ từ client. |
| `TASK-02-VOUCHER-SLOTS` | `API-004` | Buyer | - `apps/buyer/src/features/checkout/components/VoucherSection.jsx`<br>- `apps/buyer/src/features/checkout/pages/CheckoutPage.jsx`<br>- `apps/buyer/src/services/order.api.js` | - Cho phép người dùng áp dụng tối đa 3 loại voucher cùng lúc: Voucher sàn, Voucher shop, Mã miễn phí vận chuyển.<br>- Gửi payload `voucher_codes: string[]` lên `POST /checkout` theo đúng schema specs §2.3. |
| `TASK-02-MOCK-CONTROL` | `MOCK-001` | Shared / All | - `shared/utils/api-client.js`<br>- `.env.example`<br>- Các services buyer, seller, admin | - Tắt chế độ tự động fallback mock ngầm khi API trả về lỗi 5xx/4xx.<br>- Hiển thị đúng Error Alert kèm nút Thử lại (Retry) trên giao diện. |
| `TASK-02-ISOLATE-SIM` | `MOCK-002` | Buyer | - `apps/buyer/src/features/checkout/components/VnpaySimulatorModal.jsx` | - Cô lập component simulator vào môi trường test route hoặc chế độ dev rõ ràng, không xuất hiện trong luồng thanh toán thật. |

---

## 3. Rủi Ro & Biện Pháp Phòng Ngừa
- **Rủi ro**: Nếu backend thật chưa deploy cổng thanh toán VNPay, người dùng có thể gặp lỗi khi thanh toán.
- **Biện pháp**: Xử lý đầy đủ 4 trạng thái: Loading, Success, Error, Empty. Có thông báo lỗi rõ ràng và cơ chế thử lại.

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. `POST /checkout` gửi payload hợp lệ với `voucher_codes: string[]`.
2. Không còn lệnh gọi trực tiếp `POST /payments` từ giao diện Checkout.
3. Khi API gateway lỗi, giao diện hiển thị đúng Error state thay vì dữ liệu mock giả tạo.
4. `npm run lint` và build toàn bộ monorepo pass 100%.

---

## 5. Kế Hoạch Kiểm Thử (Test Plan)
- Static code analysis (`npm run lint`).
- Production build remotes & shell (`npm run build:remotes`, shell build).
- Kiểm tra Git diff bảo đảm không sửa ngoài phạm vi 4 tasks trên.
