# Thư Mục Lưu Trữ Bằng Chứng Kiểm Thử (Verification Evidence)

Thư mục này dùng để lưu trữ các bằng chứng kỹ thuật khách quan phục vụ việc nghiệm thu từng Phase theo Master Prompt:
- Logs đầu ra từ lệnh kiểm tra tĩnh (`npm run lint`).
- Logs kết quả build production (`npm run build:remotes`, shell build).
- Logs kiểm thử tự động, API contract testing hoặc snapshots.
- Ảnh chụp màn hình giao diện thực tế (nếu có).

---

## Quy tắc Lưu trữ

1. Tên tệp tin phải có tiền tố là Phase ID tương ứng, ví dụ:
   - `phase-01-lint-output.log`
   - `phase-01-build-output.log`
   - `phase-02-checkout-vouchers-network.json`
2. **Tuyệt đối không lưu trữ**:
   - Access tokens, refresh tokens, mật khẩu hoặc secrets.
   - Dữ liệu định danh cá nhân thật (PII).
3. Không tạo file rỗng hoặc ngụy tạo kết quả giả.
