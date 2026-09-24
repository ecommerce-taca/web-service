# Taca E-commerce Frontend Monorepo

Dự án Taca E-commerce sử dụng kiến trúc **Micro-Frontend (Module Federation)** với Vite và React.

## 🏢 Cấu trúc dự án
- `apps/shell`: Ứng dụng Host (chạy ở port `5173`)
- `apps/buyer`: Ứng dụng cho người mua hàng (remote - port `5174`)
- `apps/seller`: Ứng dụng cho người bán hàng (remote - port `5175`)
- `apps/admin`: Ứng dụng cho ban quản trị (remote - port `5176`)
- `shared`: Các module, components và utilities dùng chung.

## 🚀 Chạy dự án ở môi trường Local (Dev)

Yêu cầu: **Node.js 20+**

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```

2. Copy file môi trường và tuỳ chỉnh nếu cần:
   ```bash
   cp .env.example .env
   ```

3. Khởi chạy toàn bộ hệ thống (Shell + Remotes):
   ```bash
   npm run dev
   ```
   *Lệnh này sẽ build các remotes, chạy preview chúng, và cuối cùng chạy dev server cho ứng dụng shell.*

4. Truy cập ứng dụng tại: http://localhost:5173

## 🐳 Chạy dự án bằng Docker (Dành cho kiểm thử)

Dự án đã được thiết lập `Dockerfile` sẵn sàng cho việc deploy và testing. Bạn có thể dễ dàng truyền vào các biến môi trường khi khởi chạy container.

### 1. Build Docker Image
```bash
docker build -t taca-frontend .
```

### 2. Chạy Docker Container

Bạn có thể thay đổi các tham số biến môi trường bằng cờ `-e` của Docker.
Các biến môi trường hỗ trợ:
- `VITE_API_URL`: URL của Backend API (mặc định: `/api/v1`)
- `VITE_USE_MOCK`: Kích hoạt chế độ mock API thay vì gọi backend thật (`true` hoặc `false`)

**Ví dụ chạy với Mock API:**
```bash
docker run -d -p 5173:5173 -p 5174:5174 -p 5175:5175 -p 5176:5176 \
  -e VITE_USE_MOCK=true \
  --name taca-fe \
  taca-frontend
```

**Ví dụ chạy với Backend thật:**
```bash
docker run -d -p 5173:5173 -p 5174:5174 -p 5175:5175 -p 5176:5176 \
  -e VITE_API_URL=http://api.taca.local/v1 \
  -e VITE_USE_MOCK=false \
  --name taca-fe \
  taca-frontend
```

### 3. Kiểm thử
Truy cập hệ thống tại địa chỉ: [http://localhost:5173](http://localhost:5173).
Hệ thống module federation đã được tự động expose các cổng `5174`, `5175`, và `5176` ra bên ngoài để shell có thể lấy các remote app thành công.

## 📜 Các lệnh hữu ích khác

- `npm run lint`: Kiểm tra mã nguồn với ESLint.
- `npm run build:remotes`: Chỉ build các ứng dụng remote.
- `npm run serve:remotes`: Chạy local server cho các ứng dụng remote sau khi build.
