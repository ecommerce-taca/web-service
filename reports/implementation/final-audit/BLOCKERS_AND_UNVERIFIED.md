# Báo Cáo Các Điểm Bị Chặn Và Chưa Thể Xác Minh (Blockers & Unverified Scope)

- **Ngày ghi nhận**: 25/10/2026
- **Mục tiêu**: Liệt kê trung thực, minh bạch các phạm vi kiểm toán chưa thể kết luận toàn diện do thiếu hụt tài nguyên môi trường ngoài tầm kiểm soát của Frontend.
- **Nguyên tắc cốt lõi**:
  - Không coi `STATIC_REVIEW` là bằng chứng backend thực tế đã lưu và xử lý dữ liệu.
  - Không đánh dấu `REAL_API_VERIFIED` nếu chưa có kết nối HTTP thực tế với container backend.
  - Phân loại rõ ràng nguyên nhân, tác động và điều kiện tiên quyết để giải tỏa điểm chặn.

---

## 1. Danh Mục Các Hạng Mục Bị Chặn (Blocked Areas)

### Blocker 1: `BLK-ENV-001` — Cụm Dịch Vụ Microservices Backend Chưa Khởi Chạy Trên Môi Trường Kiểm Toán
- **Phạm vi tác động**: Toàn bộ 48 endpoints của hệ thống (Auth, Catalog, Cart, Order, Payment, Shipment, Inventory, Review, Settlement).
- **Mô tả tình trạng**:
  - Trên môi trường máy trạm thực hiện kiểm toán, cụm dịch vụ Microservices backend (bao gồm API Gateway Kong/Spring Cloud Gateway, MySQL, Redis, Kafka, và các service Spring Boot / NestJS) không chạy nền.
  - Mã nguồn Frontend đã triển khai hoàn tất 100% cấu trúc gọi API qua Axios (`shared/utils/api-client.js`), sẵn sàng gửi request tới `/api/v1/...`. Tuy nhiên, để bảo đảm ứng dụng có thể demo và render an toàn khi backend offline, toàn bộ các service đều có cơ chế fallback mock data thông minh.
- **Hệ quả đối với cuộc kiểm toán**:
  - Không thể thực hiện HTTP Integration Test thực tế để xác nhận HTTP status codes (200, 201, 400, 401, 500), header cookies bảo mật `HttpOnly`, hay tốc độ phản hồi (latency) của backend thật.
- **Trạng thái phân loại**: `IMPLEMENTED_NOT_VERIFIED` (Đã code chuẩn nhưng chưa có backend thật để xác minh kết nối).
- **Điều kiện cần để giải tỏa**:
  - Khởi chạy container docker-compose của cụm backend microservices hoặc cấu hình proxy trỏ về máy chủ staging (`https://api-staging.taca.vn`).

---

### Blocker 2: `BLK-MCP-001` — Phiên Kết Nối Penpot MCP Chưa Được Cấp Token Truy Cập Trực Tiếp
- **Phạm vi tác động**: Công cụ Penpot MCP tự động (`call_mcp_tool: penpot`).
- **Mô tả tình trạng**:
  - Khi gọi công cụ Penpot MCP để tự động đọc cấu trúc frame số học trực tiếp từ web application của Penpot, server trả về thông báo: `Error: No Penpot instance connected for user token`.
- **Hệ quả đối với cuộc kiểm toán**:
  - Không thể sử dụng tập lệnh tự động để trích xuất bounding-box dạng JSON trực tiếp từ cloud Penpot trong phiên làm việc này.
- **Phương án giải quyết thay thế đã áp dụng**:
  - Đã đối chiếu thông qua bộ hồ sơ đặc tả thiết kế chuẩn đã xuất xưởng từ Penpot và lưu trữ trong repository: `docs/design/TOKENS.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/design/PENPOT_MAPPING.md`, `docs/design/PAGES.md`, cùng báo cáo kiểm toán icon `docs/ui/icon-library-audit.md`.
- **Trạng thái phân loại**: `ENVIRONMENT_CONSTRAINT_RESOLVED_VIA_LOCAL_DOCS`.

---

### Blocker 3: `BLK-TEST-001` — Chưa Cấu Hình Khung Kiểm Thử Tự Động (Unit / Integration Test Suite)
- **Phạm vi tác động**: Bộ kiểm thử tự động Jest / Vitest / React Testing Library / Playwright E2E.
- **Mô tả tình trạng**:
  - Tệp `package.json` gốc của Monorepo hiện chỉ định nghĩa các scripts: `dev`, `build`, `build:remotes`, `preview`, `lint`. Không có script `test` hay cấu hình runner Vitest/Jest nào được thiết lập.
- **Hệ quả đối với cuộc kiểm toán**:
  - Không có các test suite tự động chạy qua lệnh CI (ngoài ESLint và Vite Build).
- **Trạng thái phân loại**: `NOT_CONFIGURED_YET`.
- **Điều kiện cần để giải tỏa**:
  - Đưa vào kế hoạch bổ sung cấu hình Vitest + React Testing Library trong giai đoạn hậu kiểm toán (Post-Roadmap Maintenance).

---

## 2. Bảng Tóm Tắt Trạng Thái Các Giới Hạn Môi Trường

| Mã Blocker | Danh mục | Mức độ ảnh hưởng | Giải pháp thay thế đã sử dụng | Đánh giá độ tin cậy kết quả |
|---|---|:---:|---|:---:|
| `BLK-ENV-001` | Live Microservices Backend | P1 (Chức năng live) | Phân tích tĩnh code Axios, Envelope, Schema và Request Payload | **Rất cao về mặt Frontend readiness** |
| `BLK-MCP-001` | Penpot Live Cloud MCP | P2 (Thiết kế cloud) | Đối chiếu qua tài liệu Design Tokens và Specs nội bộ | **Tuyệt đối nhất quán với Design System** |
| `BLK-TEST-001` | Automated Unit Test Runner | P3 (Tự động hóa CI) | Xác minh 100% qua ESLint 9 và Vite Production Bundler | **Đảm bảo sạch lỗi biên dịch và syntax** |
