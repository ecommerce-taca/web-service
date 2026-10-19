# Payment & Wallet Service API Specification

> **Dịch vụ Upstream:** `payment-wallet-service` (Port nội bộ `8085`)  
> **Prefix Gateway:** `/api/v1/payments/**`, `/api/v1/seller/wallet/**`, `/api/v1/seller/revenue/**`, `/api/v1/admin/finance/**`, `/api/v1/admin/fees/**`, `/api/v1/admin/taxes/**`, `/api/v1/admin/settlements/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/payment-wallet-docs/docs/api/payment-wallet.md`

---

## 1. Cổng Thanh Toán Trực Tuyến VNPAY QR (Payment Gateway)

### 1.1 `POST /payments/vnpay/create-qr` (Tạo phiên thanh toán QR)
- **Quyền:** Authenticated Buyer
- **Body:**
  ```json
  {
    "orderId": "ord-01912f31",
    "amount": 29390000,
    "paymentMethod": "VNPAY_QR"
  }
  ```
- **Response 201:**
  ```json
  {
    "data": {
      "paymentId": "pay-01912f31-7777",
      "qrContent": "00020101021238540010A000000727012400069704540112...",
      "qrImageUrl": "https://api.vietqr.io/image/970454-123456789-compact.png?amount=29390000",
      "expiresAt": "2026-10-14T17:45:00Z"
    }
  }
  ```

### 1.2 `GET /payments/{paymentId}` (Polling kiểm tra kết quả)
- **Cơ chế:** Frontend thực hiện Polling lặp lại mỗi 2-3 giây sau khi mở Modal QR.
- **Response 200 (Thành công):**
  ```json
  {
    "data": {
      "paymentId": "pay-01912f31-7777",
      "status": "SUCCESS",
      "bankCode": "NCB",
      "transactionNo": "14567892",
      "paidAt": "2026-10-14T17:35:10Z"
    }
  }
  ```
- **Các trạng thái trả về:**
  - `PENDING`: Đang chờ người dùng quét mã thanh toán trên ứng dụng ngân hàng.
  - `SUCCESS`: Thanh toán thành công (FE chuyển màn hình sang Đặt hàng hoàn tất).
  - `FAILED`: Giao dịch bị ngân hàng từ chối.
  - `EXPIRED`: Mã QR hết hạn (sau 15 phút), hiển thị nút "Tạo lại mã".

---

## 2. Ví Tiền & Tài Chính Người Bán (Seller Wallet & Payouts)

### 2.1 `GET /seller/wallet/balance`
- **Response 200:**
  ```json
  {
    "data": {
      "availableBalance": 45800000,
      "pendingBalance": 12500000,
      "totalEarnings": 185000000,
      "currency": "VND"
    }
  }
  ```
  - `availableBalance`: Số dư khả dụng có thể rút ngay.
  - `pendingBalance`: Tiền đang tạm giữ đối soát (đơn hàng đang giao hoặc trong thời hạn đổi trả 7 ngày).

### 2.2 `GET /seller/wallet/transactions`
- Lịch sử biến động dòng tiền: Doanh thu đơn hàng hoàn tất (+), Phí sàn (-), Khấu trừ thuế (-), Lệnh rút tiền (-).

### 2.3 `POST /seller/wallet/withdraw` (Yêu cầu rút tiền)
- **Body:** `{ amount: 20000000, bankAccountId: "bnk-01912" }`
- **Ràng buộc:** Số tiền yêu cầu rút không được vượt quá `availableBalance`.

### 2.4 `GET /seller/revenue/report` & `GET /seller/revenue/export`
- Báo cáo biểu đồ doanh thu theo ngày/tháng và xuất dữ liệu báo cáo kế toán ra file Excel/CSV.

---

## 3. Quản Trị Tài Chính Sàn (Admin Finance Portal)

- `GET /admin/finance/fees` & `POST /admin/finance/fees`: Quản lý danh mục biểu phí hoa hồng sàn theo ngành hàng.
- `GET /admin/finance/taxes`: Quản lý quy tắc khấu trừ thuế GTGT/TNCN người bán.
- `GET /admin/finance/settlements`: Danh sách các đợt đối soát chi trả tiền cho người bán định kỳ (Settlement Batches).
- `POST /admin/finance/settlements/{batchId}/execute`: Chạy lệnh chi trả quyết toán hàng loạt qua cổng liên ngân hàng.
