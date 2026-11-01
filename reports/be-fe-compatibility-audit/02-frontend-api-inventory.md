# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 02. Danh Mục API Frontend Đang Khai Thác (Frontend API Inventory)

**Phạm vi rà soát**: Toàn bộ mã nguồn 4 ứng dụng trong Monorepo:
1. `@taca/buyer` (`apps/buyer`)
2. `@taca/seller` (`apps/seller`)
3. `@taca/admin` (`apps/admin`)
4. `@taca/shell` (`apps/shell`)
5. Shared Utilities (`shared/utils/api-client.js`, `shared/services/`)

---

### 1. Cơ Chế Gọi API Tại Frontend (Architecture & Interceptors)

Frontend thực hiện gọi API thông qua `sharedApiClient` (`shared/utils/api-client.js`) bọc quanh `fetch` API:
- **Base URL**: Cấu hình qua biến môi trường `VITE_API_GATEWAY_URL` (Mặc định `http://localhost:8080/api/v1`).
- **Authorization Header**: Tự động chèn `Authorization: Bearer <access_token>` từ `localStorage.getItem('token')`.
- **Refresh Token Interceptor**: Bắt lỗi `401 Unauthorized` để gọi `POST /auth/refresh`, cấp lại token và thử lại request gốc.
- **Envelope Unwrapping**: Tự động bóc tách `response.data` từ cấu trúc chuẩn `{ success: true, data: ... }`.
- **Hybrid Mock Mechanism**: Rất nhiều service kiểm tra cờ `isMockMode()` (kiểm tra `VITE_USE_MOCK_API === 'true'`).

---

### 2. Bảng Danh Mục Chi Tiết API Frontend Đang Sử Dụng

#### 2.1. Ứng Dụng Buyer Storefront (`apps/buyer`)

| FE Module / File | Method | Endpoint Đang Gọi | Request Fields (Body / Params) | Response Fields Dự Kiến | Nơi Sử Dụng Trong Mã Nguồn | Tình Trạng Contract |
|:---|:---|:---|:---|:---|:---|:---|
| `auth.api.js` | `POST` | `/auth/login` | `{ email, password }` | `{ token, user }` | `LoginPage.jsx:45` | **VERIFIED** |
| `auth.api.js` | `POST` | `/auth/register` | `{ email, password, full_name, phone }` | `{ user }` | `RegisterPage.jsx:52` | **VERIFIED** |
| `auth.api.js` | `POST` | `/auth/refresh` | `{ refresh_token }` | `{ access_token, refresh_token }` | `api-client.js:84` | **VERIFIED** |
| `auth.api.js` | `POST` | `/auth/logout` | `{ refresh_token }` | `{ success: true }` | `Header.jsx:112` | **VERIFIED** |
| `auth.api.js` | `GET` | `/auth/me` | None | `{ id, email, full_name, role }` | `AuthContext.jsx:38` | **VERIFIED** |
| `address.api.js` | `GET` | `/users/addresses` | None | `Array<AddressItem>` | `AddressListPage.jsx:24` | **VERIFIED** |
| `address.api.js` | `POST` | `/users/addresses` | `{ recipient_name, phone, street, ward, district, province, is_default }` | Address Object | `AddressModal.jsx:68` | **VERIFIED** |
| `address.api.js` | `PUT` | `/users/addresses/{id}` | Address Partial Fields | Address Object | `AddressModal.jsx:74` | **VERIFIED** |
| `address.api.js` | `DELETE` | `/users/addresses/{id}`| None | `{ success: true }` | `AddressListPage.jsx:58` | **VERIFIED** |
| `address.api.js` | `PUT` | `/users/addresses/{id}/default` | None | Address Object | `AddressListPage.jsx:64` | **VERIFIED** |
| `cart.api.js` | `GET` | `/cart` | None | `{ cart_id, items, total_quantity }` | `CartProvider.jsx:32` | **VERIFIED** |
| `cart.api.js` | `POST` | `/cart/items` | `{ sku_id, quantity }` | Cart Object | `ProductPurchase.jsx:92` | **VERIFIED** |
| `cart.api.js` | `PUT` | `/cart/items/{id}` | `{ quantity }` | Cart Object | `CartItem.jsx:44` | **VERIFIED** |
| `cart.api.js` | `DELETE` | `/cart/items/{id}` | None | Cart Object | `CartItem.jsx:56` | **VERIFIED** |
| `cart.api.js` | `DELETE` | `/cart` | None | `{ success: true }` | `cart.api.js:121` (`clearCart`) | ❌ **PHANTOM ENDPOINT (BE Không Có)** |
| `order.api.js` | `POST` | `/checkout` | `{ cart_id, selected_item_ids, address_id, payment_method, voucher_codes, total, shipping_fee, discount_amount }` | `{ order_id, order_code, payment_url }` | `CheckoutPage.jsx:158` | ❌ **MISMATCH (Sai trường voucher & gửi thừa số tiền tự tính)** |
| `order.api.js` | `GET` | `/orders` | Query: `status, page, limit` | `Array<OrderSummary>` | `OrderHistoryPage.jsx:30` | **VERIFIED** |
| `order.api.js` | `GET` | `/orders/{id}` | Path: `id` | Detail Order Object | `OrderDetailPage.jsx:28` | **VERIFIED** |
| `order.api.js` | `POST` | `/orders/{id}/cancel` | `{ reason }` | `{ order_id, status }` | `OrderDetailPage.jsx:75` | **VERIFIED** |
| `order.api.js` | N/A | `markOrderPaid` | `(orderId, paymentId)` | LocalStorage Mutation | `CheckoutPage.jsx:212` | ❌ **CLIENT HACK (Bỏ qua Webhook BE)** |
| `voucher.api.js` | `GET` | `/vouchers/available` | Query: `cart_total, shop_ids` | `Array<VoucherItem>` | `VoucherSelectModal.jsx:22` | **VERIFIED (Có Fallback ngầm)** |
| `voucher.api.js` | `POST` | `/vouchers/validate` | `{ code, cart_total }` | `{ valid, voucher_id, discount_value }`| `CheckoutPage.jsx:89` | **VERIFIED** |
| `review.api.js` | `GET` | `/reviews/products/{id}` | Path: `id`, Query: `page, limit` | `{ items, average_rating }` | `ProductReviews.jsx:34` | **VERIFIED** |
| `review.api.js` | `POST` | `/reviews` | `{ order_id, product_id, sku_id, rating, comment, images }` | Review Object | `OrderReviewModal.jsx:48` | **VERIFIED** |
| `shipment.api.js` | `GET` | `/shipments/tracking/{id}`| Path: `orderId` | `{ tracking_number, carrier_name, timeline }` | `TrackingModal.jsx:26` | **VERIFIED** |
| `product.api.js` | `GET` | `/products` | Query: `page, limit, category_id, sort, min_price, max_price` | `Array<ProductSummary>` | `ProductGrid.jsx:35` | **VERIFIED** |
| `product.api.js` | `GET` | `/products/{id}` | Path: `id` | Product Detail Object | `ProductDetailPage.jsx:42` | ❌ **MISMATCH (Sai format attributes & price)** |
| `product.api.js` | `GET` | `/products?is_flash_sale=true` | Query: `is_flash_sale=true` | `Array<ProductSummary>` | `FlashSaleBanner.jsx:18` | ❌ **MISMATCH (BE NestJS chặn tham số)** |
| `product.api.js` | `GET` | `/categories` | None | `Array<CategoryItem>` | `Header.jsx:54`, `CategoryNav.jsx` | **VERIFIED** |
| `product.api.js` | `GET` | `/search` | Query: `q, page, limit, sort` | `{ items, total }` | `SearchResultsPage.jsx:31` | **VERIFIED** |
| `product.api.js` | `GET` | `/search/suggest` | Query: `q` | `Array<{ text, category_name }>` | `SearchAutocomplete.jsx:20` | **VERIFIED** |
| `shop.api.js` | `POST` | `/shops/register` | `{ shop_name, tax_code, id_card_number, address, business_type, documents }` | `{ shop_id, status }` | `SellerRegisterPage.jsx:110`| **VERIFIED** |

---

#### 2.2. Ứng Dụng Seller Merchant Portal (`apps/seller`)

| FE Module / File | Method | Endpoint Đang Gọi | Request Fields (Body / Params) | Response Fields Dự Kiến | Nơi Sử Dụng Trong Mã Nguồn | Tình Trạng Contract |
|:---|:---|:---|:---|:---|:---|:---|
| `seller-auth.api.js` | `POST` | `/auth/login` | `{ email, password }` | `{ token, user }` | `SellerLoginPage.jsx:38` | **VERIFIED** |
| `seller-auth.api.js` | `GET` | `/auth/me` | None | `{ id, email, role, shop_id }`| `SellerAuthContext.jsx:25` | **VERIFIED** |
| `seller-product.api.js` | `GET` | `/seller/products` | Query: `page, limit, status, keyword` | `Array<SellerProduct>` | `ProductListPage.jsx:40` | **VERIFIED** |
| `seller-product.api.js` | `POST` | `/seller/products` | `{ title, description, category_id, images, attributes, skus }` | Created Product | `ProductCreatePage.jsx:95` | **VERIFIED** |
| `seller-product.api.js` | `GET` | `/seller/products/{id}` | Path: `id` | Product Detail | `ProductEditPage.jsx:34` | **VERIFIED** |
| `seller-product.api.js` | `PUT` | `/seller/products/{id}` | Updated Payload | Updated Product | `ProductEditPage.jsx:82` | **VERIFIED** |
| `seller-product.api.js` | `DELETE` | `/seller/products/{id}` | Path: `id` | `{ success: true }` | `ProductListPage.jsx:78` | **VERIFIED** |
| `seller-product.api.js` | `PATCH` | `/seller/products/{id}/status` | `{ status }` | `{ id, status }` | `ProductListPage.jsx:85` | **VERIFIED** |
| `seller-order.api.js` | `GET` | `/seller/orders` | Query: `status, page, limit, keyword` | `Array<SellerOrder>` | `OrderManagementPage.jsx:32` | **VERIFIED** |
| `seller-order.api.js` | `GET` | `/seller/orders/{id}` | Path: `orderId` | Detail Order | `SellerOrderDetailPage.jsx:28` | **VERIFIED** |
| `seller-order.api.js` | `PATCH` | `/seller/orders/{id}/confirm` | None | `{ order_id, status }` | `OrderManagementPage.jsx:95` | **VERIFIED** |
| `seller-order.api.js` | `PATCH` | `/seller/orders/{id}/ship` | `{ tracking_code, carrier_id }` | `{ order_id, status }` | `OrderManagementPage.jsx:105`| **VERIFIED** |
| `seller-order.api.js` | `PATCH` | `/seller/orders/{id}/cancel` | `{ reason }` | `{ order_id, status }` | `OrderManagementPage.jsx:115`| **VERIFIED** |
| `seller-inventory.api.js`| `GET` | `/seller/inventory` | Query: `page, limit, low_stock` | `Array<InventoryItem>` | `InventoryPage.jsx:30` | **VERIFIED** |
| `seller-inventory.api.js`| `PUT` | `/seller/inventory/{skuId}` | `{ stock, adjustment_reason }` | Updated Inventory | `InventoryPage.jsx:72` | **VERIFIED** |
| `seller-inventory.api.js`| `GET` | `/seller/inventory/logs` | Query: `sku_id, page, limit` | `Array<InventoryLog>` | `InventoryLogModal.jsx:24` | **VERIFIED** |
| `seller-finance.api.js` | `GET` | `/seller/wallet/balance` | None | `{ available_balance, pending_balance, total_earnings }` | `FinancePage.jsx:25` | **VERIFIED** |
| `seller-finance.api.js` | `GET` | `/seller/wallet/transactions` | Query: `page, limit, type` | `Array<TransactionItem>` | `FinancePage.jsx:42` | **VERIFIED** |
| `seller-finance.api.js` | `POST` | `/seller/payouts` | `{ amount, bank_account_id }` | `{ payout_id, status }` | `WithdrawModal.jsx:54` | ⚠️ **DISABLED BE (ADR-003 Gate, Mock Fallback)** |
| `seller-finance.api.js` | `GET` | `/seller/payouts` | Query: `page, limit` | `Array<PayoutItem>` | `FinancePage.jsx:58` | ⚠️ **DISABLED BE (ADR-003 Gate, Mock Fallback)** |
| `seller-finance.api.js` | `GET` | `/seller/revenue/export` | Query: `from_date, to_date` | Blob / Download URL | `FinancePage.jsx:88` | ❌ **BE CHƯA TRIỂN KHAI** |
| `seller-voucher.api.js` | `GET` | `/seller/vouchers` | Query: `page, limit, status` | `Array<SellerVoucher>` | `SellerVoucherPage.jsx:30` | **VERIFIED** |
| `seller-voucher.api.js` | `POST` | `/seller/vouchers` | Full Voucher Object | Created Voucher | `CreateVoucherModal.jsx:65` | **VERIFIED** |
| `seller-voucher.api.js` | `PUT` | `/seller/vouchers/{id}` | Updated Voucher Object | Updated Voucher | `EditVoucherModal.jsx:68` | **VERIFIED** |
| `seller-voucher.api.js` | `PATCH` | `/seller/vouchers/{id}/status` | `{ status }` | `{ id, status }` | `SellerVoucherPage.jsx:72` | **VERIFIED** |

---

#### 2.3. Ứng Dụng Admin System Portal (`apps/admin`)

| FE Module / File | Method | Endpoint Đang Gọi | Request Fields (Body / Params) | Response Fields Dự Kiến | Nơi Sử Dụng Trong Mã Nguồn | Tình Trạng Contract |
|:---|:---|:---|:---|:---|:---|:---|
| `admin-auth.api.js` | `POST` | `/auth/login` | `{ email, password }` | `{ token, user }` | `AdminLoginPage.jsx:35` | **VERIFIED** |
| `admin-catalog.api.js` | `GET` | `/admin/categories` | Query: `page, limit` | `Array<CategoryItem>` | `AdminCategoryPage.jsx:28` | **VERIFIED** |
| `admin-catalog.api.js` | `POST` | `/admin/categories` | `{ name, slug, parent_id, icon }` | Created Category | `AdminCategoryPage.jsx:70` | **VERIFIED** |
| `admin-catalog.api.js` | `PUT` | `/admin/categories/{id}` | Category Update Fields | Updated Category | `AdminCategoryPage.jsx:85` | **VERIFIED** |
| `admin-catalog.api.js` | `DELETE`| `/admin/categories/{id}` | Path: `id` | `{ success: true }` | `AdminCategoryPage.jsx:98` | **VERIFIED** |
| `admin-kyc.api.js` | `GET` | `/admin/shops/kyc` | Query: `status, page, limit` | `Array<KycShopItem>` + Meta | `AdminKycPage.jsx:32` | **VERIFIED (Giao diện hardcode stats)** |
| `admin-kyc.api.js` | `PUT` | `/admin/shops/kyc/{id}/approve` | None | `{ shop_id, status }` | `KycReviewModal.jsx:52` | **VERIFIED** |
| `admin-kyc.api.js` | `PUT` | `/admin/shops/kyc/{id}/reject` | `{ reason }` | `{ shop_id, status, reason }` | `KycReviewModal.jsx:64` | **VERIFIED** |
| `admin-finance.api.js` | `GET` | `/admin/settlements` | Query: `page, limit, status` | `Array<SettlementBatch>` | `AdminSettlementPage.jsx:30` | **VERIFIED** |
| `admin-finance.api.js` | `GET` | `/admin/settlements/{id}` | Path: `batchId` | Detail Settlement Batch | `SettlementDetailPage.jsx:26`| **VERIFIED** |
| `admin-finance.api.js` | `POST` | `/admin/settlements/batch`| `{ cycle_start, cycle_end }` | `{ batch_id, status }` | `AdminSettlementPage.jsx:68` | ❌ **PHANTOM ENDPOINT (BE Không Cho Phép Manual)** |
| `admin-finance.api.js` | `POST` | `/admin/settlements/{id}/retry`| Path: `batchId` | `{ batch_id, status }` | `AdminSettlementPage.jsx:82` | **VERIFIED** |
| `admin-voucher.api.js` | `GET` | `/admin/vouchers` | Query: `page, limit` | `Array<VoucherItem>` | `AdminVoucherPage.jsx:28` | **VERIFIED** |
| `admin-voucher.api.js` | `POST` | `/admin/vouchers` | Platform Voucher Payload | Created Voucher | `CreatePlatformVoucherModal.jsx:54` | **VERIFIED** |
