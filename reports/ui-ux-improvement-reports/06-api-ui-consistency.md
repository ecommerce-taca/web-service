# BÁO CÁO RÀ SOÁT VÀ HOÀN THIỆN UI/UX FRONTEND
## PHẦN 06: TÍNH NHẤT QUÁN GIỮA GIAO DIỆN VÀ DỮ LIỆU BACKEND (06-API-UI-CONSISTENCY)

---

### 1. NGUYÊN TẮC THIẾT KẾ DỰA TRÊN CHÂN LÝ DỮ LIỆU (DATA-DRIVEN UI)

Giao diện người dùng không thể tách rời khỏi nghiệp vụ và dữ liệu thực tế của Backend. Một hệ thống UI/UX đẳng cấp phải đáp ứng 4 tiêu chuẩn dữ liệu:
1. **Không tạo chỉ số giả mạo (No Fake Metrics)**: Không tự ý hiển thị số liệu bán hàng hay đánh giá ảo nhằm lừa dối người tiêu dùng.
2. **Không có nút bấm vô nghĩa (No Phantom Actions)**: Mọi nút bấm trên giao diện đều phải có API Backend thực tế bảo trợ.
3. **Phản ánh đúng Máy trạng thái Backend (Strict State Machine)**: Không tự chế thêm các trạng thái ngoài Enum đã định nghĩa trong cơ sở dữ liệu.
4. **Bảo toàn giao ước dữ liệu (DTO Contract Fidelity)**: Form biểu mẫu chỉ thu thập và gửi đi những trường mà Backend cho phép.

---

### 2. CHI TIẾT CÁC HẠNG MỤC ĐỒNG BỘ DỮ LIỆU & UI THỰC TẾ

```
┌────────────────────────────────────────────────────────────────────────┐
│                   API & UI CONSISTENCY IMPROVEMENTS                    │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Hạng mục đồng bộ         │ Xử lý khắc phục kỹ thuật                    │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 1. Social Proof Chỉ số   │ Xóa bỏ 100% số liệu giả '1284 đánh giá'     │
│    đánh giá & đã bán     │ Đọc đúng 'rating_summary.count' & 'sold'    │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. Lý do từ chối kiểm    │ Hiển thị hộp thông điệp và tooltip chứa     │
│    duyệt sản phẩm        │ chính xác 'rejection_reason' từ Admin       │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 3. Tải file lỗi Import   │ Nút 'Tải danh sách dòng lỗi' kết nối thẳng  │
│    hàng loạt Excel       │ API 'GET /seller/products/import/jobs/...   │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 4. Lọc sản phẩm cảnh báo │ Nút toggle 'Chỉ xem cảnh báo' gửi đúng      │
│    tự động cho Admin     │ query 'flagged_only=true' lên Backend       │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 5. Xem nhật ký kiểm toán │ Tab 'Danh mục & Sản phẩm' kết nối trực tiếp │
│    Catalog sàn TMĐT      │ API 'GET /admin/catalog/audits'             │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 6. Lọc sạch form nháp    │ Loại bỏ 'min_price'/'max_price' tránh lỗi   │
│    (Sanitize Payload)    │ 400 Bad Request của NestJS ValidationPipe   │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 7. Kiểm soát đồng thời   │ Mọi form đều bảo tồn và gửi kèm số nguyên   │
│    (OCC Version Control) │ 'version' chống xung đột ghi đè dữ liệu     │
└──────────────────────────┴─────────────────────────────────────────────┘
```

---

### 3. ĐỐI SOÁT TRỰC TIẾP CÁC TRƯỜNG DỮ LIỆU CHÍNH

#### 3.1. Dữ liệu Giá và Đơn vị Tiền tệ
- **Backend Model**: `{ price_summary: { base_price: 29990000, sale_price: 27990000, currency: 'VND' } }`.
- **Hiển thị trên UI**:
  - Không tự ý chia thập phân đối với tiền Đồng Việt Nam (VND).
  - Áp dụng bộ định dạng chuẩn `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
  - Hiển thị cả Giá gốc (gạch ngang) và Giá khuyến mãi nổi bật màu đỏ Rose `#E11D48`.
  - Tự động tính toán phần trăm tiết kiệm (VD: `-7%`) hiển thị dưới dạng badge trên card sản phẩm.

#### 3.2. Thuộc tính Biến thể SKU (Variant Attributes)
- **Backend Model**: `attributes: { "color": "Titan Tự Nhiên", "storage": "256GB" }`.
- **Hiển thị trên UI**:
  - Bộ chuẩn hóa `product.adapter.js` kết hợp thuật toán tra cứu mờ (Fuzzy Normalizer) tự động khớp nối giữa label tiếng Việt ("Màu sắc", "Dung lượng") và key chuẩn hóa của hệ thống.
  - Khi khách hàng chọn một biến thể, đơn giá và số lượng khả dụng (`available_quantity` từ bảng `inventory_projections`) tự động cập nhật ngay lập tức.

#### 3.3. Tỷ lệ Thuế suất Danh mục (Tax Rate)
- **Backend Model**: `tax_rate_bps: 1000` (Basis points: 1000 = 10%).
- **Hiển thị trên UI**:
  - Tự động quy đổi ra con số phần trăm dễ hiểu: `10% VAT`.
  - Khi Admin cập nhật thuế suất trên form, hệ thống tự động nhân với 100 để trả về điểm cơ bản chuẩn cho Backend.

---

### 4. ĐÁNH GIÁ MỨC ĐỘ TRUNG THỰC VÀ BẢO MẬT GIAO DIỆN
- **Không lộ thông tin nhạy cảm**: Không hiển thị token hay mật khẩu trên console log hay DOM attributes.
- **Tính toàn vẹn giao dịch**: Giao diện không cho phép mua hàng khi tồn kho bằng 0 (`stock === 0`), tự động hiển thị nhãn "Tạm hết hàng" và vô hiệu hóa nút "Thêm vào giỏ".

