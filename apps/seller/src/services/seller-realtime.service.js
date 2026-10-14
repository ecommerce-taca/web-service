/**
 * Seller Realtime Service (WebSocket & SSE Fallback)
 * Dựa trên tài liệu hệ thống Taca:
 * - docs/api/message.md §1 & §3.3 (WebSocket Handshake via API Gateway, JWT Subprotocol)
 * - docs/api/auth-user.md §2.26 (Admin KYC Review)
 * - docs/lld/auth-user.md (Outbox Events: shop.kyc.approved, shop.kyc.rejected, shop.status_changed)
 */

import { getOnboardingProgress } from './seller-shop.api';

class SellerRealtimeService {
  constructor() {
    this.socket = null;
    this.reconnectTimer = null;
    this.pollTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Set();
    this.isConnected = false;
    this.isPolling = false;
    this.lastKnownKycStatus = null;
  }

  /**
   * Khởi tạo kết nối Realtime
   */
  connect() {
    if (typeof window === 'undefined') return;

    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('taca_access_token');
    
    // Nếu chưa đăng nhập, lắng nghe sự kiện login
    if (!token) {
      window.addEventListener('auth:login', () => this.connect(), { once: true });
      return;
    }

    this._setupWebSocket(token);
    this._startFallbackSync();
  }

  /**
   * Thiết lập WebSocket theo chuẩn API Gateway
   */
  _setupWebSocket(token) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const gatewayTarget = import.meta.env.VITE_GATEWAY_TARGET || 'http://localhost:8081';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Xây dựng WS URL qua API Gateway: /ws/notifications hoặc /ws/events
      let wsUrl = '';
      if (import.meta.env.VITE_WS_URL) {
        wsUrl = `${import.meta.env.VITE_WS_URL}?token=${encodeURIComponent(token)}`;
      } else if (gatewayTarget.startsWith('http')) {
        const cleanHost = gatewayTarget.replace(/^https?:\/\//, '');
        wsUrl = `${wsProtocol}//${cleanHost}/ws/notifications?token=${encodeURIComponent(token)}`;
      } else {
        wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications?token=${encodeURIComponent(token)}`;
      }

      // Theo chuẩn docs/api/message.md §3.3: Handshake qua Sec-WebSocket-Protocol: bearer, <token>
      try {
        this.socket = new WebSocket(wsUrl, ['bearer', token]);
      } catch {
        // Fallback sang URL không subprotocol
        this.socket = new WebSocket(wsUrl);
      }

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._notifyListeners({ type: 'CONNECTION_OPEN' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleIncomingEvent(data);
        } catch {
          // Bỏ qua tin nhắn không đúng định dạng JSON
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this._scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        // Chuyển sang chế độ Fallback Polling an toàn
        this._startFallbackSync();
      };
    } catch {
      this._startFallbackSync();
    }
  }

  /**
   * Xử lý event thời gian thực nhận được từ Backend
   */
  _handleIncomingEvent(data) {
    const eventName = data.event || data.type || data.eventType;
    const payload = data.payload || data.data || data;

    // Các sự kiện liên quan đến hồ sơ Seller KYC từ Outbox
    const kycEvents = [
      'shop.kyc.approved',
      'shop.kyc.rejected',
      'shop.kyc.needs_info',
      'shop.status_changed',
    ];

    if (kycEvents.includes(eventName)) {
      const decision = eventName.includes('approved')
        ? 'APPROVED'
        : eventName.includes('rejected')
        ? 'REJECTED'
        : eventName.includes('needs_info')
        ? 'NEEDS_INFO'
        : payload.kyc_status || 'APPROVED';

      const shopStatus = decision === 'APPROVED' ? 'ACTIVE' : 'DRAFT';

      // Phát Custom Event đồng bộ toàn hệ thống FE
      const eventDetail = {
        event: eventName,
        shopId: payload.shop_id || payload.shopId,
        decision,
        shopStatus,
        reason: payload.reason || '',
        timestamp: new Date().toISOString(),
      };

      window.dispatchEvent(new CustomEvent('taca:kyc_updated', { detail: eventDetail }));
      this._notifyListeners({ type: 'KYC_STATUS_CHANGED', data: eventDetail });
    }
  }

  /**
   * Tự động tái kết nối với Exponential Backoff
   */
  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Đạt ngưỡng tối đa -> duy trì Fallback Polling
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
    this.reconnectAttempts += 1;

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Fallback Realtime Sync:
   * Khi WebSocket chưa sẵn sàng hoặc môi trường Dev Mock,
   * kiểm tra định kỳ để UI Seller nhảy trạng thái ngay khi Admin duyệt
   */
  _startFallbackSync() {
    if (this.isPolling) return;
    this.isPolling = true;

    // Kiểm tra định kỳ mỗi 8 giây nếu hồ sơ chưa APPROVED
    const checkStatus = async () => {
      try {
        const progress = await getOnboardingProgress();
        const currentKyc = progress?.kyc_status;

        if (this.lastKnownKycStatus && currentKyc && this.lastKnownKycStatus !== currentKyc) {
          // Trạng thái đã thay đổi từ PENDING sang APPROVED / REJECTED
          const detail = {
            event: currentKyc === 'APPROVED' ? 'shop.kyc.approved' : 'shop.kyc.rejected',
            decision: currentKyc,
            shopStatus: progress?.shop_status || (currentKyc === 'APPROVED' ? 'ACTIVE' : 'DRAFT'),
            timestamp: new Date().toISOString(),
          };
          window.dispatchEvent(new CustomEvent('taca:kyc_updated', { detail }));
          this._notifyListeners({ type: 'KYC_STATUS_CHANGED', data: detail });
        }

        this.lastKnownKycStatus = currentKyc;

        // Nếu đã APPROVED, giãn thời gian poll hoặc dừng
        if (currentKyc === 'APPROVED') {
          this.stopPolling();
          return;
        }
      } catch {
        // Bỏ qua lỗi mạng
      }

      this.pollTimer = setTimeout(checkStatus, 8000);
    };

    // Bắt đầu kiểm tra
    this.pollTimer = setTimeout(checkStatus, 4000);
  }

  stopPolling() {
    clearTimeout(this.pollTimer);
    this.isPolling = false;
  }

  /**
   * Đăng ký listener nhận sự kiện realtime trong React Component
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Tự động kết nối khi có listener đầu tiên
    if (this.listeners.size === 1) {
      this.connect();
    }
    return () => {
      this.listeners.delete(listener);
      // Dừng polling và ngắt kết nối sạch sẽ khi không còn component nào lắng nghe
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  _notifyListeners(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[SellerRealtimeService] listener error:', err);
      }
    });
  }

  /**
   * Ngắt kết nối sạch sẽ (khi logout hoặc hủy toàn bộ app)
   */
  disconnect() {
    clearTimeout(this.reconnectTimer);
    clearTimeout(this.pollTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.isPolling = false;
  }
}

export const sellerRealtimeService = new SellerRealtimeService();
export default sellerRealtimeService;
