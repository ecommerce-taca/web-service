# Buyer Storefront — Engineering Rules

## 1. VAI TRÒ & PHẠM VI

`apps/buyer` là **Storefront Application** dành cho khách hàng mua sắm trên nền tảng Taca Ecommerce.

- **Port phát triển**: `5174`
- **Prefix Route**: `/*` (Gốc của hệ thống qua Shell Host)
- **Expose Federation**: `./App` trỏ vào `./src/app/App.jsx`
- **Mục tiêu**: Cung cấp trải nghiệm mua sắm nhanh, mượt mà, tối ưu Core Web Vitals (LCP, INP, CLS), hỗ trợ đầy đủ responsive từ thiết bị di động đến màn hình lớn.

---

## 2. CẤU TRÚC TÍNH NĂNG (FEATURE-BASED ARCHITECTURE)

Mọi mã nguồn nghiệp vụ của Buyer phải nằm trong `src/features/<feature_name>/`:

```text
apps/buyer/src/features/
├── account/       # Thông tin cá nhân, sổ địa chỉ, đăng ký trở thành người bán
├── auth/          # Đăng nhập, đăng ký tài khoản khách hàng, OTP
├── cart/          # Quản lý giỏ hàng (CartProvider context, mini-cart, giỏ hàng chi tiết)
├── checkout/      # Đặt hàng, chọn địa chỉ giao nhận, tính phí ship, thanh toán (COD, VNPAY QR)
├── home/          # Trang chủ, Hero banner carousel, danh mục nổi bật, flash deal
├── orders/        # Lịch sử đơn hàng, chi tiết trạng thái đơn, nút thanh toán lại (Retry Payment)
└── products/      # Danh mục sản phẩm, bộ lọc linh hoạt, trang tìm kiếm, chi tiết sản phẩm
```

---

## 3. QUY TẮC NGHIỆP VỤ & STATE MANAGEMENT

1. **Giỏ hàng (Cart State)**:
   - Sử dụng `CartProvider` (`features/cart/contexts/CartProvider.jsx`) làm nguồn chân lý duy nhất cho dữ liệu giỏ hàng phía Buyer.
   - Luôn hỗ trợ fallback lưu trữ local an toàn khi chưa đăng nhập và đồng bộ với backend Cart Service khi người dùng đăng nhập.

2. **Luồng Thanh toán (Checkout & Payment Integration)**:
   - Tích hợp chuẩn qua `features/checkout/services/payments.api.js` và `orders.api.js`.
   - **Thanh toán VNPAY QR**: Đơn hàng tạo ở trạng thái `PENDING_PAYMENT`. Modal VNPAY QR hiển thị mã và kiểm tra trạng thái polling qua `GET /payments/{paymentId}`. Tuyệt đối KHÔNG tự ý giả lập xác nhận thành công trên client.
   - Nếu Buyer vô tình đóng modal hoặc thanh toán gián đoạn, trang chi tiết đơn hàng (`OrderDetailPage.jsx`) phải cung cấp hành động mở lại cổng thanh toán.

3. **Địa chỉ & Vị trí (Location Service)**:
   - Sổ địa chỉ và chọn tỉnh/thành/quận/huyện/phường/xã bắt buộc dùng `location.api.js` (kết hợp dữ liệu chuẩn hóa `shared/utils/vietnam-address.json`).
   - Đảm bảo cơ chế tự động mapping dữ liệu khi backend location service chưa sẵn sàng.

---

## 4. QUY TẮC UI/UX & PENPOT

1. **Giao diện & Layout**:
   - Sử dụng `BuyerLayout` (`Header` chứa MegaMenu, Search bar, Mini-cart badge; `Footer`).
   - Mọi biểu tượng giao diện phải dùng thư viện `lucide-react`, không sử dụng text emoji giả lập icon.
2. **Responsive Design**:
   - Mọi trang phải hoạt động hoàn hảo trên Mobile (`< 640px`), Tablet (`640px - 1024px`) và Desktop (`> 1024px`).
   - Menu danh mục, filter sidebar trên di động phải chuyển đổi mượt mà sang dạng Drawer / Bottom Sheet.
3. **Thư viện UI dùng chung**:
   - Ưu tiên sử dụng component primitives từ `@taca/ui-components` (`Button`, `Input`, `Modal`, `Badge`).

---

## 5. KIỂM TRA CHẤT LƯỢNG TRƯỚC KHI BÀN GIAO

- Lệnh kiểm tra bắt buộc:
  ```bash
  npm run lint -w @taca/buyer
  npm run build -w @taca/buyer
  ```
- Kiểm tra tính đầy đủ của 4 trạng thái giao diện trong mọi trang/feature: `Loading`, `Success`, `Empty`, `Error`.
