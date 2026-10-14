# Shell (Host Application) — Engineering Rules

## 1. VAI TRÒ & PHẠM VI

`apps/shell` là **Host Application (Container App)** chịu trách nhiệm làm nền móng cho toàn bộ kiến trúc Micro-Frontend của Taca Ecommerce.

- **Port phát triển**: `5173`
- **Mục tiêu**: Điều hướng toàn cục (Global Routing), nạp các Micro-Frontends qua Module Federation, giám sát lỗi biên (Fault Isolation), và cung cấp công cụ chuyển đổi nhanh cho QA/Developer.

---

## 2. KIẾN TRÚC MODULE FEDERATION

Shell kết nối tới 3 ứng dụng từ xa (Remotes) thông qua `@originjs/vite-plugin-federation`:

```text
                  Browser (Port 5173)
                           │
                 ┌─────────┴─────────┐
                 │   apps/shell      │
                 │   (Host Container)│
                 └─────────┬─────────┘
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   buyer (Remote)     seller (Remote)     admin (Remote)
    Port 5174          Port 5175          Port 5176
    Path: /*           Path: /seller/*    Path: /admin/*
```

### Shared Dependencies
Các thư viện singleton chia sẻ bắt buộc giữa Shell và Remotes:
- `react`
- `react-dom`
- `react-router-dom`

---

## 3. NGUYÊN TẮC CỐT LÕI CỦA SHELL

1. **Zero Business Logic**:
   - Shell tuyệt đối không chứa business logic của Buyer (giỏ hàng, checkout), Seller (quản lý đơn, sản phẩm) hoặc Admin (phê duyệt KYC).
   - Mọi nghiệp vụ phải nằm trọn vẹn trong remote tương ứng.

2. **Fault Tolerance & Resilience (Cô lập lỗi)**:
   - Mọi Remote Micro-App khi được import qua `lazy()` phải được bọc trong `<Suspense>` và `<RemoteErrorBoundary>` (tại `src/components/common/RemoteErrorBoundary.jsx`).
   - Khi một remote app bị lỗi runtime hoặc không khởi động được, chỉ remote đó hiển thị thông báo lỗi thân thiện; các remote khác và khung Shell vẫn hoạt động bình thường.

3. **Không tạo Component trùng lặp**:
   - Không tạo các component UI cơ bản (Button, Input, Badge, Modal) trong `apps/shell/src/components/ui/`.
   - Nếu Shell cần UI primitives, sử dụng trực tiếp từ package `@taca/ui-components`.

4. **Dev / QA Navigation**:
   - Shell duy trì thanh điều hướng Developer QA top nav (ẩn/hiện qua `localStorage['taca_dev_nav_visible']`) và Floating Quick Switcher widget để đội ngũ phát triển chuyển đổi nhanh giữa 3 ứng dụng trên cùng một domain/port.

---

## 4. CẤU TRÚC THƯ MỤC CHUẨN

```text
apps/shell/src/
├── app/
│   └── App.jsx                   # Global Router, Host Nav & Remote Error Boundaries
├── components/
│   └── common/
│       ├── RemoteErrorBoundary.jsx  # Bọc crash protection cho từng remote
│       └── ScrollToTop.jsx       # Reset vị trí cuộn khi đổi route
├── index.css                     # Tailwind CSS v3 base styles
└── main.jsx                      # Bootstrap DOM
```

---

## 5. QUY TẮC BẢO TRÌ & VERIFY

- Trước khi commit thay đổi ở Shell:
  1. Kiểm tra lint: `npm run lint -w @taca/shell`
  2. Kiểm tra build: `npm run build -w @taca/shell`
  3. Kiểm tra liên kết: Chạy `npm run dev` để xác nhận cả 3 remotes nạp trơn tru qua Host port 5173.
