# Quy Chuẩn Giao Tiếp Dữ Liệu API (API Contract Specification)

> **Phạm vi:** Định nghĩa cấu trúc gửi nhận dữ liệu chuẩn giữa các ứng dụng Frontend (`Buyer`, `Seller`, `Admin`) và Backend thông qua **API Gateway**.  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/api-gateway-docs/docs/api/api-gateway.md` và `shared/utils/api-client.js`.

---

## 1. Cấu Trúc Request Chuẩn

Mọi yêu cầu gửi từ Frontend lên Gateway bắt buộc tuân thủ:

### 1.1 Headers Bắt Buộc
```http
Content-Type: application/json; charset=utf-8
Accept: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>   # (Bắt buộc với protected routes)
X-Request-ID: <UUIDv7>                     # (Tự động tạo bởi shared/utils/api-client.js nếu client không gửi)
```

### 1.2 Base URL & Proxy Routing
- Trong môi trường phát triển (Dev): Client gửi tới `/api/...`, Vite dev server proxy trực tiếp về địa chỉ API Gateway (mặc định `http://localhost:8081`).
- Gateway thực hiện strip tiền tố và chuyển tiếp nguyên dạng sang `/api/v1/...` của các Microservices upstream.

---

## 2. Quy Chuẩn Phản Hồi (Response Envelope Standards)

### 2.1 Phản hồi Thành Công (Success Response)

#### Dạng Thực Thể Đơn (Single Object):
```json
{
  "data": {
    "id": "usr-01912f31-7a1b-7c12",
    "email": "user@taca.vn",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://cdn.taca.vn/avatars/user1.jpg",
    "role": "BUYER",
    "createdAt": "2026-08-30T09:00:00Z"
  }
}
```

#### Dạng Danh Sách Phân Trang (Paginated List):
```json
{
  "data": [
    {
      "id": "prd-01912f31-88bc",
      "name": "Apple iPhone 16 Pro Max 256GB",
      "price": 29490000,
      "originalPrice": 34990000,
      "rating": 4.9,
      "reviewCount": 1284,
      "thumbnail": "https://cdn.taca.vn/products/ip16.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2.2 Phản hồi Thất Bại (Error Response Envelope)

Toàn bộ lỗi từ API Gateway hoặc Microservices upstream đều được chuẩn hóa theo định dạng envelope:

```json
{
  "error": {
    "code": "ORDER_STOCK_UNAVAILABLE",
    "message": "Sản phẩm iPhone 16 Pro Max 256GB hiện không đủ tồn kho.",
    "details": [
      {
        "field": "sku_id",
        "issue": "OUT_OF_STOCK",
        "requested": 2,
        "available": 0
      }
    ],
    "trace_id": "01912f65-7a1b-7c12-9c55-8b1c34a6d921"
  }
}
```

- **`code`**: Chuỗi mã lỗi định danh duy nhất (dùng để switch-case xử lý UI/i18n).
- **`message`**: Thông điệp lỗi bằng tiếng Việt thân thiện với người dùng, có thể hiển thị trực tiếp lên Toast / Alert.
- **`details`**: Mảng mô tả lỗi validation chi tiết theo từng trường (dùng để highlight input border màu đỏ trong Form).
- **`trace_id`**: Mã UUID định danh phiên request, được ghi nhận vào nhật ký sự cố khi người dùng bấm gửi yêu cầu hỗ trợ.

---

## 3. Các Luồng Dữ Liệu Nghiệp Vụ Trọng Tâm (Key Domain Contracts)

### 3.1 Luồng Giỏ Hàng & Checkout (Cart & Order Commerce)

#### 1. Thêm vào giỏ (`POST /cart/items`):
- **Request Body**:
  ```json
  {
    "productId": "prd-01912f31-88bc",
    "skuId": "sku-ip16-titan-256gb",
    "quantity": 1
  }
  ```
- **Response**: Trả về chi tiết item giỏ hàng mới cập nhật.

#### 2. Xem trước Đặt hàng (`POST /checkout/preview`):
- **Request Body**:
  ```json
  {
    "items": [{ "skuId": "sku-ip16-titan-256gb", "quantity": 1 }],
    "shippingAddressId": "addr-01912f31",
    "voucherCodes": ["FREESHIP50K", "TECHDEAL100"]
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "subtotal": 29490000,
      "shippingFee": 40000,
      "discountShipping": 40000,
      "discountVoucher": 100000,
      "totalAmount": 29390000,
      "estimatedDeliveryDate": "2026-10-18T12:00:00Z"
    }
  }
  ```

#### 3. Khởi tạo đơn hàng (`POST /orders`):
- Tạo đơn với trạng thái ban đầu `PENDING_PAYMENT`.

---

### 3.2 Luồng Thanh Toán VNPAY QR (Payment Integration)

#### 1. Tạo phiên thanh toán QR (`POST /payments/vnpay/create-qr`):
- **Request Body**:
  ```json
  {
    "orderId": "ord-01912f31-9999",
    "amount": 29390000,
    "paymentMethod": "VNPAY_QR"
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "paymentId": "pay-01912f31-7777",
      "qrContent": "00020101021238540010A000000727012400069704540112...",
      "qrImageUrl": "https://api.vietqr.io/image/970454-123456789-compact.png?amount=29390000",
      "expiresAt": "2026-10-14T17:30:00Z",
      "retryCount": 0
    }
  }
  ```

#### 2. Kiểm tra trạng thái thanh toán (`GET /payments/{paymentId}`):
- Client thực hiện Polling định kỳ mỗi 2-3 giây (tối đa trong 15 phút):
- **Response khi thanh toán thành công**:
  ```json
  {
    "data": {
      "paymentId": "pay-01912f31-7777",
      "status": "SUCCESS",
      "bankCode": "NCB",
      "transactionNo": "14567892",
      "paidAt": "2026-10-14T17:15:32Z"
    }
  }
  ```
- **Quy tắc bảo mật bất biến**: Chỉ chuyển màn hình đơn hàng sang trạng thái `CONFIRMED` khi nhận được `status === "SUCCESS"` từ API này. Tuyệt đối không tự kích hoạt thành công trên Client.

---

### 3.3 Luồng Onboarding & KYC Người Bán (Merchant KYC Contract)

#### Tải tài liệu định danh (`POST /seller/onboarding/kyc`):
- **Request (Multipart Form / Base64)**:
  ```json
  {
    "businessType": "INDIVIDUAL",
    "idCardNumber": "079201001234",
    "fullName": "Trần Thị B",
    "frontImageUrl": "https://storage.taca.vn/kyc/front-01912.jpg",
    "backImageUrl": "https://storage.taca.vn/kyc/back-01912.jpg",
    "taxCode": "845123998"
  }
  ```
- **Response**: Trạng thái hồ sơ chuyển sang `PENDING`.

---

### 3.4 Luồng Phê duyệt KYC Admin (`POST /admin/kyc/requests/{id}/reject`)
- **Request Bắt buộc Lý do**:
  ```json
  {
    "reasonCode": "DOCUMENT_BLURRY",
    "note": "Ảnh mặt sau CCCD bị lóa sáng, không đọc được ngày cấp. Vui lòng chụp lại."
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "kyc-01912",
      "status": "REJECTED",
      "rejectedAt": "2026-10-14T17:20:00Z",
      "rejectedBy": "admin@taca.vn"
    }
  }
  ```

---

## 4. Xử Lý Fallback Ngoại Tuyến (Offline & Graceful Degradation)

1. **Địa phương Việt Nam (`location.api.js`)**:
   - Nếu Gateway gọi `/locations/vn/provinces` gặp lỗi `503` hoặc timeout, API service tự động nạp dữ liệu từ file tĩnh `shared/utils/vietnam-address.json` (63 tỉnh thành, đầy đủ quận/huyện, phường/xã) đảm bảo người dùng luôn điền được địa chỉ nhận hàng.
2. **Trạng thái Realtime Seller (`useSellerRealtimeStatus.js`)**:
   - Nếu kết nối Server-Sent Events (SSE) bị gián đoạn, client tự động kích hoạt polling nhẹ mỗi 30 giây để duy trì số liệu thông báo trên Header.
