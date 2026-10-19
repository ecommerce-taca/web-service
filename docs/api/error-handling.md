# Tiêu Chuẩn Xử Lý Lỗi & Trạng Thái Giao Diện (Error Handling Standard)

> **Phạm vi:** Quy chuẩn xử lý lỗi, phân loại mã lỗi từ API Gateway/Microservices và hướng dẫn hiển thị 4 trạng thái giao diện bắt buộc trên toàn hệ thống Taca Ecommerce.  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/api-gateway-docs/docs/api/api-gateway.md` và `shared/utils/api-client.js`.

---

## 1. Cấu Trúc Envelope Lỗi Chuẩn

Mọi phản hồi lỗi từ hệ thống gửi về Client đều tuân thủ cấu trúc envelope:

```json
{
  "error": {
    "code": "ORDER_STOCK_UNAVAILABLE",
    "message": "Sản phẩm bạn chọn hiện đã hết hàng hoặc không đủ số lượng.",
    "details": [
      {
        "field": "quantity",
        "issue": "MAX_STOCK_EXCEEDED",
        "requested": 5,
        "available": 2
      }
    ],
    "trace_id": "01912f65-7a1b-7c12-9c55-8b1c34a6d921"
  }
}
```

- **`code`**: Chuỗi định danh mã lỗi bằng chữ in hoa phân tách bởi dấu gạch dưới (dùng để kiểm tra điều kiện rẽ nhánh).
- **`message`**: Câu thông báo bằng tiếng Việt tự nhiên, phù hợp để hiển thị trực tiếp cho người dùng.
- **`details`**: Chi tiết các trường dữ liệu không hợp lệ (hỗ trợ hiển thị lỗi dưới chân từng ô input).
- **`trace_id`**: Mã định danh sự cố duy nhất (UUIDv7) giúp tra cứu log hệ thống khi người dùng báo cáo lỗi.

---

## 2. Bảng Mã Lỗi Chuẩn Của API Gateway

| Mã Lỗi (Code) | HTTP Status | Ý Nghĩa Kỹ Thuật | Hành Động Xử Lý Phía Frontend |
| :--- | :---: | :--- | :--- |
| `GATEWAY_INVALID_REQUEST` | 400 | Dữ liệu gửi lên sai định dạng hoặc thiếu trường bắt buộc | Hiển thị thông báo form lỗi; kiểm tra lại payload |
| `GATEWAY_AUTH_REQUIRED` | 401 | Yêu cầu cần đăng nhập nhưng không có Bearer token | Mở Login Modal hoặc điều hướng về trang đăng nhập |
| `GATEWAY_TOKEN_INVALID` | 401 | Chữ ký JWT sai, token giả mạo | Xóa session lưu trữ và yêu cầu đăng nhập lại |
| `GATEWAY_TOKEN_EXPIRED` | 401 | Access token hết hạn | `api-client.js` tự động kích hoạt Silent Refresh |
| `GATEWAY_PERMISSION_DENIED` | 403 | Tài khoản không đủ quyền (Role/Permission) | Hiển thị trang/modal cảnh báo "Không có quyền truy cập" |
| `GATEWAY_RATE_LIMITED` | 429 | Gửi quá nhiều request trong thời gian ngắn | Hiển thị Toast: "Thao tác quá nhanh, vui lòng thử lại sau X giây" |
| `GATEWAY_UPSTREAM_TIMEOUT` | 504 | Dịch vụ backend phản hồi quá thời gian quy định | Hiển thị nút "Thử lại" (Retry Action) |
| `GATEWAY_UPSTREAM_UNAVAILABLE` | 503 | Dịch vụ tạm thời ngắt kết nối hoặc Circuit Breaker mở | Hiển thị thông báo hệ thống đang bảo trì, kèm nút làm mới |

---

## 3. Bảng Mã Lỗi Nghiệp Vụ Miền (Domain Business Errors)

### 3.1 Xác thực & Tài khoản (`user-auth-service`)
- `AUTH_INVALID_CREDENTIALS`: Email hoặc mật khẩu không chính xác.
- `AUTH_EMAIL_ALREADY_EXISTS`: Địa chỉ email này đã được sử dụng.
- `AUTH_PHONE_ALREADY_EXISTS`: Số điện thoại đã được liên kết với tài khoản khác.
- `AUTH_OTP_INVALID`: Mã OTP không chính xác.
- `AUTH_OTP_EXPIRED`: Mã OTP đã quá thời hạn hiệu lực (thường sau 2 phút).
- `AUTH_ACCOUNT_LOCKED`: Tài khoản bị tạm khóa do vi phạm chính sách sàn.

### 3.2 Giỏ hàng, Đặt hàng & Khuyến mãi (`order-commerce-service`)
- `ORDER_STOCK_UNAVAILABLE`: Sản phẩm hoặc biến thể SKU không đủ số lượng tồn kho.
- `ORDER_PRICE_CHANGED`: Đơn giá sản phẩm đã thay đổi trong khi đang checkout (yêu cầu xác nhận lại).
- `ORDER_VOUCHER_EXPIRED`: Mã giảm giá đã hết hạn sử dụng.
- `ORDER_VOUCHER_MIN_SPEND_NOT_MET`: Chưa đạt giá trị đơn hàng tối thiểu để áp dụng mã.
- `ORDER_CANNOT_CANCEL`: Đơn hàng đã bàn giao cho đơn vị vận chuyển, không thể hủy trực tiếp.

### 3.3 Thanh toán & Ví (`payment-wallet-service`)
- `PAYMENT_EXPIRED`: Phiên thanh toán VNPAY QR đã hết hạn (sau 15 phút), hiển thị nút "Tạo lại mã QR".
- `PAYMENT_ALREADY_COMPLETED`: Giao dịch này đã được thanh toán thành công trước đó.
- `WALLET_INSUFFICIENT_BALANCE`: Số dư khả dụng trong ví không đủ để thực hiện yêu cầu rút tiền.
- `WALLET_BANK_ACCOUNT_UNVERIFIED`: Tài khoản ngân hàng chưa được phê duyệt, không thể rút tiền.

### 3.4 Định danh KYC Nhà bán (`apps/seller`, `apps/admin`)
- `KYC_ALREADY_SUBMITTED`: Hồ sơ đang trong hàng đợi chờ duyệt, không thể gửi trùng lặp.
- `KYC_DOCUMENT_BLURRY`: Ảnh chụp giấy tờ mờ lóa, yêu cầu chụp lại góc nghiêng rõ nét.

---

## 4. Xử Lý 4 Trạng Thái Bắt Buộc Trong Mọi Component

Mọi màn hình hoặc khối tính năng trong dự án **bắt buộc phải cài đặt đầy đủ 4 trạng thái giao diện**:

```jsx
// Mô hình xử lý chuẩn trong React Component
if (isLoading) {
  return <SkeletonLoader />; // 1. LOADING STATE
}

if (error) {
  return <ErrorAlert message={error.message} onRetry={fetchData} />; // 2. ERROR STATE
}

if (!data || data.length === 0) {
  return <EmptyState title="Chưa có dữ liệu" ctaText="Khám phá ngay" onAction={...} />; // 3. EMPTY STATE
}

return <DataPresentation data={data} />; // 4. SUCCESS STATE
```

### Tiêu chuẩn chi tiết cho từng trạng thái:
1. **Loading State**:
   - Sử dụng **Skeleton** mô phỏng hình dạng giao diện thực tế (thay vì chỉ hiển thị spinner tròn đơn điệu), giúp giảm cảm giác chờ đợi cho người dùng.
2. **Success State**:
   - Hiển thị dữ liệu chính xác, hỗ trợ chuyển đổi mượt mà (transitions).
3. **Empty State**:
   - Bắt buộc có: **Hình minh họa (Illustration / Lucide Icon)** + **Tiêu đề rõ ràng** + **Mô tả ngắn gọn** + **Nút kêu gọi hành động (CTA Button)** hướng dẫn người dùng tiếp tục (ví dụ: giỏ hàng trống có nút "Tiếp tục mua sắm").
4. **Error State**:
   - Hiển thị thông báo lỗi thân thiện, không bao giờ để màn hình trắng (Blank page).
   - **Luôn cung cấp nút "Thử lại" (Retry Button)** để người dùng tải lại dữ liệu mà không cần phải F5 toàn bộ trang web.

---

## 5. Kiến Trúc Cô Lập Sự Cố (Fault Isolation & Error Boundaries)

1. **Bảo vệ toàn cục (`RemoteErrorBoundary.jsx` tại `apps/shell`)**:
   - Mỗi Remote Micro-App (`buyer`, `seller`, `admin`) được bọc bởi một `RemoteErrorBoundary`.
   - Nếu Kênh Người Bán (Seller) gặp sự cố runtime nghiêm trọng, chỉ Kênh Người Bán hiển thị thẻ báo lỗi; Khách hàng ở Storefront và Admin vẫn tiếp tục hoạt động bình thường trên cùng domain.
2. **Bảo vệ cấp độ Component (`shared/ui-components/ErrorBoundary`)**:
   - Dùng để bọc các widget phức tạp (ví dụ ma trận biến thể SKU, widget bản đồ, biểu đồ doanh thu).
