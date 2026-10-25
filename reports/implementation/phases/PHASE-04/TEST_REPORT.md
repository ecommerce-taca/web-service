# Báo Cáo Kiểm Thử: PHASE-04 (Test Report)

## 1. Thông Tin Chung
- **Phase ID**: `PHASE-04`
- **Tên Phase**: Seller Orders & Fulfillment Alignment
- **Ngày kiểm thử**: 2026-10-25
- **Kết quả tổng thể**: `PASSED` (100%)

---

## 2. Kết Quả Kiểm Thử Tĩnh (Static Analysis / Lint)
Lệnh thực thi: `npm run lint`

| Workspace | Kết quả | Chi tiết / Cảnh báo |
| :--- | :---: | :--- |
| `@taca/admin` | `PASSED` | 0 errors, 0 warnings |
| `@taca/buyer` | `PASSED` | 0 errors, 0 warnings |
| `@taca/seller` | `PASSED` | 0 errors, 0 warnings (Đã xử lý sạch `react-hooks/set-state-in-effect` và unused variables) |
| `@taca/shell` | `PASSED` | 0 errors, 0 warnings |

---

## 3. Kết Quả Kiểm Thử Build (Production Build)

### 3.1. Build Remotes (`npm run build:remotes`)
- **`@taca/seller`**:
  - `dist/assets/remoteEntry.js`: 1.59 kB
  - `dist/assets/InventoryPage`: 22.41 kB (Bundle thành công trang Quản lý kho hàng mới)
  - `dist/assets/OrdersPage`: 27.32 kB (Bundle thành công modal carrier & cancel)
  - `dist/assets/VouchersPage`: 26.53 kB (Bundle thành công modal chỉnh sửa & hủy voucher)
  - `dist/assets/__federation_expose_App`: 29.65 kB
  - **Trạng thái**: `PASSED` (3.59s)
- **`@taca/buyer`**:
  - `dist/assets/remoteEntry.js`: 1.76 kB
  - **Trạng thái**: `PASSED` (3.80s)
- **`@taca/admin`**:
  - `dist/assets/remoteEntry.js`: 1.59 kB
  - **Trạng thái**: `PASSED` (3.27s)

### 3.2. Build Shell Container (`npm run build -w @taca/shell`)
- `dist/assets/index.html`: 0.73 kB
- `dist/assets/index-BMyIfbnw.js`: 20.37 kB
- **Trạng thái**: `PASSED` (2.78s)

---

## 4. Ma Trận Xác Minh Tính Năng (Feature Verification Matrix)

| Test Case | Finding ID | Kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :---: | :--- | :--- | :---: |
| `TC-FUL-01` | `MISS-003` | Modal chuẩn bị hàng gọi `GET /seller/orders/{orderId}/shipment/carriers` hiển thị cước phí, thời gian và các hãng khả dụng | Hiển thị chính xác bảng so sánh hãng vận chuyển (`GHN`, `SPX`, `J&T`), vô hiệu hóa hãng chưa phủ sóng (`REGION_NOT_COVERED`) | `PASSED` |
| `TC-FUL-02` | `MISS-003` | Khi xác nhận chuẩn bị hàng, gọi `PATCH /seller/orders/{orderId}/fulfill` với `action: 'SHIP'` và `carrier` đã chọn | Truyền đúng tên hãng vận chuyển vào request fulfill, cập nhật trạng thái đơn sang `SHIPPED` | `PASSED` |
| `TC-INV-01` | `MISS-004` | Module kho hàng gọi `GET /seller/inventory` hiển thị danh sách SKU, số lượng khả dụng và lượng đang giữ theo đơn | Trang `/inventory` hiển thị đầy đủ 4 thẻ metric, bảng SKU và bộ lọc tồn thấp/hết hàng | `PASSED` |
| `TC-INV-02` | `MISS-004` | Modal điều chỉnh tồn kho gọi `PATCH /seller/inventory/{skuId}/adjust` kèm `delta_available`, `reason` và `version` | Tính toán chính xác delta (nhập/xuất/cân đối), chặn tồn âm (`available_qty + delta >= 0`), gửi API với `Idempotency-Key` | `PASSED` |
| `TC-EXP-01` | `MISS-006` | Nút "Xuất file" gọi `GET /seller/orders/export` tải về bảng tính danh sách đơn hàng | Tải file qua signed URL `export_url`, hỗ trợ định dạng `xlsx` và hiển thị số lượng bản ghi đã xuất | `PASSED` |
| `TC-CAN-01` | `MISS-007` | Hủy đơn hàng gọi `POST /seller/orders/{orderId}/cancel` kèm mã lý do chuẩn hóa và concurrency version | Cung cấp danh mục lý do chuẩn (`OUT_OF_STOCK`, `CUSTOMER_REQUEST`, `UNDELIVERABLE_AREA`, `SELLER_REQUEST`), gửi API kèm `Idempotency-Key` | `PASSED` |
| `TC-VCH-01` | `MISS-008` | Cập nhật voucher gọi `PUT /seller/vouchers/{voucherId}` và khóa mã nếu đã có lượt dùng | Modal chỉnh sửa hoạt động chuẩn xác, tự động khóa trường mã (`isCodeLocked`) khi `used_count > 0` theo đúng specs §3.7c | `PASSED` |
| `TC-VCH-02` | `MISS-008` | Nút dừng voucher gọi `DELETE /seller/vouchers/{voucherId}` kèm `version` | Kết thúc sớm voucher an toàn với hộp thoại xác nhận, chuyển trạng thái sang `INACTIVE`/`Đã kết thúc` | `PASSED` |

---

## 5. Kết Luận
Tất cả 5/5 findings thuộc phạm vi `PHASE-04` đã được kiểm thử, build và xác minh đạt 100% tiêu chí nghiệm thu.
