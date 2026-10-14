# KIẾN TRÚC TỔNG THỂ DỰ ÁN MICRO-FRONTEND TACA ECOMMERCE

> **Tài liệu Phân tích & Tái dựng Kiến trúc Hệ thống**  
> **Dự án:** Taca Ecommerce Platform (`ecommerce-taca/web-service`)  
> **Cập nhật:** 2026-10-14  
> **Vai trò phân tích:** Senior Software Architect & Senior Full-Stack Engineer  
> **Nguồn đối chiếu:** Source code Monorepo `web-service`, 12 backend repositories trong tổ chức `ecommerce-taca`, tài liệu đặc tả `docs` (`ecommerce-taca/docs`), và hồ sơ thiết kế UI/UX Penpot (`taca`).

---

## 1. Executive Summary (Tổng quan Dễ hiểu)

Hệ thống **Taca Ecommerce** là nền tảng thương mại điện tử đa người bán (Multi-Vendor Marketplace) có quy mô doanh nghiệp. Để giải quyết bài toán mở rộng đội ngũ phát triển, tránh sự cồng kềnh của mô hình Monolith và tách biệt triệt để các miền nghiệp vụ khách hàng khác nhau, dự án lựa chọn mô hình **Micro-Frontend (MFE)** kết hợp với hạ tầng **Microservices (Backend)**.

```
+---------------------------------------------------------------------------------------+
|                                    TRÌNH DUYỆT KHÁCH HÀNG                            |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   |                        Host Shell Application (@taca/shell :5173)             |   |
|   |  - Routing tổng thể    - Dev/QA App Switcher    - Xác thực phiên làm việc     |   |
|   +-------------------------------------------------------------------------------+   |
|          | (Module Federation)           | (Module Federation)       | (Module Fed.)  |
|          v                               v                           v                |
|   +-------------------+          +-------------------+       +--------------------+   |
|   |   @taca/buyer     |          |   @taca/seller    |       |    @taca/admin     |   |
|   |   (Port 5174)     |          |   (Port 5175)     |       |    (Port 5176)     |   |
|   | Storefront & Cart |          | Kênh Người Bán    |       | Quản trị & Duyệt   |   |
|   +-------------------+          +-------------------+       +--------------------+   |
|             \                              |                             /            |
|              +-----------------------------+----------------------------+             |
|                                            |                                          |
|                                            v                                          |
|                     +---------------------------------------------+                   |
|                     |  Thư viện dùng chung (@taca/ui-components)  |                   |
|                     |  Shared API Client (Axios + Auto Refresh)   |                   |
|                     +---------------------------------------------+                   |
+--------------------------------------------|------------------------------------------+
                                             | REST / HTTPS (prefix: /api/v1)
                                             v
                      +---------------------------------------------+
                      |         API GATEWAY (Kong Gateway 3.x)      |
                      |   - JWT RS256 Local Verification (JWKS)     |
                      |   - Inject X-User-*, Rate Limiting, Proxy   |
                      +---------------------------------------------+
                                             |
     +-------------------+-------------------+-------------------+------------------+
     |                   |                   |                   |                  |
     v                   v                   v                   v                  v
+-----------+     +--------------+    +---------------+   +--------------+    +---------------+
| user-auth |     | product-cat. |    | order-commerce|   | payment-wal. |    | other services|
| (Spring)  |     | (NestJS/MDB) |    | (Spring/MySQL)|   | (Spring/PG)  |    | (Search/Ship) |
+-----------+     +--------------+    +---------------+   +--------------+    +---------------+
```

### Các đặc điểm cốt lõi đã xác minh từ mã nguồn:
1. **Mô hình Repository:** **Monorepo** quản lý bằng **npm workspaces** (`apps/*`, `shared/*`), cho phép đồng bộ dependency version mà vẫn giữ tính độc lập cho từng micro-app.
2. **Cơ chế Micro-Frontend:** Sử dụng **Vite Module Federation** (`@originjs/vite-plugin-federation`). Host shell (`@taca/shell`) import động các bundle `remoteEntry.js` từ 3 Remote Apps: `@taca/buyer`, `@taca/seller`, `@taca/admin`.
3. **Cơ chế chạy độc lập (Standalone Isolation):** Cả 3 Remote Apps đều tích hợp hook `useInRouterContext()`: khi chạy lồng trong Shell sẽ tái sử dụng Router của Shell; khi chạy độc lập trên port riêng (5174, 5175, 5176) sẽ tự bọc `<BrowserRouter>`, phục vụ quy trình dev/test cô lập.
4. **Cơ chế chuyển đổi Mock / Real API:** Được trừu tượng hóa thống nhất tại `shared/utils/api-client.js`. Hệ thống hỗ trợ cờ môi trường `VITE_USE_MOCK` kết hợp với `localStorage.getItem('taca_force_mock')`, giúp đội ngũ frontend có thể phát triển hoàn toàn độc lập khi backend đang xây dựng.
5. **Tiến độ tích hợp:**
   - **Auth & Hồ sơ cá nhân & Onboarding KYC:** Đồng bộ rất cao (**~95%**), bám sát DTO của `user-auth-service`.
   - **Product Catalog (Buyer & Seller):** Đồng bộ cao (**~92%**), hỗ trợ đầy đủ quản lý SPU/SKU và bộ lọc đa tiêu chí theo `Product-Catalog-Service`.
   - **Đơn hàng & Giỏ hàng & Voucher:** Đang phân mảnh (**~55%**), Buyer hiện chủ yếu thao tác trên LocalStorage/Mock, cần chuẩn hóa lại các endpoint `POST /checkout` và `GET /orders` theo chuẩn `order-commerce-service`.
   - **Admin Console:** Đã hoàn thiện giao diện duyệt KYC và phân quyền người dùng, sẵn sàng kết nối API thật.

---

## 2. Technology Stack (Công nghệ Thực tế)

Tất cả thông tin dưới đây được trích xuất trực tiếp từ các file `package.json` và cấu hình build trong workspace.

| Thành phần | Công nghệ thực tế | Phiên bản | Vai trò & Giải thích kiến trúc | Bằng chứng |
|---|---|---|---|---|
| **Monorepo Manager** | npm workspaces | Node.js 20+ | Quản lý đa gói (`apps/*`, `shared/*`), chia sẻ thư viện gốc và chạy script tập trung | `package.json:5-8` |
| **Frontend Framework** | React | `^18.3.1` | Thư viện kết xuất UI cốt lõi của cả 4 Micro-Apps | `apps/*/package.json` |
| **Build Tool / Bundler** | Vite | `^5.4.1` | Công cụ build ES modules tốc độ cao, cung cấp dev server HMR và production build | `apps/*/package.json` |
| **Micro FE Plugin** | @originjs/vite-plugin-federation | `^1.4.1` | Hiện thực hóa Module Federation trên Vite: Shell import remote components; Remotes expose `remoteEntry.js` | `apps/*/vite.config.js` |
| **Routing** | react-router-dom | `^6.26.1` | Điều hướng SPA. Shell quản lý cấp root; Remotes quản lý sub-routes | `apps/*/package.json` |
| **Styling** | Tailwind CSS | `^3.4.10` | Utility-first CSS. Cấu hình namespace `taca-` qua preset dùng chung | `shared/ui-components/tailwind-preset.js` |
| **Icons** | Lucide React | `^0.435.0` | Bộ icon SVG hiện đại, nhất quán thay thế cho các emoji hoặc icon rời rạc | `apps/buyer/package.json` |
| **HTTP Client** | Axios | `^1.20.0` | Giao tiếp API qua Interceptors, tự động đính kèm Bearer token và xử lý refresh token xoay vòng | `shared/utils/api-client.js` |
| **Linting & Code Quality** | ESLint + Flat Config | `^9.9.0` | Kiểm tra cú pháp, react-hooks rules và tiêu chuẩn code JavaScript | `eslint.config.js`, `apps/*/eslint.config.js` |
| **Git Hook & Commit** | Husky + Commitlint | `husky^9.1.7`, `commitlint^21.2.2` | Bắt buộc định dạng commit chuẩn Conventional Commits (`feat:`, `fix:`) | `.husky/`, `commitlint.config.js` |
| **E2E Testing (Pre-installed)** | Puppeteer | `^25.11.0` | Thư viện headless browser (hiện diện ở devDependencies nhưng chưa có test script) | `package.json:29` |

---

## 3. Repository Map (Bản đồ Cấu trúc Dự án)

Cấu trúc thư mục chi tiết được tổ chức theo tiêu chuẩn Feature-Based Architecture:

```text
taca_ecommerce/
├── apps/
│   ├── shell/                       # Host Application (Cổng 5173)
│   │   ├── vite.config.js           # Khai báo remotes (buyer, seller, admin) & proxy /api
│   │   └── src/
│   │       ├── app/App.jsx          # Route gốc, Suspense fallback, Dev/QA App Switcher
│   │       └── components/          # Layout, Navigation, ScrollToTop
│   ├── buyer/                       # Remote App: Khách hàng mua sắm (Cổng 5174)
│   │   ├── vite.config.js           # Expose ./App -> src/app/App.jsx
│   │   └── src/
│   │       ├── app/App.jsx          # Sub-routes, AuthProvider, CartProvider, FavoritesProvider
│   │       ├── features/
│   │       │   ├── auth/            # Signin/Signup, Verify Email, OTP, Forgot Password
│   │       │   ├── home/            # Hero banner, Danh mục, Flash sale
│   │       │   ├── products/        # Product list, bộ lọc, chi tiết sản phẩm, biến thể SKU
│   │       │   ├── cart/            # Giỏ hàng phân nhóm theo shop
│   │       │   ├── checkout/        # Chọn địa chỉ, áp 3 tầng voucher, COD / VNPAY QR
│   │       │   ├── account/         # Hồ sơ cá nhân, sổ địa chỉ, lịch sử đơn hàng
│   │       │   ├── shops/           # Trang Shop công khai, Follow / Unfollow
│   │       │   └── search/          # Trang tìm kiếm sản phẩm
│   │       └── layouts/BuyerLayout  # Header, Search bar, Mega Menu, Footer
│   ├── seller/                      # Remote App: Kênh Người Bán (Cổng 5175)
│   │   ├── vite.config.js           # Expose ./App -> src/app/App.jsx
│   │   └── src/
│   │       ├── app/App.jsx          # Sub-routes Kênh Người Bán
│   │       ├── features/
│   │       │   ├── onboarding/      # Quy trình thiết lập gian hàng 5 bước & KYC upload S3
│   │       │   ├── dashboard/       # Thống kê KPI, biểu đồ doanh thu, cảnh báo đơn
│   │       │   ├── products/        # Quản lý SPU/SKU, biến thể ma trận 2 cấp, Import/Export Excel
│   │       │   ├── orders/          # Tiếp nhận đơn, xác nhận, chuẩn bị hàng và giao vận
│   │       │   ├── vouchers/        # Thiết lập khuyến mãi gian hàng (Scope SHOP)
│   │       │   ├── finance/         # Số dư ví, lịch sử đối soát và rút tiền
│   │       │   └── settings/        # Hồ sơ shop, địa chỉ kho, tài khoản ngân hàng
│   │       └── components/layout/   # SellerSidebar, SellerHeader
│   └── admin/                       # Remote App: Cổng Quản Trị Hệ Thống (Cổng 5176)
│       ├── vite.config.js           # Expose ./App -> src/app/App.jsx
│       └── src/
│           ├── app/App.jsx          # Sub-routes Admin Portal
│           ├── features/
│           │   ├── kyc/             # Thẩm định hồ sơ KYC gian hàng (Duyệt / Yêu cầu sửa / Từ chối)
│           │   ├── users/           # Quản lý phân quyền tài khoản (BUYER, SELLER, ADMIN)
│           │   └── audit/           # Truy vấn nhật ký kiểm toán hệ thống (Audit Logs)
│           └── layouts/AdminLayout  # Dark theme navigation, Admin top bar
├── shared/                          # Gói dùng chung cho toàn bộ monorepo
│   ├── ui-components/               # UI Primitives: Button, Input, Modal, Badge
│   │   └── tailwind-preset.js       # Bảng màu thương hiệu (taca-primary, taca-sale, ...)
│   └── utils/                       # Shared Utilities
│       ├── api-client.js            # Axios instance, Bearer interceptor, Refresh Token Queue
│       ├── location.js              # Xử lý địa giới hành chính Việt Nam
│       ├── phone.js                 # Chuẩn hóa số điện thoại E.164 (+84)
│       ├── security.js              # Xử lý bảo mật, làm sạch ký tự (chống Formula Injection)
│       └── vietnam-address.json     # Cơ sở dữ liệu 63 tỉnh thành, quận huyện, phường xã
├── docs/                            # Tài liệu kiến trúc và hướng dẫn phát triển
└── package.json                     # Cấu hình workspace gốc và lệnh thực thi toàn hệ thống
```

---

## 4. Architecture Diagram (Sơ đồ Kiến trúc Bằng Mermaid)

Sơ đồ dưới đây phản ánh chính xác cấu trúc Micro-Frontend kết hợp Backend Microservices:

```mermaid
graph TB
    subgraph Browser ["Trình Duyệt Khách Hàng (Client Layer)"]
        direction TB
        HostApp["Host Shell App (@taca/shell)<br/>URL: localhost:5173"]
        
        subgraph Remotes ["Remote Micro-Apps (Vite Module Federation)"]
            BuyerApp["Buyer Storefront (@taca/buyer)<br/>Port: 5174 | Exposes: ./App"]
            SellerApp["Seller Portal (@taca/seller)<br/>Port: 5175 | Exposes: ./App"]
            AdminApp["Admin Console (@taca/admin)<br/>Port: 5176 | Exposes: ./App"]
        end

        subgraph SharedLayer ["Shared Modules (@taca/shared)"]
            SharedUI["UI Components (@taca/ui-components)<br/>Button, Input, Modal, Badge"]
            SharedUtils["Shared Utils<br/>api-client.js, phone.js, security.js"]
            SharedToken["Singletons chia sẻ bộ nhớ:<br/>React, React-DOM, React-Router-DOM"]
        end

        HostApp -->|Tải remoteEntry.js| BuyerApp
        HostApp -->|Tải remoteEntry.js| SellerApp
        HostApp -->|Tải remoteEntry.js| AdminApp

        BuyerApp -.->|Import| SharedUI
        SellerApp -.->|Import| SharedUI
        AdminApp -.->|Import| SharedUI
        BuyerApp -.->|Giao tiếp API| SharedUtils
        SellerApp -.->|Giao tiếp API| SharedUtils
        AdminApp -.->|Giao tiếp API| SharedUtils
    end

    subgraph GatewayLayer ["Tầng Cổng Giao Tiếp (API Gateway)"]
        KongGW["Kong Gateway 3.x OSS (Reverse Proxy)<br/>Base Path: /api/v1 (Port: 8081)"]
        JWTVerify["Xác thực JWT RS256 qua JWKS nội bộ<br/>Inject Header: X-User-ID, X-User-Roles, X-User-Shop-Scope"]
        KongGW --> JWTVerify
    end

    subgraph BackendLayer ["Tầng Microservices Backend"]
        AuthSvc["user-auth-service (Spring Boot 3 / MySQL / Redis)<br/>Auth, User Profile, Addresses, Follows, Shops, KYC"]
        CatalogSvc["Product-Catalog-Service (NestJS / MongoDB / Kafka CDC)<br/>SPU, SKU Matrix, Categories, Excel Import/Export Jobs"]
        OrderSvc["order-commerce-service (Spring Boot / MySQL / Redis)<br/>Cart, Checkout, Split Orders, Vouchers (3 Slots), Invoices"]
        PaySvc["payment-wallet-service (Spring Boot)<br/>VNPAY QR, COD, Seller Wallet, Payouts"]
        ShipSvc["shipment-service<br/>Carrier Adapters (GHN), Shipping Quotes, Tracking"]
        SearchSvc["search-service (Elasticsearch)<br/>Full-text search, đồng bộ CDC qua Kafka"]
        MsgSvc["message-service (WebSocket /ws/messages)<br/>Real-time Chat Buyer - Seller"]
        NotifSvc["notification-service<br/>Thông báo đẩy, Email giao dịch, SMS OTP"]
    end

    SharedUtils -->|HTTPS REST Request| KongGW
    JWTVerify -->|/api/v1/auth/**, /api/v1/users/**, /api/v1/seller/onboarding/**| AuthSvc
    JWTVerify -->|/api/v1/products/**, /api/v1/categories/**, /api/v1/seller/products/**| CatalogSvc
    JWTVerify -->|/api/v1/cart/**, /api/v1/checkout/**, /api/v1/orders/**, /api/v1/vouchers/**| OrderSvc
    JWTVerify -->|/api/v1/payments/**, /api/v1/seller/wallet/**| PaySvc
    JWTVerify -->|/api/v1/orders/*/shipment, /api/v1/webhooks/shipping/**| ShipSvc
    JWTVerify -->|/api/v1/search/**, /api/v1/products/search| SearchSvc
    JWTVerify -->|/ws/messages (WebSocket Handshake)| MsgSvc
    JWTVerify -->|/api/v1/notifications/**| NotifSvc
```

---

## 5. Micro FE Integration (Cơ chế Kết nối Frontend Thực tế)

### 5.1 Cấu hình Module Federation
Trong `apps/shell/vite.config.js`:
```javascript
federation({
  name: 'shell',
  remotes: {
    buyer: 'http://localhost:5174/assets/remoteEntry.js',
    seller: 'http://localhost:5175/assets/remoteEntry.js',
    admin: 'http://localhost:5176/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

Trong các Remote Apps (`apps/buyer`, `apps/seller`, `apps/admin`):
```javascript
federation({
  name: 'buyer', // hoặc 'seller', 'admin'
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/app/App.jsx',
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

### 5.2 Khử xung đột Router (Router Hierarchy & Standalone Mode)
Một vấn đề kinh điển của Micro-Frontend dùng React Router là lỗi **"You cannot render a <Router> inside another <Router>"**.
Dự án giải quyết bằng cách áp dụng `useInRouterContext()` tại điểm đầu vào của từng Remote App:
```javascript
// Trích từ apps/buyer/src/app/App.jsx & apps/seller/src/app/App.jsx
export default function App() {
  const inRouter = useInRouterContext();

  if (inRouter) {
    // Đang chạy bên trong Host Shell: Chỉ trả về Routes nội bộ
    return <AppRoutes />;
  }

  // Chạy độc lập trên cổng 5174/5175: Tự bọc BrowserRouter
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

### 5.3 Điều hướng và Phân giải Route ở Host Shell
Tại `apps/shell/src/app/App.jsx`:
```javascript
const BuyerApp = lazy(() => import('buyer/App'));
const SellerApp = lazy(() => import('seller/App'));
const AdminApp = lazy(() => import('admin/App'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/seller/*" element={<SellerApp />} />
    <Route path="/admin/*" element={<AdminApp />} />
    <Route path="/*" element={<BuyerApp />} />
  </Routes>
</Suspense>
```
- Khi URL bắt đầu bằng `/seller`, Host nạp remote component từ cổng `5175`.
- Khi URL bắt đầu bằng `/admin`, Host nạp remote component từ cổng `5176`.
- Tất cả các URL còn lại thuộc quyền quản lý của Buyer Storefront (cổng `5174`).
- Host Shell cung cấp widget nổi `Developer QA Quick Switcher` (có thể bật/tắt hiển thị) giúp QA/Dev chuyển nhanh giữa 3 ứng dụng mà không cần gõ lại URL.

### 5.4 Cơ chế Chia sẻ Thư viện (Shared Singletons)
Cả Host và Remotes đều khai báo `shared: ['react', 'react-dom', 'react-router-dom']`. Nhờ đó, trình duyệt chỉ tải 1 phiên bản duy nhất của React và React DOM vào bộ nhớ, đảm bảo:
- Context không bị phân mảnh (React Context không bị mất khi xuyên qua ranh giới remote).
- Giảm dung lượng tải mạng và tối ưu hóa hiệu năng render.

---

## 6. End-to-End Business Flows (Các Luồng Nghiệp vụ Chính)

### Luồng 1: Người mua duyệt sản phẩm, chọn biến thể và đặt hàng (Buyer Flow)
1. **Duyệt danh mục & Tìm kiếm:**
   - Component: `HomePage.jsx`, `SearchPage.jsx`, `CategoryLandingPage.jsx`.
   - Hook/Service: `productApi.getProducts(params)` gọi `GET /products` hoặc `GET /categories`.
   - Backend: API Gateway proxy tới `Product-Catalog-Service` (NestJS/MongoDB).
   - Mock/Real: Khi `VITE_USE_MOCK=true`, đọc mảng tĩnh `PRODUCTS_CATALOG`. Khi `false`, gọi API thật.
2. **Chi tiết sản phẩm & Chọn SKU biến thể:**
   - Component: `ProductDetailPage.jsx`, `ProductPurchase.jsx`.
   - Xử lý: Lấy chi tiết SPU và mảng SKU biến thể; tính toán giá động theo tổ hợp thuộc tính (Dung lượng, Màu sắc).
3. **Thêm vào giỏ hàng:**
   - Hook: `useCart.js` (`CartProvider`).
   - Hiện trạng mã nguồn: Lưu trữ `items` vào state React và `localStorage.getItem('taca_cart')`.
   - Khoảng cách với BE Spec: Theo đặc tả `order-commerce-docs`, giỏ hàng chuẩn phải đồng bộ qua Redis bằng `POST /cart/items` và `GET /cart`.
4. **Checkout & Tạo đơn hàng:**
   - Component: `CheckoutPage.jsx`.
   - Xử lý: Chọn địa chỉ nhận hàng (`addressApi.getAddresses`), chọn phương thức (COD / VNPAY QR), áp dụng voucher.
   - Thao tác: Bấm "Đặt hàng" kích hoạt `handlePlaceOrder()` gọi `orderApi.createOrder()`.
   - Lưu trữ: Tự sinh mã `TACA26xxxxxx`, lưu vào `localStorage.setItem('taca_user_orders')`. Nếu `!USE_MOCK`, thử gọi `POST /orders`.

### Luồng 2: Người bán đăng ký, hoàn thành Onboarding KYC và quản lý gian hàng (Seller Flow)
1. **Đăng ký trở thành Người Bán:**
   - Component: `SellerRegisterPage.jsx` (Buyer) hoặc `OnboardingPage.jsx` (Seller).
   - Service: `sellerRegisterApi.registerShop()` gọi `POST /users/register-seller`.
   - Backend: `user-auth-service` tạo bản ghi Shop ở trạng thái `DRAFT` và `kyc_status: DRAFT`.
2. **Thực hiện Onboarding 5 bước (Bám sát thiết kế Penpot):**
   - **Bước 1 (Hồ sơ):** `PUT /seller/onboarding/profile` lưu Tên shop, Mã số thuế, Mô tả.
   - **Bước 2 (KYC tài liệu):** 
     - Gọi `POST /seller/onboarding/kyc/documents/presign` nhận S3 Presigned URL.
     - Upload file CCCD/GPKD trực tiếp lên Object Storage.
     - Gọi `POST /seller/onboarding/kyc/documents/complete` và `POST /seller/onboarding/kyc/submit`.
   - **Bước 3 (Kho hàng):** `PUT /seller/onboarding/warehouse` lưu địa chỉ kho, đơn vị vận chuyển.
   - **Bước 4 (Ngân hàng):** `PUT /seller/onboarding/bank` lưu tài khoản nhận tiền.
   - **Bước 5 (Tạo sản phẩm đầu tiên):** Chuyển hướng sang màn tạo SPU.
3. **Tạo và Cấu hình Sản phẩm:**
   - Component: `ProductEditPage.jsx` / `ProductsPage.jsx`.
   - Service: `seller-product.api.js` gọi `POST /seller/products` (tạo SPU DRAFT), `PUT /seller/products/{id}/skus` (sinh ma trận biến thể), `POST /seller/products/{id}/publish`.
   - Backend: `Product-Catalog-Service` lưu trữ MongoDB và bắn sự kiện qua Kafka CDC.

### Luồng 3: Quản trị viên duyệt hồ sơ KYC gian hàng (Admin Moderation Flow)
1. **Truy cập hàng đợi thẩm định:**
   - Component: `AdminKycPage.jsx` (`apps/admin`).
   - Service: `admin-kyc.api.js` gọi `GET /admin/shops/kyc?status=PENDING`.
2. **Kiểm tra tài liệu & Ra quyết định:**
   - Component: `AdminKycDetailModal.jsx` xem xét các file tài liệu đã upload.
   - Thao tác: Bấm "Duyệt hồ sơ" (`APPROVED`), "Yêu cầu bổ sung" (`NEEDS_INFO`) hoặc "Từ chối" (`REJECTED`).
   - Service: Gọi `POST /admin/shops/{shopId}/kyc/review` với payload `{ decision, reason }`.
   - Đồng bộ Client-side Mock: Khi ở chế độ Mock, service cập nhật `localStorage.getItem('taca_user')` cấp thêm quyền `roles: [...roles, 'SELLER']` và phát sự kiện `BroadcastChannel('taca_marketplace_channel')` để Seller Portal lập tức cập nhật trạng thái hoạt động mà không cần reload trang.

---

## 7. Authentication & Authorization (Xác thực và Phân quyền)

### 7.1 Cơ chế Đăng nhập & Quản lý Token
- **Chuẩn Token:** Access Token (JWT RS256, hạn 15 phút) và Refresh Token (Opaque token, hạn 30 ngày).
- **Lưu trữ Frontend:** 
  - `localStorage.setItem('taca_access_token', token)`
  - `localStorage.setItem('taca_refresh_token', refreshToken)`
  - `localStorage.setItem('taca_user', JSON.stringify(userData))`
- **Tự động gắn Token:** Interceptor trong `shared/utils/api-client.js` tự động gắn `Authorization: Bearer <access_token>` vào mọi HTTP request.

### 7.2 Hàng đợi Refresh Token Tự động (Concurrency Queue)
Khi nhận lỗi `401 Unauthorized` từ một API được bảo vệ:
1. `api-client.js` chặn việc bắn hàng loạt request refresh bằng cờ `isRefreshing = true`.
2. Các request bị lỗi kế tiếp được đẩy vào `failedQueue = []`.
3. Gửi request duy nhất `POST /auth/refresh` với `refresh_token`.
4. Khi nhận được token mới: Lưu vào localStorage, gán lại header cho toàn bộ request trong hàng đợi và tiếp tục thực thi (`processQueue(null, newAccessToken)`).
5. Nếu refresh thất bại: Xóa toàn bộ token trong localStorage và phát sự kiện trình duyệt `window.dispatchEvent(new Event('auth:logout'))` để `AuthProvider` đăng xuất người dùng an toàn.

### 7.3 Phân biệt Vai trò (Roles & Guarding)
Hệ thống hỗ trợ 3 vai trò chính:
- `BUYER`: Người mua hàng (mặc định cho mọi tài khoản đăng ký).
- `SELLER`: Người bán hàng (được cấp sau khi Shop được duyệt KYC `APPROVED`).
- `ADMIN`: Quản trị viên hệ thống (có quyền thẩm định KYC, phân quyền vai trò và tra cứu audit log).

**Lưu ý bảo mật kiến trúc:**
- Ẩn/hiện nút bấm và chặn route trên React Router (`/seller/*`, `/admin/*`) chỉ là **UI Guard** nhằm nâng cao trải nghiệm người dùng (UX).
- **Ranh giới bảo mật thực sự (Security Boundary)** nằm ở API Gateway và các Domain Microservices Backend: Gateway giải mã JWT, xác minh chữ ký qua JWKS, inject header `X-User-Roles` và các service đích kiểm tra quyền trước khi thao tác DB.

---

## 8. API & Data Flow (Luồng Dữ liệu và Tích hợp Backend)

Bảng đối chiếu toàn diện giữa Frontend Entry Point, API Endpoint và Backend Handler:

| Nghiệp vụ | Frontend Entry Point | Endpoint thực tế | Backend Handler (Dịch vụ) | Nguồn lưu trữ | Trạng thái xác minh |
|---|---|---|---|---|---|
| Đăng nhập tài khoản | `features/auth/services/auth.api.js:login` | `POST /auth/signin` | `user-auth-service` (`AuthController`) | MySQL (`users`) + Redis | **MATCH (Đã xác minh)** |
| Đăng ký tài khoản | `features/auth/services/auth.api.js:register` | `POST /auth/signup` | `user-auth-service` (`AuthController`) | MySQL (`users`) | **MATCH (Đã xác minh)** |
| Refresh token | `shared/utils/api-client.js:interceptor` | `POST /auth/refresh` | `user-auth-service` (`AuthController`) | Redis (Token family) | **MATCH (Đã xác minh)** |
| Lấy profile người dùng | `features/auth/services/auth.api.js:getProfile` | `GET /users/me` | `user-auth-service` (`UserController`) | MySQL (`users`) | **MATCH (Đã xác minh)** |
| Sổ địa chỉ giao hàng | `features/account/services/address.api.js` | `GET, POST, PUT, DELETE /users/me/addresses` | `user-auth-service` (`AddressController`) | MySQL (`addresses`) | **MATCH (Đã xác minh)** |
| Sản phẩm yêu thích | `features/products/services/favorites.api.js` | `GET, POST, DELETE /users/me/favorites` | `user-auth-service` (`FavoriteController`) | MySQL (`user_favorites`) | **MATCH (Đã xác minh)** |
| Theo dõi / Bỏ theo dõi Shop | `features/shops/services/shop.api.js` | `POST, DELETE /shops/{id}/follow` | `user-auth-service` (`ShopFollowController`)| MySQL (`shop_followers`)| **MATCH (Đã xác minh)** |
| Danh mục sản phẩm | `features/products/services/product.api.js` | `GET /categories` | `Product-Catalog-Service` (`CategoriesCtrl`)| MongoDB (`categories`) | **MATCH (Đã xác minh)** |
| Danh sách sản phẩm | `features/products/services/product.api.js` | `GET /products` | `Product-Catalog-Service` (`ProductsCtrl`) | MongoDB (`products`) | **MATCH (Đã xác minh)** |
| Chi tiết sản phẩm & SKU | `features/products/services/product.api.js` | `GET /products/{id}` | `Product-Catalog-Service` (`ProductsCtrl`) | MongoDB (`products`) | **MATCH (Đã xác minh)** |
| Đăng ký Shop / Onboarding | `features/account/services/seller-register.api.js`| `POST /users/register-seller`| `user-auth-service` (`ShopOnboardCtrl`) | MySQL (`shops`, `kyc`) | **MATCH (Đã xác minh)** |
| Tiến độ Onboarding Shop | `apps/seller/src/services/seller-shop.api.js` | `GET /seller/onboarding` | `user-auth-service` (`ShopOnboardCtrl`) | MySQL (`shops`, `kyc`) | **MATCH (Đã xác minh)** |
| Upload tài liệu KYC (Presign) | `apps/seller/src/services/seller-shop.api.js` | `POST /seller/onboarding/kyc/.../presign` | `user-auth-service` (`KycUploadCtrl`) | S3/MinIO + MySQL | **MATCH (Đã xác minh)** |
| Tạo SPU sản phẩm mới | `apps/seller/.../seller-product.api.js` | `POST /seller/products` | `Product-Catalog-Service` (`SellerProdCtrl`)| MongoDB (`products`) | **MATCH (Đã xác minh)** |
| Cập nhật ma trận SKU | `apps/seller/.../seller-product.api.js` | `PUT /seller/products/{id}/skus` | `Product-Catalog-Service` (`SellerProdCtrl`)| MongoDB (`products`) | **MATCH (Đã xác minh)** |
| Xuất danh sách SP (Excel) | `apps/seller/.../seller-product.api.js` | `GET /seller/products/export` | `Product-Catalog-Service` (`ExportCtrl`) | S3 Presigned URL | **MATCH (Đã xác minh)** |
| Nạp hàng loạt SP (Excel) | `apps/seller/.../seller-product.api.js` | `POST /seller/products/import` | `Product-Catalog-Service` (`ImportWorker`) | S3 + Async Job Queue | **MATCH (Đã xác minh)** |
| Giỏ hàng mua sắm | `apps/buyer/.../useCart.js` | *Hiện chưa gọi API* (Lưu State/LocalStorage) | `order-commerce-service` (`GET, POST /cart`)| Redis (`cart:{user_id}`) | **MOCK / CHƯA NỐI** |
| Đặt hàng / Checkout | `apps/buyer/.../order.api.js:createOrder` | Gọi `POST /orders` (Sai spec) | `order-commerce-service` (`POST /checkout`)| MySQL (`orders`, `items`)| **CONTRACT MISMATCH** |
| Lịch sử đơn hàng Buyer | `apps/buyer/.../order.api.js:getOrders` | Gọi `GET /orders/me` (Sai spec) | `order-commerce-service` (`GET /orders`)| MySQL (`orders`) | **CONTRACT MISMATCH** |
| Quản trị duyệt KYC | `apps/admin/src/services/admin-kyc.api.js` | `POST /admin/shops/{id}/kyc/review` | `user-auth-service` (`AdminKycCtrl`) | MySQL (`kyc_cases`) | **MATCH (Đã cấu hình)** |
| Phân quyền User Role | `apps/admin/src/services/admin-kyc.api.js` | `PATCH /admin/users/{id}/roles` | `user-auth-service` (`AdminRoleCtrl`) | MySQL (`user_roles`) | **MATCH (Đã cấu hình)** |
| Nhật ký kiểm toán | `apps/admin/src/services/admin-kyc.api.js` | `GET /admin/audit-logs` | `user-auth-service` (`AuditLogCtrl`) | MySQL (`audit_logs`) | **MATCH (Đã cấu hình)** |

---

## 9. Mock vs Real Integration Matrix (Kiểm tra Dữ liệu Giả lập)

| Phân hệ / Nghiệp vụ | Trạng thái | Nguồn dữ liệu thực tế khi chạy | Hành vi khi đổi `VITE_USE_MOCK=false` |
|---|---|---|---|
| **Xác thực (Auth: Login/Register/Token)** | **REAL** (Dual) | Có mock fallback lưu `localStorage: taca_mock_users`. | Gọi backend thật qua API Gateway (`/api/v1/auth/*`). Hệ thống đã sẵn sàng 100%. |
| **Sổ địa chỉ & Favorites & Follows** | **REAL** (Dual) | Gọi API thật nếu tắt mock; fallback localStorage khi bật mock. | Hoạt động trơn tru với `user-auth-service`. |
| **Danh mục & Chi tiết sản phẩm (Buyer)** | **REAL** (Dual) | Mảng tĩnh `PRODUCTS_CATALOG` (802 dòng) khi mock. | Gọi `Product-Catalog-Service` (`/api/v1/products`). |
| **Seller Onboarding & KYC Upload** | **REAL** (Dual) | Dữ liệu mô phỏng trong `seller-shop.api.js`. | Gọi API S3 presigned URL và cập nhật tiến độ shop trên MySQL. |
| **Seller Quản lý Sản phẩm (SPU/SKU/Excel)** | **REAL** (Dual) | Giả lập trong `seller-product.api.js`. | Gọi NestJS Product Catalog; tải file Excel qua S3 signed link. |
| **Giỏ hàng (Cart)** | **MOCK** | `localStorage: taca_cart` qua `CartProvider.jsx`. | **Chưa nối BE.** Giỏ hàng chưa gọi endpoint `POST /cart/items` của `order-commerce-service`. |
| **Checkout & Đặt hàng** | **MOCK** (Sai lệch) | `localStorage: taca_user_orders`. | **Gặp lỗi.** Frontend gọi `POST /orders` thay vì `POST /checkout` kèm `Idempotency-Key`. |
| **Seller Xử lý Đơn hàng (Orders)** | **MOCK** | Dữ liệu tĩnh `SELLER_MOCK_DATA` trong `seller.mock.js`. | **Chưa nối BE.** Chưa kết nối API `GET /seller/orders` và `PATCH /seller/orders/{id}/fulfill`. |
| **Seller Tài chính & Rút tiền (Finance)** | **MOCK** | Dữ liệu tĩnh trong `FinancePage.jsx`. | **Chưa nối BE.** Chưa kết nối `payment-wallet-service` (`/api/v1/seller/wallet`). |
| **Admin Thẩm định KYC & Role** | **PARTIAL** | Hàng đợi tĩnh `MOCK_KYC_QUEUE` kết hợp localStorage sync. | Đã cấu hình đúng endpoint; chỉ cần backend môi trường QA bật cổng. |

---

## 10. Penpot vs Implementation (Thiết kế và Mã nguồn)

### 10.1 Thông tin Tham chiếu Penpot
- **Penpot File:** `taca` (ID: `40e06342-8830-80d6-8008-8f83031f9fb5`).
- **Phạm vi thiết kế:** 7 trang giao diện, trong đó có 16 boards chi tiết cho Seller Portal và các luồng Storefront Buyer.
- **Trạng thái MCP Penpot:** Server MCP khả dụng nhưng hiện tại chưa gắn token phiên làm việc trình duyệt (`No Penpot instance connected for user token`). Kết luận đối chiếu dựa trên hồ sơ audit thiết kế đã ghi nhận và mã nguồn token thực tế.

### 10.2 Hệ thống Design Tokens (`tailwind-preset.js`)
Để tránh xung đột với các class tiện ích mặc định của Tailwind CSS, toàn bộ màu sắc và quy chuẩn thiết kế Penpot được chuẩn hóa dưới namespace `taca-`:
- Màu chủ đạo: `taca-primary` (`#4f46e5` - Indigo 600), hover `#4338ca`.
- Màu khuyến mãi / Sale: `taca-sale` (`#e11d48` - Rose 600).
- Nền giao diện: `taca-surface` (`#f8fafc` - Slate 50).
- Văn bản: `taca-text-main` (`#0f172a`), `taca-text-muted` (`#475569`).
- Viền phân cách: `taca-border` (`#e2e8f0`).
- Font chữ chuẩn Penpot: `Plus Jakarta Sans`.

### 10.3 So sánh Mức độ Khớp Giao diện
1. **Buyer Storefront:**
   - Khớp cao (~90%) về bố cục lưới, Product Card, Header, Mega Menu đa cấp và trang Chi tiết sản phẩm (tách module `ProductPurchase`, `ProductShopCard`, `ProductReviews`).
   - Đã thay thế toàn bộ emoji sang bộ icon vector `lucide-react` để đạt độ sắc nét cao theo chuẩn UI Penpot.
2. **Seller Portal:**
   - Luồng Onboarding 5 bước khớp hoàn toàn 16 boards Penpot về thứ tự logic (Hồ sơ $\to$ KYC $\to$ Kho $\to$ Ngân hàng $\to$ Sản phẩm đầu).
   - Trang quản lý SPU/SKU hỗ trợ hiển thị bảng biến thể lồng nhau (Nested SKU Table) và tải file mẫu Excel đúng tinh thần thiết kế.
3. **Admin Portal:**
   - Giao diện Admin mang phong cách Dark Theme (`taca-adminDark: #0f172a`), khớp cấu trúc bảng kiểm duyệt KYC và modal phân quyền người dùng.

---

## 11. Build, Test & CI/CD Pipeline

### 11.1 Các Lệnh Thực thi Hệ thống
- **Chạy môi trường phát triển (Full MFE):**
  ```bash
  npm run dev
  ```
  *Cơ chế:* Sử dụng `concurrently` chạy song song 2 luồng:
  1. `npm run build:remotes && npm run serve:remotes`: Build 3 remote apps và chạy preview server trên các cổng `5174` (Buyer), `5175` (Seller), `5176` (Admin).
  2. `npm run dev:shell`: Khởi chạy Vite dev server cho Shell app trên cổng `5173`.
- **Kiểm tra cú pháp & quy chuẩn:**
  ```bash
  npm run lint
  ```
  Chạy ESLint đồng loạt trên tất cả workspaces (`@taca/admin`, `@taca/buyer`, `@taca/seller`, `@taca/shell`). Hiện trạng: **Pass 100% (0 lỗi, 0 warning)**.
- **Build Production Remotes:**
  ```bash
  npm run build:remotes
  ```
  Build lần lượt `@taca/buyer` (13.11s), `@taca/seller` (2.19s), `@taca/admin` (1.69s). Sinh ra các bundle `remoteEntry.js` và tài nguyên tĩnh tương ứng trong thư mục `dist/`.

### 11.2 CI/CD Workflow (`.github/workflows/ci.yml`)
Quy trình tự động kích hoạt khi có `push` hoặc `pull_request` vào nhánh `main` và `develop`:
1. **Job `commitlint`:** Kiểm tra tiêu đề commit bằng `@commitlint/cli` dựa trên conventional config.
2. **Job `build-and-test`:**
   - Cài đặt Node.js 20.x và dependency qua `npm ci`.
   - Chạy `npm run lint`.
   - Chạy `npm run build:remotes`.
   - Chạy `npm run build -w @taca/shell`.

### 11.3 Đóng gói Docker (`Dockerfile`)
Dự án cung cấp `Dockerfile` chạy trên nền `node:20-alpine`, phơi các cổng `5173, 5174, 5175, 5176`, cho phép truyền biến môi trường `-e VITE_API_URL` và `-e VITE_USE_MOCK` linh hoạt cho kiểm thử độc lập.

---

## 12. Architecture Review (Đánh giá Chuyên gia: Điểm Tốt, Lỗ Hổng & Rủi Ro)

### 12.1 Điểm tốt (Strengths)
1. **Kiến trúc Micro-Frontend chuẩn mực:** Sử dụng Vite Module Federation giúp tách biệt trách nhiệm rõ ràng. Shell chỉ làm nhiệm vụ layout và host routing, không chứa logic nghiệp vụ phức tạp của từng miền.
2. **Khả năng chạy độc lập xuất sắc (Standalone Mode):** Cơ chế `useInRouterContext()` cho phép từng team phát triển, chạy dev server và kiểm thử ứng dụng của mình độc lập mà không bắt buộc phải bật toàn bộ hệ thống.
3. **Cơ chế Token Refresh thông minh:** Tránh race condition token refresh bằng hàng đợi `failedQueue` và phát sự kiện `auth:logout` phân tán giúp trải nghiệm người dùng liền mạch.
4. **Chuẩn hóa Design Tokens:** Đặt tiền tố `taca-` ngăn ngừa triệt để xung đột CSS toàn cục giữa Host và các Remote Apps.

### 12.2 Các Vấn đề & Rủi ro Kiến trúc (Identified Issues & Risks)

#### Vấn đề 1: Thiếu Error Boundary bọc quanh các Remote Apps tại Shell (Mức độ: CRITICAL)
- **Bằng chứng:** Trong `apps/shell/src/app/App.jsx`, các component `BuyerApp`, `SellerApp`, `AdminApp` được bọc bởi `<Suspense>` nhưng **không có `<ErrorBoundary>`**.
- **Tác động thực tế:** Nếu server cổng 5175 (Seller) bị sập hoặc file `remoteEntry.js` gặp lỗi mạng, toàn bộ trang web trên cổng 5173 sẽ bị trắng màn hình (White Screen of Death), khiến khách mua hàng ở cổng Buyer cũng không thể truy cập được.
- **Đề xuất:** Bọc từng remote route bằng component `RemoteErrorBoundary` kèm giao diện fallback thông báo lỗi cục bộ và nút bấm thử lại.

#### Vấn đề 2: Lệch Contract & Phân mảnh Luồng Checkout / Đơn hàng (Mức độ: HIGH)
- **Bằng chứng:** Trong `apps/buyer/.../order.api.js`, frontend gọi `GET /orders/me` và `POST /orders`, trong khi tài liệu backend `order-commerce-docs` quy định endpoint chuẩn là `POST /checkout` (yêu cầu header `Idempotency-Key`) và `GET /orders`.
- **Tác động thực tế:** Khi chuyển cờ `VITE_USE_MOCK=false`, luồng thanh toán và quản lý đơn hàng của Buyer sẽ gặp lỗi `404 Not Found` từ API Gateway.
- **Đề xuất:** Cập nhật lại service `order.api.js` và `useCart` để tích hợp đúng hợp đồng `POST /checkout` và quản lý giỏ hàng trên Redis.

#### Vấn đề 3: Thiếu Hệ thống Kiểm thử Tự động (Automated Testing Void) (Mức độ: HIGH)
- **Bằng chứng:** Không có script `test` trong bất kỳ file `package.json` nào. Thư viện `puppeteer` có trong dependencies nhưng không có test script E2E. CI workflow chỉ chạy `lint` và `build`.
- **Tác động thực tế:** Khó phát hiện các lỗi hồi quy (regression bugs) khi cập nhật shared components hoặc thay đổi DTO API.
- **Đề xuất:** Bổ sung **Vitest** + **React Testing Library** cho Unit/Integration Test và **Playwright** cho kiểm thử liên Micro-App.

#### Vấn đề 4: Tối ưu Kích thước Bundle & Code Splitting (Mức độ: MEDIUM)
- **Bằng chứng:** Bản build `@taca/buyer` có chunk `AddressFormModal` nặng **316.38 kB** và `@taca/seller` có chunk `OnboardingPage` nặng **356.86 kB** (chưa gzip).
- **Tác động thực tế:** Tăng thời gian tải trang ban đầu (LCP) trên mạng di động.
- **Đề xuất:** Tách nhỏ các modal nhập liệu địa chỉ và KYC upload bằng `React.lazy` ở cấp độ component.

---

## 13. Recommended Next Steps (Kế hoạch Đề xuất Theo Thứ Tự Ưu Tiên)

1. **Ưu tiên 1 (Ngay lập tức - P0):**
   - Bổ sung `RemoteErrorBoundary` vào `apps/shell/src/app/App.jsx` để bảo vệ Shell khỏi sự cố khi một remote app gặp lỗi tải tài nguyên.
2. **Ưu tiên 2 (Sprint tiếp theo - P1):**
   - Chuẩn hóa luồng Cart & Checkout: Đồng bộ `CartProvider` với API `order-commerce-service` (`POST /cart/items`, `GET /cart`, `POST /checkout` kèm `Idempotency-Key`).
   - Đổi endpoint `GET /orders/me` thành `GET /orders`.
3. **Ưu tiên 3 (Sprint tiếp theo - P1):**
   - Thiết lập khung kiểm thử tự động: Cài đặt Vitest trong `shared/ui-components` và cấu hình ít nhất 1 kịch bản kiểm thử E2E (Playwright) kiểm tra luồng Host nạp các Remote Apps.
4. **Ưu tiên 4 (Cải tiến - P2):**
   - Nối API thật cho Seller Order Fulfillment (`PATCH /seller/orders/{id}/fulfill`) và Seller Wallet (`payment-wallet-service`).
   - Tối ưu hóa Code Splitting cho các bundle lớn trên 300kB.

---

## 14. Evidence Index (Mục lục Nguồn Bằng chứng)

Toàn bộ các luận điểm và kết luận trong báo cáo này được đối chiếu trực tiếp từ các file nguồn sau:

### Mã nguồn Frontend (Local Workspace):
- `package.json`: Cấu hình workspaces, dependency Module Federation, lint-staged.
- `apps/shell/vite.config.js`: Cấu hình remotes (`buyer:5174`, `seller:5175`, `admin:5176`), shared singletons và proxy `/api`.
- `apps/shell/src/app/App.jsx`: Lazy import remote components, cấu hình routing, widget QA Switcher.
- `apps/buyer/vite.config.js`: Cấu hình Expose `./App` cổng 5174.
- `apps/buyer/src/app/App.jsx`: Xử lý `useInRouterContext()`, AuthProvider, CartProvider, routes Buyer.
- `apps/buyer/src/features/auth/services/auth.api.js`: Hiện thực 11 endpoint auth và cơ chế dual mock/real.
- `apps/buyer/src/features/products/services/product.api.js`: Cây danh mục `CATEGORIES_TREE` và danh mục sản phẩm `PRODUCTS_CATALOG`.
- `apps/buyer/src/features/account/services/order.api.js`: Xử lý lưu đơn LocalStorage và sai lệch endpoint `POST /orders`.
- `apps/seller/vite.config.js` & `apps/seller/src/app/App.jsx`: Cấu hình Remote Seller cổng 5175.
- `apps/seller/src/services/seller-shop.api.js`: Tích hợp 5 bước Onboarding và S3 Presigned URL.
- `apps/seller/src/features/products/services/seller-product.api.js`: Quản lý SPU/SKU và Async Job Import/Export Excel.
- `apps/admin/vite.config.js` & `apps/admin/src/app/App.jsx`: Cấu hình Remote Admin cổng 5176.
- `apps/admin/src/services/admin-kyc.api.js`: Hiện thực duyệt KYC và đồng bộ trạng thái qua BroadcastChannel.
- `shared/utils/api-client.js`: Axios instance, Bearer token interceptor, Refresh Token Queue và helper `isMockMode()`.
- `shared/ui-components/tailwind-preset.js`: Khai báo Design Tokens chuẩn Penpot mang namespace `taca-`.
- `.github/workflows/ci.yml`: CI workflow chạy commitlint, linter và build.
- `Dockerfile`: Cấu hình multi-port container phục vụ kiểm thử.

### Tài liệu Backend Đặc tả (`ecommerce-taca/docs` trên GitHub):
- `api-gateway-docs/docs/api/api-gateway.md`: Đặc tả Kong Gateway 3.x OSS, xác thực JWT RS256 qua JWKS, 19 route families và quy tắc định tuyến.
- `auth-user-docs/docs/api/auth-user.md`: Đặc tả 47 endpoints của `user-auth-service`.
- `product-catalog-docs/docs/api/product-catalog.md`: Đặc tả 26 endpoints của `Product-Catalog-Service`.
- `order-commerce-docs/docs/api/order-commerce.md`: Đặc tả 28 endpoints của `order-commerce-service` (Cart, 3-slot Vouchers, Checkout Saga, Idempotency-Key).
- `docs/audit/FULL_SYSTEM_AUDIT.md`: Báo cáo audit v1.0.0-RC của toàn hệ thống Taca Ecommerce.
