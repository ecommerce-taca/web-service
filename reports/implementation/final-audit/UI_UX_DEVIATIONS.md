# Báo Cáo Sai Lệch Thiết Kế UI/UX (UI/UX Deviations Report)

- **Ngày ghi nhận**: 25/10/2026
- **Mục tiêu**: Liệt kê chi tiết mọi điểm sai lệch nhỏ, trường hợp biên về layout hoặc responsive so với thiết kế lý tưởng, đồng thời đưa ra hướng dẫn khắc phục cụ thể.
- **Tổng số sai lệch ghi nhận**: 2 sai lệch nhỏ (P3), 0 sai lệch nghiêm trọng (P0/P1 = 0).

---

## Danh Sách Các Sai Lệch Ghi Nhận

### Sai Lệch 1: `AUDIT-UI-001` — Khoảng Cách Lề Đệm Drawer Bộ Lọc Tìm Kiếm Trên Màn Hình Điện Thoại Hẹp (< 375px)
- **ID phát hiện**: `AUDIT-UI-001`
- **Application & Route**: Buyer Application (`apps/buyer`), Route `/search`.
- **Component nguồn**: [SearchPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/search/pages/SearchPage.jsx) và Filter Drawer di động.
- **Frame Penpot**: `Buyer / Mobile / Search Filter Drawer (375 × 812)`
- **Loại sai lệch**: `MINOR_DEVIATION` (Responsive Spacing).
- **Mức độ ưu tiên**: `P3 — LOW` (Không ảnh hưởng đến chức năng lọc sản phẩm).
- **Viewport xảy ra**: Màn hình siêu nhỏ có độ rộng dưới 375px (ví dụ iPhone SE 320px).
- **Mô tả trạng thái mong đợi theo Penpot**:
  - Filter Drawer có khoảng lề ngang `px-4` (16px), các ô checkbox khoảng giá và nút "Áp dụng" cách đáy màn hình an toàn `pb-6` (24px) có tính đến SafeArea của iOS.
- **Mô tả trạng thái thực tế trong mã nguồn**:
  - Drawer hiện đang sử dụng `px-3 pb-4`. Trên các màn hình cực hẹp (< 375px), khoảng cách giữa checkbox và chữ nhãn hơi khít (~6px thay vì 8px).
- **Nguyên nhân xác minh**:
  - Do lớp bọc CSS của Drawer ưu tiên hiển thị tối đa nội dung trên màn hình nhỏ nên đã giảm nhẹ padding từ 16px xuống 12px.
- **Hướng khắc phục đề xuất**:
  - Tinh chỉnh class từ `px-3 pb-4` thành `px-4 pb-6 sm:px-6` để đồng nhất với layout Penpot.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Khi mở Drawer ở kích thước 320px - 375px, khoảng cách đệm 2 bên đạt chuẩn 16px, không gây tràn ngang.

---

### Sai Lệch 2: `AUDIT-UI-002` — Chiều Cao Cố Định Của Bảng Ma Trận SKU Trong Modal Tạo Sản Phẩm Người Bán
- **ID phát hiện**: `AUDIT-UI-002`
- **Application & Route**: Seller Application (`apps/seller`), Route `/seller/products`.
- **Component nguồn**: [SkuMatrixStep.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/editor/steps/SkuMatrixStep.jsx) bên trong [ProductEditorModal.jsx](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/ProductEditorModal.jsx).
- **Frame Penpot**: `Seller / Products / Product Editor Modal (960 × 640)`
- **Loại sai lệch**: `MINOR_DEVIATION` (Modal Internal Scroll Container).
- **Mức độ ưu tiên**: `P3 — LOW`.
- **Viewport xảy ra**: Desktop độ phân giải thấp (1024 × 768 hoặc màn hình laptop 13 inch mở kèm DevTools).
- **Mô tả trạng thái mong đợi theo Penpot**:
  - Bảng danh sách tổ hợp SKU có chiều cao linh hoạt, chiếm tối đa 40vh và cuộn độc lập bên trong bước 3 của Modal.
- **Mô tả trạng thái thực tế trong mã nguồn**:
  - Khối chứa bảng SKU hiện dùng `max-h-[380px] overflow-y-auto`. Khi người bán tạo ma trận có hơn 12 biến thể (ví dụ: 3 kích thước × 4 màu), thanh cuộn xuất hiện trong khung 380px.
- **Nguyên nhân xác minh**:
  - Sử dụng chiều cao pixel tĩnh `max-h-[380px]` thay vì lớp tính toán phần trăm theo viewport (`max-h-[45vh]`).
- **Hướng khắc phục đề xuất**:
  - Thay đổi sang `max-h-[45vh] overflow-y-auto` để tự động giãn nở tối ưu theo chiều cao màn hình của người bán.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Trên màn hình 768px chiều cao, modal không bị đẩy ra ngoài cạnh trên/dưới trình duyệt, các nút "Lưu" và "Tiếp theo" luôn hiển thị cố định ở chân modal.

---

## 3. Tổng Kết Đánh Giá Sai Lệch UI/UX

- Cả 2 sai lệch trên đều thuộc cấp độ **P3 — LOW**, hoàn toàn không làm gián đoạn bất kỳ trải nghiệm mua sắm hay thao tác quản trị nào của người dùng.
- Không có bất kỳ lỗi **BROKEN_LAYOUT** (vỡ khung, tràn ngang ngoài ý muốn, hay đè chữ) nào trên toàn bộ 22 màn hình đã kiểm toán.
