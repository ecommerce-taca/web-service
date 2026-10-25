# Ma Trận Theo Dõi Lộ Trình Triển Khai (Roadmap Status)

*Cập nhật lần cuối: 2026-10-25 15:45:00 (ICT)*  
*Chuẩn tuân thủ: Master Prompt & Kiến trúc Micro-Frontend Taca Ecommerce*

---

## 1. Bảng Trạng Thái Chi Tiết Toàn Bộ Roadmap

| Phase ID | Tên Phase & Mục tiêu chính | Trạng thái | Tasks Đã làm | Tasks Còn lại | Blockers | Điều kiện Nghiệm thu | Báo cáo chi tiết |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **PHASE-00** | **Audit Baseline & Thiết lập Báo cáo**: Đối chiếu toàn bộ FE code với GitHub docs, phân loại 26 findings và xây dựng chuẩn báo cáo. | `COMPLETE_VERIFIED` | 5/5 | 0 | Không có | 100% tài liệu được đối chiếu, 26 findings được đánh chỉ mục, cấu trúc báo cáo chuẩn hóa. | [Xem Báo Cáo](./phases/PHASE-00/IMPLEMENTATION_REPORT.md) |
| **PHASE-01** | **Security & Auth Hardening**: Triển khai `X-MFA-Step-Up` header, chốt chặn RBAC cho Admin, chống race condition refresh token. | `COMPLETE_VERIFIED` | 3/3 | 0 | Không có | Modal MFA đính kèm header trên mọi API nhạy cảm, Route guard chặn truy cập trái phép bằng JWT, Token refresh an toàn. Lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-01/IMPLEMENTATION_REPORT.md) |
| **PHASE-02** | **Core Checkout & Payment API Alignment**: Chuyển luồng thanh toán sang API gateway chuẩn từ `POST /checkout`, 3 slots voucher, loại bỏ mock. | `COMPLETE_VERIFIED` | 4/4 | 0 | Không có | Loại bỏ gọi thẳng `POST /payments`, gửi mảng voucher `voucher_codes: string[]`, `isMockMode()` mặc định `false`, mô phỏng thanh toán được cô lập. Lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-02/IMPLEMENTATION_REPORT.md) |
| **PHASE-03** | **Buyer Reviews & Order Tracking Alignment**: Đưa review về đúng endpoint `POST /products/{productId}/reviews`, tích hợp tracking vận chuyển `GET /orders/{orderId}/shipment`, chuẩn hóa voucher & PDP reviews. | `COMPLETE_VERIFIED` | 7/7 | 0 | Không có | Review PDP hiển thị đúng aggregate/filters, đăng review thành công, tra cứu shipment hành trình đơn hàng chính xác, xóa phantom endpoints `/reviews/pending`, `/completed`, `/vouchers/save`. Lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-03/IMPLEMENTATION_REPORT.md) |
| **PHASE-04** | **Seller Inventory, Orders & Fulfillment**: Bổ sung so sánh cước vận chuyển, quản lý tồn kho SKU, xuất đơn và hủy đơn. | `COMPLETE_VERIFIED` | 5/5 | 0 | Không có | Seller so sánh và chọn carrier qua API, quản lý tồn kho SKU chuyên biệt `/inventory`, xuất file đơn hàng Excel/CSV, hủy đơn chuẩn lý do, sửa/dừng voucher. Lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-04/IMPLEMENTATION_REPORT.md) |
| **PHASE-05** | **Admin Governance, KYC & Finance Reconciliation**: Xóa API ma, bổ sung quyết toán người bán theo lô, báo cáo tài chính tổng hợp và quản trị voucher toàn sàn. | `COMPLETE_VERIFIED` | 5/5 | 0 | Không có | Giao diện KYC và đối soát sạch API ảo, module settlement hoạt động chuẩn spec, finance summary hiển thị số liệu và xuất file, platform vouchers CRUD đầy đủ. Lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-05/IMPLEMENTATION_REPORT.md) |
| **PHASE-06** | **Search Enhancement, Response Cleanup & E2E Verification**: Gợi ý tìm kiếm, dọn dẹp unwrapping response `res.data.data.data`, kiểm thử hồi quy toàn sàn. | `COMPLETE_VERIFIED` | 4/4 | 0 | Không có | Auto-suggest hoạt động mượt mà, zero regression lỗi contract, lint & build pass 100%. | [Xem Báo Cáo](./phases/PHASE-06/IMPLEMENTATION_REPORT.md) |

---

## 2. Tiêu chuẩn Nghiệm thu Toàn diện (Roadmap Definition of Done)

Một Phase chỉ được chuyển trạng thái sang **`COMPLETE_VERIFIED`** khi đáp ứng đầy đủ:
1. **Scope Compliance**: 100% tasks được phê duyệt trong Phase đã được lập trình chính xác.
2. **Contract Truth**: Toàn bộ request/response tuân thủ 100% tài liệu GitHub `ecommerce-taca/docs`.
3. **Automated Verification**:
   - `npm run lint` chạy sạch lỗi (exit code 0).
   - `npm run build:remotes` và build shell vượt qua không lỗi cú pháp hay thiếu import.
4. **Git Discipline**:
   - Không chứa dead code, log console nhạy cảm hoặc mock data giả tạo kết quả.
   - Không ghi đè hoặc làm ảnh hưởng các thay đổi uncommitted trước đó của người dùng.
5. **Documentation**:
   - Báo cáo chi tiết của Phase (`PLAN.md`, `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, `REMAINING_WORK.md`) được cập nhật trung thực kèm bằng chứng.
   - `MASTER_PROGRESS.md` và `FINDINGS_TRACKER.md` được đồng bộ số liệu chính xác.
