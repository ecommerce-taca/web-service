# Shared UI Components — Engineering Rules

## 1. VAI TRÒ & PHẠM VI

`shared/ui-components` là **Design System UI Primitives Package** dùng chung cho cả 4 micro-applications (`shell`, `buyer`, `seller`, `admin`).

- **Package name**: `@taca/ui-components`
- **Các thành phần hiện tại**:
  - `Button` (`src/components/Button.jsx`)
  - `Input` (`src/components/Input.jsx`)
  - `Modal` (`src/components/Modal.jsx`)
  - `Badge` (`src/components/Badge.jsx`)
  - `ErrorBoundary` (`src/components/ErrorBoundary.jsx`)
- **Điểm xuất khẩu duy nhất**: `src/index.js`

---

## 2. NGUYÊN TẮC CỐT LÕI

1. **Zero Business Logic (Hoàn toàn không chứa logic nghiệp vụ)**:
   - Các components trong package này phải là Presentational Primitives thuần túy.
   - Tuyệt đối KHÔNG import các API service, API client, giỏ hàng, thông tin user hay bất kỳ logic domain nào từ các apps.

2. **Xác thực Props Bắt buộc (Runtime Prop Validation)**:
   - Vì dự án sử dụng JavaScript thay vì TypeScript, MỌI component trong package này bắt buộc phải định nghĩa đầy đủ `propTypes` và `defaultProps` (hoặc default arguments).
   - Kiểm tra chặt chẽ kiểu dữ liệu của props (`PropTypes.string`, `PropTypes.func`, `PropTypes.node`, `PropTypes.oneOf`, ...).

3. **Thiết kế Theo Hệ thống Tokens (Tailwind Preset)**:
   - Tận dụng cấu hình màu sắc, khoảng cách, font chữ từ `tailwind-preset.js`.
   - Cung cấp các `variants` rõ ràng (ví dụ: `primary`, `secondary`, `outline`, `ghost`, `danger` cho Button) thay vì để các app tự viết inline class tùy tiện.

4. **Trợ năng (Accessibility - A11y)**:
   - Luôn sử dụng thẻ semantic HTML native (`<button>`, `<input>`, `<dialog>`/`<aside>`).
   - Hỗ trợ đầy đủ trạng thái `focus-visible`, `disabled`, `aria-label`, phím `Escape` để đóng modal và quản lý focus trap khi modal mở.

---

## 3. QUY TRÌNH THÊM HOẶC SỬA COMPONENT

1. Kiểm tra xem component có thực sự tái sử dụng ở ít nhất 2 micro-apps trở lên hay không. Nếu chỉ dùng ở 1 app, đặt tại `apps/<app>/src/components/`.
2. Định nghĩa component với PropTypes đầy đủ.
3. Export qua `src/index.js`.
4. Chạy kiểm tra lint và build:
   ```bash
   npm run lint
   npm run build:remotes
   npm run build -w @taca/shell
   ```
