# Lộ Trình Sửa Lỗi Hậu Kiểm Toán (Post-Audit Remediation Roadmap)

- **Ngày ban hành**: 25/10/2026
- **Trạng thái**: Chờ phê duyệt (Pending Approval) — Tuyệt đối không tự ý sửa mã nguồn trong giai đoạn này.
- **Phân loại ưu tiên**: P0 (0 task), P1 (0 task), P2 (0 task), P3 (2 tasks).

---

## Danh Mục Công Việc Đề Xuất (Theo Mức Độ Ưu Tiên)

### Nhóm P0 — Rủi Ro Nghiêm Trọng (Critical)
*Không có task nào. Toàn bộ các rủi ro bảo mật P0 (`AUTH-001`, `AUTH-002`) đã được giải quyết hoàn toàn từ các Phase trước.*

---

### Nhóm P1 — Hợp Đồng API, Workflow & Layout Trọng Yếu (High)
*Không có task nào. Toàn bộ 7 lỗi P1 lịch sử (`API-001`, `API-003`, `API-004`, `MISS-002`, `MISS-003`, `MISS-004`, `MISS-005`) đã được xử lý triệt để.*

---

### Nhóm P2 — Chức Năng Phụ, Đồng Bộ Dữ Liệu & Sai Lệch UI/UX Đáng Kể (Medium)
*Không có task nào. Toàn bộ 13 lỗi P2 lịch sử đã được giải quyết và kiểm chứng.*

---

### Nhóm P3 — Hoàn Thiện Spacing, Typography & Tự Động Hóa Kiểm Thử (Low)

#### Task 1: `REM-P3-001` — Tinh chỉnh padding Filter Drawer trên mobile cực hẹp (<375px)
- **ID Task**: `REM-P3-001`
- **Finding liên quan**: `AUDIT-UI-001`
- **Mô tả**: Khoảng cách lề ngang trong Filter Drawer của trang tìm kiếm trên thiết bị màn hình hẹp (<375px) đang ở mức 12px (`px-3`), cần tinh chỉnh lên 16px (`px-4`) để khớp hoàn toàn với Penpot mobile frame.
- **Root cause đã xác minh**: Đặt class tĩnh `px-3` thay vì `px-4 pb-6 sm:px-6`.
- **Tệp / Component liên quan**: [SearchPage.jsx](file:///d:/di_hoc/taca_ecommerce/apps/buyer/src/features/search/pages/SearchPage.jsx).
- **Phạm vi ảnh hưởng**: Giao diện Drawer lọc sản phẩm trên Buyer app khi mở trên màn hình nhỏ.
- **Dependency**: Không có.
- **Hướng khắc phục**: Cập nhật container class của Drawer thành `px-4 pb-6`.
- **Acceptance Criteria**: Mở Drawer trên viewport 320px - 375px, lề đệm hiển thị chuẩn 16px, không tràn ngang.
- **Test cần chạy lại**: `npm run lint`, `npm run build:remotes`.
- **Rủi ro & Điều kiện**: Rủi ro cực thấp (0%). Không ảnh hưởng logic lọc dữ liệu.

#### Task 2: `REM-P3-002` — Tích hợp bộ công cụ kiểm thử tự động Vitest & React Testing Library
- **ID Task**: `REM-P3-002`
- **Finding liên quan**: `AUDIT-TEST-001`
- **Mô tả**: Hiện dự án mới chỉ có kiểm tra lint và build, chưa có test runner tự động để thực thi Unit Test và Component Test.
- **Root cause đã xác minh**: Chưa cấu hình script `test` trong `package.json` của Monorepo.
- **Tệp / Component liên quan**: `package.json` (root), `vitest.config.js`.
- **Phạm vi ảnh hưởng**: Quy trình CI/CD và kiểm thử hồi quy tự động.
- **Dependency**: Quyết định phê duyệt thư viện kiểm thử từ Tech Lead.
- **Hướng khắc phục**: Cài đặt `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, viết unit tests cho các utils nòng cốt (`api-client.js`, `formatters`).
- **Acceptance Criteria**: Chạy `npm test` thực thi các test suite với kết quả 100% pass.
- **Test cần chạy lại**: `npm test`, `npm run lint`, `npm run build:remotes`.
- **Rủi ro & Điều kiện**: Cần cài thêm dependencies vào devDependencies của monorepo.

---

## Quy Trình Thực Hiện Tiếp Theo

1. Trình nộp toàn bộ 10 hồ sơ kiểm toán và lộ trình sửa lỗi cho Product Owner / Tech Lead.
2. Chờ phê duyệt chính thức trước khi tiến hành chỉnh sửa mã nguồn.
3. Không tự ý sửa code trong giai đoạn kiểm toán này.
