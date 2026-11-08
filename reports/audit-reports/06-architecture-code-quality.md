# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG – TACA ECOMMERCE
## PHẦN 06: KIẾN TRÚC HỆ THỐNG VÀ CHẤT LƯỢNG MÃ NGUỒN (ARCHITECTURE & CODE QUALITY)

---

### 1. KIẾN TRÚC MONOREPO MICRO-FRONTEND (MODULE FEDERATION)

Hệ thống Frontend Taca Ecommerce được tổ chức theo kiến trúc Monorepo Micro-Frontend thông qua **Vite 5 Module Federation**:

```text
                               ┌─────────────────────────────────┐
                               │           Host Shell            │
                               │      Port: 5173 (@taca/shell)   │
                               │  Global Routing, Auth & Layout  │
                               └───────────────┬─────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │                               │                               │
               ▼                               ▼                               ▼
  ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
  │      Remote: Buyer      │    │     Remote: Seller      │    │      Remote: Admin      │
  │ Port: 5174 (@taca/buyer)│    │Port: 5175 (@taca/seller)│    │ Port: 5176 (@taca/admin)│
  │ Storefront, Cart, PDP   │    │ Merchant Catalog, SKU   │    │ System Portal, KYC, Mod │
  └────────────┬────────────┘    └────────────┬────────────┘    └────────────┬────────────┘
               │                              │                              │
               └──────────────────────────────┼──────────────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │       Shared Dependencies       │
                               │  @taca/ui-components & @taca/   │
                               │  utils (API Client & Adapters)  │
                               └─────────────────────────────────┘
```

#### 1.1. Đánh giá tính độc lập và khả năng chịu lỗi (Remote Crash Protection)
- Mỗi ứng dụng con (Buyer, Seller, Admin) được build và bundle độc lập, có dev server riêng biệt.
- Shell Container cài đặt các khối **React Error Boundaries** bao bọc từng remote route. Nếu một micro-app gặp sự cố hoặc server remote tạm thời offline, Host Shell vẫn hoạt động bình thường và hiển thị màn hình fallback thân thiện thay vì làm trắng toàn bộ trình duyệt (White Screen of Death).
- Tránh xung đột CSS nhờ quy chuẩn Tailwind CSS với tiền tố cấu hình rõ ràng và zero CSS global overrides.

---

### 2. BẢO MẬT VÀ CÔ LẬP ĐA NGƯỜI THUÊ (IDOR & TENANT ISOLATION)

#### 2.1. Cơ chế phòng vệ IDOR (Insecure Direct Object References) tại Backend
Backend không bao giờ tin tưởng ID người dùng hoặc ID shop do client tự do gửi trong request body. Thay vào đó:
1. **API Gateway** phân giải JWT Bearer Token, kiểm tra chữ ký số và trích xuất `sub` (User ID), `roles`, và `shop_id`.
2. Gateway chuyển tiếp request vào Backend kèm các HTTP headers tin cậy:
   - `x-user-id`: ID định danh người dùng.
   - `x-user-roles`: Mảng vai trò (`SELLER`, `SELLER_STAFF`, `CATALOG_ADMIN`).
   - `x-user-shop-scope`: Mã shop mà người dùng được ủy quyền quản lý.
3. **ShopScopeGuard** phía NestJS chặn đứng mọi truy cập nếu thiếu header này trên các route `/seller/*`.
4. Trong tầng Repository, mọi câu lệnh truy vấn của Seller đều bắt buộc đính kèm điều kiện `shop_id`:
   ```typescript
   // Seller không thể sửa sản phẩm của shop khác ngay cả khi biết chính xác ID sản phẩm
   const product = await this.productModel.findOne({
     _id: productId,
     shop_id: req.headers['x-user-shop-scope'],
   });
   if (!product) {
     throw new NotFoundException('Sản phẩm không tồn tại hoặc bạn không có quyền truy cập');
   }
   ```

#### 2.2. Kiểm soát quyền quản trị (Role-Based Access Control - RBAC)
- Các route `/admin/catalog/*` được bảo vệ bởi `RolesGuard`.
- Chỉ người dùng có vai trò `CATALOG_ADMIN` hoặc `SUPER_ADMIN` mới có quyền phê duyệt, từ chối, khóa sản phẩm hoặc thay đổi cấu trúc danh mục hệ thống.

---

### 3. KIỂM TOÁN CHẤT LƯỢNG MÃ NGUỒN FRONTEND

#### 3.1. Tuân thủ 4 trạng thái giao diện bắt buộc (Loading, Success, Empty, Error)
Toàn bộ các màn hình chính (`ProductsPage`, `ProductDetailPage`, `AdminProductsPage`) đều tuân thủ chặt chẽ:
- **Loading State**: Sử dụng Skeleton UI tương đồng 100% với layout thật, giảm thiểu hiện tượng nhảy bố cục (Cumulative Layout Shift - CLS).
- **Success State**: Render dữ liệu chính xác qua tầng Adapter.
- **Empty State**: Hiển thị hình minh họa vector từ `lucide-react`, thông điệp rõ ràng và nút kêu gọi hành động (Call to Action - CTA) như "Tạo sản phẩm đầu tiên ngay".
- **Error State**: Bắt lỗi qua block `try/catch`, phân loại mã lỗi HTTP để hiển thị thông báo phù hợp, luôn có nút "Thử lại" (Retry).

#### 3.2. Quản lý vòng đời và Phòng ngừa rò rỉ bộ nhớ (Memory Leak Prevention)
- Trong các hooks và `useEffect` gọi API, mã nguồn sử dụng `AbortController` để hủy bỏ HTTP request khi component bị unmount hoặc người dùng đổi trang:
  ```javascript
  useEffect(() => {
    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort();
  }, [filters]);
  ```
- Tránh hoàn toàn lỗi phổ biến: `Can't perform a React state update on an unmounted component`.

#### 3.3. Tối ưu hóa hiệu năng render (Render Performance)
- Áp dụng `useMemo` cho các phép toán nặng như: ma trận tổ hợp SKU từ thuộc tính (Cartesian product), bộ lọc danh sách sản phẩm theo nhiều tiêu chí.
- Áp dụng `useCallback` cho các hàm truyền xuống component con (`onSelectVariant`, `onPageChange`) giúp hạn chế re-render không cần thiết.
- Tách nhỏ Presentational Components với prop validation qua `PropTypes`.

#### 3.4. Hệ thống Icon chuẩn hóa
- Tuân thủ 100% quy tắc sử dụng icon vector từ thư viện `lucide-react`.
- Loại bỏ triệt để các ký tự emoji Unicode giả lập icon giao diện (như 🛒, 🔍, ⚠️), đảm bảo tính đồng nhất thẩm mỹ trên mọi hệ điều hành (Windows, macOS, iOS, Android).

---

### 4. ĐÁNH GIÁ HIỆU NĂNG VÀ CƠ CHẾ CACHING BACKEND

#### 4.1. Chiến lược phân tầng Cache (Multi-Tier Caching)
```text
Client Browser (Cache-Control: public, max-age=60)
       │
       ▼
Cloudflare CDN / API Gateway (Edge Cache)
       │
       ▼
NestJS In-Memory / Redis v7 Cluster
  ├── /categories (TTL: 15 phút, Invalidation via CategoryChangedEvent)
  └── /products/:id (TTL: 5 phút, Invalidation via ProductUpdatedEvent)
       │
       ▼
MongoDB Replica Set (Compound Indexed Queries)
```

#### 4.2. Tối ưu hóa truy vấn cơ sở dữ liệu MongoDB
Backend đã định nghĩa các Compound Indexes quan trọng:
- `products`: `{ shop_id: 1, status: 1, updated_at: -1 }` (Tối ưu màn hình quản lý sản phẩm của Seller).
- `products`: `{ status: 1, primary_category_id: 1, "price_summary.base_price": 1 }` (Tối ưu tìm kiếm và lọc giá của Buyer).
- `products`: `{ slug: 1 }` (Unique index cho truy vấn SEO friendly URL).
- `skus`: `{ product_id: 1, status: 1 }` (Tối ưu lấy biến thể khi vào xem chi tiết sản phẩm).
- `skus`: `{ shop_id: 1, seller_sku: 1 }` (Unique compound index chống trùng mã SKU người bán trong cùng một shop).

---

### 5. KIỂM ĐỊNH MÃ NGUỒN THEO QUY CHUẨN ĐỊNH NGHĨA HOÀN THÀNH (DOD)

| Tiêu chuẩn Definition of Done | Mức độ đáp ứng | Minh chứng kiểm định |
| :--- | :---: | :--- |
| **Kiến trúc Monorepo Micro-Frontend** | **100% ĐẠT** | Tách biệt hoàn hảo giữa `@taca/shell`, `@taca/buyer`, `@taca/seller`, `@taca/admin` |
| **100% Icon sử dụng `lucide-react`** | **100% ĐẠT** | Kiểm tra toàn bộ mã nguồn không còn bất kỳ emoji giả lập icon |
| **Không còn dead code hay mock data** | **100% ĐẠT** | Đã xóa bỏ các số liệu giả `1284 đánh giá`, kết nối 100% qua API Gateway |
| **Kiểm tra Lint & Build** | **100% ĐẠT** | `npm run lint` và `npm run build` không phát sinh lỗi cú pháp hay gãy module |
| **Xử lý đầy đủ 4 trạng thái giao diện** | **100% ĐẠT** | Mọi trang chính đều có Skeleton Loading, Empty State minh họa và Error Retry |
| **Bảo mật và biến môi trường** | **100% ĐẠT** | Không hardcode secrets, gọi qua baseURL `/api` sử dụng Vite env variables |

