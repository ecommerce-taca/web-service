# Tổng Quan Hệ Thống API Toàn Diện (API Master Directory)

> **Tài liệu chuẩn hóa:** Được trích xuất trực tiếp từ toàn bộ 10 kho tài liệu backend microservices trong `ecommerce-taca/docs` (`api-gateway-docs`, `auth-user-docs`, `product-catalog-docs`, `order-commerce-docs`, `payment-wallet-docs`, `inventory-docs`, `shipment-docs`, `rating-comment-docs`, `search-docs`, `message-docs`) và đối chiếu với mã nguồn Frontend.  
> **Cổng API Gateway:** Prefix `/api` (Kong API Gateway v3.x OSS rewrite sang `/api/v1` trên port `8081`).  
> **Phương thức xác thực:** `Authorization: Bearer <JWT>` (chuẩn ký RS256).

---

## 1. Bản Đồ Tài Liệu Chuyên Biệt Theo Microservices (Service API Specs)

Dự án phân tách tài liệu chi tiết cho từng dịch vụ nghiệp vụ độc lập trong thư mục [docs/api/services/](file:///d:/di_hoc/taca_ecommerce/docs/api/services/):

| Dịch Vụ Backend | Prefix Gateway | Trọng Tâm Nghiệp Vụ | Tài Liệu Chi Tiết |
| :--- | :--- | :--- | :--- |
| **Auth & User** | `/auth/**`, `/users/**`, `/shops/**` | Cấp phát JWT, Hồ sơ cá nhân, Sổ địa chỉ, Yêu thích, Onboarding Shop, Phân quyền Admin | [auth-user.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/auth-user.md) |
| **Product Catalog** | `/products/**`, `/categories/**`, `/seller/products/**` | Cây danh mục, Chi tiết SPU, Ma trận biến thể SKU, Upload media, Duyệt sản phẩm Admin | [product-catalog.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/product-catalog.md) |
| **Order Commerce** | `/cart/**`, `/checkout/**`, `/orders/**`, `/vouchers/**` | Quản lý giỏ hàng, Tính giá preview, Vòng đời đơn hàng, Khuyến mãi & Voucher sàn/shop | [order-commerce.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/order-commerce.md) |
| **Payment & Wallet** | `/payments/**`, `/seller/wallet/**`, `/admin/finance/**` | Cổng VNPAY QR, Ví người bán, Rút tiền, Biểu phí hoa hồng sàn, Đối soát thanh toán | [payment-wallet.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/payment-wallet.md) |
| **Inventory** | `/seller/inventory/**`, `/admin/inventory/**` | Quản lý số lượng tồn kho theo SKU, Khóa giữ chỗ tồn kho (Hold), Cảnh báo sắp hết hàng | [inventory.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/inventory.md) |
| **Shipment** | `/orders/{id}/shipment`, `/seller/orders/{id}/shipment/**` | Kết nối cổng giao vận (GHN/GHTK), Tính cước phí, Khởi tạo vận đơn, In phiếu gửi | [shipment.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/shipment.md) |
| **Rating & Comment**| `/reviews/**`, `/products/{id}/reviews` | Đánh giá sao, Nhận xét kèm hình ảnh, Người bán phản hồi đánh giá của khách hàng | [rating-comment.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/rating-comment.md) |
| **Search Engine** | `/search/**`, `/products/search` | Tìm kiếm toàn văn Elasticsearch, Gợi ý từ khóa tự động (Typeahead), Bộ lọc Facet | [search.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/search.md) |
| **Messaging & Chat**| `/conversations/**`, `/messages/**`, `/ws/messages` | Kênh chat Realtime WebSocket hai chiều, Quản lý hội thoại giữa Khách hàng và Shop | [message-chat.md](file:///d:/di_hoc/taca_ecommerce/docs/api/services/message-chat.md) |

---

## 2. Bản Đồ Phân Bổ Theo Ứng Dụng Micro-Frontend

```text
                                 API Gateway (/api/v1)
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   Buyer Storefront                Seller Dashboard                  Admin Portal
   (Port 5174)                     (Port 5175)                       (Port 5176)
   - Auth & Profile                - Onboarding & KYC                - Quản lý tài khoản & RBAC
   - Product Catalog & Search      - Quản lý kho & SKU Matrix        - Phê duyệt KYC Nhà bán
   - Giỏ hàng & Checkout           - Xử lý đơn hàng & Vận đơn        - Cấu hình Biểu phí & Thuế
   - VNPAY QR & Thanh toán         - Ví tài chính & Rút tiền         - Đối soát thanh toán (Settlement)
   - Đánh giá & Yêu thích          - Khuyến mãi & Voucher            - Nhật ký kiểm toán (Audit Logs)
```

---

## 3. Các Tài Liệu Quy Chuẩn Bổ Trợ
- [api-contract.md](file:///d:/di_hoc/taca_ecommerce/docs/api/api-contract.md): Quy chuẩn phong bì Request/Response envelope, phân trang và contracts các luồng nghiệp vụ cốt lõi.
- [authentication.md](file:///d:/di_hoc/taca_ecommerce/docs/api/authentication.md): Đặc tả kiến trúc JWT RS256, Silent Refresh flow qua Axios interceptor, ma trận phân quyền 4 vai trò và xác thực 2FA.
- [error-handling.md](file:///d:/di_hoc/taca_ecommerce/docs/api/error-handling.md): Danh mục mã lỗi Gateway & Domain, tiêu chuẩn hiển thị 4 trạng thái giao diện bắt buộc (`Loading`, `Success`, `Empty`, `Error`) và Error Boundaries.
