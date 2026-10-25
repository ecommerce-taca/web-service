# Hệ thống Báo cáo Tiến độ Triển khai Frontend — Taca Ecommerce

Thư mục này là trung tâm theo dõi, kiểm thử và nghiệm thu tiến độ chuẩn hóa API Frontend của dự án **Taca Ecommerce** theo tài liệu kỹ thuật chính thức tại:
[https://github.com/ecommerce-taca/docs](https://github.com/ecommerce-taca/docs)

Tuân thủ quy trình nghiêm ngặt: **Implement → Verify → Report → Update Progress → Stop**.

---

## 1. Cấu trúc và ý nghĩa các tệp tin

| Tệp tin / Thư mục | Mục đích & Trách nhiệm |
| :--- | :--- |
| [MASTER_PROGRESS.md](./MASTER_PROGRESS.md) | **Trang tổng quan điều hành**: Thống kê số lượng findings (Critical, High, Medium, Low), trạng thái các Phase, blocker và hành động tiếp theo. |
| [ROADMAP_STATUS.md](./ROADMAP_STATUS.md) | **Ma trận theo dõi lộ trình**: Chi tiết từng Phase từ Phase 0 đến Phase 6, mục tiêu, tiến độ task và điều kiện nghiệm thu. |
| [FINDINGS_TRACKER.md](./FINDINGS_TRACKER.md) | **Cơ sở dữ liệu Findings**: Bảng theo dõi toàn bộ 26 vấn đề độc lập từ kết quả audit (ID, mức độ, nguồn gốc, trạng thái, phase phụ trách). |
| [CHANGELOG.md](./CHANGELOG.md) | **Nhật ký thay đổi**: Ghi nhận chi tiết từng lần can thiệp mã nguồn, file thay đổi, lý do và kết quả kiểm thử. |
| `phases/` | **Thư mục báo cáo từng Phase**: Mỗi Phase có thư mục riêng chứa `PLAN.md`, `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, `REMAINING_WORK.md`. |
| `evidence/` | **Bằng chứng kiểm thử**: Lưu trữ logs kiểm thử tự động, kết quả build, lint và ảnh chụp màn hình xác minh. |

---

## 2. Quy ước Trạng thái Kỹ thuật (Status Definitions)

### A. Trạng thái Finding:
- **`CONFIRMED`**: Vấn đề đã được xác minh bằng chứng rõ ràng qua đối chiếu tài liệu và mã nguồn.
- **`LIKELY`**: Có dấu hiệu sai lệch nhưng cần kiểm thử runtime trên backend thật để xác nhận 100%.
- **`UNVERIFIED`**: Chưa đủ bằng chứng để kết luận.
- **`BLOCKED`**: Bị chặn do thiếu API backend, thiếu quyền hạn hoặc tài liệu mâu thuẫn.
- **`RESOLVED`**: Đã sửa mã nguồn, vượt qua kiểm thử và đáp ứng đầy đủ tiêu chí nghiệm thu.

### B. Trạng thái Phase:
- **`NOT_STARTED`**: Chưa bắt đầu triển khai code.
- **`IN_PROGRESS`**: Đang tiến hành thực hiện các task trong phạm vi được duyệt.
- **`PARTIAL`**: Đã hoàn thành một phần task, còn task dở dang hoặc phụ thuộc.
- **`BLOCKED`**: Bị tạm dừng do gặp rào cản kỹ thuật hoặc mâu thuẫn hợp đồng API.
- **`IMPLEMENTED_NOT_VERIFIED`**: Code đã triển khai nhưng chưa chạy được kiểm thử xác nhận.
- **`COMPLETE_VERIFIED`**: 100% task hoàn thành, 100% test đạt yêu cầu, Git diff sạch, báo cáo cập nhật đầy đủ.

---

## 3. Quy tắc Cập nhật Tiến độ
1. Không bao giờ cập nhật trạng thái `COMPLETE_VERIFIED` nếu chưa chạy lệnh kiểm thử thực tế và kiểm tra Git diff.
2. Không ghi đè hoặc xóa bỏ lịch sử báo cáo của các Phase trước đó.
3. Mọi thay đổi mã nguồn phải có tương ứng 1 bản ghi trong `CHANGELOG.md` và cập nhật `FINDINGS_TRACKER.md`.
