# Messaging & Realtime Chat Service API Specification

> **Dịch vụ Upstream:** `message-service` (Port nội bộ `8090`)  
> **Prefix Gateway:** `/api/v1/conversations/**`, `/api/v1/messages/**`, `/api/v1/attachments/**`, `/ws/messages`  
> **Nguồn đối chiếu:** `ecommerce-taca/docs/message-docs/docs/api/message.md`

---

## 1. Kết Nối WebSocket Realtime (`/ws/messages`)

- **Protocol:** `ws://` (hoặc `wss://` qua Gateway)
- **Handshake Header:**
  ```http
  Sec-WebSocket-Protocol: bearer, <JWT_ACCESS_TOKEN>
  ```
- **Gateway xử lý:** Xác thực JWT hợp lệ ➔ Nâng cấp kết nối HTTP sang TCP WebSocket tunnel (`101 Switching Protocols`) ➔ Chuyển tiếp frame hai chiều không lưu đệm.
- **Sự kiện luồng:**
  - `message.new`: Khi có tin nhắn mới gửi đến hội thoại.
  - `typing.status`: Báo đối phương đang nhập tin nhắn.
  - `message.read`: Thông báo tin nhắn đã được đối phương đọc.

---

## 2. API Quản Lý Hội Thoại (REST Conversation Endpoints)

### 2.1 `GET /conversations`
- **Response 200:** Danh sách hội thoại của người dùng (Shop chat hoặc Hỗ trợ khách hàng). Hiển thị tin nhắn cuối cùng, thời gian và số tin nhắn chưa đọc.

### 2.2 `GET /conversations/{conversationId}/messages`
- **Query:** `limit` (default: 30), `before` (cursor UUID của tin nhắn cũ nhất đang hiển thị để cuộn lên xem lịch sử).

### 2.3 `POST /conversations/{conversationId}/messages`
- **Body:** `{ content: "Sản phẩm này còn màu trắng không shop?", attachmentIds: [] }`

### 2.4 `POST /attachments/upload-url`
- Nhận presigned upload URL tải ảnh trực tiếp gửi trong khung chat.

### 2.5 `PATCH /conversations/{conversationId}/read`
- Đánh dấu đã đọc toàn bộ tin nhắn trong cuộc hội thoại để reset badge thông báo trên thanh Header.
