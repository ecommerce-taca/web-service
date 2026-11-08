# BÁO CÁO AUDIT TOÀN DIỆN PRODUCT CATALOG: UI/UX, FRONTEND API & BACKEND
## PHẦN 10: ĐÁNH GIÁ CUỐI CÙNG & TRẢ LỜI 5 CÂU HỎI CỐT LÕI (FINAL ASSESSMENT)

---

### 1. ĐIỂM ĐÁNH GIÁ SẴN SÀNG SẢN XUẤT (PRODUCTION READINESS SCORE)

Dựa trên toàn bộ kết quả kiểm toán kỹ thuật ba chiều giữa **Tài liệu chuẩn**, **Backend NestJS** và **Frontend React Micro-Frontends**, nhóm Audit đưa ra bảng điểm đánh giá mức độ sẵn sàng sản xuất của phân hệ Product Catalog:

```text
+------------------------------------+---------------+-------------+------------------------------------+
| Hạng mục Thẩm định (Audit Domain)  | Trọng số (%)  | Điểm số (/100)| Điểm quy đổi                      |
+------------------------------------+---------------+-------------+------------------------------------+
| 1. Tính hoàn thiện Backend API     |      25%      |     95      | 23.75                              |
| 2. Tính tương thích Hợp đồng (API) |      30%      |     35      | 10.50                              |
| 3. Đồng bộ Dữ liệu & Biến thể SKU  |      20%      |     30      |  6.00                              |
| 4. Độ hoàn thiện UI/UX & Penpot    |      15%      |     60      |  9.00                              |
| 5. Hiệu năng & Khả năng mở rộng    |      10%      |     55      |  5.50                              |
+------------------------------------+---------------+-------------+------------------------------------+
| TỔNG ĐIỂM SẴN SÀNG SẢN XUẤT        |     100%      |             | 54.75 / 100 -> ~42% Thực tế Runtime|
+------------------------------------+---------------+-------------+------------------------------------+
```

> [!CAUTION]
> **KẾT LUẬN CHUNG**: Phân hệ **Product Catalog HIỆN CHƯA ĐỦ ĐIỀU KIỆN ĐỂ TÍCH HỢP PRODUCTION** nếu chuyển đổi sang `VITE_USE_MOCK_DATA=false`. Mặc dù Backend được thiết kế và hiện thực rất tốt (đạt 95/100 điểm với đầy đủ Transactional Outbox, CDC Debezium, Redis Cache và Validation nghiêm ngặt), nhưng khoảng cách giao tiếp (Contract Drifts) ở tầng Frontend là quá lớn, dẫn đến việc hầu hết các luồng mua sắm và đăng bán sẽ bị chặn ngay lập tức.

---

### 2. TRẢ LỜI TRỰC TIẾP 5 CÂU HỎI TRỌNG TÂM CỦA BAN QUẢN TRỊ

---

#### CÂU HỎI 1: Frontend đang hiển thị UI nào mà tài liệu không yêu cầu hoặc không có nghiệp vụ backend tương ứng?

**Trả lời**: Có **3 thành phần UI điển hình** đang vi phạm:
1. **Chỉ số Social Proof giả mạo trên Trang chi tiết sản phẩm (`ProductDetailPage.jsx`, Line 106-107)**:
   - *Bằng chứng*: Code FE fallback cứng `review_count || 1284` và `sold_count || 1420`.
   - *Thực tế*: Backend chỉ trả về `{ avg: number, count: number }`. Không hề có số liệu 1,284 đánh giá hay 1,420 lượt bán. UI đang tự động hiển thị số ảo cho mọi sản phẩm.
2. **Tab lọc "Hết hàng" (`OUT_OF_STOCK`) trong Quản lý sản phẩm Người bán (`ProductsPage.jsx`, Line 28)**:
   - *Bằng chứng*: Tab lọc gửi query `status=OUT_OF_STOCK`.
   - *Thực tế*: Enum `ProductStatus` trong database và tài liệu không có trạng thái này. Tồn kho là thuộc tính số học được đồng bộ bất đồng bộ từ `inventory_projections`, không phải trạng thái vòng đời sản phẩm.
3. **Các ô nhập `min_price` và `max_price` trong Modal tạo sản phẩm (`ProductEditorModal.jsx`)**:
   - *Bằng chứng*: Form tạo sản phẩm có state và input cho khoảng giá min/max.
   - *Thực tế*: Tài liệu và DTO `PriceSummaryDto` của Backend chỉ quản lý `base_price` và `sale_price`. Việc hiển thị và gửi khoảng giá là dư thừa và gây lỗi từ chối request.

---

#### CÂU HỎI 2: Frontend đang gửi request nào mà Backend không có API tiếp nhận?

**Trả lời**: Có **2 trường hợp gửi sai lệch hoặc không có endpoint tiếp nhận tương ứng**:
1. **Request Flash Sale với `sort=popular` (`product.api.js`, Line 40)**:
   - *Bằng chứng*: FE gửi `GET /products?limit=8&page=1&sort=popular`.
   - *Thực tế*: Backend Catalog Service không có thuật toán xếp hạng `popular` (tính năng này thuộc về Recommendation/Search Service). Backend chỉ chấp nhận `sort` thuộc 3 giá trị: `newest`, `price_asc`, `price_desc`.
2. **Request Tìm kiếm nâng cao gửi nhầm vào Catalog Service (`product.api.js`, Line 25)**:
   - *Bằng chứng*: Khi người dùng gõ từ khóa tìm kiếm trên thanh search hoặc lọc đánh giá sao, FE gửi các query params: `q`, `rating`, `isOfficial` vào endpoint `GET /products`.
   - *Thực tế*: `QueryProductsDto` của Backend Catalog Service hoàn toàn không có các trường này (chúng thuộc về Search-Service chạy ElasticSearch). Kết quả Backend quăng lỗi HTTP 400.

---

#### CÂU HỎI 3: Frontend đang gửi field nào mà Backend API không nhận hoặc không xử lý?

**Trả lời**: Đây là điểm gãy nguy hiểm nhất do Backend bật cơ chế `forbidNonWhitelisted: true`. Cụ thể:
1. **Các trường cấm trong `price_summary` khi Tạo sản phẩm (`ProductEditorModal.jsx`)**:
   - FE gửi: `min_price` và `max_price`.
   - Backend `PriceSummaryDto` không khai báo $\rightarrow$ **NestJS quăng lỗi HTTP 400 Bad Request ngay lập tức**.
2. **Trường giá trị tối thiểu không hợp lệ**:
   - FE gửi: `minPrice: 0` hoặc `basePrice: 0`.
   - Backend `PriceSummaryDto` ràng buộc decorator `@Min(1)` $\rightarrow$ **NestJS quăng lỗi HTTP 400 Bad Request**.
3. **Thuế suất sai đơn vị đo lường**:
   - FE gửi: `tax_rate_bps: 10` (Hiểu là 10%).
   - Backend quy định Basis Points ($1\% = 100 \text{ bps}$) $\rightarrow$ Backend lưu $10 \text{ bps} = 0.1\%$, làm sai lệch toàn bộ tính toán thuế đơn hàng.
4. **Key thuộc tính SKU gửi tiếng Việt thô**:
   - FE gửi: `{ "Màu sắc": "Đỏ", "Kích thước": "XL" }`.
   - Backend yêu cầu normalized key bằng tiếng Anh (`{ "color": "red", "size": "XL" }`).

---

#### CÂU HỎI 4: Những requirement nào có trong tài liệu nhưng Frontend hoặc Backend chưa làm?

**Trả lời**:
1. **Chưa làm trên Frontend (FE Missing)**:
   - **Xóa Media chuyên biệt**: Chưa gọi `DELETE /seller/products/{productId}/media/{mediaId}` (PC-REQ-015).
   - **Màn hình Audit Logs Admin**: Chưa có trang và API client gọi `GET /admin/catalog/audits` (PC-REQ-025).
   - **Hiển thị Lý do từ chối (Rejection Reason)**: Chưa có UI popup/modal để Người bán xem lý do Admin từ chối duyệt sản phẩm.
   - **Xác thực 2FA khi đình chỉ**: LLD yêu cầu bảo mật 2FA cho thao tác suspend sản phẩm nhưng FE chưa tích hợp flow OTP.
   - **Tracking Job Import Excel**: Chưa có cơ chế polling theo dõi tiến độ `job_id` khi nhập hàng loạt.
2. **Đánh giá trên Backend (BE Status)**:
   - Backend NestJS đã hiện thực đầy đủ **26 / 26 Endpoints (100%)**, cấu trúc DB và Outbox Debezium chuẩn chỉ. Backend không thiếu endpoint nghiệp vụ nào đã quy định trong tài liệu.

---

#### CÂU HỎI 5: Nếu cắm Frontend và Backend vào chạy ngay lúc này: Flow nào chạy được? Flow nào hỏng hoàn toàn? Nguyên nhân chính xác là gì?

**Trả lời**:

##### A. CÁC FLOW HỎNG HOÀN TOÀN (BREAKING FLOWS):
1. **Flow Người bán xem danh mục hàng hóa (Seller Products Page) $\rightarrow$ HỎNG HOÀN TOÀN**:
   - *Hiện tượng*: Người bán đăng nhập vào, danh sách sản phẩm luôn hiển thị **bảng rỗng** (Empty State), dù trong database có hàng trăm sản phẩm.
   - *Nguyên nhân*: Tại `ProductsPage.jsx` dòng 47, code đọc `res?.data?.items`. Vì Backend Interceptor trả về mảng trực tiếp tại `res.data`, nên `items` nhận giá trị `undefined`, gán fallback thành `[]`.
2. **Flow Người bán Tạo sản phẩm mới (Create Product) $\rightarrow$ HỎNG HOÀN TOÀN**:
   - *Hiện tượng*: Người bán điền form, bấm "Lưu nháp" hoặc "Gửi duyệt" $\rightarrow$ Báo lỗi hệ thống thất bại.
   - *Nguyên nhân*: NestJS `ValidationPipe` với `forbidNonWhitelisted: true` từ chối request vì payload gửi thừa `min_price` và `max_price`, đồng thời vi phạm `@Min(1)`.
3. **Flow Khách hàng xem Flash Sale trên Trang chủ (Buyer Flash Sale) $\rightarrow$ HỎNG HOÀN TOÀN**:
   - *Hiện tượng*: Khu vực Flash Sale quay tròn loading rồi báo lỗi, không có sản phẩm nào xuất hiện.
   - *Nguyên nhân*: Hàm `getFlashSaleProducts` gửi `limit=8` và `sort=popular`. Backend quăng lỗi HTTP 400 Bad Request.
4. **Flow Khách hàng chọn Biến thể mua hàng (PDP Variant Selection) $\rightarrow$ HỎNG HOÀN TOÀN**:
   - *Hiện tượng*: Khách hàng bấm chọn màu Đen, size XL nhưng hệ thống luôn thêm vào giỏ hàng biến thể mặc định đầu tiên (màu Trắng, size S) hoặc nút mua bị khóa.
   - *Nguyên nhân*: Xung đột giữa nhãn tiếng Việt (`selectedAttributes["Màu sắc"]`) và key Backend (`sku.attributes["color"]`), khiến hàm so khớp luôn trả về `undefined`.
5. **Flow Khách hàng xem Chi tiết sản phẩm (PDP Display) $\rightarrow$ HỎNG HIỂN THỊ**:
   - *Hiện tượng*: Tiêu đề sản phẩm bị trống, ảnh sản phẩm là ảnh placeholder xám xịt.
   - *Nguyên nhân*: Lệch tên trường `title` vs `name`, `media` vs `images`.

##### B. CÁC FLOW CHẠY ĐƯỢC (WORKING FLOWS):
1. **Flow Khám phá Cây danh mục (Categories Navigation)**: Menu danh mục đa cấp trên Buyer và Admin hoạt động mượt mà vì DTO và data mapping giữa FE và BE ở endpoint này hoàn toàn trùng khớp (`GET /categories`).
2. **Flow Admin phê duyệt sản phẩm (Admin Approve)**: Nút "Phê duyệt" gửi `POST /admin/catalog/products/{id}/approve` hoạt động chuẩn xác, kích hoạt đúng sự kiện Outbox trên Backend.
3. **Flow Người bán ẩn/hiện sản phẩm (Publish / Unpublish)**: Các thao tác chuyển trạng thái đơn giản không kèm payload phức tạp hoạt động tốt.
4. **Flow Người bán xóa mềm sản phẩm (Archive)**: `DELETE /seller/products/{id}` hoạt động đúng như thiết kế.

---

### 3. LỜI KHUYÊN ĐỊNH HƯỚNG CỦA SENIOR ARCHITECT

Để dự án Taca Ecommerce có thể chính thức bước vào giai đoạn kiểm thử liên thông (End-to-End Testing) và chuẩn bị ra mắt, toàn đội ngũ cần thực hiện ngay:

1. **Tuyệt đối tuân thủ kế hoạch Hotfix 4 giai đoạn** tại tài liệu `09-remediation-plan.md`. Không tự ý code thêm tính năng mới cho đến khi 6 lỗi Critical được giải quyết triệt để.
2. **Triển khai ngay Tầng Adapter (`product.adapter.js`)**: Thay vì sửa code rải rác trên từng component React, hãy đặt một tầng chuyển đổi dữ liệu tập trung ở `shared/utils` để bảo vệ mã nguồn Frontend trước các thay đổi schema của Backend.
3. **Thống nhất bộ Data Dictionary cho SKU Attributes**: Quy định danh mục thuộc tính chuẩn hóa bằng tiếng Anh (`color`, `size`, `material`, `flavor`) và chỉ dịch sang tiếng Việt ở tầng hiển thị cuối cùng.
4. **Bật chế độ Real API (`VITE_USE_MOCK_DATA=false`) trong môi trường Staging nội bộ**: Loại bỏ hoàn toàn sự phụ thuộc vào Mock Data cục bộ để các kỹ sư Frontend phát hiện lỗi contract ngay trong quá trình phát triển hàng ngày.

