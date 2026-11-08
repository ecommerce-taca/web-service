# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 4: ĐỐI SOÁT HỢP ĐỒNG API (API COMPATIBILITY AUDIT)

---

### 1. QUY CHUẨN THẨM ĐỊNH BACKEND & CƠ CHẾ BẢO VỆ NGHIÊM NGẶT

Trước khi đối soát từng endpoint, cần lưu ý cấu hình bootstrap cốt lõi của Backend NestJS (`Product-Catalog-Service/src/main.ts`):

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, // QUY TẮC CỰC KỲ NGHIÊM NGẶT
    transform: true,
  }),
);
```

> [!CAUTION]
> **HẬU QUẢ CỦA `forbidNonWhitelisted: true`**:
> Khi cờ này được kích hoạt, nếu Frontend gửi **bất kỳ trường nào (dù chỉ là 1 property)** không được định nghĩa với decorator hợp lệ trong DTO của Backend (ở cả `@Query()` lẫn `@Body()`), NestJS sẽ **ngay lập tức từ chối request với mã lỗi HTTP 400 Bad Request** kèm danh sách các trường bị cấm.
>
> Đây là nguyên nhân gốc rễ (Root Cause) giải thích vì sao nhiều màn hình Frontend chạy rất mượt trên môi trường Mock nhưng sẽ gãy hoàn toàn ngay khi kết nối Backend thực tế.

---

### 2. MA TRẬN ĐỐI SOÁT HỢP ĐỒNG 26 API ENDPOINTS

Dưới đây là bảng đối soát chi tiết giữa **Frontend thực tế** (`apps/*`) và **Backend thực tế** (`Product-Catalog-Service`) dựa trên tài liệu chuẩn `api/product-catalog.md`:

#### Nhóm 1: Public Catalog (Buyer Storefront)

| STT | Nghiệp vụ | FE Implementation | BE Implementation | Đánh giá Contract & Mismatch |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Lấy danh sách sản phẩm công khai** | `GET /products`<br>`product.api.js` | `@Get('products')`<br>`product.controller.ts` | 🔴 **CRITICAL MISMATCH**:<br>1. FE gửi `limit` trong khi DTO BE (`QueryProductsDto`) chỉ chấp nhận `size`.<br>2. FE gửi `sort=popular` trong hàm `getFlashSaleProducts()`, nhưng BE Enum chỉ chấp nhận: `newest`, `price_asc`, `price_desc`. Bị **HTTP 400**.<br>3. Trong `getProducts(params)`, FE để lọt các param tìm kiếm (`q`, `rating`, `isOfficial`) sang Catalog Service. BE quăng **HTTP 400** do `forbidNonWhitelisted`. |
| **2** | **Xem chi tiết sản phẩm** | `GET /products/{productId}`<br>`product.api.js` | `@Get('products/:id')`<br>`product.controller.ts` | 🟡 **FIELD MISMATCH**:<br>1. URL khớp (`/products/:id`).<br>2. Response Data Mapping lệch: BE trả về `{ product_id, title, media: [...] }`, nhưng FE `ProductDetailPage.jsx` đọc `product.id`, `product.name`, `product.images`. Dẫn đến hiển thị rỗng tiêu đề và fallback sang placeholder ảnh! |
| **3** | **Danh sách sản phẩm của người bán** | `GET /seller/products`<br>`seller-product.api.js` | `@Get('seller/products')`<br>`seller-product.controller.ts` | 🔴 **CRITICAL ENVELOPE MISMATCH**:<br>BE Interceptor trả về: `{ data: Array(n), meta: { page, size, total } }`.<br>Tại `ProductsPage.jsx` dòng 47: `const dataItems = res?.data?.items || [];`.<br>Vì `res.data` là mảng (Array), `res.data.items` là `undefined` $\rightarrow$ gán `dataItems = []`. **Kết quả: Bảng của người bán luôn luôn rỗng!** |
| **4** | **Xem chi tiết sản phẩm người bán** | `GET /seller/products/{id}`<br>`seller-product.api.js` | `@Get('seller/products/:id')`<br>`seller-product.controller.ts` | 🟢 **MATCHED**: URL và header `X-User-Id` khớp đúng. |

---

#### Nhóm 2: Seller Product Lifecycle & CRUD

| STT | Nghiệp vụ | FE Implementation | BE Implementation | Đánh giá Contract & Mismatch |
| :---: | :--- | :--- | :--- | :--- |
| **5** | **Tạo sản phẩm nháp** | `POST /seller/products`<br>`ProductEditorModal.jsx` | `@Post('seller/products')`<br>`seller-product.controller.ts` | 🔴 **CRITICAL PAYLOAD MISMATCH**:<br>1. FE gửi `price_summary.min_price` và `price_summary.max_price`. DTO BE (`PriceSummaryDto`) không khai báo 2 trường này $\rightarrow$ **HTTP 400 Bad Request** (`property min_price should not exist`).<br>2. FE gửi `minPrice: 0` vi phạm validation `@Min(1)`.<br>3. FE gửi gộp danh sách SKU và Media trong payload tạo ban đầu, nhưng BE tách thành các bước độc lập (Draft Product $\rightarrow$ Upload Media $\rightarrow$ Update SKUs). |
| **6** | **Cập nhật sản phẩm** | `PUT /seller/products/{id}`<br>`seller-product.api.js` | `@Put('seller/products/:id')`<br>`seller-product.controller.ts` | 🟡 **MISMATCHED**: Payload FE gửi thừa các trường `skus`, `media`, `categories` vi phạm DTO `UpdateProductDto`. |
| **7** | **Lưu trữ / Xóa mềm sản phẩm** | `DELETE /seller/products/{id}`<br>`seller-product.api.js` | `@Delete('seller/products/:id')`<br>`seller-product.controller.ts` | 🟢 **MATCHED**: Khớp hoàn toàn HTTP method và Path. |
| **8** | **Gửi duyệt sản phẩm** | `POST /seller/products/{id}/submit`<br>`seller-product.api.js` | `@Post('seller/products/:id/submit')`<br>`seller-publish.controller.ts` | 🟢 **MATCHED**: Khớp URL và Method. |
| **9** | **Ẩn sản phẩm đang bán** | `POST /seller/products/{id}/unpublish`<br>`seller-product.api.js` | `@Post('seller/products/:id/unpublish')`<br>`seller-publish.controller.ts` | 🟢 **MATCHED**: Khớp URL và Method. |
| **9a** | **Kích hoạt lại sản phẩm đã ẩn** | `POST /seller/products/{id}/publish`<br>`seller-product.api.js` | `@Post('seller/products/:id/publish')`<br>`seller-publish.controller.ts` | 🟢 **MATCHED**: Khớp URL và Method. |

---

#### Nhóm 3: Seller SKU & Media Management

| STT | Nghiệp vụ | FE Implementation | BE Implementation | Đánh giá Contract & Mismatch |
| :---: | :--- | :--- | :--- | :--- |
| **10** | **Cập nhật danh sách SKUs** | `PUT /seller/products/{id}/skus`<br>`seller-product.api.js` | `@Put('seller/products/:id/skus')`<br>`seller-sku.controller.ts` | 🟡 **DATA STRUCTURE MISMATCH**:<br>DTO BE (`UpdateProductSkusDto`) yêu cầu `skus: [{ sku_code, attributes, price, stock, barcode }]`. Trong đó `attributes` là Record key-value chuẩn hóa (`{ color: "black", size: "M" }`).<br>FE hiện tại gửi key là chuỗi tiếng Việt thô (`{ "Màu sắc": "Đen", "Kích thước": "M" }`). |
| **10a**| **Lấy riêng danh sách SKUs** | Chưa gọi | `@Get('seller/products/:id/skus')`<br>`seller-sku.controller.ts` | ⚪ **UNUSED API**: BE có endpoint riêng biệt nhưng FE luôn lấy SKUs qua API detail sản phẩm. |
| **11** | **Cập nhật 1 SKU đơn lẻ** | `PATCH /seller/products/{id}/skus/{skuId}` | `@Patch('seller/products/:id/skus/:skuId')` | 🟢 **MATCHED**: Endpoint và params khớp. |
| **12** | **Cập nhật tồn kho SKU** | `PATCH /seller/products/{id}/skus/{skuId}/stock` | `@Patch('seller/products/:id/skus/:skuId/stock')` | 🟢 **MATCHED**: Khớp contract. |
| **13** | **Tải lên Media sản phẩm** | `POST /seller/products/{id}/media`<br>`multipart/form-data` | `@Post('seller/products/:id/media')`<br>`FileInterceptor('file')` | 🟢 **MATCHED**: Khớp chuẩn upload file và field name `file`. |
| **14** | **Sắp xếp thứ tự Media** | `PUT /seller/products/{id}/media/sort` | `@Put('seller/products/:id/media/sort')` | 🟢 **MATCHED**: Payload `{ media_ids: string[] }` khớp. |
| **15** | **Gắn cờ ảnh bìa (Cover)** | `PATCH /seller/products/{id}/media/{mediaId}/cover` | `@Patch('seller/products/:id/media/:mediaId/cover')` | 🟢 **MATCHED**: Khớp contract. |
| **16a**| **Lấy danh sách Media** | Chưa gọi | `@Get('seller/products/:id/media')` | ⚪ **UNUSED API**: FE đọc media qua response detail. |
| **16b**| **Xóa Media sản phẩm** | Chưa gọi | `@Delete('seller/products/:id/media/:mediaId')` | 🔴 **MISSING CLIENT CALL**: BE đã có API nhưng FE chưa gắn nút gọi xóa media. |

---

#### Nhóm 4: Categories & Admin Moderation

| STT | Nghiệp vụ | FE Implementation | BE Implementation | Đánh giá Contract & Mismatch |
| :---: | :--- | :--- | :--- | :--- |
| **17** | **Lấy danh sách Danh mục** | `GET /categories`<br>`categories.api.js` | `@Get('categories')`<br>`category.controller.ts` | 🟢 **MATCHED**: Khớp hoàn toàn. |
| **18** | **Lấy chi tiết Danh mục** | `GET /categories/{id}` | `@Get('categories/:id')`<br>`category.controller.ts` | 🟢 **MATCHED**: Khớp hoàn toàn. |
| **19** | **Tạo Danh mục (Admin)** | `POST /admin/categories`<br>`admin-catalog.api.js` | `@Post('admin/categories')`<br>`admin-category.controller.ts` | 🟢 **MATCHED**: DTO `CreateCategoryDto` khớp các trường `name`, `slug`, `parent_id`. |
| **20** | **Cập nhật Danh mục (Admin)** | `PUT /admin/categories/{id}`<br>`admin-catalog.api.js` | `@Put('admin/categories/:id')`<br>`admin-category.controller.ts` | 🟢 **MATCHED**: Khớp hoàn toàn. |
| **21** | **Hàng đợi kiểm duyệt sản phẩm** | `GET /admin/catalog/products`<br>`admin-catalog.api.js` | `@Get('admin/catalog/products')`<br>`admin-moderation.controller.ts` | 🟢 **MATCHED**: Query param `status=PENDING_APPROVAL` khớp. |
| **22** | **Phê duyệt sản phẩm** | `POST /admin/catalog/products/{id}/approve` | `@Post('admin/catalog/products/:id/approve')` | 🟢 **MATCHED**: Khớp hoàn toàn. |
| **23** | **Từ chối sản phẩm** | `POST /admin/catalog/products/{id}/reject` | `@Post('admin/catalog/products/:id/reject')` | 🟡 **MISMATCHED**: BE yêu cầu DTO `{ reason: string }` tối thiểu 5 ký tự. Một số dialog FE gửi payload rỗng `{}` dẫn đến **HTTP 400**. |
| **24** | **Đình chỉ / Khóa sản phẩm** | `POST /admin/catalog/products/{id}/suspend` | `@Post('admin/catalog/products/:id/suspend')` | 🟢 **MATCHED**: Cần bổ sung `{ reason: string }`. |
| **24a**| **Xem Audit Logs Danh mục** | Chưa có client | `@Get('admin/catalog/audits')`<br>`admin-moderation.controller.ts` | 🔴 **MISSING ON FE**: FE chưa có hàm trong `admin-catalog.api.js`. |
| **25** | **Nhập hàng loạt Excel/CSV** | `POST /seller/products/import` | `@Post('seller/products/import')`<br>`seller-import.controller.ts` | 🟡 **INCOMPLETE**: BE trả về `{ job_id }` nhưng FE chưa có cơ chế polling kiểm tra tiến độ import. |
| **26** | **Xuất dữ liệu Excel/CSV** | `GET /seller/products/export` | `@Get('seller/products/export')`<br>`seller-export.controller.ts` | 🟢 **MATCHED**: Response dạng octet-stream khớp. |

---

### 3. ĐIỂM GÃY CRITICAL: CHI TIẾT LỖI REQUEST & RESPONSE

#### 3.1. Điểm gãy #1: Flash Sale & Public Catalog (Lỗi HTTP 400)
- **Vị trí**: `apps/buyer/src/features/products/services/product.api.js`:
  ```javascript
  getFlashSaleProducts: () => {
    return apiClient.get('/products', {
      params: { limit: 8, page: 1, sort: 'popular' }
    });
  }
  ```
- **Tại Backend NestJS**: `QueryProductsDto` quy định:
  ```typescript
  @IsOptional() @IsInt() @Min(1) @Max(100) size?: number = 20;
  @IsOptional() @IsIn(['newest', 'price_asc', 'price_desc']) sort?: string;
  ```
- **Hậu quả**: NestJS quăng lỗi `limit should not exist` và `sort must be one of the following values: newest, price_asc, price_desc`. Request trả về mã lỗi 400 và không một sản phẩm flash sale nào hiển thị trên trang chủ Buyer!

#### 3.2. Điểm gãy #2: Response Envelope và Danh sách sản phẩm Người bán (Bảng rỗng)
- **Vị trí**: `apps/seller/src/features/products/pages/ProductsPage.jsx` (dòng 47):
  ```javascript
  const res = await sellerProductApi.getProducts(params);
  const dataItems = res?.data?.items || [];
  setProducts(dataItems);
  ```
- **Tại Backend NestJS**: `ResponseEnvelopeInterceptor` bọc kết quả từ controller:
  ```typescript
  return {
    data: result.items, // TRẢ THẲNG MẢNG VÀO data
    meta: {
      page: result.page,
      size: result.size,
      total: result.total,
    }
  };
  ```
- **Hậu quả**: Khi Axios nhận response, `res.data` chính là object `{ data: [...mảng sản phẩm...], meta: {...} }`. Khi FE gọi `res.data.items`, kết quả nhận được là `undefined`. Toàn bộ sản phẩm của Người bán biến mất và UI render Empty State rỗng vĩnh viễn!

