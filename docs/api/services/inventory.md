# Inventory Service API Specification

> **Dịch vụ Upstream:** `inventory-service` (Port nội bộ `8086`)  
> **Prefix Gateway:** `/api/v1/seller/inventory/**`, `/api/v1/admin/inventory/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/inventory-docs/docs/api/inventory.md`

---

## 1. Vai Trò & Nguyên Tắc Kho Hàng

1. **Nguồn chân lý tồn kho (Source of Truth for Stock)**:
   - Dịch vụ `inventory-service` chịu trách nhiệm độc quyền về việc khóa giữ chỗ tồn kho (Hold/Reserve) khi khách hàng đặt hàng và giải phóng tồn kho nếu đơn hủy hoặc thanh toán thất bại.
   - Dữ liệu hiển thị tồn kho ở Product Catalog chỉ là bản chiếu (Projection Display) không đồng bộ tức thời.

2. **Các mức độ số lượng**:
   - `availableQuantity`: Tồn kho thực tế sẵn sàng để bán.
   - `reservedQuantity`: Số lượng đang tạm khóa giữ chỗ cho các đơn hàng đang chờ thanh toán hoặc chuẩn bị giao.
   - `lowStockThreshold`: Ngưỡng cảnh báo sắp hết hàng (mặc định 5 cái) để gửi thông báo cho Seller.

---

## 2. API Quản Lý Kho Phía Người Bán (Seller Inventory)

### 2.1 `GET /seller/inventory`
- **Quyền:** Authenticated Seller
- **Query:** `page`, `size`, `status` (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), `q` (tìm theo tên sản phẩm hoặc mã Seller SKU)
- **Response 200:**
  ```json
  {
    "data": [
      {
        "skuId": "sku-ip16-titan-256",
        "sellerSku": "IP16-SM-256",
        "productTitle": "Apple iPhone 16 Pro Max",
        "variantName": "Titan Sa Mạc / 256GB",
        "availableQuantity": 42,
        "reservedQuantity": 3,
        "lowStockThreshold": 5,
        "status": "IN_STOCK",
        "updatedAt": "2026-10-14T15:00:00Z"
      }
    ],
    "meta": { "page": 1, "size": 20, "total": 1 }
  }
  ```

### 2.2 `PUT /seller/inventory/{skuId}` (Điều chỉnh tồn kho)
- **Body:**
  ```json
  {
    "newQuantity": 50,
    "reason": "RESTOCK" // hoặc "CORRECTION", "DAMAGE"
  }
  ```
- **Response 200:** Cập nhật số lượng tồn kho mới và tự động phát sinh sự kiện đồng bộ sang Product Catalog.

---

## 3. Cổng Quản Trị Hệ Thống (Admin Inventory Monitoring)

- `GET /admin/inventory`: Giám sát tổng tồn kho của các gian hàng trên sàn, hỗ trợ phát hiện gian lận hoặc thiếu hụt nguồn cung hàng hóa quy mô lớn.
