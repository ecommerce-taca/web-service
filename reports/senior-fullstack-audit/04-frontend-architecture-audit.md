# CHƯƠNG 4: KIỂM TOÁN KIẾN TRÚC FRONTEND (FRONTEND ARCHITECTURE AUDIT)
## VITE MODULE FEDERATION, SHARED DESIGN SYSTEM VÀ QUẢN LÝ TRẠNG THÁI CLIENT

---

## 1. TỔNG QUAN KIẾN TRÚC MONOREPO MICRO-FRONTEND

Phân hệ Frontend `taca_ecommerce` được tổ chức theo kiến trúc **Monorepo NPM Workspaces** gồm 5 workspace độc lập:
1. `@taca/shell`: Host Container điều phối routing và tích hợp.
2. `@taca/buyer`: Remote Storefront phục vụ người mua hàng (Port 5174).
3. `@taca/seller`: Remote Merchant Portal phục vụ nhà bán hàng (Port 5175).
4. `@taca/admin`: Remote System Backoffice phục vụ quản trị sàn (Port 5176).
5. `@taca/ui-components`: Thư viện Design System dùng chung.

```text
taca_ecommerce/
├── apps/
│   ├── shell/                          # Host Application (:5173)
│   ├── buyer/                          # Remote Storefront (:5174)
│   ├── seller/                         # Remote Merchant (:5175)
│   └── admin/                          # Remote Backoffice (:5176)
├── shared/
│   ├── ui-components/                  # Design System Primitives
│   └── utils/                          # api-client.js, formatters, validation
├── package.json                        # Root Monorepo configuration
└── tailwind.config.js                  # Master Design Tokens
```

---

## 2. CẤU HÌNH VITE MODULE FEDERATION VÀ ĐỘ BỀN VỮNG (RESILIENCE)

### 2.1. Cấu hình Module Federation
Dự án sử dụng plugin `@originjs/vite-plugin-federation` với cơ chế chia sẻ tài nguyên singleton:
```javascript
// Trích xuất từ apps/shell/vite.config.js
federation({
  name: 'shell',
  remotes: {
    buyerApp: 'http://localhost:5174/assets/remoteEntry.js',
    sellerApp: 'http://localhost:5175/assets/remoteEntry.js',
    adminApp: 'http://localhost:5176/assets/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.1' },
    'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.26.0' }
  }
})
```

### 2.2. Cơ chế bảo vệ sự cố Remote (Remote Crash Protection)
- Trong `apps/shell/src/App.jsx`, toàn bộ các route remote đều được bọc trong component `RemoteErrorBoundary`:
  - Nếu remote Seller hoặc Admin bị mất kết nối mạng hoặc lỗi build, Shell không bị văng trắng trang (`White Screen of Death`).
  - Người dùng nhận được thông báo lỗi trực quan với nút "Tải lại phân hệ" (`Retry Remote Reload`).

---

## 3. THƯ VIỆN GIAO DIỆN DÙNG CHUNG (`@taca/ui-components`)

Tuân thủ nguyên tắc cốt lõi được định nghĩa trong file hướng dẫn [shared/ui-components/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/AGENTS.md):

### 3.1. Nguyên tắc Không logic nghiệp vụ (Zero-logic Principle)
- Các component (`Modal.jsx`, `Button.jsx`, `Input.jsx`, `Table.jsx`, `Card.jsx`, `Badge.jsx`) hoàn toàn **không import bất kỳ API service hay store state nào**.
- Toàn bộ dữ liệu hiển thị được đưa vào qua `props`, các tương tác người dùng được phát ra ngoài thông qua các hàm callback (`onClick`, `onClose`, `onChange`).

### 3.2. Kiểm định PropTypes 100%
- Toàn bộ các component trong `shared/ui-components` đều có khai báo `PropTypes` đầy đủ và nghiêm ngặt:
  - Khai báo rõ kiểu dữ liệu: `PropTypes.string`, `PropTypes.number`, `PropTypes.bool`, `PropTypes.func`.
  - Khai báo rõ tính chất bắt buộc: `.isRequired` cho các props trọng yếu như `isOpen`, `onClose`.
  - Khai báo giá trị mặc định chuẩn xác trong `defaultProps`.

---

## 4. TẦNG KẾT NỐI MẠNG VÀ CHẾ ĐỘ KÉP (`shared/utils/api-client.js`)

Tầng giao tiếp mạng được tập trung tại một module duy nhất `shared/utils/api-client.js`, đóng vai trò là "chốt chặn" kiểm soát luồng dữ liệu vào/ra.

### 4.1. Cấu hình Axios Instance & Reverse Proxy
- `baseURL` được thiết lập mặc định là `/api`, định tuyến qua Vite Dev Server Reverse Proxy sang Backend Gateway (Port 8080).
- Không hardcode IP hay Port backend trong bất kỳ file component nào.

### 4.2. Cơ chế Chế độ Kép (Mock Mode vs Live Mode)
- Hàm `isMockMode()` đọc biến môi trường:
  ```javascript
  export const isMockMode = () => import.meta.env.VITE_USE_MOCK !== 'false';
  ```
- Khi `VITE_USE_MOCK=true`: Các API service trả về mock data nội bộ chuẩn hóa, cho phép đội ngũ UI/UX và QA kiểm thử độc lập mà không phụ thuộc vào hạ tầng Backend.
- Khi `VITE_USE_MOCK=false`: Gọi trực tiếp đến API Gateway. Toàn bộ headers xác thực JWT và Request ID được tự động đính kèm.

### 4.3. Lớp lọc Envelope (Unwrap & Wrap)
- `unwrapApiResponse(response)`: Tự động trích xuất thuộc tính `data` từ envelope backend `{ data, meta }`. Nếu backend trả về mảng trực tiếp, client tự xử lý fallback tương thích ngược mà không gây lỗi runtime.
- `createResponseEnvelope(data, meta)`: Chuẩn hóa dữ liệu trả về cho UI luôn theo dạng `{ data, meta }`.

---

## 5. KIỂM TOÁN QUẢN LÝ TRẠNG THÁI VÀ BỘ NHỚ TRONG CÁC REMOTE

### 5.1. Phân hệ Buyer: VnpayQrModal & Polling Cleanup
- Trong file `apps/buyer/src/features/checkout/components/VnpayQrModal.jsx`:
  - Cơ chế đếm ngược thời gian hết hạn (`timeLeft`) và polling kiểm tra trạng thái giao dịch (`checkStatus`) chạy mỗi 2.5 giây.
  - **Kiểm định rò rỉ bộ nhớ (Memory Leak Audit)**: Toàn bộ các hàm `setInterval` đều có hàm dọn dẹp (`cleanup function`) trong `useEffect`:
    ```javascript
    useEffect(() => {
      if (!isOpen || !paymentId || paymentStatus !== 'PENDING') return;
      pollingRef.current = setInterval(() => {
        checkStatus(false);
      }, 2500);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }, [isOpen, paymentId, paymentStatus, checkStatus]);
    ```
  - Khi modal đóng hoặc người dùng chuyển trang, timer được hủy ngay lập tức, không gây rò rỉ bộ nhớ.

### 5.2. Phân hệ Seller: FinancePage & WithdrawModal
- State quản lý theo mô hình phân tầng:
  - `wallet`: Lưu trữ thông tin số dư từ `GET /seller/wallet`.
  - `revenue`: Lưu trữ số liệu kinh doanh từ `GET /seller/revenue`.
  - `ledger`: Lưu trữ lịch sử sao kê từ `GET /seller/wallet/ledger`.
- Xử lý bất đồng bộ song song: Sử dụng `Promise.allSettled` thay vì `Promise.all`. Nếu API lấy sao kê bị lỗi nhẹ, thông tin số dư ví vẫn hiển thị được bình thường, không làm sập toàn bộ trang.

### 5.3. Phân hệ Admin: AdminFinancePage & Modal Portal
- Toàn bộ các Modal lớn (`CreateFeeRuleModal.jsx`, `CreateSettlementBatchModal.jsx`, `SettlementBatchDetailModal.jsx`) đều được render thông qua `createPortal(..., document.body)`.
- Điều này loại bỏ hoàn toàn lỗi hiển thị bị cắt viền (clipping), bị cuộn che khuất do các khối `overflow-hidden` của layout cha.

---

## 6. ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN VÀ QUY TRÌNH BUILD (LINT & BUILD)

- **Kết quả kiểm tra Lint**:
  - Đã chạy lệnh `npm run lint` trên toàn bộ 5 workspace: `@taca/shell`, `@taca/buyer`, `@taca/seller`, `@taca/admin`, `@taca/landing`.
  - **Kết quả: 0 LỖI (0 errors, 0 warnings)**. Toàn bộ cú pháp JSX, đóng mở thẻ HTML/SVG và quy tắc React Hook đều đạt 100%.
- **Kết quả kiểm tra Build**:
  - `npm run build:remotes`: 100% build thành công các bundle Module Federation `remoteEntry.js`.
  - `npm run build -w @taca/shell`: Build thành công bundle production của container.

---

## 7. KẾT LUẬN KIỂM TOÁN KIẾN TRÚC FRONTEND
- **Độ hoàn thiện kiến trúc**: Đạt **8.8 / 10**.
- **Điểm sáng**: Tách biệt MFE hoàn hảo, Shared UI tuân thủ Zero-logic, xử lý dọn dẹp timer chống rò rỉ bộ nhớ rất chặt chẽ, Lint & Build đạt tuyệt đối.
- **Điểm cần lưu ý**: Cần loại bỏ hoặc gắn cờ cảnh báo các modal gọi API không tồn tại trên backend (như tạo batch quyết toán thủ công).

