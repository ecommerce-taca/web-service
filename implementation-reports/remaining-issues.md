# BÁO CÁO CÁC VẤN ĐỀ TỒN ĐỌNG VÀ KẾ HOẠCH NÂNG CẤP TƯƠNG LAI
## REMAINING ISSUES & FUTURE ENHANCEMENTS

---

### 1. TỔNG KẾT HIỆN TRẠNG
Sau khi hoàn tất 6 giai đoạn thi công khắc phục theo lộ trình kiểm toán:
- **0 lỗi CRITICAL (P0)**: Toàn bộ lỗi xung đột phiên bản OCC và crash trang đã được xử lý triệt để.
- **0 lỗi HIGH (P1)**: Toàn bộ các lỗi vi phạm DTO Whitelist 400 Bad Request và thiếu header tenant đã được bảo vệ.
- **0 lỗi MEDIUM (P2)**: Đã tích hợp tính năng tải file lỗi Excel, bộ lọc `flagged_only`, và nhật ký kiểm toán Catalog.
- Hệ thống đã đạt **100% điều kiện sẵn sàng vận hành (Production Ready)** cho các nghiệp vụ cốt lõi của Product Catalog.

---

### 2. DANH MỤC CÁC HẠNG MỤC CHỜ PHÁT TRIỂN TIẾP THEO (NON-BLOCKING BACKLOG)

Dưới đây là các tính năng cải tiến thứ cấp không ảnh hưởng đến luồng giao dịch hiện tại, được xếp vào kế hoạch nâng cấp dài hạn (Future Milestones):

| Mã định danh | Hạng mục cải tiến | Phân hệ liên quan | Lý do chờ / Phụ thuộc | Đề xuất giải pháp kỹ thuật |
| :---: | :--- | :--- | :--- | :--- |
| **FUT-01** | **Thông báo đẩy thời gian thực (Realtime SSE / WebSocket)** | Seller & Notification Gateway | Chờ triển khai Notification WebSocket Service dùng chung toàn sàn. | Tích hợp Server-Sent Events (SSE) để Seller nhận ngay thông báo khi Admin duyệt sản phẩm mà không cần F5. |
| **FUT-02** | **Microservice Khuyến mãi & Flash Sale chuyên biệt** | Buyer & Promotion Service | Hiện tại Buyer Flash Sale đang truy vấn tạm qua catalog chuẩn `GET /products?sort=newest&size=8`. | Chuyển hướng endpoint sang Promotion Service khi Backend bàn giao API Flash Sale có đồng hồ đếm ngược và slot giới hạn. |
| **FUT-03** | **Cập nhật giá hàng loạt cho nhiều SKU (Bulk SKU Price Update)** | Backend Product Catalog Service | Backend hiện tại mới hỗ trợ cập nhật SKU theo từng SPU (`PUT /seller/products/{id}/skus`). | Backend bổ sung API `PATCH /seller/products/skus/bulk-price` cho phép người bán cập nhật giá 500 biến thể cùng lúc trong các đợt Siêu Sale. |
| **FUT-04** | **Tự động đóng dấu Watermark & Tối ưu WebP cho hình ảnh** | Media Storage & DevOps | Quy trình hiện tại tải ảnh nguyên bản của người bán lên S3. | Triển khai AWS Lambda @ Edge hoặc Cloudflare Image Resizing tự động nén WebP và gắn logo Taca bảo vệ bản quyền ảnh. |
| **FUT-05** | **Ảo hóa danh sách biến thể SKU (Virtual Scrolling)** | Seller ProductEditorModal | Hiện tại các sản phẩm thông thường có dưới 20 biến thể hoạt động rất mượt mà. | Áp dụng `@tanstack/react-virtual` nếu trong tương lai có các gian hàng thời trang quy mô lớn với trên 100 biến thể / sản phẩm. |

---

### 3. ĐÁNH GIÁ MỨC ĐỘ HOÀN THIỆN TOÀN CỤC (FINAL VERDICT)

> **KẾT LUẬN**: Hệ thống Frontend Monorepo (`@taca/buyer`, `@taca/seller`, `@taca/admin`, `@taca/shell`) và Backend Microservices (`Product-Catalog-Service`) đã đạt trạng thái **HOÀN TOÀN TƯƠNG THÍCH (100% ALIGNED)**.
> 
> Đủ điều kiện kỹ thuật để tiến hành đóng gói phát hành môi trường Staging và triển khai UAT chính thức.

