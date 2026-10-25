# Danh Mục Công Việc Còn Lại: Chuyển Tiếp Sang PHASE-02 (Remaining Work)

## 1. Tóm Tắt Trạng Thái
Toàn bộ các nhiệm vụ thuộc phạm vi của `PHASE-01` (gồm 3 findings `AUTH-001`, `AUTH-002`, `AUTH-003`) đã hoàn thành và được xác minh 100%.

---

## 2. Danh Sách Nhiệm Vụ & Findings Chuyển Tiếp Cho PHASE-02

| Task / Finding ID | Mô tả tóm tắt | Nguyên nhân còn lại | Phụ thuộc (Dependency) | Mức độ ưu tiên | Hành động tiếp theo | Tiêu chí nghiệm thu tương ứng |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| `API-003` | FE Buyer gọi thẳng `POST /payments` nội bộ thay vì dùng thông tin thanh toán từ `POST /checkout` | Thuộc phạm vi `PHASE-02` | Sẵn sàng triển khai | 🟠 High | Cập nhật `CheckoutPage.jsx` tiếp nhận response `POST /checkout` và điều hướng cổng thanh toán chuẩn | Luồng checkout chuyển sang cổng thanh toán hoặc sandbox trả về từ API checkout |
| `API-004` | `POST /checkout` chỉ truyền 1 voucher thay vì mảng 3 slot `voucher_codes: string[]` | Thuộc phạm vi `PHASE-02` | Sẵn sàng triển khai | 🟠 High | Cập nhật payload `voucher_codes: string[]` và giao diện chọn tối đa 3 loại voucher | Body gửi lên `POST /checkout` chứa mảng đúng định dạng schema |
| `MOCK-001` | Biến `FALLBACK_TO_MOCK` nuốt lỗi ngầm trong các service | Thuộc phạm vi `PHASE-02` | Sẵn sàng triển khai | 🟡 Medium | Chuyển `FALLBACK_TO_MOCK` thành `false` mặc định, hiển thị Error State trung thực | Khi API lỗi, UI hiển thị đúng thông báo lỗi và nút Thử lại |
| `MOCK-002` | VNPay Simulator còn sót lại trong luồng thanh toán | Thuộc phạm vi `PHASE-02` | Sẵn sàng triển khai | 🟢 Low | Tách simulator khỏi production bundle, chỉ bật trong test route riêng | Giao diện thanh toán chính thức chỉ sử dụng redirect URL thật từ gateway |

---

## 3. Hành Động Tiếp Theo Ngay Lập Tức
Chờ lệnh phê duyệt chính thức từ người dùng để khởi động `PHASE-02`:
```text
Thực hiện PHASE-02 theo MASTER PROMPT. Phạm vi: các task đã được phê duyệt trong roadmap. Sau khi làm xong, kiểm thử, cập nhật toàn bộ báo cáo và dừng lại.
```
