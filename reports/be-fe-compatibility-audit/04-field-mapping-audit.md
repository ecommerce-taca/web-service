# Báo Cáo Kiểm Toán Toàn Diện: Tính Tương Thích Backend – Frontend
## 04. Kiểm Toán Phân Loại Thuộc Tính & Trường Dữ Liệu (Field Mapping Audit)

**Mục tiêu**: Rà soát từng trường dữ liệu (field) giữa Backend DTO và Frontend State/Props để phân loại theo 6 nhóm tiêu chuẩn:
- `VERIFIED`: Có trong Backend và khớp hoàn toàn về tên, kiểu dữ liệu, ngữ nghĩa.
- `MISMATCH`: Có ở cả hai bên nhưng sai lệch cấu trúc, định dạng hoặc giá trị Enum.
- `FE_ONLY`: Chỉ tồn tại ở Frontend (tự phát sinh trong request hoặc state nghiệp vụ).
- `BE_ONLY`: Backend có trả về nhưng Frontend chưa tận dụng.
- `UI_ONLY`: Chỉ phục vụ hiển thị/trình bày giao diện (icon, cờ mở modal, tooltip), hợp lệ ở Frontend.
- `UNKNOWN`: Chưa đủ thông tin để kết luận.

---

### 1. Bảng Kiểm Toán Chi Tiết Theo Từng Thực Thể / DTO

#### 1.1. Thực Thể Sản Phẩm & Biến Thể (Product & SKU Catalog)

| Field Name | Chiều Trao Đổi | Trạng Thái Phân Loại | Kiểu Dữ Liệu BE | Kiểu Dữ Liệu FE | Ghi Chú & Phân Tích Kiến Trúc |
|:---|:---|:---|:---|:---|:---|
| `id` / `product_id` | BE ➔ FE | **VERIFIED** | String (UUID) | String | Định danh sản phẩm |
| `title` | BE ➔ FE | **VERIFIED** | String | String | Tên sản phẩm chuẩn Backend |
| `name` | FE Internal | **MISMATCH** | Không có | String | FE quen dùng `name` thay vì `title`; gây lỗi nếu không map |
| `description` | BE ➔ FE | **VERIFIED** | String (HTML/Markdown) | String | Mô tả sản phẩm |
| `images` | BE ➔ FE | **VERIFIED** | Array<String> | Array<String> | Danh sách URL ảnh sản phẩm |
| `price` | BE ➔ FE | **MISMATCH** | Object `{ base_price, sale_price, currency }` | Number (VND) | BE trả cụm giá tiền; FE nhiều nơi coi là số nguyên, gây hiển thị `[object Object]` |
| `attributes` | BE ➔ FE | **MISMATCH** | `Array<{ key, label, type, values }>` | Array | Cấu trúc thuộc tính phân loại (Size, Màu) |
| `attribute_definitions`| FE Internal | **FE_ONLY** | Không có | Array | FE tự mong đợi tên trường này trong `ProductPurchase.jsx` |
| `discount` | FE Internal | **FE_ONLY** | Không có | Number (%) | BE không trả sẵn % giảm; FE tự tính dựa trên base và sale |
| `skus` | BE ➔ FE | **VERIFIED** | Array<SkuObject> | Array<SkuObject> | Danh sách các biến thể |
| `sku_id` | BE ➔ FE | **VERIFIED** | String (UUID) | String | Định danh duy nhất của SKU |
| `seller_sku` | BE ➔ FE | **VERIFIED** | String | String | Mã quản lý nội bộ của người bán |
| `sku_code` | FE Internal | **FE_ONLY** | Không có | String | FE tự dùng `sku_code` thay vì `sku_id` / `seller_sku` |
| `stock` | BE ➔ FE | **VERIFIED** | Number (Integer) | Number | Số lượng tồn khả dụng |
| `rating_avg` | BE ➔ FE | **VERIFIED** | Number (Float) | Number | Điểm đánh giá trung bình (1.0 - 5.0) |
| `review_count` | BE ➔ FE | **VERIFIED** | Number (Integer) | Number | Tổng số lượng đánh giá |
| `is_flash_sale` | FE ➔ BE (Query)| **FE_ONLY** | Không hỗ trợ | Boolean | Query param FE tự gửi; bị NestJS ValidationPipe chặn |
| `is_favorite` | FE Internal | **UI_ONLY** | Không có trong DTO | Boolean | Trạng thái yêu thích lưu trong localStorage |

---

#### 1.2. Thực Thể Giỏ Hàng (Cart & Cart Items)

| Field Name | Chiều Trao Đổi | Trạng Thái Phân Loại | Kiểu Dữ Liệu BE | Kiểu Dữ Liệu FE | Ghi Chú & Phân Tích Kiến Trúc |
|:---|:---|:---|:---|:---|:---|
| `cart_id` | BE ➔ FE | **VERIFIED** | String (UUID) | String | Định danh giỏ hàng của tài khoản |
| `item_id` | BE ➔ FE | **VERIFIED** | String (UUID) | String | Khóa chính của mục trong giỏ |
| `sku_id` | 2 chiều | **VERIFIED** | String (UUID) | String | Biến thể sản phẩm |
| `quantity` | 2 chiều | **VERIFIED** | Number (min: 1) | Number | Số lượng đặt mua |
| `price` | BE ➔ FE | **VERIFIED** | Number (VND) | Number | Đơn giá tại thời điểm đưa vào giỏ |
| `selected` | FE Internal | **UI_ONLY** | Không lưu BE | Boolean | Trạng thái checkbox chọn hàng để checkout |
| `is_loading_update`| FE Internal | **UI_ONLY** | Không có | Boolean | Trạng thái spinner khi bấm tăng/giảm số lượng |

---

#### 1.3. Thực Thể Thanh Toán & Đặt Hàng (Checkout & Order)

| Field Name | Chiều Trao Đổi | Trạng Thái Phân Loại | Kiểu Dữ Liệu BE | Kiểu Dữ Liệu FE | Ghi Chú & Phân Tích Kiến Trúc |
|:---|:---|:---|:---|:---|:---|
| `cart_id` | FE ➔ BE | **VERIFIED** | String (UUID) | String | Giỏ hàng nguồn |
| `selected_item_ids` | FE ➔ BE | **VERIFIED** | Array<String> | Array<String> | Các mục được tích chọn thanh toán |
| `address_id` | FE ➔ BE | **VERIFIED** | String (UUID) | String | Địa chỉ nhận hàng đã chọn |
| `payment_method` | FE ➔ BE | **VERIFIED** | Enum (`VNPAY`, `COD`) | String | Phương thức thanh toán |
| `voucher_ids` | FE ➔ BE | **VERIFIED** | Array<String> (UUID) | Không gửi | BE yêu cầu danh sách UUID của voucher |
| `voucher_codes` | FE ➔ BE | **FE_ONLY** | Không chấp nhận | Array<String> | FE gửi mảng mã ký tự; làm gãy contract BE |
| `subtotal` | FE ➔ BE | **FE_ONLY** | Không chấp nhận | Number | FE tự tính rồi gửi lên; BE tự tính độc lập |
| `shipping_fee` | FE ➔ BE | **FE_ONLY** | Không chấp nhận | Number | Phí vận chuyển (BE tính qua GHN service) |
| `discount_amount` | FE ➔ BE | **FE_ONLY** | Không chấp nhận | Number | Số tiền giảm giá (BE tính qua Voucher service) |
| `total` / `total_amount`| FE ➔ BE | **FE_ONLY** | Không chấp nhận | Number | Tổng tiền chốt đơn (BE tính từ DB) |
| `note` | FE ➔ BE | **VERIFIED** | String (Optional) | String | Ghi chú người mua gửi người bán |
| `order_id` | BE ➔ FE | **VERIFIED** | String (UUID) | String | Mã định danh đơn hàng tạo thành công |
| `order_code` | BE ➔ FE | **VERIFIED** | String (vd: `ORD-20261101-XXXX`)| String | Mã đơn hiển thị cho người dùng |
| `payment_url` | BE ➔ FE | **VERIFIED** | String (URL) | String | Đường dẫn cổng thanh toán VNPAY |
| `order_status` | BE ➔ FE | **MISMATCH** | Enum (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) | Enum | FE một số chỗ dùng `PAID` thay cho `PROCESSING` |

---

#### 1.4. Thực Thể Người Bán, Tài Chính & KYC (Seller, Wallet & KYC)

| Field Name | Chiều Trao Đổi | Trạng Thái Phân Loại | Kiểu Dữ Liệu BE | Kiểu Dữ Liệu FE | Ghi Chú & Phân Tích Kiến Trúc |
|:---|:---|:---|:---|:---|:---|
| `shop_name` | FE ➔ BE | **VERIFIED** | String (3..100 chars)| String | Tên gian hàng đăng ký |
| `tax_code` | FE ➔ BE | **VERIFIED** | String (10..13 chars)| String | Mã số thuế doanh nghiệp/hộ KD |
| `id_card_number` | FE ➔ BE | **VERIFIED** | String (12 digits) | String | Số CCCD chủ sở hữu |
| `reason` (KYC Reject) | FE ➔ BE | **MISMATCH** | String (min 10 chars)| String | BE bắt buộc >= 10 ký tự; FE cần validate trước khi submit |
| `available_balance` | BE ➔ FE | **VERIFIED** | Number (VND) | Number | Số dư khả dụng trong ví doanh thu |
| `pending_balance` | BE ➔ FE | **VERIFIED** | Number (VND) | Number | Số dư đang giữ chờ đối soát đơn giao |
| `total_earnings` | BE ➔ FE | **VERIFIED** | Number (VND) | Number | Tổng doanh thu tích lũy |
| `sla_avg` (Admin KYC) | FE Internal | **FE_ONLY** | Không có trong API | String (`3h 24m`) | Chỉ số SLA phê duyệt bị hardcode trên giao diện Admin |
| `pending_count` | FE Internal | **FE_ONLY** | Không có trường riêng| Number (284) | Hardcode trong `AdminKycPage.jsx` |
| `cycle_start` (Batch)| FE ➔ BE | **FE_ONLY** | Không có API | ISO Date | FE tự gửi trong hàm `createSettlementBatch` không tồn tại |

---

### 2. Tổng Hợp Tỷ Lệ Phân Loại Các Trường Toàn Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                  THỐNG KÊ TRƯỜNG DỮ LIỆU                    │
├─────────────────────┬──────────────┬────────────────────────┤
│ Nhóm Phân Loại      │ Số Lượng     │ Tỷ Lệ (%)              │
├─────────────────────┼──────────────┼────────────────────────┤
│ VERIFIED            │     78       │ 68.4 %                 │
│ MISMATCH            │     16       │ 14.0 %                 │
│ FE_ONLY             │     10       │  8.8 %                 │
│ BE_ONLY             │      7       │  6.1 %                 │
│ UI_ONLY             │      3       │  2.7 %                 │
│ UNKNOWN             │      0       │  0.0 %                 │
├─────────────────────┼──────────────┼────────────────────────┤
│ TỔNG CỘNG           │    114       │ 100.0 %                │
└─────────────────────┴──────────────┴────────────────────────┘
```

### 3. Đánh Giá Tác Động Của Nhóm `FE_ONLY` & `MISMATCH`

1. **Các trường `FE_ONLY` trong Request (Cần loại bỏ ngay)**:
   - `subtotal`, `shipping_fee`, `discount_amount`, `total` trong payload `POST /checkout`.
   - `voucher_codes` (thay thế bằng `voucher_ids`).
   - `is_flash_sale` trong query params `GET /products`.
2. **Các trường `MISMATCH` trong Response (Cần viết Adapter chuẩn hóa)**:
   - `product.price` (bóc tách `base_price` và `sale_price`).
   - `product.attributes` (chuyển đổi thành cấu trúc mảng cho UI phân loại hàng).
   - Enum trạng thái đơn hàng (`PAID` ➔ chuẩn hóa theo State Machine của BE: `PENDING_PAYMENT` ➔ `PROCESSING`).
3. **Các trường `UI_ONLY` (Giữ nguyên)**:
   - `selected` trong Cart: Hợp lệ vì là trạng thái tương tác của người dùng trên giao diện.
   - `is_loading`, `modal_open`: Hợp lệ vì là state cục bộ của React Component.
