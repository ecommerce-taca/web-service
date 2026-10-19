# Shipment Service API Specification

> **Dịch vụ Upstream:** `shipment-service` (Port nội bộ `8087`)  
> **Prefix Gateway:** `/api/v1/orders/{orderId}/shipment`, `/api/v1/seller/orders/{orderId}/shipment/**`, `/api/v1/webhooks/shipping/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/shipment-docs/docs/api/shipment.md`

---

## 1. Hành Trình Vận Chuyển Cho Người Mua (Buyer Tracking)

### `GET /orders/{orderId}/shipment`
- **Quyền:** Authenticated Buyer sở hữu đơn hàng
- **Response 200:**
  ```json
  {
    "data": {
      "orderId": "ord-01912f31",
      "carrier": {
        "code": "GHN",
        "name": "Giao Hàng Nhanh",
        "logo": "https://cdn.taca.vn/carriers/ghn.png"
      },
      "trackingCode": "GHN849128491VN",
      "status": "IN_TRANSIT",
      "estimatedDeliveryDate": "2026-10-18T18:00:00Z",
      "timeline": [
        {
          "status": "PICKED_UP",
          "title": "Đã lấy hàng thành công",
          "description": "Bưu tá đã nhận kiện hàng từ kho người bán.",
          "time": "2026-10-14T14:30:00Z"
        },
        {
          "status": "SORTING_HUB",
          "title": "Đến kho phân loại Tân Bình",
          "description": "Kiện hàng đang được phân loại tự động.",
          "time": "2026-10-14T16:15:00Z"
        }
      ]
    }
  }
  ```

---

## 2. Chuẩn Bị & Bàn Giao Vận Đơn Phía Người Bán (Seller Fulfillment)

### 2.1 `GET /seller/orders/{orderId}/shipment/carriers`
- Lấy danh sách các đơn vị giao vận kết nối với kho hàng người bán (GHN, GHTK, Viettel Post) kèm cước phí dự tính.

### 2.2 `POST /seller/orders/{orderId}/shipment` (Khởi tạo vận đơn)
- **Modal:** `PrepareShipmentModal.jsx`
- **Body:**
  ```json
  {
    "carrierCode": "GHN",
    "pickupShift": "MORNING", // hoặc "AFTERNOON"
    "packageWeightGrams": 500,
    "packageDimensions": { "length": 20, "width": 15, "height": 10 },
    "sellerNote": "Hàng điện tử dễ vỡ, xin nhẹ tay"
  }
  ```
- **Response 201:**
  ```json
  {
    "data": {
      "shipmentId": "shp-01912f31-8899",
      "trackingCode": "GHN849128491VN",
      "waybillUrl": "https://shipping.taca.vn/waybills/GHN849128491VN.pdf",
      "pickupDeadline": "2026-10-15T12:00:00Z"
    }
  }
  ```

### 2.3 `GET /seller/orders/{orderId}/print-label`
- Trả về tệp PDF hoặc mã HTML sẵn sàng in phiếu giao nhận hàng (kích cỡ chuẩn A6 dán lên kiện hàng).
