# CHƯƠNG 3: KIỂM TOÁN CƠ SỞ DỮ LIỆU VÀ TÍNH TOÀN VẸN DỮ LIỆU (DATABASE & DATA CONSISTENCY)
## SCHEMA MYSQL 8.4, FLYWAY MIGRATIONS V001–V018, SỔ CÁI KÉP VÀ TRANSACTIONAL OUTBOX

---

## 1. TỔNG QUAN HỆ THỐNG CƠ SỞ DỮ LIỆU

Hệ thống cơ sở dữ liệu của `payment-wallet-service` sử dụng **MySQL 8.4 LTS** với cơ chế quản lý di chuyển lược đồ (Schema Migration) tự động thông qua **Flyway 10**.

### Đặc tính kỹ thuật nổi bật:
- **Bộ ký tự & Sắp chiếu**: `utf8mb4_unicode_ci` hỗ trợ đầy đủ tiếng Việt và emoji.
- **Engine lưu trữ**: 100% sử dụng `InnoDB` với khóa ngoại (`FOREIGN KEY`) và mức cô lập giao dịch `READ COMMITTED`.
- **Số lượng bảng**: 14 bảng nghiệp vụ cốt lõi và bảng phụ trợ kiểm toán.
- **Quy chuẩn thời gian**: Sử dụng kiểu `DATETIME(6)` hoặc `TIMESTAMP` lưu trữ giờ UTC chuẩn hóa ISO-8601.

---

## 2. KIỂM ĐỊNH CHI TIẾT 18 FLYWAY SCRIPTS (V001 – V018)

Mã nguồn tại thư mục `src/main/resources/db/migration/` gồm 18 script được đánh số thứ tự tuần tự không gián đoạn:

| Script Flyway | Tên file migration | Đối tượng DDL khởi tạo | Mục đích & Ràng buộc toàn vẹn |
| :--- | :--- | :--- | :--- |
| **V001** | `V001__init_payment_schema.sql` | `payments`, `payment_orders` | Lưu trữ giao dịch thanh toán và đơn hàng liên kết. Cột `amount` dùng `BIGINT`. |
| **V002** | `V002__create_wallets_table.sql` | `wallets` | Ví tiền của Người bán. Lưu `available_balance`, `pending_balance`, `version` (Optimistic Locking). |
| **V003** | `V003__create_ledger_accounts_table.sql` | `ledger_accounts` | Danh mục tài khoản sổ cái kế toán (Hệ thống, Shop, Escrow). |
| **V004** | `V004__create_ledger_postings_table.sql` | `ledger_postings` | Bút toán kế toán tổng hợp, lưu trữ mã chứng từ tham chiếu (`reference_id`). |
| **V005** | `V005__create_ledger_entries_table.sql` | `ledger_entries` | Chi tiết các dòng định khoản (`DEBIT` / `CREDIT`), liên kết khóa ngoại với posting. |
| **V006** | `V006__create_fee_configs_table.sql` | `fee_configs` | Cấu hình tỷ lệ hoa hồng sàn theo phiên bản (Effective-dated `from` - `to`). |
| **V007** | `V007__create_tax_configs_table.sql` | `tax_configs` | Cấu hình thuế GTGT khấu trừ tại nguồn theo Thông tư 40/2021/TT-BTC. |
| **V008** | `V008__create_payment_allocations_table.sql` | `payment_allocations` | Bảng phân bổ tiền thu hộ: Tiền chuyển shop, phí sàn, thuế nộp nhà nước. |
| **V009** | `V009__create_refunds_table.sql` | `refunds` | Quản lý các lệnh hoàn tiền và trạng thái xử lý với ngân hàng. |
| **V010** | `V010__create_payouts_table.sql` | `payouts` | Quản lý các yêu cầu rút tiền của Người bán (Bảng sẵn sàng cho Phase 2). |
| **V011** | `V011__create_settlement_batches_table.sql` | `settlement_batches` | Quản lý các đợt quyết toán định kỳ T+2 và tiến trình xử lý. |
| **V012** | `V012__create_idempotency_keys_table.sql` | `idempotency_keys` | Khóa chống trùng lặp request API, lưu trữ hash request và response snapshot. |
| **V013** | `V013__create_outbox_messages_table.sql` | `outbox_messages` | Transactional Outbox lưu trữ sự kiện miền đẩy lên Kafka. |
| **V014** | `V014__add_indexes_for_ledger_and_payments.sql`| Chỉ mục bổ trợ | Tạo Composite Index tối ưu truy vấn theo shop, trạng thái và khoảng ngày. |
| **V015** | `V015__seed_default_fee_and_tax_configs.sql` | Seed dữ liệu mẫu | Cấu hình mặc định: Hoa hồng 5.0% (`500 bps`), Thuế GTGT 1.0% (`100 bps`). |
| **V016** | `V016__seed_system_ledger_accounts.sql` | Seed tài khoản hệ thống | Khởi tạo các tài khoản hệ thống: `ESCROW_HOLDING`, `PLATFORM_REVENUE`, `TAX_PAYABLE`. |
| **V017** | `V017__add_settlement_shop_breakdown.sql` | `settlement_items` | Bảng chi tiết giải ngân từng shop trong một đợt quyết toán chung. |
| **V018** | `V018__add_reconciliation_audit_log.sql` | `reconciliation_logs` | Nhật ký ghi nhận kết quả chạy đối soát VNPAY tự động hàng đêm. |

---

## 3. NGUYÊN TẮC TOÀN VẸN TIỀN TỆ (MONEY VALUE OBJECT & CURRENCY INTEGRITY)

### 3.1. Tuyệt đối không dùng số thực (Float / Double)
- **Rủi ro số thực**: Trong các hệ thống tài chính, việc dùng kiểu `FLOAT`, `DOUBLE` hoặc thậm chí `DECIMAL` có làm tròn sai quy tắc có thể gây lệch tiền do biểu diễn nhị phân (ví dụ: `0.1 + 0.2 = 0.30000000000000004`).
- **Triển khai tại Backend**:
  - Toàn bộ các cột tiền (`amount`, `balance`, `gross_amount`, `net_amount`, `fee_amount`, `tax_amount`) trong DB đều khai báo kiểu `BIGINT NOT NULL`.
  - Đơn vị tính: **VND nguyên tệ (Integer VND)**. 1 đồng = 1 đơn vị. Không có số thập phân (do đồng Việt Nam không dùng đơn vị xu).
  - Tỷ lệ phần trăm hoa hồng và thuế được tính bằng **Điểm cơ bản (Basis Points - BPS)**: `1% = 100 bps`, `5.5% = 550 bps`. Thuật toán nhân chia luôn dùng phép chia nguyên có cơ chế làm tròn an toàn `RoundingMode.HALF_UP` tại Java Domain Layer:
    $$\text{Fee} = \frac{\text{Amount} \times \text{Rate}_{\text{bps}}}{10000}$$

---

## 4. CƠ CHẾ SỔ CÁI KÉP BẤT BIẾN (DOUBLE-ENTRY LEDGER MECHANICS)

Tuân thủ quyết định kiến trúc [ADR-001](file:///ecommerce-taca/payment-wallet-service/docs/adr/ADR-001-double-entry-ledger-immutable.md), hệ thống không cho phép sửa đổi (`UPDATE`) hoặc xóa (`DELETE`) dữ liệu trong các bảng sổ cái.

### 4.1. Cấu trúc bút toán và định khoản
Mỗi giao dịch kinh tế sinh ra 1 bản ghi `ledger_postings` và ít nhất 2 bản ghi `ledger_entries`:
- **Ghi nợ (DEBIT)**: Tăng tài sản hoặc giảm nợ phải trả.
- **Ghi có (CREDIT)**: Tăng doanh thu, nợ phải trả hoặc giảm tài sản.

**Quy tắc bất biến (Balancing Invariant)**:
$$\sum \text{Debit Amount} \equiv \sum \text{Credit Amount} \quad (\forall \text{ posting})$$

### 4.2. Bảng hạch toán mẫu: Đơn hàng thành công 1.000.000 ₫ (Hoa hồng 5%, Thuế 1%)
Khi Người mua thanh toán thành công đơn hàng qua VNPAY với giá trị 1.000.000 ₫:

| Bản ghi Entry | Tài khoản sổ cái (`ledger_account`) | Loại tài khoản | Định khoản | Số tiền (VND) | Diễn giải nghiệp vụ |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | `BANK_CLEARING_VNPAY` | Tài sản sàn | **DEBIT** | 1.000.000 ₫ | Tiền thực tế vào tài khoản ngân hàng VNPAY của sàn |
| **2** | `SELLER_PAYABLE_SHOP_01` | Nợ phải trả Shop | **CREDIT** | 940.000 ₫ | Doanh thu thực nhận của Shop (Ghi vào `pending_balance`) |
| **3** | `PLATFORM_COMMISSION_REVENUE` | Doanh thu sàn | **CREDIT** | 50.000 ₫ | Doanh thu hoa hồng sàn thu được (5.0%) |
| **4** | `TAX_WITHHELD_PAYABLE` | Nợ phải trả Nhà nước | **CREDIT** | 10.000 ₫ | Thuế GTGT sàn giữ lại để nộp thay Shop (1.0%) |

**Tổng DEBIT** (1.000.000 ₫) = **Tổng CREDIT** (940.000 + 50.000 + 10.000 = 1.000.000 ₫). Bút toán hoàn toàn cân bằng!

---

## 5. MẪU THIẾT KẾ TRANSACTIONAL OUTBOX (CHỐNG MẤT SỰ KIỆN KAFKA)

Tuân thủ quyết định kiến trúc [ADR-002](file:///ecommerce-taca/payment-wallet-service/docs/adr/ADR-002-transactional-outbox-kafka.md).

```mermaid
sequenceDiagram
    autonumber
    actor Client as Người mua / VNPAY
    participant Svc as PaymentApplicationService
    participant DB as MySQL Database
    participant Poller as OutboxPollingJob
    participant Kafka as Apache Kafka Broker

    Client->>Svc: Xác nhận thanh toán (Webhook IPN)
    Note over Svc,DB: Mở Transaction ACID tại MySQL
    Svc->>DB: UPDATE payments SET status = 'SUCCESS'
    Svc->>DB: INSERT INTO ledger_postings & entries (...)
    Svc->>DB: INSERT INTO outbox_messages (topic='payment.events', event='PaymentSuccessEvent', status='PENDING')
    Note over Svc,DB: COMMIT TRANSACTION ACID (100% nguyên khối)
    Svc-->>Client: Trả lời 200 OK

    loop Mỗi 500ms
        Poller->>DB: SELECT * FROM outbox_messages WHERE status = 'PENDING' FOR UPDATE SKIP LOCKED
        Poller->>Kafka: Đẩy message lên Kafka topic 'payment.events'
        Kafka-->>Poller: ACK xác nhận đã nhận tin
        Poller->>DB: UPDATE outbox_messages SET status = 'PUBLISHED', published_at = NOW()
    end
```

### Ưu điểm vượt trội:
- **Triệt tiêu Dual-Write Hazard**: Nếu Kafka broker bị sập, transaction trong MySQL vẫn hoàn tất thành công. Khi Kafka hồi phục, bộ quét Outbox tự động đẩy lại các tin nhắn tồn đọng.
- **Bảo toàn thứ tự sự kiện**: Bằng cách sắp xếp `created_at` và `id`, các dịch vụ hạ nguồn (Order, Inventory, Notification) luôn nhận được sự kiện thanh toán theo đúng thứ tự thời gian thực.

---

## 6. KHÓA IDEMPOTENCY KEY VÀ KIỂM SOÁT ĐỒNG THỜI (CONCURRENCY CONTROL)

### 6.1. Bảng `idempotency_keys`
- **Khóa chính**: `idempotency_key` (VARCHAR(128)).
- **Cơ chế hoạt động**:
  1. Khi nhận request có header `Idempotency-Key`, backend thực hiện câu lệnh `INSERT INTO idempotency_keys (key, request_hash, status) VALUES (?, ?, 'IN_PROGRESS')`.
  2. Nếu trùng lặp key đang chạy: Bắt ngoại lệ `DuplicateKeyException` và trả về ngay HTTP `409 Conflict`.
  3. Khi xử lý xong: Lưu `response_body` (JSON) và chuyển status sang `'COMPLETED'`.
  4. Nếu client bấm retry với cùng key: Backend đọc trực tiếp response từ cache DB và trả về ngay kết quả cũ mà không thực thi lại logic trừ/cộng tiền lần 2.

### 6.2. Kiểm soát đồng thời trên số dư ví (`wallets`)
- Áp dụng **Optimistic Locking** thông qua cột `version INT NOT NULL DEFAULT 0`.
- Khi cập nhật số dư ví:
  ```sql
  UPDATE wallets 
  SET available_balance = available_balance + :delta, version = version + 1 
  WHERE wallet_id = :id AND version = :currentVersion;
  ```
- Nếu có 2 giao dịch đồng thời cập nhật ví cùng lúc, giao dịch thứ hai bị `OptimisticLockException` và được cơ chế retry tự động của Spring thử lại với phiên bản số dư mới.

---

## 7. KẾT LUẬN KIỂM TOÁN CƠ SỞ DỮ LIỆU
- **Độ tin cậy & Toàn vẹn**: Đạt **9.5 / 10**.
- **Đánh giá chung**: Cấu trúc cơ sở dữ liệu và các ràng buộc toàn vẹn của `payment-wallet-service` đạt tiêu chuẩn cấp độ ngân hàng (Banking-grade Core). Tính bất biến của sổ cái kép và mô hình Transactional Outbox là điểm sáng kỹ thuật mẫu mực của toàn bộ dự án Taca Ecommerce.

