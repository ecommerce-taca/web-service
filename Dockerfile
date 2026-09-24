# Sử dụng Node.js bản nhẹ
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy toàn bộ source code (bao gồm cấu hình workspace)
COPY . .

# Cài đặt thư viện
RUN npm ci

# Set biến môi trường mặc định (có thể bị ghi đè khi chạy container qua -e)
ENV VITE_API_URL=/api/v1
ENV VITE_USE_MOCK=true

# Build các remotes và start toàn bộ frontend
# Lệnh "npm run dev" sẽ chạy build:remotes -> serve:remotes và dev:shell
CMD ["npm", "run", "dev"]

# Expose các port cho shell và các remote apps
# Shell: 5173, Buyer: 5174, Seller: 5175, Admin: 5176
EXPOSE 5173 5174 5175 5176
