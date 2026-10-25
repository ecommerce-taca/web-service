# Kế Hoạch Triển Khai PHASE-06: Search Enhancement, Response Cleanup & E2E Verification

- **Giai đoạn**: PHASE-06 (Phase Hoàn Thiện & Nghiệm Thu Toàn Sàn)
- **Mục tiêu**:
  1. Tích hợp tính năng gợi ý từ khóa tức thì (Search Auto-Suggest / Autocomplete) `GET /search/suggest?q=...` trên Header người mua (`MISS-001`).
  2. Chuẩn hóa unwrapping response `res.data` duy nhất một tầng, giải quyết dứt điểm tình trạng `res.data.data.data` không đồng nhất (`API-009`).
  3. Kiểm thử hồi quy toàn diện (E2E Regression), chạy lint 100%, build remotes & host shell 100%, chuẩn bị nghiệm thu toàn bộ Roadmap.
- **Phạm vi ứng dụng**: `apps/buyer`, `apps/seller`, `apps/admin`, `shared/utils/api-client.js`.
- **Hợp đồng & Specs đối chiếu**:
  - `docs/api/services/search.md` §1.1 (`GET /search/suggest?q=...`)
  - `docs/lld/order-commerce.md`, `payment-wallet.md`, `auth-user.md` (REST Response Envelopes `{ data, meta }`)
- **Tài liệu Findings đối chiếu**: `FINDINGS_TRACKER.md` (2 Findings cuối cùng: `MISS-001`, `API-009`)

---

## 1. Danh Sách Tasks Chi Tiết

### Task 1: Chuẩn Hóa Response Unwrapping Duy Nhất 1 Tầng (`API-009`)
- **Vấn đề**:
  - `apiClient.interceptors.response` unwrap `response.data` của axios (trả về `{ data, meta }` của backend).
  - Một số service layers như `seller-finance.api.js`, `order.api.js`, `shipment.api.js` lại wrap thêm `{ data: { data } }`, khiến component phải truy cập `res.data.data.data`.
- **Giải pháp**:
  - Bổ sung helper `unwrapApiResponse(response)` và `createResponseEnvelope(payload, meta)` trong `shared/utils/api-client.js`.
  - Cập nhật các service layers (`seller-finance.api.js`, `order.api.js`, `shipment.api.js`) trả về chuẩn envelope `{ data, meta }` thống nhất, tương thích ngược an toàn 100%.
  - Chuẩn hóa các điểm gọi tại component (`FinancePage.jsx`, `OrderDetailPage.jsx`) đọc dữ liệu trực tiếp và an toàn.

### Task 2: Xây Dựng Service Gợi Ý Tìm Kiếm `GET /search/suggest` (`MISS-001`)
- **Vấn đề**: Thanh tìm kiếm Storefront chưa có tính năng gợi ý từ khóa và sản phẩm tức thì khi người dùng gõ từ khóa.
- **Giải pháp**:
  - Xây dựng `apps/buyer/src/features/search/services/search.api.js` với method:
    - `getSearchSuggestions(q, options)`: gọi `GET /search/suggest?q=...` theo specs `search.md` §1.1.
    - Hỗ trợ live API và mock fallback thông minh: trả về 3 cấu trúc `{ keywords, categories, topProducts }`.

### Task 3: Xây Dựng Giao Diện Dropdown Gợi Ý Tìm Kiếm (Storefront Autocomplete)
- **Vấn đề**: Cần popup gợi ý hiển thị tức thì với UX mượt mà, phản hồi nhanh, không lag giật.
- **Giải pháp**:
  - Xây dựng component `SearchSuggestDropdown.jsx` hiển thị 3 phần rõ ràng:
    1. Danh sách từ khóa tìm kiếm phổ biến (Keywords).
    2. Danh mục ngành hàng liên quan (Categories).
    3. Top sản phẩm nổi bật khớp từ khóa kèm hình ảnh thumbnail và giá bán (Top Products).
  - Tích hợp hook debounce (250ms) vào `Header.jsx` và `WhiteHeader.jsx`.
  - Hỗ trợ đóng mở tự động khi click ra ngoài hoặc bấm phím `Escape`.

### Task 4: Kiểm Thử Toàn Diện & Nghiệm Thu Tổng Thể Roadmap
- **Tiêu chí**:
  - `npm run lint` đạt mã 0 (0 errors, 0 warnings).
  - `npm run build:remotes` đạt mã 0.
  - `npm run build -w @taca/shell` đạt mã 0.
  - Cập nhật toàn bộ hệ thống báo cáo: `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, `REMAINING_WORK.md`, `ROADMAP_STATUS.md` (chuyển sang hoàn tất 100%), `FINDINGS_TRACKER.md` (26/26 resolved), `MASTER_PROGRESS.md`, `CHANGELOG.md`.
