# Monorepo Micro-Frontend Architecture

Hệ thống Taca Ecommerce sử dụng mô hình **Monorepo** (npm workspaces) kết hợp với **Vite Module Federation** chia làm 4 Micro-Apps.

```text
taca_ecommerce/
├── package.json          (Root Workspace config)
├── apps/
│   ├── shell/            (Host App - Chạy port 5173)
│   │   ├── vite.config.js (Khai báo remotes)
│   │   └── src/
│   │       └── app/App.jsx (Routing gốc)
│   ├── buyer/            (Remote App - Chạy port 5174)
│   │   ├── vite.config.js (Expose RemoteApp)
│   │   └── src/
│   │       ├── features/  (Home, Products, Cart...)
│   │       └── app/RemoteApp.jsx
│   ├── seller/           (Remote App - Chạy port 5175)
│   └── admin/            (Remote App - Chạy port 5176)
└── shared/               (Dùng chung cho cả 4 apps)
    ├── ui-components/
    └── utils/
```

## Các khái niệm:
- **`shell`**: Chịu trách nhiệm load layout tổng thể và làm cầu nối (Host) điều hướng giữa các micro-apps.
- **`buyer`**: Xử lý toàn bộ logic liên quan đến storefront cho khách hàng mua sắm.
- **`seller`**: Quản lý dashboard bán hàng.
- **`admin`**: Quản lý hệ thống.
