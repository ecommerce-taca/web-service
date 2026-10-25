# Báo Cáo Công Việc Còn Lại: PHASE-03 (Remaining Work)

## 1. Trạng Thái Hiện Tại Của Phase 3
- **Tất cả các task trong phạm vi PHASE-03**: `HOÀN THÀNH 100%` (`7/7 Findings RESOLVED`).
- Không có lỗi tồn đọng, không có blocker kỹ thuật trong phạm vi Phase 3.

---

## 2. Kế Hoạch Cho Phase Kế Tiếp: PHASE-04
- **Tên Phase**: `PHASE-04: Seller Orders & Fulfillment Alignment`
- **Các Findings Trong Phạm Vi Phase 4**:
  - `API-006` (High): Sửa action accept đơn hàng của người bán sang `PATCH /seller/orders/{orderId}/fulfill` kèm body `{ action: "ACCEPT", version }`.
  - `API-007` (High): Sửa endpoint hủy đơn của người bán sang `POST /seller/orders/{orderId}/cancel` kèm `{ reason, version }`.
  - `MISS-003` (High): Tích hợp luồng xác nhận đơn hàng loạt cho người bán qua `POST /seller/orders/bulk-accept`.
  - `MISS-004` (High): Tích hợp màn hình người bán chọn đơn vị vận chuyển (GHN, SPX, J&T) qua `GET /seller/orders/{orderId}/shipment/carriers` trước khi kích hoạt `action: "SHIP"`.
  - `MISS-011` (Medium): Bổ sung tính năng xuất danh sách đơn hàng người bán ra file Excel/CSV qua `GET /seller/orders/export`.

---

## 3. Điều Kiện Tiên Quyết Bắt Đầu Phase 4
- Người dùng phê duyệt nghiệm thu `PHASE-03`.
- Chỉ bắt đầu `PHASE-04` khi có chỉ đạo trực tiếp từ người dùng.
