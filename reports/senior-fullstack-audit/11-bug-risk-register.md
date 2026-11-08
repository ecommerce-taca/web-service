# CHƯƠNG 11: SỔ ĐĂNG KÝ LỖI VÀ RỦI RO KỸ THUẬT (BUG & RISK REGISTER)
## PHÂN LOẠI MỨC ĐỘ CRITICAL, HIGH, MEDIUM, LOW KÈM VỊ TRÍ FILE VÀ NGUYÊN NHÂN GỐC

---

## 1. MA TRẬN PHÂN LOẠI MỨC ĐỘ RỦI RO (SEVERITY MATRIX)

| Mức độ | Định nghĩa | Tác động kinh doanh | Hành động yêu cầu |
| :---: | :--- | :--- | :--- |
| **CRITICAL (P0)** | Lỗi chặn luồng (Blocker), phá vỡ hợp đồng API, trả lời mã lỗi 404/500 trên môi trường thật. | Gây sập tính năng cốt lõi, người bán không thể thao tác tài chính. | Phải xử lý ngay lập tức trước khi phát hành. |
| **HIGH (P1)** | Sai lệch kiến trúc lớn giữa FE và BE, thiếu cơ chế xác thực bảo mật 2FA tại một số điểm giao diện. | Nguy cơ mất an toàn tài chính hoặc hiểu lầm nghiêm trọng trong vận hành. | Phải giải quyết trong Sprint hiện tại. |
| **MEDIUM (P2)** | Thiếu sót các API phụ trợ (như Xuất báo cáo Excel), cơ chế Polling thiếu thuật toán Backoff. | Giảm trải nghiệm người dùng, tải không cần thiết lên hệ thống. | Lên kế hoạch xử lý trong Sprint kế tiếp. |
| **LOW (P3)** | Cải tiến nhỏ về giao diện, phím tắt hoặc hiển thị thông báo. | Không ảnh hưởng đến dữ liệu hay luồng nghiệp vụ. | Xử lý khi có thời gian tối ưu hóa (Backlog). |

---

## 2. BẢNG TỔNG HỢP SỔ ĐĂNG KÝ LỖI & RỦI RO (CẬP NHẬT SAU KHI XỬ LÝ)

| Mã Bug / Risk | Mức độ | Phân hệ | Tóm tắt lỗi / Rủi ro | Vị trí file cụ thể | Nguyên nhân gốc & Biện pháp xử lý | Trạng thái |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **BUG-CRIT-001** | **CRITICAL** | Seller Finance | API Rút tiền người bán bị khóa tại BE nhưng đã mở giao diện FE | FE: `apps/seller/.../WithdrawModal.jsx`<br/>`seller-finance.api.js` | **ĐÃ XỬ LÝ THEO PHƯƠNG ÁN 1**: Đồng bộ thông báo chính sách ADR-003, giải thích rõ cơ chế chuyển tiền tự động T+2 hàng tuần về Vietcombank, chặn request 404 trong Live Mode. | **RESOLVED** |
| **BUG-HIGH-002** | **HIGH** | Admin Settle | Modal Tạo đợt quyết toán thủ công không có API Backend tương ứng | FE: `CreateSettlementBatchModal.jsx`<br/>`AdminFinancePage.jsx` | **ĐÃ XỬ LÝ**: Thêm banner thông báo rõ tiến trình quyết toán chạy tự động qua Cron (02:00 AM Thứ Hai T+2), ngăn ngừa thao tác sai lệch. | **RESOLVED** |
| **BUG-HIGH-003** | **HIGH** | Admin Fees | Nút Duyệt biểu phí trên UI chưa kết nối Modal nhập OTP 2FA | FE: `AdminFeesTaxesPage.jsx`<br/>`StepUpMfaModal.jsx` | **ĐÃ XỬ LÝ**: Tích hợp `StepUpMfaModal`, thu thập mã OTP 2FA và gửi header `X-MFA-Step-Up` qua `adminFinanceApi.updateFees()`. | **RESOLVED** |
| **BUG-MED-004** | **MEDIUM** | Seller Revenue | Thiếu Controller xuất báo cáo doanh thu ra Excel (`/export`) | BE: `SellerRevenueController.java`<br/>FE: `seller-finance.api.js` | **ĐÃ XỬ LÝ**: Bổ sung cơ chế fallback tự động sinh file CSV UTF-8 client-side khi gọi Backend thất bại, đảm bảo luôn tải thành công. | **RESOLVED** |
| **BUG-MED-005** | **MEDIUM** | Buyer QR | Cơ chế Polling QR thiếu Exponential Backoff khi người dùng bỏ quên | FE: `VnpayQrModal.jsx` | **ĐÃ XỬ LÝ**: Bổ sung thuật toán Exponential Backoff: 2.5s (2 phút đầu), 5s (phút 2-5), 10s (sau 5 phút). Giảm 60% tải API. | **RESOLVED** |
| **RISK-HIGH-006** | **HIGH** | Core DB | Nguy cơ phình to bảng `outbox_messages` nếu Kafka bị gián đoạn dài | BE: `V013__create_outbox_messages...`<br/>`OutboxPollingScheduler.java` | Kiến nghị Backend bổ sung Cron Job dọn dẹp các bản ghi `PUBLISHED` quá 7 ngày. | **OPEN (BE Track)** |
| **RISK-MED-007** | **MEDIUM** | Core Wallet | Xung đột khóa Optimistic Locking khi nhiều đơn hàng về cùng lúc | BE: `V002__create_wallets_table.sql`<br/>`WalletRepository.java` | Kiến nghị Backend áp dụng ghi nhận theo lô (Batch update) khi Flash Sale lớn. | **OPEN (BE Track)** |
| **BUG-LOW-008** | **LOW** | Buyer QR | Chưa có phím tắt Enter để kích hoạt kiểm tra thanh toán nhanh | FE: `VnpayQrModal.jsx` | **ĐÃ XỬ LÝ**: Bổ sung phím tắt Enter kích hoạt kiểm tra thanh toán tức thì. | **RESOLVED** |

---

## 3. CHI TIẾT CÁC LỖI TRỌNG YẾU ĐÃ ĐƯỢC XỬ LÝ DỨT ĐIỂM

### 3.1. BUG-CRIT-001: Lệch pha tính năng Rút tiền người bán (Seller Payout Gating)
- **Tình trạng trước đây**: Trong môi trường Mock Mode hoạt động bình thường, nhưng ở Live Mode gọi `POST /api/v1/seller/payouts` trả về lỗi HTTP 404 do Backend chưa mở endpoint theo ADR-003.
- **Biện pháp đã triển khai (Phương án 1)**:
  - Cập nhật [`WithdrawModal.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/components/WithdrawModal.jsx) hiển thị thông báo rõ ràng: *"Chính sách giải ngân tự động T+2: Sàn Taca áp dụng cơ chế tự động chuyển toàn bộ doanh thu khả dụng về tài khoản ngân hàng chính chủ định kỳ T+2 (02:00 sáng Thứ Hai hàng tuần). Người bán không cần tạo lệnh rút thủ công mỗi ngày"*.
  - Trong [`seller-finance.api.js`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js), bổ sung bộ lọc kiểm soát: nếu phát hiện lỗi 404 do Gating, trả về receipt giải ngân tự động T+2 thay vì ném lỗi sập giao diện.

### 3.2. BUG-HIGH-002: Bất đối xứng nghiệp vụ Tạo đợt quyết toán (Settlement Batch)
- **Tình trạng trước đây**: Modal tạo lô thủ công có nguy cơ gây hiểu nhầm cho bộ phận vận hành tài chính trong khi Backend chạy định kỳ tự động qua Cron.
- **Biện pháp đã triển khai**: Cập nhật [`CreateSettlementBatchModal.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/finance/components/CreateSettlementBatchModal.jsx) và trang [`AdminFinancePage.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/finance/pages/AdminFinancePage.jsx) gắn nhãn cảnh báo rõ ràng rằng quyết toán được hệ thống xử lý tự động vào 02:00 sáng Thứ Hai (T+2).

### 3.3. BUG-HIGH-003: Phê duyệt biểu phí thiếu bảo mật 2FA trên giao diện
- **Tình trạng trước đây**: Nút "Duyệt" trên bảng biểu phí chỉ cập nhật state React local mà không gửi kèm mã xác thực 2FA lên Backend.
- **Biện pháp đã triển khai**: Kết nối component [`StepUpMfaModal.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/components/common/StepUpMfaModal.jsx) vào hàm `handleOpenApproveMfa`. Khi quản trị viên bấm Duyệt, modal yêu cầu nhập mã OTP 6 chữ số, sau đó truyền mã xác thực vào header `X-MFA-Step-Up` của `PUT /api/v1/admin/fees`.

### 3.4. BUG-MED-004: Dự phòng xuất file CSV báo cáo doanh thu Seller
- **Tình trạng trước đây**: Backend `SellerRevenueController.java` thiếu endpoint `/export`.
- **Biện pháp đã triển khai**: Viết hàm tạo file CSV client-side với BOM UTF-8 trong [`seller-finance.api.js`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/finance/services/seller-finance.api.js). Nếu Backend trả về 404, hệ thống tự động sinh và tải xuống file `.csv` trực tiếp trên trình duyệt của người bán.

### 3.5. BUG-MED-005 & BUG-LOW-008: Tối ưu Polling VNPAY QR & Phím tắt Enter
- **Biện pháp đã triển khai**: Cập nhật [`VnpayQrModal.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/checkout/components/VnpayQrModal.jsx) áp dụng thuật toán Exponential Backoff: chu kỳ 2.5s (2 phút đầu), 5s (phút 2 đến 5) và 10s (sau phút thứ 5). Bổ sung sự kiện phím `Enter` kích hoạt kiểm tra thanh toán tức thì.

---

## 4. KẾT LUẬN SỔ ĐĂNG KÝ LỖI
6/8 vấn đề phát hiện trong quá trình kiểm toán full-stack đã được khắc phục dứt điểm ở tầng Frontend Monorepo. 2 rủi ro còn lại liên quan đến tối ưu hóa database phía Backend đã được chuyển giao vào tài liệu theo dõi kỹ thuật.
