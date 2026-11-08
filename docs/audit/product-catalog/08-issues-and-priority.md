# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 8: BẢNG DANH MỤC VẤN ĐỀ & PHÂN CẤP ƯU TIÊN (ISSUE CATALOG & PRIORITY)

---

### 1. NGUYÊN TẮC PHÂN LOẠI MỨC ĐỘ NGHIÊM TRỌNG

- 🔴 **CRITICAL (Khẩn cấp)**: Lỗi chặn hoàn toàn luồng nghiệp vụ của người dùng, gây mã lỗi HTTP 400/500 vĩnh viễn, làm trắng màn hình (blank screen) hoặc hỏng hoàn toàn khả năng đọc/ghi dữ liệu khi kết nối Backend thực tế.
- 🟠 **HIGH (Nghiêm trọng)**: Lỗi gây sai lệch dữ liệu tài chính (thuế, giá), không thể mua đúng biến thể sản phẩm, hoặc thiếu các cơ chế bảo mật/kiểm soát dữ liệu quan trọng.
- 🟡 **MEDIUM (Trung bình)**: Lỗi thiếu hụt trạng thái giao diện (Empty state, Loading state), thiếu thông tin phản hồi cho người dùng (lý do từ chối kiểm duyệt) hoặc nguy cơ suy giảm hiệu năng.
- 🟢 **LOW (Thấp)**: Các vấn đề về quy ước đặt tên (code conventions), code smell, console log dư thừa hoặc thiếu PropTypes.

---

### 2. DANH MỤC TOÀN BỘ VẤN ĐỀ KỸ THUẬT (ISSUE-01 ĐẾN ISSUE-16)

| Mã Issue | Tiêu đề vấn đề | Mức độ | Phân hệ | Vị trí mã nguồn | Nguyên nhân gốc rễ (Root Cause) |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **ISSUE-01** | **Seller Product List luôn hiển thị rỗng vĩnh viễn** | 🔴 **CRITICAL** | Seller | `apps/seller/.../ProductsPage.jsx`<br>Line 47 | FE đọc `res?.data?.items` trong khi BE NestJS bọc Envelope trả về mảng trực tiếp tại `res.data`. Kết quả là `items = undefined` $\rightarrow$ gán `[]`. |
| **ISSUE-02** | **Lỗi HTTP 400 Bad Request khi tạo/lưu sản phẩm người bán** | 🔴 **CRITICAL** | Seller | `apps/seller/.../ProductEditorModal.jsx`<br>Line 85-94 | FE gửi `min_price`, `max_price` vào `price_summary`. Backend cấu hình `forbidNonWhitelisted: true` nên từ chối toàn bộ request. Ngoài ra gửi `minPrice: 0` vi phạm `@Min(1)`. |
| **ISSUE-03** | **Lỗi HTTP 400 Bad Request trên Flash Sale Buyer Storefront** | 🔴 **CRITICAL** | Buyer | `apps/buyer/.../product.api.js`<br>Line 38-44 | FE gửi `params: { limit: 8, sort: 'popular' }`. Backend DTO chỉ chấp nhận `size` (không có `limit`) và `sort` enum chỉ cho phép `newest`, `price_asc`, `price_desc`. |
| **ISSUE-04** | **Lỗi HTTP 400 khi tìm kiếm & lọc sản phẩm Buyer** | 🔴 **CRITICAL** | Buyer | `apps/buyer/.../product.api.js`<br>Line 20-35 | FE truyền nguyên vẹn các tham số tìm kiếm (`q`, `rating`, `isOfficial`) sang API `GET /products`. BE `QueryProductsDto` cấm thuộc tính lạ, quăng lỗi 400. |
| **ISSUE-05** | **Trang chi tiết sản phẩm hiển thị rỗng tiêu đề và ảnh placeholder** | 🔴 **CRITICAL** | Buyer | `apps/buyer/.../ProductDetailPage.jsx`<br>Line 42-60 | FE đọc `product.name`, `product.id`, `product.images`. BE thật trả về `product.title`, `product.product_id`, `product.media: [{ url, is_cover }]`. |
| **ISSUE-06** | **Gãy logic chọn biến thể SKU trên trang chi tiết sản phẩm** | 🔴 **CRITICAL** | Buyer | `apps/buyer/.../ProductPurchase.jsx`<br>Line 55-75 | FE lưu `selectedAttributes` theo nhãn tiếng Việt (`"Màu sắc": "Đen"`), trong khi SKU Backend lưu key chuẩn hóa (`{ "color": "black" }`). `sku.attributes[label]` luôn `undefined`. |
| **ISSUE-07** | **Sai lệch tính toán thuế suất gấp 100 lần (Tax Calculation Error)** | 🟠 **HIGH** | Seller | `apps/seller/.../ProductEditorModal.jsx`<br>Line 78 | FE nhập thuế theo % (ví dụ 10) và gửi nguyên số `10` lên BE. BE quy định `tax_rate_bps` tính theo Basis Points (1000 bps = 10%). Kết quả BE lưu $10 \text{ bps} = 0.1\%$. |
| **ISSUE-08** | **Hiển thị số liệu Social Proof giả mạo trên toàn bộ sản phẩm** | 🟠 **HIGH** | Buyer | `apps/buyer/.../ProductDetailPage.jsx`<br>Line 106-107 | Code fallback cứng: `review_count || 1284` và `sold_count || 1420`. Toàn bộ sản phẩm thật mới tạo đều bị hiển thị gian lận 1284 đánh giá và 1420 đã bán. |
| **ISSUE-09** | **Tab "Hết hàng" (OUT_OF_STOCK) gây lỗi hoặc vô hiệu** | 🟠 **HIGH** | Seller | `apps/seller/.../ProductsPage.jsx`<br>Line 28 | `ProductStatus` không có enum `OUT_OF_STOCK`. Gửi query `?status=OUT_OF_STOCK` sẽ bị BE báo lỗi trạng thái không hợp lệ. |
| **ISSUE-10** | **Thiếu cơ chế hiển thị lý do từ chối duyệt sản phẩm cho Seller** | 🟡 **MEDIUM** | Seller | `apps/seller/.../ProductsPage.jsx` | Khi sản phẩm bị Admin chuyển sang `REJECTED`, Seller không có bất kỳ nơi nào để xem `rejection_reason` từ Admin để sửa chữa. |
| **ISSUE-11** | **Thiếu Empty State chuẩn Penpot khi danh mục/tìm kiếm rỗng** | 🟡 **MEDIUM** | Buyer/Seller | `apps/seller/.../ProductsPage.jsx`<br>`apps/buyer/.../ProductListPage.jsx` | Chỉ hiển thị bảng trắng trơn hoặc text đơn giản, thiếu minh họa và CTA chuẩn Design System. |
| **ISSUE-12** | **Chưa triển khai giao diện và API client cho Audit Logs (Kiểm toán)** | 🟡 **MEDIUM** | Admin | `apps/admin/.../admin-catalog.api.js` | BE đã có sẵn endpoint `GET /admin/catalog/audits` nhưng FE Admin chưa có service và view hiển thị. |
| **ISSUE-13** | **Nguy cơ Race Condition khi bấm chuyển Tab danh sách sản phẩm nhanh** | 🟡 **MEDIUM** | Seller | `apps/seller/.../ProductsPage.jsx` | Thiếu `AbortController` trong `useEffect`, request cũ có thể ghi đè request mới khi mạng chập chờn. |
| **ISSUE-14** | **Suy giảm hiệu năng DOM khi số lượng tổ hợp biến thể SKU lớn (>100 SKU)** | 🟡 **MEDIUM** | Seller | `apps/seller/.../SkuMatrixTable.jsx` | Render đồng loạt hàng trăm input cells không có Virtualization, gây giật lag gõ phím (>300ms INP). |
| **ISSUE-15** | **Thiếu Client Caching cho Cây danh mục sản phẩm (Categories Tree)** | 🟢 **LOW** | Buyer/Seller | Multiple components | Gọi lại API `GET /categories` liên tục khi đổi trang, gây lãng phí băng thông và tải DB. |
| **ISSUE-16** | **Thiếu PropTypes và Type Validation cho các Component dùng chung** | 🟢 **LOW** | Shared | `shared/ui-components/` | Một số component thiếu khai báo `PropTypes` đầy đủ theo quy định của dự án JavaScript. |

---

### 3. BIỂU ĐỒ PHÂN BỐ VẤN ĐỀ THEO MỨC ĐỘ

```text
+-----------------------+-------+------------------------------------------+
| Mức độ nghiêm trọng   | Số lỗi| Tác động chính                           |
+-----------------------+-------+------------------------------------------+
| 🔴 CRITICAL           |   6   | Crash ứng dụng, 400 Bad Request, White UI|
| 🟠 HIGH               |   3   | Sai giá/thuế, gian lận số liệu, lỗi SKU  |
| 🟡 MEDIUM             |   5   | Thiếu tính năng UX, thiếu Audit, giật lag|
| 🟢 LOW                |   2   | Caching, Clean Code, PropTypes           |
+-----------------------+-------+------------------------------------------+
| TỔNG CỘNG             |  16   |                                          |
+-----------------------+-------+------------------------------------------+
```

> [!IMPORTANT]
> **Nhận định sống còn**: 6 lỗi mức **CRITICAL** phải được xử lý ngay lập tức trong Giai đoạn 1 (Hotfix). Nếu không xử lý 6 lỗi này, toàn bộ việc tích hợp hệ thống là bất khả thi.

