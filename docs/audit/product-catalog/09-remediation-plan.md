# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 9: KẾ HOẠCH KHẮC PHỤC KỸ THUẬT (REMEDIATION PLAN)

---

### 1. NGUYÊN TẮC THỰC THI & PHÂN KỲ DỰ ÁN

Để đảm bảo quá trình sửa lỗi diễn ra an toàn, không gây xáo trộn kiến trúc và đưa hệ thống vào trạng thái hoạt động nhanh nhất có thể, kế hoạch khắc phục được chia thành **4 giai đoạn tuần tự**:

```text
[Giai đoạn 1: Hotfix Blockers] ──> [Giai đoạn 2: Chuẩn hóa Adapter] ──> [Giai đoạn 3: Hoàn thiện UI/UX] ──> [Giai đoạn 4: Tối ưu Hiệu năng]
   (Xử lý 6 lỗi Critical)             (Đồng bộ Data Model & SKU)             (Empty state, Rejection modal)         (Caching, Virtualization)
```

---

### 2. CHI TIẾT CÁC GIAI ĐOẠN KHẮC PHỤC

#### GIAI ĐOẠN 1: HOTFIX CRITICAL BLOCKERS (Ưu tiên P0 - Thời gian ước tính: 1-2 ngày)
**Mục tiêu**: Giải phóng các lỗi chặn luồng, thông suốt API giữa Frontend và Backend NestJS.

1. **Sửa lỗi Envelope hiển thị danh sách sản phẩm Người bán (`ISSUE-01`)**:
   - *File*: `apps/seller/src/features/products/pages/ProductsPage.jsx`.
   - *Mã nguồn sửa đổi*:
     ```javascript
     // TRƯỚC: const dataItems = res?.data?.items || [];
     // SAU: Hỗ trợ linh hoạt cả 2 cấu trúc response:
     const dataItems = Array.isArray(res?.data) 
       ? res.data 
       : (res?.data?.items || res?.data?.data || []);
     setProducts(dataItems);
     ```

2. **Sửa lỗi DTO Payload cấm `min_price`/`max_price` khi tạo sản phẩm (`ISSUE-02`)**:
   - *File*: `apps/seller/src/features/products/components/ProductEditorModal.jsx`.
   - *Mã nguồn sửa đổi*:
     ```javascript
     // Loại bỏ hoàn toàn min_price và max_price khỏi price_summary:
     price_summary: {
       base_price: Number(form.basePrice) > 0 ? Number(form.basePrice) : 10000,
       ...(form.salePrice ? { sale_price: Number(form.salePrice) } : {}),
       currency: 'VND',
     },
     // Chuẩn hóa thuế sang basis points:
     tax_rate_bps: Math.round(Number(form.taxRate || 0) * 100),
     ```

3. **Sửa lỗi Flash Sale & Query Params Buyer Storefront (`ISSUE-03` & `ISSUE-04`)**:
   - *File*: `apps/buyer/src/features/products/services/product.api.js`.
   - *Mã nguồn sửa đổi*:
     ```javascript
     getFlashSaleProducts: () => {
       return apiClient.get('/products', {
         params: { size: 8, page: 1, sort: 'newest' } // Dùng size và sort hợp lệ
       });
     },
     getProducts: (params = {}) => {
       // Chỉ lọc và gửi các param mà Backend QueryProductsDto hỗ trợ:
       const validParams = {};
       if (params.page) validParams.page = Number(params.page);
       if (params.size || params.limit) validParams.size = Number(params.size || params.limit);
       if (params.category_id) validParams.category_id = params.category_id;
       if (['newest', 'price_asc', 'price_desc'].includes(params.sort)) {
         validParams.sort = params.sort;
       }
       return apiClient.get('/products', { params: validParams });
     }
     ```

---

#### GIAI ĐOẠN 2: CHUẨN HÓA TẦNG ADAPTER & DỮ LIỆU THỰC THỂ (Ưu tiên P1 - Thời gian ước tính: 2-3 ngày)
**Mục tiêu**: Đảm bảo toàn bộ thuộc tính sản phẩm, hình ảnh và biến thể SKU hiển thị chính xác.

1. **Xây dựng Data Normalizer (`product.adapter.js`)**:
   - *File mới*: `shared/utils/adapters/product.adapter.js`.
   - *Chức năng*: Chuyển đổi dữ liệu từ Backend sang định dạng chuẩn chung cho toàn bộ React Components:
     ```javascript
     export const normalizeProduct = (raw = {}) => {
       if (!raw) return null;
       const mediaList = raw.media || [];
       const coverMedia = mediaList.find(m => m.is_cover)?.url || mediaList[0]?.url || raw.image;
       
       return {
         id: raw.product_id || raw.id || raw._id,
         product_id: raw.product_id || raw.id,
         title: raw.title || raw.name || 'Sản phẩm không có tên',
         name: raw.title || raw.name || 'Sản phẩm không có tên',
         description: raw.description || '',
         price: raw.price_summary?.sale_price || raw.price_summary?.base_price || raw.price || 0,
         originalPrice: raw.price_summary?.base_price || raw.originalPrice || 0,
         coverImage: coverMedia || 'https://placehold.co/400',
         images: mediaList.length > 0 ? mediaList.map(m => m.url) : (raw.images || [coverMedia]),
         category_id: raw.category_id,
         rating: raw.rating_summary?.avg || 0,
         ratingCount: raw.rating_summary?.count || 0,
         soldCount: raw.sold_count || 0,
         status: raw.status,
         skus: raw.skus || [],
       };
     };
     ```

2. **Khắc phục triệt để Logic chọn SKU Variant (`ISSUE-06`)**:
   - Chuẩn hóa hàm so khớp biến thể trong `ProductPurchase.jsx`:
     ```javascript
     const matchedSku = product.skus?.find(sku => {
       return Object.entries(selectedAttributes).every(([attrKey, selectedVal]) => {
         // Hỗ trợ cả key tiếng Anh lẫn nhãn tiếng Việt nếu có
         const skuAttrValue = sku.attributes?.[attrKey] || sku.attributes?.[attrKey.toLowerCase()];
         return skuAttrValue === selectedVal;
       });
     });
     ```

---

#### GIAI ĐOẠN 3: HOÀN THIỆN TÍNH NĂNG & TRẠNG THÁI UI/UX (Ưu tiên P2 - Thời gian ước tính: 2-3 ngày)
**Mục tiêu**: Đáp ứng quy chuẩn `AGENTS.md` về 4 trạng thái bắt buộc và độ chính xác thiết kế Penpot.

1. **Bổ sung Modal hiển thị Lý do từ chối kiểm duyệt cho Người bán (`ISSUE-10`)**:
   - Khi trạng thái là `REJECTED`, render thêm badge kèm icon `AlertCircle`.
   - Khi click vào, hiển thị Dialog: "Lý do từ chối từ Ban Quản Trị" kèm nội dung `rejection_reason` và nút "Chỉnh sửa sản phẩm để gửi duyệt lại".
2. **Tích hợp Empty State chuẩn Penpot (`ISSUE-11`)**:
   - Sử dụng `<EmptyState />` từ `@taca/ui-components` trong cả Seller `ProductsPage.jsx` và Buyer `ProductListPage.jsx`.
3. **Bổ sung Giao diện và API Client cho Audit Logs (`ISSUE-12`)**:
   - Thêm hàm `getCatalogAudits(params)` vào `admin-catalog.api.js`.
   - Xây dựng tab hoặc trang con xem lịch sử kiểm toán trong Admin Portal.

---

#### GIAI ĐOẠN 4: HIỆU NĂNG, KIẾN TRÚC & EVENTUAL CONSISTENCY (Ưu tiên P3 - Thời gian ước tính: 2 ngày)
**Mục tiêu**: Đảm bảo tính ổn định cao khi chịu tải và trải nghiệm mượt mà.

1. **Chống Race Condition bằng AbortController (`ISSUE-13`)**:
   - Tích hợp hủy request tự động trong các hook gọi dữ liệu danh sách sản phẩm.
2. **Lưu đệm cây Danh mục (Categories Caching) (`ISSUE-15`)**:
   - Sử dụng Context hoặc SWR cache cho endpoint `GET /categories` với TTL 15 phút.
3. **Tối ưu bảng ma trận SKU bằng React.memo (`ISSUE-14`)**:
   - Đóng gói từng dòng SKU (`SkuRow.jsx`) bằng `React.memo` để tránh re-render toàn bộ bảng khi người dùng nhập dữ liệu trên 1 ô input.

---

### 3. MA TRẬN PHÂN CÔNG & THỜI GIAN BIỂU (TIMELINE)

| Giai đoạn | Nhiệm vụ trọng tâm | Đầu ra (Deliverables) | Thời gian | Phụ trách chính |
| :---: | :--- | :--- | :---: | :--- |
| **P0** | Hotfix 6 lỗi Critical | PR hotfix: sửa params, payload, envelope mapping | 2 ngày | Fullstack Engineer |
| **P1** | Chuẩn hóa Data Adapter & SKU | PR adapter: `product.adapter.js`, fix PDP & variant selection | 3 ngày | Frontend Lead |
| **P2** | Hoàn thiện UI/UX & Audit | PR UI: Rejection modal, Empty states, Admin Audit view | 3 ngày | Frontend Engineer |
| **P3** | Tối ưu Hiệu năng & Cache | PR perf: AbortController, React.memo SkuMatrix, Caching | 2 ngày | Senior Architect |
| **TỔNG**| **Toàn bộ lộ trình** | **Hệ thống Product Catalog đạt chuẩn sẵn sàng Production** | **10 ngày công** | Toàn đội ngũ |

