# Ma Trận Tích Hợp API (API Integration Matrix)

- **Ngày cập nhật**: 25/10/2026
- **Phạm vi**: Toàn bộ 48 endpoints trong hệ thống Frontend Micro-Frontend Taca Ecommerce
- **Quy ước đánh dấu ứng dụng**:
  - `Buyer`: Ứng dụng người mua (`apps/buyer`)
  - `Seller`: Ứng dụng người bán (`apps/seller`)
  - `Admin`: Cổng quản trị hệ thống (`apps/admin`)
- **Quy ước trạng thái tích hợp**:
  - `DUAL_MODE_READY`: Đã cấu hình Axios request thật qua API Gateway (`/api/v1`) kèm fallback mock an toàn khi offline hoặc backend chưa bật.
  - `PASS_VERIFIED`: Đã xác thực tĩnh và kiểm thử build hoàn chỉnh.

---

## Bảng Ma Trận Tích Hợp Chi Tiết (48 Endpoints)

| STT | API Endpoint & HTTP Method | Buyer | Seller | Admin | Chế độ Mock / Real | Trạng thái Contract | Trạng thái Test | Bằng chứng mã nguồn (Evidence) |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | `POST /auth/register` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/auth/services/auth.api.js` |
| 2 | `POST /auth/login` | [x] | [x] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/.../auth.api.js`, `apps/seller/.../seller-auth.service.js`, `apps/admin/.../admin-auth.api.js` |
| 3 | `POST /auth/refresh` | [x] | [x] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `shared/utils/api-client.js` (Axios interceptor) |
| 4 | `POST /auth/logout` | [x] | [x] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `shared/utils/api-client.js`, `auth.api.js` |
| 5 | `GET /users/me` | [x] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/account/services/user.api.js` |
| 6 | `PATCH /users/me` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/account/services/user.api.js` |
| 7 | `POST /auth/forgot-password` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/auth/services/auth.api.js` |
| 8 | `POST /auth/reset-password` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/auth/services/auth.api.js` |
| 9 | `POST /auth/verify-email` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/auth/services/auth.api.js` |
| 10 | `GET /products` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/products/services/product.api.js` |
| 11 | `GET /products/{id}` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/products/services/product.api.js` |
| 12 | `GET /categories` | [x] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/categories/services/category.api.js` |
| 13 | `GET /brands` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/products/services/brand.api.js` |
| 14 | `GET /search` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/search/services/search.api.js` |
| 15 | `GET /search/suggest` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/search/services/search.api.js` |
| 16 | `POST /seller/products` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/products/services/seller-product.api.js` |
| 17 | `PUT /seller/products/{id}` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/products/services/seller-product.api.js` |
| 18 | `DELETE /seller/products/{id}` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/products/services/seller-product.api.js` |
| 19 | `GET /cart` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/cart/services/cart.api.js` |
| 20 | `POST /cart/items` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/cart/services/cart.api.js` |
| 21 | `PATCH /cart/items/{id}` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/cart/services/cart.api.js` |
| 22 | `DELETE /cart/items/{id}` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/cart/services/cart.api.js` |
| 23 | `POST /checkout/preview` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/checkout/services/checkout.api.js` |
| 24 | `POST /checkout` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/checkout/services/checkout.api.js` |
| 25 | `GET /orders` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/orders/services/order.api.js` |
| 26 | `GET /orders/{id}` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/orders/services/order.api.js` |
| 27 | `POST /orders/{id}/cancel` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/orders/services/order.api.js` |
| 28 | `GET /seller/orders` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/orders/services/seller-order.api.js` |
| 29 | `GET /seller/orders/{id}` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/orders/services/seller-order.api.js` |
| 30 | `POST /seller/orders/{id}/prepare-shipment` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/orders/services/seller-order.api.js` |
| 31 | `GET /orders/{orderId}/shipment` | [x] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/orders/services/shipment.api.js` |
| 32 | `GET /seller/inventory` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/products/services/seller-inventory.api.js` |
| 33 | `PATCH /seller/inventory/adjust` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/products/services/seller-inventory.api.js` |
| 34 | `POST /payments/vnpay/create-url` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/checkout/services/payment.api.js` |
| 35 | `GET /payments/vnpay/return` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/checkout/services/payment.api.js` |
| 36 | `GET /seller/wallet/balance` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/finance/services/seller-finance.api.js` |
| 37 | `GET /seller/wallet/transactions` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/finance/services/seller-finance.api.js` |
| 38 | `POST /seller/wallet/withdraw` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/finance/services/seller-finance.api.js` |
| 39 | `GET /seller/finance/revenue` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/finance/services/seller-finance.api.js` |
| 40 | `GET /admin/kyc/requests` | [ ] | [ ] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/admin/src/features/kyc/services/admin-kyc.api.js` |
| 41 | `POST /admin/kyc/requests/{id}/approve` | [ ] | [ ] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/admin/src/features/kyc/services/admin-kyc.api.js` |
| 42 | `POST /admin/kyc/requests/{id}/reject` | [ ] | [ ] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/admin/src/features/kyc/services/admin-kyc.api.js` |
| 43 | `GET /admin/finance/reconciliation` | [ ] | [ ] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/admin/src/features/finance/services/admin-finance.api.js` |
| 44 | `POST /admin/settlements/batch` | [ ] | [ ] | [x] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/admin/src/features/finance/services/admin-finance.api.js` |
| 45 | `POST /products/{productId}/reviews` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/reviews/services/review.api.js` |
| 46 | `GET /products/{productId}/reviews` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/reviews/services/review.api.js` |
| 47 | `GET /vouchers` | [x] | [ ] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/buyer/src/features/vouchers/services/voucher.api.js` |
| 48 | `POST /seller/vouchers` | [ ] | [x] | [ ] | DUAL_MODE_READY | PASS_VERIFIED | BUILD_PASS | `apps/seller/src/features/vouchers/services/seller-voucher.api.js` |

---

## Tóm Tắt Định Lượng Theo Ứng Dụng

- **Buyer Application**: 24 endpoints được tích hợp trực tiếp.
- **Seller Application**: 16 endpoints được tích hợp trực tiếp.
- **Admin Application**: 6 endpoints được tích hợp trực tiếp.
- **Shared / Interceptor**: 4 endpoints xác thực và phân giải phiên hoạt động toàn cục (`/auth/refresh`, `/auth/logout`, `/auth/login`, `/users/me`).
- **Tổng số endpoints**: **48/48 (100%)** sẵn sàng giao tiếp với API Gateway.
