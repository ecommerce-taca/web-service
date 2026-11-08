# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 7: HIỆU NĂNG, KHẢ NĂNG MỞ RỘNG VÀ KIẾN TRÚC (PERFORMANCE & ARCHITECTURE AUDIT)

---

### 1. KIẾN TRÚC MICRO-FRONTEND MODULE FEDERATION

Hệ thống Frontend áp dụng kiến trúc **Monorepo Micro-Frontend** sử dụng Vite 5 và `@originjs/vite-plugin-federation`:
- **Shell (Host - Port 5173)**: Đóng vai trò container điều phối route toàn cục, authentication context và layout bọc ngoài.
- **Buyer (Remote - Port 5174)**: Cung cấp Storefront, Catalog, Cart và Checkout.
- **Seller (Remote - Port 5175)**: Cung cấp Merchant Portal và quản trị sản phẩm.
- **Admin (Remote - Port 5176)**: Cung cấp Hệ thống kiểm duyệt và cấu hình sàn.
- **Shared Packages**: `@taca/ui-components` (Design System Primitives) và `shared/utils` (API client & helpers).

#### Đánh giá ranh giới kiến trúc (Architectural Boundaries):
- Phân tách rõ ràng giữa các phân hệ: Code Buyer không phụ thuộc trực tiếp vào code Seller hay Admin.
- Tái sử dụng tốt các shared primitives: Các component Button, Badge, Modal được đóng gói trong `@taca/ui-components` giúp đảm bảo tính nhất quán về mặt thị giác.
- **Điểm yếu kiến trúc**: Thiếu một lớp **Data Normalizer / Adapter Layer** thống nhất đặt tại tầng shared service. Mỗi Remote tự viết hàm parse response theo cách riêng, dẫn đến tình trạng `apps/buyer` parse theo kiểu `res.data.data` còn `apps/seller` parse theo kiểu `res.data.items`.

---

### 2. PHÂN TÍCH HIỆU NĂNG FRONTEND (FRONTEND PERFORMANCE ISSUES)

#### 2.1. Nguy cơ Race Condition khi chuyển Tab nhanh trong Quản lý sản phẩm
- **Vị trí**: `apps/seller/src/features/products/pages/ProductsPage.jsx`.
- **Vấn đề**: Khi người bán bấm chuyển liên tục giữa các Tab trạng thái (`Tất cả` $\rightarrow$ `Đang bán` $\rightarrow$ `Chờ duyệt`), mỗi lần click kích hoạt một hàm `fetchProducts()` bất đồng bộ.
- **Hiện trạng**: Hàm gọi API không sử dụng `AbortController` để hủy bỏ request trước đó khi dependency thay đổi hoặc khi component unmount.
- **Hậu quả**: Nếu request của Tab "Tất cả" trả về sau request của Tab "Đang bán" (do mạng chập chờn), dữ liệu của Tab "Tất cả" sẽ ghi đè lên giao diện, khiến người bán đang xem tab "Đang bán" nhưng nội dung bảng lại hiển thị sản phẩm của tab "Tất cả".
- **Giải pháp**:
  ```javascript
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts({ signal: controller.signal });
    return () => controller.abort();
  }, [currentTab, page]);
  ```

---

#### 2.2. Vấn đề nghẽn DOM khi mở rộng ma trận SKU (SKU Matrix Scalability)
- **Vị trí**: `apps/seller/src/features/products/components/SkuMatrixTable.jsx`.
- **Vấn đề**: Bảng ma trận biến thể sinh ra dựa trên tích Descartes (Cartesian product) của các nhóm thuộc tính.
  - Khi người bán có 2 nhóm thuộc tính (Màu sắc: 3 màu, Kích thước: 3 size) $\rightarrow$ 9 dòng SKU: Render trơn tru.
  - Khi người bán kinh doanh mặt hàng thời trang/phụ kiện phức tạp (Màu sắc: 5 màu, Kích thước: 6 size, Chất liệu: 4 loại) $\rightarrow$ $5 \times 6 \times 4 = 120$ dòng SKU.
- **Hiện trạng**: Bảng render toàn bộ 120 dòng cùng lúc, mỗi dòng có 4 ô input (Giá lẻ, Giá khuyến mãi, Tồn kho ban đầu, Mã Barcode) $\rightarrow$ gần 500 input elements render đồng thời.
- **Hậu quả**: Khi người bán gõ phím vào ô nhập giá, mỗi ký tự kích hoạt re-render toàn bộ 120 dòng, gây giật lag nghiêm trọng (Input Lag > 300ms, vi phạm chỉ số Interaction to Next Paint - INP).
- **Giải pháp**: Áp dụng Virtual Scrolling (sử dụng `@tanstack/react-virtual`) hoặc cô lập local state của từng dòng SKU bằng `React.memo`.

---

#### 2.3. Thiếu cơ chế Caching phía Client cho Danh mục sản phẩm (Categories Tree)
- **Vị trí**: `apps/buyer` và `apps/seller`.
- **Vấn đề**: Cây danh mục sản phẩm (`GET /categories`) là dữ liệu tĩnh, hiếm khi thay đổi (chỉ thay đổi khi Admin tạo mới hoặc sửa danh mục).
- **Hiện trạng**: Cả trang chủ Buyer, trang tìm kiếm, modal tạo sản phẩm của Seller và trang quản trị Admin đều gọi API `GET /categories` mỗi khi render màn hình, không hề có cơ chế lưu đệm (cache) trong React Context hay LocalStorage.
- **Hậu quả**: Gây tải vô ích lên Backend MongoDB và làm chậm thời gian hiển thị ban đầu (LCP) của người dùng từ 200ms - 400ms.
- **Giải pháp**: Lưu cache cây danh mục với TTL (Time To Live) 15-30 phút hoặc sử dụng React Query / SWR với `staleTime: 1000 * 60 * 15`.

---

### 3. KIẾN TRÚC BACKEND & KHẢ NĂNG MỞ RỘNG (BACKEND SCALABILITY)

Dựa trên tài liệu `lld/product-catalog.md` và mã nguồn NestJS:

```text
[MongoDB Cluster] (Replica Set / Sharded by shop_id)
       │
       ▼
[Cache Layer: Redis Cluster]
   ├── Cache-aside cho Product Detail (TTL 5m)
   └── Cache Categories Tree (TTL 1h)
       │
       ▼
[Outbox Pattern & Debezium CDC Engine]
   └── Kafka Message Bus (catalog.product.events)
```

- **Điểm mạnh kiến trúc Backend**:
  1. Sử dụng **Transactional Outbox**: Đảm bảo không bao giờ mất sự kiện đồng bộ dữ liệu sang ElasticSearch và Analytics dù có sự cố sập mạng hoặc crash service.
  2. Indexing chuẩn: Các trường thường xuyên truy vấn như `shop_id`, `category_id`, `status`, `sku_code` đều được đánh chỉ mục đơn và compound index chính xác.
  3. Xử lý BigInt an toàn: Interceptor serialize toàn bộ số nguyên lớn sang chuỗi hoặc an toàn trước khi trả về JSON cho client.
- **Rủi ro tải tại API Gateway**: Nếu Frontend không tối ưu việc phân trang và gọi API trùng lặp, API Gateway sẽ phải chịu tải lớn từ các request không hợp lệ bị NestJS quăng lỗi 400 liên tục.

