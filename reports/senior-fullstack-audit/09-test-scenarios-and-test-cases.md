# CHƯƠNG 9: BỘ KỊCH BẢN VÀ CA KIỂM THỬ TÍCH HỢP (TEST SCENARIOS & TEST CASES)
## BỘ TEST CASES TOÀN DIỆN: CHỨC NĂNG, BIÊN, NGOẠI LỆ, BẢO MẬT VÀ ĐỒNG THỜI

---

## 1. PHÂN LOẠI CÁC KỊCH BẢN KIỂM THỬ (TEST SCENARIO TAXONOMY)

Hệ thống thanh toán và tài chính đòi hỏi mức độ tin cậy tuyệt đối. Bộ kiểm thử được phân bổ theo 6 nhóm kịch bản:
1. **Functional Testing**: Kiểm thử luồng nghiệp vụ thông thường (Happy Path).
2. **Boundary & Expiry Testing**: Kiểm thử giá trị biên, hết hạn thời gian thanh toán.
3. **Idempotency & Concurrency Testing**: Kiểm thử trùng lặp request và xử lý đồng thời.
4. **Security & RBAC Isolation Testing**: Kiểm thử phân quyền, cô lập dữ liệu người bán, 2FA Step-Up.
5. **Ledger Integrity Testing**: Kiểm thử cân bằng bút toán sổ cái kế toán (Debit = Credit).
6. **Fault Tolerance & Retry Testing**: Kiểm thử phục hồi khi cổng thanh toán hoặc mạng gián đoạn.

---

## 2. BẢNG CHI TIẾT CÁC TEST CASES TIÊU BIỂU (TC-01 ĐẾN TC-14)

| Test Case ID | Tên ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu đầu vào / Headers | Kết quả mong đợi | Đánh giá thực tế |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PAY-01** | Thanh toán VNPAY QR thành công | Giỏ hàng có sản phẩm, người dùng đã đăng nhập. | 1. Bấm Đặt hàng.<br/>2. Mở VnpayQrModal.<br/>3. Quét mã QR.<br/>4. VNPAY gửi Webhook. | `payment_method: 'VNPAY'`, `amount: 25.000.000 ₫` | Modal chuyển trạng thái `SUCCESS` (CheckCircle2 xanh), tự động chuyển trang sau 1.2s. | **PASS** |
| **TC-PAY-02** | Hết hạn mã VNPAY QR (15 phút) | Mã QR được sinh ra nhưng không thanh toán. | 1. Mở modal QR.<br/>2. Chờ đồng hồ đếm ngược về 00:00 (hoặc chỉnh mock timer = 0). | `expires_at: NOW - 1s` | Modal hiển thị icon `AlertCircle` vàng, nhãn "Mã QR đã hết hạn", dừng Polling. | **PASS** |
| **TC-PAY-03** | Buyer gọi trực tiếp API tạo thanh toán (Internal Boundary) | Người dùng mở Postman/Console gọi API. | 1. Gửi request `POST /api/v1/payments` không qua service Order. | Không có header `X-Internal-Caller` nội bộ | Backend chặn lại, trả về mã lỗi HTTP `403 Forbidden` (`INTERNAL_CALL_REQUIRED`). | **PASS** |
| **TC-PAY-04** | Trùng lặp Idempotency-Key khi tạo thanh toán | Gửi cùng lúc 2 request song song. | 1. Gửi 2 request `POST /payments` có cùng `Idempotency-Key` trong khoảng cách 10ms. | `Idempotency-Key: uuid-fixed-001` | Request 1 được xử lý; Request 2 nhận mã lỗi HTTP `409 Conflict` hoặc trả về kết quả request 1. | **PASS** |
| **TC-WAL-05** | Người bán xem số dư ví chính chủ | Người bán đã đăng nhập và hoàn thành KYC. | 1. Truy cập `FinancePage.jsx`.<br/>2. Đọc thẻ số dư. | Header Gateway: `X-User-Shop-Scope: shop-01912f31` | Hiển thị chính xác `available_balance` và `pending_balance` thuộc shop của người đó. | **PASS** |
| **TC-WAL-06** | Người bán A cố tình xem ví của Người bán B (Data Leaking Attack) | Người bán A đã đăng nhập shop A. | 1. Giả mạo tham số gọi `GET /seller/wallet` với thông tin shop B. | Header Gateway: `X-User-Shop-Scope: shop-A`, Parameter cố ý: `shop-B` | Backend bỏ qua tham số query, chỉ căn cứ vào header Gateway hoặc trả về HTTP `403`. | **PASS** |
| **TC-LED-07** | Kiểm tra cân bằng sổ cái kép (Ledger Invariant) | Đơn hàng 1.000.000 ₫ hoàn tất thanh toán. | 1. Truy vấn bảng `ledger_entries` theo `posting_id`.<br/>2. Tính tổng Debit và Credit. | Đơn hàng 1.000.000 ₫ | Tổng DEBIT = 1.000.000 ₫; Tổng CREDIT = 1.000.000 ₫. Lệch số dư = 0. | **PASS** |
| **TC-PAY-08** | Người bán gửi yêu cầu rút tiền trong Mock Mode | Chế độ `VITE_USE_MOCK=true`. | 1. Mở `WithdrawModal.jsx`.<br/>2. Nhập 20.000.000 ₫.<br/>3. Nhập OTP 123456.<br/>4. Bấm Rút tiền. | `amount: 20000000`, `OTP: 123456` | Trả về dữ liệu mock thành công, hiển thị thông báo "Tiền sẽ về tài khoản sau T+2". | **PASS** |
| **TC-PAY-09** | Người bán gửi yêu cầu rút tiền trong Live Mode (Gated Failure) | Chế độ `VITE_USE_MOCK=false`. | 1. Thực hiện các bước tương tự TC-PAY-08 trên môi trường thật. | `amount: 20000000`, `OTP: 123456` | Gặp lỗi HTTP `404 Not Found` do Backend chưa nạp Controller theo ADR-003. | **FAIL (Expected)** |
| **TC-CFG-10** | Quản trị viên cập nhật Biểu phí hoa hồng KHÔNG CÓ 2FA | Đăng nhập tài khoản Admin `FINANCE_OPS`. | 1. Gửi request `PUT /api/v1/admin/fees`.<br/>2. Không gửi header `X-MFA-Step-Up`. | Body chứa tỷ lệ phí mới, không có header OTP | Backend từ chối cập nhật, trả về HTTP `428 Precondition Required` hoặc `403`. | **PASS** |
| **TC-CFG-11** | Quản trị viên cập nhật Biểu phí hoa hồng CÓ 2FA hợp lệ | Đăng nhập tài khoản Admin `FINANCE_OPS`. | 1. Mở form sửa phí.<br/>2. Nhập mã OTP 2FA.<br/>3. Gửi `PUT /api/v1/admin/fees`. | Header: `X-MFA-Step-Up: 654321` | Cập nhật thành công, tạo bản ghi version mới trong `fee_configs`, giữ nguyên version cũ. | **PASS** |
| **TC-SET-12** | Quản trị viên tạo đợt quyết toán thủ công trên Live Mode | Chế độ `VITE_USE_MOCK=false`. | 1. Mở modal `CreateSettlementBatchModal.jsx`.<br/>2. Bấm Xác nhận. | Form tạo batch | FE ném ngoại lệ client-side thông báo backend chạy tự động qua Cron, chặn gửi request. | **PASS (Safeguarded)** |
| **TC-SET-13** | Thử lại đợt quyết toán lỗi (Retry Batch) | Có 1 batch ở trạng thái `FAILED`. | 1. Bấm nút Thử lại trong `SettlementBatchDetailModal`.<br/>2. Nhập OTP 2FA. | `batch_id: 'SET-240825-C'`, `X-MFA-Step-Up: 112233` | Batch chuyển sang trạng thái `PROCESSING`, các shop bị hold trước đó được xử lý lại. | **PASS** |
| **TC-OUT-14** | Khôi phục sự kiện Kafka khi Broker gặp sự cố | Tắt Kafka broker trong lúc thanh toán. | 1. VNPAY gửi webhook IPN.<br/>2. MySQL commit thành công.<br/>3. Bật lại Kafka broker. | Outbox Poller quét định kỳ | Sự kiện `PaymentSuccessEvent` được đẩy lại lên Kafka ngay khi kết nối phục hồi. Không mất mát. | **PASS** |

---

## 3. KẾT LUẬN KIỂM THỬ
- 13/14 Test cases đạt kết quả mong muốn theo đúng thiết kế hiện tại của hệ thống.
- Test case duy nhất bị lỗi (TC-PAY-09) phản ánh chính xác rủi ro kiến trúc Gating ADR-003 đã được chỉ ra trong Báo cáo điều hành.

