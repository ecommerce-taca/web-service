# ---------- Build: bundle shell + 3 remote (buyer/seller/admin) thành file tĩnh ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY . .
RUN npm ci

# Mọi URL đều tương đối (cùng origin) → image dùng được cho bất kỳ domain nào đứng sau API Gateway.
#   /                    → shell
#   /remotes/<app>/      → remote, remoteEntry tại /remotes/<app>/assets/remoteEntry.js
#   /api/v1, /ws/...     → API Gateway (Kong), cùng origin nên không cần CORS
ENV VITE_API_URL=/api/v1 \
    VITE_USE_MOCK=false \
    VITE_GATEWAY_TARGET=/ \
    VITE_REMOTE_BUYER_URL=/remotes/buyer/assets/remoteEntry.js \
    VITE_REMOTE_SELLER_URL=/remotes/seller/assets/remoteEntry.js \
    VITE_REMOTE_ADMIN_URL=/remotes/admin/assets/remoteEntry.js

RUN VITE_BASE=/remotes/buyer/ npm run build -w @taca/buyer \
 && VITE_BASE=/remotes/seller/ npm run build -w @taca/seller \
 && VITE_BASE=/remotes/admin/ npm run build -w @taca/admin \
 && npm run build -w @taca/shell

# ---------- Runtime: nginx không chạy bằng root ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/shell/dist /usr/share/nginx/html
COPY --from=build /app/apps/buyer/dist /usr/share/nginx/html/remotes/buyer
COPY --from=build /app/apps/seller/dist /usr/share/nginx/html/remotes/seller
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html/remotes/admin

EXPOSE 8080
