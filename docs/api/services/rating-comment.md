# Rating & Comment Service API Specification

> **Dịch vụ Upstream:** `rating-comment-service` (Port nội bộ `8088`)  
> **Prefix Gateway:** `/api/v1/products/{productId}/reviews`, `/api/v1/reviews/**`, `/api/v1/seller/reviews/**`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/rating-comment-docs/docs/api/rating-comment.md`

---

## 1. Đánh Giá Sản Phẩm Công Khai (Public Product Reviews)

### `GET /products/{productId}/reviews`
- **Quyền:** Public
- **Query:** `page`, `size`, `rating` (1..5 sao), `has_media` (boolean), `sort` (`newest`, `highest`, `lowest`)
- **Response 200:**
  ```json
  {
    "data": [
      {
        "reviewId": "rev-01912f31",
        "user": {
          "fullName": "Nguyễn V***",
          "avatar": "https://cdn.taca.vn/avatars/user.jpg"
        },
        "rating": 5,
        "variantPurchased": "Titan Sa Mạc / 256GB",
        "comment": "Máy đẹp nguyên seal, giao hàng hỏa tốc trong 2 giờ rất hài lòng!",
        "images": [
          "https://cdn.taca.vn/reviews/rev1.jpg",
          "https://cdn.taca.vn/reviews/rev2.jpg"
        ],
        "sellerReply": {
          "reply": "Cảm ơn quý khách đã tin tưởng ủng hộ Taca Flagship Store ạ!",
          "repliedAt": "2026-10-14T16:00:00Z"
        },
        "createdAt": "2026-10-14T15:20:00Z"
      }
    ],
    "meta": {
      "ratingSummary": { "avg": 4.9, "totalReviews": 1284, "star5": 1150, "star4": 100, "star3": 20, "star2": 10, "star1": 4 }
    }
  }
  ```

---

## 2. Viết Đánh Giá Đơn Mua Phía Khách Hàng (Buyer Review Management)

### 2.1 `GET /users/me/reviews/pending`
- Lấy danh sách các mặt hàng người mua đã nhận thành công nhưng chưa đánh giá.

### 2.2 `POST /reviews` (Gửi nhận xét đánh giá)
- **Body:**
  ```json
  {
    "orderId": "ord-01912f31",
    "orderItemId": "item-01912f31",
    "rating": 5,
    "comment": "Sản phẩm chất lượng vượt mong đợi.",
    "images": ["https://storage.taca.vn/reviews/img1.jpg"]
  }
  ```

---

## 3. Phản Hồi Đánh Giá Phía Người Bán (Seller Review Reply)

### `POST /seller/reviews/{reviewId}/reply`
- Người bán gửi phản hồi cảm ơn hoặc hỗ trợ kỹ thuật đối với nhận xét của khách hàng.
