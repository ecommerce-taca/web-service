# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 01. Danh Mục API Backend Thực Tế (Backend API Inventory)

**Nguồn tham chiếu (Source of Truth)**: 
- Kho tài liệu kỹ thuật chuẩn: `ecommerce-taca/docs` (12 Microservices Specs + API Gateway Routing + Contract Matrix).
- Implementation Architecture: NestJS (Product, Cart, Search), Java Spring Boot (Payment, Order, Auth, Inventory, Settlement).

---

### 1. Chuẩn Hóa Khung Envelope & Mã Trạng Thái Backend

Toàn bộ 12 dịch vụ backend tuân thủ chuẩn JSON Envelope thống nhất qua API Gateway:

```json
// Phản hồi thành công (200 OK, 201 Created)
{
  "success": true,
  "code": "SUCCESS",
  "data": { ... },
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}

// Phản hồi thất bại (400, 401, 403, 404, 409, 500)
{
  "success": false,
  "code": "ERROR_CODE_ENUM",
  "message": "Mô tả lỗi thân thiện hoặc chi tiết validation",
  "details": [
    { "field": "email", "issue": "Invalid email format" }
  ],
  "timestamp": "2026-11-01T07:15:00Z"
}
```

---

### 2. Danh Mục Toàn Bộ Endpoint Thực Tế Của 12 Microservices

#### 2.1. API Gateway & Dịch Vụ Định Danh / Người Dùng (Auth & User Service)
*Công nghệ: Java Spring Boot + JWT + Redis Cache*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/v1/auth/register` | `{ email, password, full_name, phone }` | `{ user_id, email, full_name }` | Public | Đăng ký tài khoản người mua |
| `POST` | `/api/v1/auth/login` | `{ email, password }` | `{ access_token, refresh_token, token_type, expires_in, user }` | Public | Đăng nhập hệ thống, cấp cặp JWT |
| `POST` | `/api/v1/auth/refresh` | `{ refresh_token }` | `{ access_token, refresh_token, expires_in }` | Public | Cấp lại access token khi hết hạn |
| `POST` | `/api/v1/auth/logout` | `{ refresh_token }` | `{ success: true }` | Bearer Token | Đưa refresh token vào Redis blacklist |
| `GET` | `/api/v1/auth/me` | None | `{ id, email, full_name, phone, role, avatar_url }` | Bearer Token | Lấy thông tin phiên đăng nhập hiện tại |
| `GET` | `/api/v1/users/profile` | None | `{ id, email, full_name, phone, avatar_url, dob, gender }` | Bearer Token | Chi tiết hồ sơ cá nhân |
| `PUT` | `/api/v1/users/profile` | `{ full_name, phone, avatar_url, dob, gender }` | `{ id, full_name, phone, ... }` | Bearer Token | Cập nhật hồ sơ cá nhân |
| `GET` | `/api/v1/users/addresses` | None | `Array<{ id, recipient_name, phone, street, ward, district, province, is_default }>` | Bearer Token | Danh sách sổ địa chỉ nhận hàng |
| `POST` | `/api/v1/users/addresses` | `{ recipient_name, phone, street, ward, district, province, is_default }` | Address Object | Bearer Token | Thêm mới địa chỉ nhận hàng |
| `PUT` | `/api/v1/users/addresses/{id}` | Address Partial Fields | Address Object | Bearer Token | Cập nhật địa chỉ theo ID |
| `DELETE` | `/api/v1/users/addresses/{id}`| None | `{ success: true }` | Bearer Token | Xóa địa chỉ |
| `PUT` | `/api/v1/users/addresses/{id}/default` | None | Address Object | Bearer Token | Thiết lập địa chỉ mặc định |
| `POST` | `/api/v1/shops/register` | `{ shop_name, tax_code, id_card_number, address, business_type, documents: [...] }` | `{ shop_id, status: "PENDING" }` | Bearer Token (Buyer) | Nộp hồ sơ đăng ký mở gian hàng Seller |
| `GET` | `/api/v1/admin/shops/kyc` | Query: `status, page, limit` | `Array<KycShopItem>` + Pagination | Role: ADMIN | Danh sách hồ sơ KYC gian hàng |
| `PUT` | `/api/v1/admin/shops/kyc/{id}/approve` | None | `{ shop_id, status: "ACTIVE" }` | Role: ADMIN | Phê duyệt hồ sơ KYC mở shop |
| `PUT` | `/api/v1/admin/shops/kyc/{id}/reject` | `{ reason: string }` *(min 10 chars)* | `{ shop_id, status: "REJECTED", reason }` | Role: ADMIN | Từ chối hồ sơ kèm lý do |

---

#### 2.2. Dịch Vụ Danh Mục Sản Phẩm (Product Catalog Service)
*Công nghệ: NestJS + MongoDB / PostgreSQL + Strict ValidationPipe*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/products` | Query: `page, limit, category_id, sort, min_price, max_price, rating` | `Array<ProductSummary>` + Meta | Public | Danh sách sản phẩm sàn. **Chặn thuộc tính ngoài DTO** |
| `GET` | `/api/v1/products/{id}` | Path: `id` (UUID hoặc Slug) | `{ id, title, description, category_id, brand, images: [], attributes: [], skus: [{ sku_id, seller_sku, price: { base_price, sale_price, currency }, stock }], rating_avg, review_count }` | Public | Chi tiết sản phẩm & biến thể SKU |
| `GET` | `/api/v1/categories` | Query: `parent_id` (optional) | `Array<{ id, name, slug, icon, level, children: [] }>` | Public | Cây danh mục ngành hàng |
| `GET` | `/api/v1/seller/products` | Query: `page, limit, status, keyword` | `Array<SellerProductItem>` + Meta | Role: SELLER | Danh sách sản phẩm của gian hàng |
| `POST` | `/api/v1/seller/products` | `{ title, description, category_id, images, attributes, skus: [{ seller_sku, base_price, sale_price, stock, tier_index }] }` | Created Product Object | Role: SELLER | Tạo mới sản phẩm & ma trận SKU |
| `GET` | `/api/v1/seller/products/{id}` | Path: `id` | Full Product Detail Object | Role: SELLER | Xem chi tiết sản phẩm thuộc shop |
| `PUT` | `/api/v1/seller/products/{id}` | Update Product Payload | Updated Product Object | Role: SELLER | Cập nhật thông tin sản phẩm |
| `DELETE` | `/api/v1/seller/products/{id}` | Path: `id` | `{ success: true }` | Role: SELLER | Xóa mềm sản phẩm |
| `PATCH` | `/api/v1/seller/products/{id}/status` | `{ status: "ACTIVE" \| "INACTIVE" }` | `{ id, status }` | Role: SELLER | Ẩn/Hiện sản phẩm trên sàn |
| `GET` | `/api/v1/admin/categories` | Query: `page, limit` | `Array<CategoryItem>` | Role: ADMIN | Quản trị toàn bộ danh mục |
| `POST` | `/api/v1/admin/categories` | `{ name, slug, parent_id, icon }` | Created Category | Role: ADMIN | Tạo mới danh mục sàn |
| `PUT` | `/api/v1/admin/categories/{id}` | `{ name, slug, icon, status }` | Updated Category | Role: ADMIN | Cập nhật danh mục |
| `DELETE` | `/api/v1/admin/categories/{id}` | Path: `id` | `{ success: true }` | Role: ADMIN | Xóa danh mục không chứa sản phẩm |

---

#### 2.3. Dịch Vụ Tìm Kiếm & Gợi Ý (Search & Recommendation Service)
*Công nghệ: NestJS + Elasticsearch*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/search` | Query: `q, category_id, min_price, max_price, sort, page, limit` | `{ items: Array<SearchItem>, facets, total }` | Public | Tìm kiếm toàn văn (Fulltext search) |
| `GET` | `/api/v1/search/suggest` | Query: `q` | `Array<{ text, category_name }>` | Public | Auto-suggest khi người dùng gõ từ khóa |
| `GET` | `/api/v1/recommendations/personal` | Query: `limit` | `Array<ProductSummary>` | Bearer / Guest Token | Gợi ý sản phẩm cá nhân hóa |
| `GET` | `/api/v1/recommendations/related/{id}` | Path: `id`, Query: `limit` | `Array<ProductSummary>` | Public | Gợi ý sản phẩm liên quan theo ID |

---

#### 2.4. Dịch Vụ Giỏ Hàng (Cart Service)
*Công nghệ: NestJS + Redis (In-memory storage)*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/cart` | None | `{ cart_id, items: Array<{ item_id, sku_id, product_id, title, image, price, quantity, stock, shop_id, shop_name }>, total_quantity }` | Bearer Token | Lấy thông tin giỏ hàng hiện tại |
| `POST` | `/api/v1/cart/items` | `{ sku_id, quantity }` | Cart Object | Bearer Token | Thêm SKU vào giỏ hàng |
| `PUT` | `/api/v1/cart/items/{itemId}` | `{ quantity: number }` | Cart Object | Bearer Token | Điều chỉnh số lượng mục trong giỏ |
| `DELETE` | `/api/v1/cart/items/{itemId}` | Path: `itemId` | Cart Object | Bearer Token | Xóa 1 mục khỏi giỏ hàng |
| `POST` | `/api/v1/cart/sync` | `{ guest_cart_items: Array<{ sku_id, quantity }> }` | Merged Cart Object | Bearer Token | Đồng bộ giỏ vãng lai khi đăng nhập |

> ⚠️ **LƯU Ý QUAN TRỌNG TỪ BACKEND CONTRACT**: Cart Service **KHÔNG CÓ** endpoint `DELETE /cart`. Để xóa nhiều mục hoặc làm trống giỏ hàng sau khi đặt hàng, hệ thống thực hiện tự động qua Kafka Event sau khi Checkout thành công.

---

#### 2.5. Dịch Vụ Khuyến Mãi & Thanh Toán Đặt Hàng (Checkout & Voucher Service)
*Công nghệ: Java Spring Boot + PostgreSQL*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/v1/checkout/preview` | `{ cart_id, selected_item_ids: string[], address_id, voucher_ids?: string[] }` | `{ subtotal, shipping_fee, discount_amount, final_total, shop_orders: [...] }` | Bearer Token | Tính thử số tiền, áp mã và phí ship |
| `POST` | `/api/v1/checkout` | `{ cart_id, selected_item_ids: string[], address_id, payment_method: "VNPAY" \| "COD", voucher_ids?: string[], note?: string }` | `{ order_id, order_code, total_amount, payment_url?: string }` | Bearer Token | Tạo đơn hàng chính thức từ giỏ hàng |
| `GET` | `/api/v1/vouchers/available` | Query: `cart_total, shop_ids` | `Array<VoucherSummary>` | Bearer Token | Danh sách mã giảm giá khả dụng |
| `POST` | `/api/v1/vouchers/validate` | `{ code: string, cart_total: number, shop_id?: string }` | `{ valid: boolean, voucher_id, discount_value, min_spend }` | Bearer Token | Xác thực mã và lấy `voucher_id` |
| `GET` | `/api/v1/seller/vouchers` | Query: `page, limit, status` | `Array<SellerVoucher>` + Meta | Role: SELLER | Danh sách voucher của gian hàng |
| `POST` | `/api/v1/seller/vouchers` | `{ code, name, discount_type: "PERCENT" \| "FIXED", discount_value, min_order_value, max_discount_value, start_date, end_date, usage_limit }` | Created Voucher | Role: SELLER | Tạo voucher shop |
| `GET` | `/api/v1/seller/vouchers/{id}` | Path: `id` | Full Voucher Detail | Role: SELLER | Xem chi tiết voucher |
| `PUT` | `/api/v1/seller/vouchers/{id}` | Voucher Update Payload | Updated Voucher | Role: SELLER | Cập nhật cấu hình voucher |
| `PATCH` | `/api/v1/seller/vouchers/{id}/status` | `{ status: "ACTIVE" \| "EXPIRED" }` | `{ id, status }` | Role: SELLER | Bật/tắt voucher shop |
| `GET` | `/api/v1/admin/vouchers` | Query: `page, limit` | `Array<VoucherItem>` | Role: ADMIN | Quản lý voucher toàn sàn |
| `POST` | `/api/v1/admin/vouchers` | Admin Voucher Payload | Created Platform Voucher | Role: ADMIN | Tạo voucher sàn (Platform-wide) |

---

#### 2.6. Dịch Vụ Quản Lý Đơn Hàng (Order Service)
*Công nghệ: Java Spring Boot + State Machine*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/orders` | Query: `status, page, limit` | `Array<BuyerOrderSummary>` + Meta | Bearer Token | Danh sách đơn mua của Buyer |
| `GET` | `/api/v1/orders/{orderId}` | Path: `orderId` | `{ order_id, order_code, status: "PENDING" \| "PROCESSING" \| "SHIPPED" \| "DELIVERED" \| "CANCELLED", items: [], shipping_address, payment: { method, status }, summary: { subtotal, shipping_fee, discount, total } }` | Bearer Token | Chi tiết đơn mua |
| `POST` | `/api/v1/orders/{orderId}/cancel` | `{ reason: string }` | `{ order_id, status: "CANCELLED" }` | Bearer Token | Hủy đơn trước khi giao |
| `GET` | `/api/v1/seller/orders` | Query: `status, page, limit, keyword` | `Array<SellerOrderSummary>` + Meta | Role: SELLER | Danh sách đơn bán của shop |
| `GET` | `/api/v1/seller/orders/{orderId}` | Path: `orderId` | Full Seller Order Detail | Role: SELLER | Chi tiết đơn bán |
| `PATCH` | `/api/v1/seller/orders/{orderId}/confirm` | None | `{ order_id, status: "PROCESSING" }` | Role: SELLER | Gian hàng xác nhận đơn |
| `PATCH` | `/api/v1/seller/orders/{orderId}/ship` | `{ tracking_code: string, carrier_id: string }` | `{ order_id, status: "SHIPPED" }` | Role: SELLER | Bàn giao đơn cho ĐVVC |
| `PATCH` | `/api/v1/seller/orders/{orderId}/cancel` | `{ reason: string }` | `{ order_id, status: "CANCELLED" }` | Role: SELLER | Gian hàng từ chối/hủy đơn |
| `GET` | `/api/v1/admin/orders` | Query: `page, limit, status` | `Array<AdminOrderSummary>` | Role: ADMIN | Quản trị đơn hàng toàn sàn |

---

#### 2.7. Dịch Vụ Thanh Toán, Ví & Quyết Toán (Payment & Wallet Service)
*Công nghệ: Java Spring Boot + VNPAY SDK + Concurrency Lock*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/v1/payments/create-url` | `{ order_id: string, amount: number, return_url: string }` | `{ payment_id, payment_url }` | Bearer Token | Tạo liên kết thanh toán VNPAY |
| `GET` | `/api/v1/payments/{paymentId}/status` | Path: `paymentId` | `{ payment_id, order_id, status: "PENDING" \| "SUCCESS" \| "FAILED", amount, transaction_id }` | Bearer Token | Thăm dò trạng thái thanh toán |
| `POST` | `/api/v1/payments/webhook` | Form URL-encoded từ VNPAY | `{ RspCode: "00", Message: "Confirm Success" }` | IPN Signature | Webhook xử lý kết quả VNPAY |
| `GET` | `/api/v1/seller/wallet/balance` | None | `{ available_balance, pending_balance, total_earnings, currency: "VND" }` | Role: SELLER | Xem số dư ví doanh thu shop |
| `GET` | `/api/v1/seller/wallet/transactions` | Query: `page, limit, type` | `Array<WalletTransactionItem>` + Meta | Role: SELLER | Lịch sử biến động số dư |
| `GET` | `/api/v1/admin/settlements` | Query: `page, limit, status` | `Array<SettlementBatchItem>` + Meta | Role: ADMIN | Danh sách đợt quyết toán tiền sàn |
| `GET` | `/api/v1/admin/settlements/{batchId}` | Path: `batchId` | Detail Settlement Batch + Shop List | Role: ADMIN | Chi tiết đợt quyết toán |
| `POST` | `/api/v1/admin/settlements/{batchId}/retry` | Path: `batchId` | `{ batch_id, status: "PROCESSING" }` | Role: ADMIN | Thử lại lượt thanh toán thất bại |

> ⚠️ **LƯU Ý THEO ADR-003**: 
> 1. `POST /api/v1/seller/payouts` (Rút tiền người bán) đang bị **Disabled / Tạm khóa** ở backend do đang trong giai đoạn sandbox.
> 2. `POST /api/v1/admin/settlements/batch` (Tạo batch quyết toán thủ công) **KHÔNG TỒN TẠI** trong controller; tiến trình quyết toán ví chạy theo Scheduled Job tự động định kỳ.

---

#### 2.8. Dịch Vụ Tồn Kho (Inventory Service)
*Công nghệ: Java Spring Boot + Optimistic Locking*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/seller/inventory` | Query: `page, limit, low_stock` | `Array<{ sku_id, title, seller_sku, stock, reserved_stock, available_stock }>` + Meta | Role: SELLER | Quản lý số lượng tồn kho từng SKU |
| `PUT` | `/api/v1/seller/inventory/{skuId}` | `{ stock: number, adjustment_reason: string }` | `{ sku_id, updated_stock, updated_at }` | Role: SELLER | Cập nhật số lượng tồn kho thủ công |
| `GET` | `/api/v1/seller/inventory/logs` | Query: `sku_id, page, limit` | `Array<InventoryLogItem>` + Meta | Role: SELLER | Lịch sử nhập xuất biến động tồn |

---

#### 2.9. Dịch Vụ Vận Chuyển (Shipment Service)
*Công nghệ: NestJS + GHN/GHTK Integration*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/shipments/tracking/{orderId}` | Path: `orderId` | `{ tracking_number, carrier_name, status, timeline: [{ time, status, location, note }] }` | Bearer Token | Hành trình vận đơn đơn hàng |
| `POST` | `/api/v1/seller/shipments/create-label` | `{ order_id: string }` | `{ label_url: string, tracking_number: string }` | Role: SELLER | In phiếu gửi hàng / mã vận đơn |
| `GET` | `/api/v1/seller/shipments/providers` | None | `Array<{ provider_id, name, code, is_active }>` | Role: SELLER | Danh sách đơn vị vận chuyển hỗ trợ |

---

#### 2.10. Dịch Vụ Đánh Giá & Nhận Xét (Rating & Review Service)
*Công nghệ: NestJS + MongoDB*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/reviews/products/{productId}` | Path: `productId`, Query: `rating, page, limit` | `{ average_rating, total_reviews, rating_distribution, items: Array<ReviewItem> }` | Public | Danh sách bình luận sản phẩm |
| `POST` | `/api/v1/reviews` | `{ order_id, product_id, sku_id, rating: 1..5, comment, images?: string[] }` | Created Review Object | Bearer Token | Người mua gửi đánh giá sản phẩm |
| `GET` | `/api/v1/seller/reviews` | Query: `rating, has_reply, page, limit` | `Array<SellerReviewItem>` + Meta | Role: SELLER | Danh sách đánh giá gian hàng nhận được |
| `POST` | `/api/v1/seller/reviews/{id}/reply` | `{ reply_content: string }` | `{ review_id, reply: { content, replied_at } }` | Role: SELLER | Shop phản hồi đánh giá khách hàng |

---

#### 2.11. Dịch Vụ Thông Báo & Tin Nhắn Realtime (Notification & Chat Service)
*Công nghệ: Node.js + WebSocket / SSE + Redis PubSub*

| HTTP | Endpoint | Request Schema | Response Schema | Scope / Auth | Chức năng nghiệp vụ & Ghi chú |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/notifications` | Query: `page, limit, type` | `Array<{ id, title, content, type, read: boolean, created_at, reference_id }>` | Bearer Token | Danh sách thông báo tài khoản |
| `PATCH` | `/api/v1/notifications/{id}/read` | Path: `id` | `{ id, read: true }` | Bearer Token | Đánh dấu 1 thông báo đã đọc |
| `PATCH` | `/api/v1/notifications/read-all` | None | `{ success: true }` | Bearer Token | Đánh dấu đọc tất cả thông báo |
| `GET` | `/api/v1/notifications/unread-count`| None | `{ unread_count: number }` | Bearer Token | Số lượng thông báo chưa đọc |
| `GET` | `/api/v1/chat/conversations` | Query: `page, limit` | `Array<ConversationSummary>` | Bearer Token | Danh sách hội thoại nhắn tin |
| `GET` | `/api/v1/chat/conversations/{id}/messages` | Query: `before_id, limit` | `Array<ChatMessage>` | Bearer Token | Lịch sử tin nhắn chi tiết |
| `POST` | `/api/v1/chat/messages` | `{ recipient_id, content, attachments?: [] }` | Sent Message Object | Bearer Token | Gửi tin nhắn mới |
