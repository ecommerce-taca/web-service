# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 6: AUDIT DỮ LIỆU MOCK & TÍNH SẴN SÀNG TÍCH HỢP (MOCK & INTEGRATION READINESS)

---

### 1. CƠ CHẾ DUAL-MODE (REAL API VS MOCK DATA)

Toàn bộ hệ thống Frontend Monorepo được xây dựng trên cơ chế chuyển đổi hai chế độ (Dual-Mode Architecture) thông qua biến môi trường `VITE_USE_MOCK_DATA` được cấu hình tại `shared/utils/api-client.js` và các file `.env`:

```text
[Frontend Request]
       │
       ▼
[shared/utils/api-client.js]
       │
       ├── VITE_USE_MOCK_DATA === 'true'  ──> [Local Mock Interceptor / Mock Fixtures]
       └── VITE_USE_MOCK_DATA === 'false' ──> [Axios HTTP /api/* ──> API Gateway]
```

#### Phân tích mã nguồn `shared/utils/api-client.js`:
- Client khởi tạo instance `axios.create({ baseURL: '/api', timeout: 15000 })`.
- Khi `VITE_USE_MOCK_DATA=true`, các Feature Service tự động bypass lệnh gọi mạng thực tế và trả về Promise resolved kèm dữ liệu mock cục bộ (Local Fixtures).
- Khi `VITE_USE_MOCK_DATA=false`, các request được gửi thẳng tới reverse proxy `/api` để chuyển tiếp tới Backend Microservices.

---

### 2. DANH MỤC DỮ LIỆU MOCK & SO SÁNH CẤU TRÚC VỚI REAL BACKEND

Sự khác biệt tai hại giữa dữ liệu Mock (được lập trình viên FE tự định nghĩa trong lúc dựng giao diện) và dữ liệu Backend thật là nguyên nhân tạo ra ảo giác "giao diện đã hoàn thành" nhưng thực chất sẽ sụp đổ khi tích hợp thật:

#### Bảng so sánh cấu trúc Mock vs Real Backend:

| Thuộc tính | Dữ liệu Mock FE đang dùng | Dữ liệu Backend NestJS thật | Hậu quả khi tắt Mock (`USE_MOCK=false`) |
| :--- | :--- | :--- | :--- |
| **Response Wrapper** | Trả về `{ data: { items: [...], total: 10 } }` | Trả về `{ data: [...], meta: { page, size, total } }` | **Crash/Empty**: Code đọc `res.data.items` bị `undefined`, bảng Seller biến mất. |
| **Product ID** | `id: "prod-001"` | `product_id: "cuid_xyz123"` hoặc `_id` | **404 Not Found**: Điều hướng trang chi tiết bị `/products/undefined`. |
| **Product Name** | `name: "Áo Thun Cotton Compact"` | `title: "Áo Thun Cotton Compact"` | **Blank UI**: Tiêu đề sản phẩm Buyer hiển thị chuỗi rỗng. |
| **Media/Images** | `images: ["https://.../1.jpg"]` | `media: [{ url: "...", is_cover: true }]` | **Placeholder Image**: Trang chi tiết rơi vào ảnh giữ chỗ `placehold.co/400`. |
| **SKU Attributes** | `{ "Màu sắc": "Đen", "Kích cỡ": "L" }` | `{ "color": "black", "size": "L" }` | **Variant Freeze**: Không thể chọn biến thể, không thể mua đúng hàng. |
| **Tax Rate** | `taxRate: 10` (10%) | `tax_rate_bps: 1000` (Basis points) | **Calculation Error**: Tính sai thuế suất 100 lần. |
| **Price Summary** | `{ basePrice, salePrice, minPrice, maxPrice }` | `{ base_price, sale_price, currency }` | **HTTP 400 Bad Request**: Bị NestJS Validation cấm do chứa `min_price`/`max_price`. |
| **Social Proof** | `review_count: 1284, sold_count: 1420` | `rating_summary: { avg: 4.8, count: 25 }` | **Fake Metrics**: Hiển thị số ảo gian lận trên toàn bộ sản phẩm. |

---

### 3. ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG TÍCH HỢP THEO PHÂN HỆ

Nếu chuyển cờ `VITE_USE_MOCK_DATA=false` ngay hôm nay:

```text
[MỨC ĐỘ SẴN SÀNG TÍCH HỢP TỔNG THỂ: 42/100]

1. BUYER STOREFRONT (apps/buyer)
   ├── Trang chủ (Flash Sale)           ──> [ 0% ]  Lỗi 400 Bad Request do sai params limit/sort
   ├── Tìm kiếm & Bộ lọc Catalog        ──> [ 10% ] Lỗi 400 do gửi thừa query param tìm kiếm
   ├── Chi tiết sản phẩm (PDP)          ──> [ 25% ] Thiếu tên (title), sai ảnh (media), sai SKU
   └── Khám phá Danh mục                ──> [ 90% ] Hoạt động tốt với Category API
   
2. SELLER MANAGEMENT (apps/seller)
   ├── Danh sách sản phẩm (Table)       ──> [ 0% ]  Bảng rỗng do đọc sai Envelope res.data.items
   ├── Modal tạo sản phẩm mới           ──> [ 0% ]  Lỗi 400 do gửi min_price, max_price và minPrice:0
   ├── Cập nhật biến thể SKU            ──> [ 30% ] Sai key thuộc tính tiếng Việt
   ├── Bật/Tắt hiển thị (Publish)       ──> [ 80% ] Hoạt động tốt
   └── Xóa mềm / Lưu trữ (Archive)      ──> [ 90% ] Hoạt động tốt

3. ADMIN MODERATION (apps/admin)
   ├── Danh sách chờ duyệt              ──> [ 85% ] Hoạt động tốt
   ├── Phê duyệt sản phẩm               ──> [ 90% ] Hoạt động tốt
   ├── Từ chối sản phẩm                 ──> [ 50% ] Thiếu validation bắt buộc lý do từ chối
   └── Quản lý danh mục (CRUD)          ──> [ 95% ] Hoạt động hoàn toàn chuẩn chỉ
```

---

### 4. NGUY CƠ BẢO MẬT & DỮ LIỆU NHẠY CẢM TRONG MÔI TRƯỜNG DUAL-MODE

1. **Rò rỉ ID định danh nội bộ**: Trong chế độ Mock, FE sử dụng chuỗi ID đơn giản như `1`, `2`, `prod-001`. Khi sang môi trường Real, ID là dạng UUID ngẫu nhiên. Nhiều logic trong component sử dụng phép so sánh `Number(id)` hoặc ép kiểu số nguyên `parseInt(productId)`, dẫn đến giá trị chuyển thành `NaN` và phá vỡ logic render.
2. **Hardcode URL môi trường**: Kiểm tra trong toàn bộ codebase Frontend cho thấy dự án đã tuân thủ nghiêm ngặt quy định: không hardcode URL port cụ thể (như `http://localhost:3000`) mà đi qua biến môi trường và proxy `/api`. Điều này đáp ứng tốt quy chuẩn kiến trúc Microservices.

