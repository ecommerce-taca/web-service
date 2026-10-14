# Seller Dashboard — Engineering Rules

## 1. VAI TRÒ & PHẠM VI

`apps/seller` là **Merchant Dashboard Portal** dành riêng cho các nhà bán hàng quản lý shop, danh mục sản phẩm, đơn hàng, tài chính và thiết lập kinh doanh trên Taca Ecommerce.

- **Port phát triển**: `5175`
- **Prefix Route**: `/seller/*` (qua Shell Host)
- **Expose Federation**: `./App` trỏ vào `./src/app/App.jsx`
- **Mục tiêu**: Cung cấp giao diện quản trị cửa hàng chuyên nghiệp, xử lý nghiệp vụ bán hàng phức tạp với độ chính xác cao về trạng thái, tồn kho, tiền tệ và biểu mẫu đa bước.

---

## 2. CẤU TRÚC TÍNH NĂNG (FEATURE-BASED ARCHITECTURE)

Toàn bộ mã nguồn theo domain của Seller đặt tại `src/features/<feature_name>/`:

```text
apps/seller/src/features/
├── dashboard/     # Bảng điều khiển kinh doanh, số liệu thống kê, biểu đồ, cảnh báo realtime
├── finance/       # Ví người bán, số dư khả dụng, đóng băng, lịch sử dòng tiền, rút tiền
├── onboarding/    # Luồng kích hoạt shop 4 bước (Hồ sơ, Định danh KYC, Ngân hàng, Kho hàng)
├── orders/        # Quản lý đơn hàng, xác nhận đơn, in vận đơn, giao hàng cho đơn vị vận chuyển
├── products/      # Quản lý danh mục hàng hóa, bộ tạo ma trận SKU biến thể, import sản phẩm
├── settings/      # Cấu hình cửa hàng, thông tin pháp lý, kết nối ngân hàng, thiết lập vận chuyển
└── vouchers/      # Khuyến mãi của shop, tạo mã voucher theo phần trăm / tiền mặt
```

---

## 3. QUY TẮC NGHIỆP VỤ & STATE MANAGEMENT

1. **Quy trình Onboarding & KYC Nhà Bán Hàng**:
   - Shop mới đăng ký phải hoàn thiện quy trình Onboarding 4 bước: `ProfileStep` ➔ `KycStep` ➔ `BankStep` ➔ `WarehouseStep`.
   - Trạng thái KYC tuân thủ state machine: `NOT_SUBMITTED` ➔ `PENDING` ➔ `APPROVED` hoặc `REJECTED`.
   - Nếu bị từ chối (`REJECTED`), giao diện phải hiển thị rõ lý do từ Admin và cho phép cập nhật lại tài liệu mà không làm mất thông tin cũ.

2. **Bộ tạo ma trận biến thể sản phẩm (SKU Matrix Generator)**:
   - Trong `ProductEditorModal`: Tách bạch các bước `BasicInfoStep`, `AttributesStep`, `SkuMatrixStep`, `ShippingStep`.
   - Khi người dùng thêm các thuộc tính (màu sắc, dung lượng...), ma trận SKU phải tự động tính toán tổ hợp `Cartesian product`, bảo toàn giá trị tồn kho và giá bán của các SKU đã nhập trước đó.

3. **Cập nhật trạng thái Realtime (SSE / Realtime Service)**:
   - Sử dụng `src/services/seller-realtime.service.js` và hook `src/hooks/useSellerRealtimeStatus.js` để lắng nghe sự kiện Server-Sent Events (SSE).
   - Đảm bảo tự động dọn dẹp listener/connection khi component unmount để tránh rò rỉ bộ nhớ (memory leaks).

4. **Quản lý Tài chính & Rút tiền**:
   - `WithdrawModal.jsx` phải kiểm tra số dư khả dụng so với số tiền yêu cầu rút và tài khoản ngân hàng thụ hưởng đã xác thực. Tuyệt đối không cho phép gửi request rút tiền vượt quá số dư khả dụng.

---

## 4. QUY TẮC GIAO DIỆN & LAYOUT

1. **Layout Chuẩn**:
   - Sử dụng `SellerLayout` (`src/components/layout/SellerLayout.jsx`) kết hợp `SellerHeader` và `SellerNav`.
   - Không được tạo các layout thừa như `BuyerLayout` trong Seller.
2. **Icons & Primitives**:
   - 100% icon phải dùng từ `lucide-react`.
   - Các UI primitives (`Button`, `Input`, `Modal`, `Badge`) phải nhập từ thư viện chia sẻ `@taca/ui-components`.
   - Trạng thái thẻ chỉ số dùng component `StatusBadge` và `MetricCard` trong `src/components/common/`.

---

## 5. KIỂM TRA CHẤT LƯỢNG TRƯỚC KHI BÀN GIAO

- Lệnh kiểm tra bắt buộc:
  ```bash
  npm run lint -w @taca/seller
  npm run build -w @taca/seller
  ```
- Kiểm tra validation của tất cả các form: bắt buộc xử lý disabled state khi đang gửi request, hiển thị thông báo lỗi thân thiện nếu API gateway trả về lỗi validation.
