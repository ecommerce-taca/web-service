# BÁO CÁO THI CÔNG TRIỂN KHAI THEO GIAI ĐOẠN
## PHASE 03: TÍCH HỢP & HOÀN THIỆN GIAO DIỆN NGƯỜI DÙNG (UI INTEGRATION)

---

### 1. MỤC TIÊU CỦA PHASE 03
1. Tích hợp trực tiếp các API Backend còn thiếu vào giao diện người dùng.
2. Hoàn thiện tính năng **Tải file báo cáo lỗi Excel** cho Seller khi nhập hàng loạt (`GET /seller/products/import/jobs/{jobId}/result`).
3. Bổ sung nút lọc sản phẩm có rủi ro cao (`flagged_only`) trên giao diện Admin Catalog.
4. Xây dựng bộ điều khiển chuyển đổi phạm vi kiểm toán (Scope Switcher) trên `AdminAuditLogsPage.jsx` kết nối trực tiếp với API `GET /admin/catalog/audits`.
5. Đảm bảo 100% icon sử dụng `lucide-react`, không làm thay đổi hay phá vỡ layout thiết kế hiện có.

---

### 2. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN

#### 2.1. Nâng cấp Modal Nhập sản phẩm hàng loạt (`ProductImportModal.jsx`)
- **File**: [`apps/seller/src/features/products/components/ProductImportModal.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/components/ProductImportModal.jsx)
- **Hàm nâng cấp**: `handleDownloadResultReport()`
- **Cơ chế hoạt động**:
  - Gọi `sellerProductApi.getImportJobResultUrl(jobStatus.job_id)`.
  - Nếu BE trả về link URL trực tiếp (`result_file_url`): Tự động mở cửa sổ mới để tải về.
  - Nếu BE trả về binary stream / blob file Excel: Tự động khởi tạo `window.URL.createObjectURL(blob)`, tạo thẻ `<a>` ảo và tải file `import_errors_{jobId}.xlsx` về máy người bán.

#### 2.2. Nâng cấp API Tải file lỗi (`seller-product.api.js`)
- **File**: [`apps/seller/src/features/products/services/seller-product.api.js`](file:///d:/di_hoc/taca_ecommerce/apps/seller/src/features/products/services/seller-product.api.js)
- **Hàm nâng cấp**: `getImportJobResultUrl(jobId)`
- **Cấu hình bổ sung**: Đính kèm `{ responseType: 'blob', headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json' } }`.

#### 2.3. Bổ sung Bộ lọc cảnh báo rủi ro cao (`AdminProductsPage.jsx`)
- **File**: [`apps/admin/src/features/products/pages/AdminProductsPage.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/products/pages/AdminProductsPage.jsx)
- **Cơ chế hoạt động**:
  - Thêm state `flaggedOnly` (mặc định `false`).
  - Gửi param `flagged_only: flaggedOnly ? true : undefined` vào `adminCatalogApi.getAdminProducts`.
  - Bổ sung nút toggle "Chỉ xem cảnh báo" với icon `ShieldAlert`, có trạng thái active viền đỏ (`bg-rose-50 text-rose-700 ring-2 ring-rose-200`) giúp Admin phát hiện ngay các sản phẩm bị hệ thống cảnh báo vi phạm.

#### 2.4. Kết nối Nhật ký Kiểm toán Catalog (`AdminAuditLogsPage.jsx`)
- **File**: [`apps/admin/src/features/audit/pages/AdminAuditLogsPage.jsx`](file:///d:/di_hoc/taca_ecommerce/apps/admin/src/features/audit/pages/AdminAuditLogsPage.jsx)
- **Cơ chế hoạt động**:
  - Thêm Tab chuyển đổi phạm vi (Scope Switcher):
    1. **Danh mục & Sản phẩm**: Kết nối tới API `GET /admin/catalog/audits` thông qua `adminCatalogApi.getCatalogAudits()`.
    2. **Hệ thống & KYC**: Kết nối tới API `GET /admin/audit-logs` thông qua `adminKycApi.getAuditLogs()`.
  - Bộ lọc đối tượng động (`ALL`, `PRODUCT`, `CATEGORY`, `SKU`).
  - Ánh xạ chi tiết bản ghi kiểm toán (`actor_name`, `action`, `diff`, `created_at`) hiển thị trực quan trên bảng.

---

### 3. KẾT QUẢ ĐỐI SOÁT GIAO DIỆN
- Không phá vỡ bất kỳ quy chuẩn styling nào của Tailwind CSS v3.
- Bảo tồn 100% trải nghiệm người dùng hiện tại, chỉ bổ sung các nút bấm nghiệp vụ có API Backend bảo trợ.
- 100% icon vector chính hãng từ thư viện `lucide-react`.

---

### 4. TRẠNG THÁI PHASE 03
**STATUS: COMPLETED (100%)**

