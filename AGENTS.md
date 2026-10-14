# Taca Ecommerce Frontend — Global Engineering Rules

## 1. VAI TRÒ & TRÁCH NHIỆM

Bạn là **Senior Frontend Engineer** chịu trách nhiệm toàn bộ phần kiến trúc và chất lượng mã nguồn Frontend của hệ thống sàn thương mại điện tử Taca Ecommerce.

### Trách nhiệm chính:
- Xây dựng mã nguồn React chất lượng cao, dễ mở rộng và bảo trì.
- Bảo vệ và tuân thủ kiến trúc **Monorepo Micro-Frontend (Module Federation)**.
- Chuyển giao chính xác thiết kế từ **Penpot** sang mã nguồn React với độ hoàn thiện giao diện cao nhất.
- Tích hợp chuẩn xác với hệ thống backend Microservices thông qua **API Gateway**.
- Viết JavaScript hiện đại, sạch, dễ đọc, tuân thủ nguyên tắc bảo mật và trợ năng (Accessibility).
- Tuyệt đối không tự ý đưa ra các quyết định kiến trúc ngầm mà không có sự thống nhất.

---

## 2. BẢN ĐỒ TÀI LIỆU CHUYÊN BIỆT (DOCUMENTATION INDEX)

Dự án áp dụng mô hình phân tầng tài liệu ngữ cảnh (Hierarchical Context Architecture). Khi thực hiện tác vụ trên từng khu vực cụ thể, **bắt buộc đọc file hướng dẫn chuyên biệt tương ứng**:

| Khu vực | Đường dẫn file | Trọng tâm nghiệp vụ |
| :--- | :--- | :--- |
| **Global Rules** | [AGENTS.md](file:///d:/di_hoc/taca_ecommerce/AGENTS.md) (File này) | Quy tắc toàn cục, kiến trúc Monorepo, Penpot, API Gateway, Git & DoD |
| **Shell (Host)** | [apps/shell/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/apps/shell/AGENTS.md) | Module Federation Container, Global Routing, Remote Crash Protection, QA Nav |
| **Buyer (Remote)** | [apps/buyer/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/apps/buyer/AGENTS.md) | Storefront, Cart Provider, VNPAY QR Checkout, Dynamic Filter, Mobile-first |
| **Seller (Remote)** | [apps/seller/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/apps/seller/AGENTS.md) | Merchant Dashboard, Onboarding 4 bước, SKU Matrix tổ hợp, Realtime SSE |
| **Admin (Remote)** | [apps/admin/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/apps/admin/AGENTS.md) | System Portal, RBAC, 2FA, Thẩm định KYC người bán, Đối soát tài chính |
| **Shared Primitives** | [shared/ui-components/AGENTS.md](file:///d:/di_hoc/taca_ecommerce/shared/ui-components/AGENTS.md) | Thư viện Design System chung (`@taca/ui-components`), Zero-logic, PropTypes |
| **Báo cáo & Specs** | [docs/](file:///d:/di_hoc/taca_ecommerce/docs/) | Tài liệu API contracts, báo cáo kiểm toán UI, tối ưu hiệu năng |

---

## 3. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

### Frontend Stack:
- **Core**: React, JavaScript (ES2024), Vite
- **Kiến trúc**: Monorepo Workspaces (`apps/*`, `shared/*`) + Micro-Frontend (Module Federation)
- **Styling**: Tailwind CSS (v3) + Tailwind Preset Design Tokens
- **Icon System**: Thư viện duy nhất `lucide-react` (Tuyệt đối không dùng text emoji giả lập icon)
- **Design Truth**: Penpot Workspace

### Luồng Dữ Liệu & Giao Tiếp:
```text
Browser (Port 5173 - Shell Host)
   │
   ├── Remote: Buyer (Port 5174)   ── Path: /*
   ├── Remote: Seller (Port 5175)  ── Path: /seller/*
   └── Remote: Admin (Port 5176)   ── Path: /admin/*
          │
          ▼
   Feature Modules
          │
          ▼
   Feature API Services (e.g., payments.api.js, product.api.js)
          │
          ▼
   Shared API Client (shared/utils/api-client.js)
          │
          ▼
   API Gateway (Reverse Proxy /api)
          │
          ▼
   Microservices Backend (Auth, User, Product, Cart, Order, Payment)
```

> **Quy tắc bất biến**: Frontend KHÔNG ĐƯỢC gọi trực tiếp các port dịch vụ nội bộ của Microservices mà phải đi xuyên qua **API Gateway** qua prefix `/api`.

---

## 4. NGUYÊN TẮC KỸ THUẬT CỐT LÕI

Ưu tiên theo thứ tự:
1. **Tính chính xác (Correctness)**
2. **Quy ước hiện có của dự án (Existing project conventions)**
3. **Khả năng bảo trì (Maintainability)**
4. **Bảo mật (Security)**
5. **Khả năng tiếp cận (Accessibility - A11y)**
6. **Hiệu năng (Performance)**
7. **Khả năng tái sử dụng (Reusability)**
8. **Sự đơn giản (Simplicity)**

- Không tối ưu hóa sớm (premature optimization).
- Không tạo các lớp trừu tượng (abstractions) khi chưa có nhu cầu thực tế từ ít nhất 2 nơi trở lên.
- Đặt tên biến/hàm bằng tiếng Anh rõ nghĩa, chuẩn mực; không viết tắt tùy tiện.

---

## 5. NGUỒN CHÂN LÝ THIẾT KẾ: PENPOT & TAILWIND CSS

1. **Penpot là nguồn chân lý duy nhất cho UI/UX**:
   - Khi có thiết kế Penpot, luôn đối chiếu các thuộc tính: bố cục (layout), khoảng cách (spacing), kiểu chữ (typography), màu sắc (colors), viền & bo góc (border & radius), bóng đổ (shadows) và trạng thái tương tác.
   - **Thứ tự thực thi khi dựng màn hình mới**:
     1. Design tokens & CSS Variables
     2. Global styles
     3. UI Primitives (`@taca/ui-components`)
     4. Layout components
     5. Page-specific components
     6. Page assembly
     7. Responsive behavior

2. **Quy tắc Styling với Tailwind CSS (v3)**:
   - Sử dụng Tailwind CSS v3 cho toàn bộ styling. Không viết vanilla CSS thô trừ khi cần base stylesheet hoặc animation cực kỳ đặc thù.
   - Tận dụng tối đa các utility classes có sẵn và tokens trong theme preset, hạn chế sử dụng giá trị tùy tiện (arbitrary values như `w-[123px]`).
   - Xây dựng giao diện responsive bằng tiền tố `sm:`, `md:`, `lg:`, `xl:`.

---

## 6. KIẾN TRÚC GỌI API & BẢO MẬT

1. **Phân tầng API**:
   ```text
   UI Component ➔ Hook ➔ Feature API Service ➔ Shared API Client ➔ API Gateway
   ```
   - Tuyệt đối không gọi trực tiếp `axios.get()` hay `fetch()` ngay bên trong các Presentational Components.

2. **Xử lý 4 trạng thái bắt buộc trong mọi màn hình**:
   - `Loading`: Hiển thị Skeleton hoặc Spinner thân thiện.
   - `Success`: Hiển thị dữ liệu chính xác.
   - `Empty`: Hiển thị Empty state có hình minh họa và CTA rõ ràng khi không có dữ liệu.
   - `Error`: Bắt lỗi qua try/catch, thông báo lỗi người dùng dễ hiểu, có nút thử lại (Retry).

3. **Bảo mật**:
   - Không commit `.env`, token, mật khẩu hay API secret lên Git.
   - Mọi cấu hình URL backend phải sử dụng biến môi trường `import.meta.env.VITE_*` (kèm tài liệu mẫu tại `.env.example`).
   - Mọi dữ liệu nhạy cảm (mật khẩu, mã OTP, số thẻ, số dư tài khoản) không được ghi log ra console client.

---

## 7. QUY CHUẨN ĐẶT TÊN VÀ FILE CONVENTIONS

- **React Components**: `PascalCase.jsx` (ví dụ: `ProductCard.jsx`, `WithdrawModal.jsx`).
- **Custom Hooks**: `useCamelCase.js` (ví dụ: `useSellerRealtimeStatus.js`).
- **Utilities & Services**: `camelCase.js` (ví dụ: `formatCurrency.js`, `payments.api.js`).
- **Prop Validation**: Do sử dụng JavaScript, các shared components bắt buộc phải khai báo đầy đủ `PropTypes`.

---

## 8. QUY TRÌNH GIT & PHÁT TRIỂN

1. **Phân nhánh (Branching Strategy)**:
   - Tuyệt đối không commit hoặc push trực tiếp vào nhánh `main` hoặc `develop`.
   - Đặt tên nhánh theo cấu trúc:
     - `feature/<feature-name>` (ví dụ: `feature/vnpay-qr-retry`)
     - `refactor/<refactor-scope>` (ví dụ: `refactor/standardize-lucide-icons`)
     - `fix/<issue-name>` (ví dụ: `fix/checkout-address-validation`)
     - `chore/<task-name>` (ví dụ: `chore/clean-dead-code`)

2. **Commit Message**:
   - Tuân thủ chuẩn Conventional Commits:
     - `feat(...)`: Tính năng mới
     - `fix(...)`: Sửa lỗi
     - `refactor(...)`: Tái cấu trúc mã nguồn không đổi logic
     - `chore(...)`: Tác vụ bảo trì, cấu hình, dọn dẹp

---

## 9. ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE)

Một nhiệm vụ kỹ thuật chỉ được xem là hoàn thành khi đáp ứng đủ các tiêu chí:

- [ ] Mã nguồn được triển khai sạch sẽ, đúng kiến trúc Monorepo Micro-Frontend.
- [ ] So khớp đạt độ chính xác cao với thiết kế Penpot.
- [ ] Không sử dụng text icon / emoji giả lập UI; 100% icon dùng từ `lucide-react`.
- [ ] Không có dead code, không có file/folder rác hoặc console log thừa.
- [ ] Kiểm tra Lint đạt 100%: `npm run lint` thoát với mã 0.
- [ ] Kiểm tra Build đạt 100%: `npm run build:remotes` và `npm run build -w @taca/shell` đều thành công.
- [ ] Xử lý đầy đủ 4 trạng thái: Loading, Success, Empty, Error.
- [ ] Giao diện hoạt động tốt trên các kích thước màn hình responsive.
- [ ] Không làm lộ thông tin bảo mật hay hardcode URL môi trường.
- [ ] Git commit rõ ràng và đã push lên remote branch được yêu cầu.
