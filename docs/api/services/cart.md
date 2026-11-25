# Cart Service API Specification

> **Dịch vụ Upstream:** `cart-service` (Spring Boot 4.1.2 / Java 25 / MongoDB 8.x, Port nội bộ `1204`)  
> **Repository BE:** `ecommerce-taca/cart-service`  
> **Prefix Gateway:** `/api/v1/cart/**`  
> **Xác thực qua API Gateway:** Gateway xác thực JWT người mua và truyền xuống `X-Gateway-Service-Token` + `X-User-ID`.

---

## 1. Cấu hình & Ràng buộc Backend quan trọng

- **Jackson Strict Deserialization:** `fail-on-unknown-properties: true`, `accept-float-as-int: false`. Frontend **tuyệt đối không** gửi field thừa hoặc số thực cho trường `quantity`.
- **Giới hạn nghiệp vụ (`application.yml`):**
  - `cart.max-items`: `100` (tối đa 100 dòng SKU trong 1 giỏ hàng).
  - `cart.item-qty-min`: `1`, `cart.item-qty-max`: `999`.
- **Optimistic Locking (CAS):** `CartCasPersistence` dùng `version` trên MongoDB document theo `buyerUserId`. Các thao tác ghi tuần tự hoặc debounce trên client giúp tránh `CART_VERSION_CONFLICT`.

---

## 2. Danh sách Endpoints

### 2.1 `GET /api/v1/cart`
Lấy giỏ hàng hiện tại của người mua, đồng thời BE hydrate song song thông tin từ Product Catalog (có cache 30s) và Inventory Service (theo batch tối đa 100 SKU, tránh N+1).

- **Response `200 OK` (`Cache-Control: no-store`):**
  ```json
  {
    "data": {
      "cart_id": "019363f2-7c00-7000-8000-000000000001",
      "items": [
        {
          "item_id": "019363f2-7c00-7000-8000-000000000002",
          "product_id": "prd-01912f31-88bc",
          "sku_id": "sku-ip16-titan-256gb",
          "shop_id": "shop-01912f31",
          "title_snapshot": "iPhone 16 Pro Max 256GB",
          "sku_label_snapshot": "Titan tự nhiên · 256GB",
          "unit_price_snapshot": 29490000,
          "quantity": 1,
          "line_total": 29490000,
          "available": true,
          "availability_status": "AVAILABLE"
        }
      ],
      "item_count": 1,
      "updated_at": "2026-11-25T11:00:00Z"
    },
    "meta": {
      "request_id": "req-..."
    }
  }
  ```
- **Lưu ý khi giỏ trống:** `cart_id: null`, `items: []`, `item_count: 0`, `updated_at: null`.
- **Enum `availability_status` (`AvailabilityStatus`):**
  - `AVAILABLE`: Khả dụng, đủ tồn kho.
  - `OUT_OF_STOCK`: Hết hàng.
  - `PRODUCT_UNAVAILABLE`: Sản phẩm hoặc SKU không còn khả dụng.
  - `STALE`: Không lấy được thông tin mới nhất từ Product Catalog trong timeout.
  - `UNKNOWN`: Không xác định được trạng thái tồn kho từ Inventory.

### 2.2 `POST /api/v1/cart/items`
Thêm sản phẩm (SKU) vào giỏ hàng hoặc cộng dồn số lượng nếu SKU đã tồn tại.

- **Headers tùy chọn:** `Idempotency-Key` (chuỗi ASCII printable `33..126`, độ dài `1..128`, TTL 24h) để chống gửi trùng khi double-click hoặc retry.
- **Request Body (`AddCartItemRequest`):**
  ```json
  {
    "product_id": "prd-01912f31-88bc",
    "sku_id": "sku-ip16-titan-256gb",
    "quantity": 1
  }
  ```
- **Response `201 Created` (`AddCartItemResponse`):**
  ```json
  {
    "data": {
      "cart_id": "019363f2-7c00-7000-8000-000000000001",
      "item_id": "019363f2-7c00-7000-8000-000000000002",
      "quantity": 1,
      "line_total": 29490000
    },
    "meta": {
      "request_id": "req-..."
    }
  }
  ```

### 2.3 `PUT /api/v1/cart/items/{itemId}`
Cập nhật số lượng cho 1 dòng sản phẩm (`item_id` là UUIDv7 do BE tạo).

- **Request Body (`UpdateCartItemRequest`):**
  ```json
  {
    "quantity": 2
  }
  ```
- **Response `200 OK` (`UpdateCartItemResponse`):**
  ```json
  {
    "data": {
      "item_id": "019363f2-7c00-7000-8000-000000000002",
      "quantity": 2,
      "line_total": 58980000
    },
    "meta": {
      "request_id": "req-..."
    }
  }
  ```

### 2.4 `DELETE /api/v1/cart/items/{itemId}`
Xóa một mục khỏi giỏ hàng.

- **Response:** `204 No Content`.

---

## 3. Mã lỗi chuẩn (`CartErrorCode`)

Format lỗi từ `GlobalExceptionHandler`:
```json
{
  "error": {
    "code": "CART_PRODUCT_UNAVAILABLE",
    "message": "...",
    "details": {},
    "trace_id": "..."
  }
}
```

| HTTP Status | Code | Ý nghĩa |
| :--- | :--- | :--- |
| `400` | `CART_INVALID_INPUT` | Request body/param/header không hợp lệ |
| `401` | `CART_UNAUTHENTICATED` | Thiếu hoặc sai xác thực |
| `403` | `CART_FORBIDDEN` | Không có quyền BUYER |
| `404` | `CART_ITEM_NOT_FOUND` | Không tìm thấy `item_id` trong giỏ |
| `409` | `CART_PRODUCT_UNAVAILABLE` | Sản phẩm/SKU không khả dụng hoặc không khớp |
| `409` | `CART_TOO_MANY_ITEMS` | Vượt quá 100 items trong giỏ |
| `409` | `CART_VERSION_CONFLICT` | Xung đột cập nhật đồng thời (CAS) |
| `409` | `CART_IDEMPOTENCY_CONFLICT` | Trùng `Idempotency-Key` với payload khác |
| `503` | `CART_DEPENDENCY_UNAVAILABLE` | Product/Inventory dependency lỗi |
| `503` | `CART_STORAGE_UNAVAILABLE` | MongoDB lưu trữ giỏ hàng gián đoạn |
| `500` | `CART_INTERNAL_ERROR` | Lỗi nội bộ không mong muốn |
