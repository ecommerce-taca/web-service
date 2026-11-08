# LỘ TRÌNH HÀNH ĐỘNG TIẾP THEO & BÀN GIAO (NEXT ACTION ROADMAP)
## DỰ ÁN: PRODUCT CATALOG SERVICE & FRONTEND ECOSYSTEM (TACA ECOMMERCE)

- **Vai trò thực hiện**: Senior Technical Project Manager & Full-Stack Lead
- **Ngày lập**: 08/11/2026
- **Trạng thái**: Kế hoạch hành động chính thức (Actionable Roadmap)
- **Thời gian thực hiện**: 14 Ngày (4 Giai đoạn chuyển giao từ Audit sang Production)

---

## I. TỔNG QUAN TIẾN TRÌNH TRIỂN KHAI

Sau khi hoàn thành đợt kiểm toán toàn diện BA/QA/QC với kết quả **Chấp thuận có điều kiện (Accepted with Conditions)**, hệ thống bước vào giai đoạn hoàn thiện môi trường hạ tầng, tự động hóa kiểm thử và kiểm thử chấp nhận người dùng (UAT) trước khi chính thức phát hành trên môi trường Production.

```text
  Tuần 1: Chuẩn bị Hạ tầng & Tự động hóa Testing       Tuần 2: Tải, Bảo mật & Triển khai Production
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ Giai đoạn 1: Môi trường  │  │ Giai đoạn 2: Tự động hóa │  │ Giai đoạn 3: Hiệu năng   │  │ Giai đoạn 4: UAT &       │
│ Staging & AWS/Kafka      ├──┤ CI/CD & E2E Testing      ├──┤ & An ninh Bảo mật        ├──┤ Go-Live Production       │
│ (Ngày 1 - 3)             │  │ (Ngày 4 - 6)             │  │ (Ngày 7 - 9)             │  │ (Ngày 10 - 14)           │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

---

## II. CHI TIẾT CÁC GIAI ĐOẠN HÀNH ĐỘNG

### GIAI ĐOẠN 1: THIẾT LẬP MÔI TRƯỜNG STAGING & HẠ TẦNG ĐÁM MÂY (NGÀY 1 - 3)
- **Mục tiêu**: Xóa bỏ rào cản phụ thuộc hạ tầng đám mây để kiểm chứng 100% các ca kiểm thử còn lại (đặc biệt là `TC-16` Live S3 Upload).
- **Hành động cụ thể**:
  1. **Cấu hình LocalStack / S3 Bucket Staging**:
     - Cung cấp Bucket AWS S3 Staging: `taca-catalog-media-staging`.
     - Cấu hình biến môi trường tại Backend `.env`:
       `AWS_REGION=ap-southeast-1`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`.
     - Chạy lại kiểm thử `TC-16`: Thực hiện upload binary ảnh thật từ Seller App ➔ Đảm bảo trả về HTTP `200 OK` và hiển thị ảnh mượt mà trên CDN.
  2. **Kết nối Kafka Broker Staging**:
     - Khởi chạy cụm Kafka 3-node trên Kubernetes Staging cluster.
     - Khởi động Outbox Relay Poller của NestJS và xác nhận message `ProductApprovedEvent` được Search Service tiêu thụ (consume) thành công.
- **Tiêu chí hoàn thành (DoD Phase 1)**: Tất cả 35/35 Test Cases đạt trạng thái **PASS 100%**.

---

### GIAI ĐOẠN 2: TỰ ĐỘNG HÓA KIỂM THỬ TRONG CI/CD PIPELINE (NGÀY 4 - 6)
- **Mục tiêu**: Xây dựng hàng rào kiểm soát chất lượng tự động (Quality Gate) trên GitHub Actions, ngăn ngừa lỗi tái phát (Regression).
- **Hành động cụ thể**:
  1. **Cài đặt Automated Contract Tests (Pact / Supertest)**:
     - Tự động hóa việc kiểm tra hợp đồng cho 31 Endpoints API trong thư mục `tests/contracts/`.
     - Chặn các Pull Request nếu payload gửi thừa field hoặc thay đổi kiểu dữ liệu mà không có thỏa thuận.
  2. **Cài đặt Kịch bản Kiểm thử Đầu cuối Tự động (Playwright E2E)**:
     - Viết mã Playwright tự động hóa cho 6 kịch bản E2E trong file `ba-qa-audit/09-end-to-end-testing.md`.
     - Tự động chạy giả lập tương tác trên 3 trình duyệt: Chromium, Firefox, WebKit (Safari).
  3. **Tích hợp GitHub Actions Workflow**:
     ```yaml
     name: CI Quality Gate
     on: [push, pull_request]
     jobs:
       audit_and_test:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - run: npm run lint
           - run: npm run build:remotes
           - run: npm run build -w @taca/shell
           - run: npx playwright test
     ```
- **Tiêu chí hoàn thành (DoD Phase 2)**: CI Pipeline chạy tự động và xanh 100% trên mọi commit.

---

### GIAI ĐOẠN 3: KIỂM THỬ TẢI, HIỆU NĂNG & TĂNG CƯỜNG BẢO MẬT (NGÀY 7 - 9)
- **Mục tiêu**: Đảm bảo hệ thống chịu được lưu lượng lớn trong các đợt Siêu Sale (Mega Campaign) và an toàn trước các cuộc tấn công mạng.
- **Hành động cụ thể**:
  1. **Kiểm thử tải bằng k6 (Load Testing)**:
     - Kịch bản 1: 2.000 Concurrent Users duyệt danh mục và xem chi tiết sản phẩm (`GET /api/v1/categories/tree`, `GET /api/v1/buyer/products/:slugOrId`).
     - Yêu cầu: Thời gian phản hồi trung bình (P95) < 150ms; tỷ lệ lỗi < 0.01%.
     - Kịch bản 2: 200 Seller cùng lúc submit duyệt sản phẩm và upload file import Excel.
  2. **Chiến lược Bộ nhớ đệm (Caching with Redis)**:
     - Áp dụng Redis Caching cho API cây danh mục `categories/tree` (TTL 30 phút, vô hiệu hóa ngay khi Admin cập nhật danh mục).
     - Cache thông tin chi tiết SPU/SKU cho các sản phẩm hot.
  3. **Rà quét An ninh (Security Hardening & OWASP ZAP)**:
     - Rà quét lỗ hổng SQLi, NoSQL Injection, XSS, SSRF và Broken Access Control.
     - Cấu hình chặt chẽ Rate Limiting trên API Gateway (ví dụ: tối đa 60 requests/phút/IP đối với API công khai).
- **Tiêu chí hoàn thành (DoD Phase 3)**: Báo cáo kiểm thử tải đạt yêu cầu P95 < 150ms; không có lỗ hổng bảo mật mức High/Critical.

---

### GIAI ĐOẠN 4: KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (UAT) & PHÁT HÀNH SẢN XUẤT (NGÀY 10 - 14)
- **Mục tiêu**: Đưa hệ thống vào tay người dùng thật và triển khai chính thức (Production Go-Live).
- **Hành động cụ thể**:
  1. **Tổ chức UAT Thí điểm (Pilot Merchant UAT)**:
     - Mời 5 gian hàng đối tác chiến lược tham gia đăng tải sản phẩm thực tế (khoảng 500 SKUs).
     - Thu thập phản hồi về độ tiện dụng của bảng ma trận SKU và tốc độ tải ảnh.
  2. **Đào tạo Đội ngũ Vận hành & Kiểm duyệt (Admin Training)**:
     - Hướng dẫn nhân viên kiểm soát danh mục cách sử dụng bộ lọc `flaggedOnly`, từ chối sản phẩm kèm lý do chuẩn hóa và tra cứu Catalog Audit Logs.
  3. **Kế hoạch Triển khai Sản xuất (Production Release Plan)**:
     - Áp dụng chiến lược triển khai Blue-Green Deployment (Zero-Downtime).
     - Thiết lập Canary Release: Mở luồng truy cập cho 10% người dùng Buyer đầu tiên để theo dõi lỗi qua Sentry và Prometheus/Grafana.
     - Mở rộng 100% lưu lượng sau 24 giờ hoạt động ổn định.
- **Tiêu chí hoàn thành (DoD Phase 4)**: Phát hành thành công lên Production, 0 downtime, tỷ lệ lỗi dưới 0.05%.

---

## III. MA TRẬN PHÂN CÔNG TRÁCH NHIỆM (RACI MATRIX)

| Tác vụ chuyển giao | Senior Architect | Backend Lead | Frontend Lead | QA/QC Lead | Product Owner |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Cung cấp S3 Staging & Kafka** | **A** | **R** | C | I | I |
| **Chạy lại TC-16 Live Upload** | I | C | **R** | **A** | I |
| **Xây dựng CI/CD & Playwright E2E**| C | C | **R** | **A** | I |
| **Kiểm thử tải k6 & Tối ưu Redis** | **A** | **R** | C | C | I |
| **Tổ chức UAT với Merchant** | I | I | C | C | **A / R** |
| **Ký biên bản Go-Live Production**| **A** | C | C | **A** | **A** |

*(Chú thích: **R** - Responsible (Thực hiện), **A** - Accountable (Chịu trách nhiệm chính), **C** - Consulted (Tham vấn), **I** - Informed (Nhận thông báo))*

---

## IV. LỜI KẾT & CAM KẾT CHẤT LƯỢNG

Toàn bộ quy trình kiểm toán và lộ trình hành động được thiết lập nhằm đưa **Taca Ecommerce Product Catalog** trở thành một phân hệ tiêu chuẩn cao về mặt kiến trúc, an toàn về dữ liệu, hoàn thiện về giao diện và sẵn sàng đáp ứng quy mô mở rộng hàng triệu sản phẩm trong tương lai.

