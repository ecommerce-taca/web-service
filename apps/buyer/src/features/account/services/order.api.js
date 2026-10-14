import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY = 'taca_user_orders';

const getStoredOrders = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse orders from localStorage', e);
    return [];
  }
};

const saveStoredOrders = (orders) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
};

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Default initial demo orders
const INITIAL_DEMO_ORDERS = [
  {
    id: 'TACA2408271',
    order_number: 'TC-20260827-0001',
    status: 'COMPLETED',
    total_amount: 29490000,
    shipping_fee: 0,
    discount_amount: 0,
    created_at: '2026-08-27T10:30:00Z',
    shop: { name: 'Taca Apple Flagship Store' },
    shipping_address: {
      name: 'Nguyễn Minh Anh',
      phone: '0909 123 456',
      detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
    },
    order_items: [
      {
        product_name: 'iPhone 16 Pro Max 256GB',
        variant_name: 'Titan tự nhiên - SKU IP16PM-256-NAT',
        unit_price: 29490000,
        quantity: 1,
        product_image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'TACA2408272',
    order_number: 'TC-20260828-0002',
    status: 'SHIPPING',
    total_amount: 7490000,
    shipping_fee: 30000,
    discount_amount: 10000,
    created_at: '2026-08-28T14:15:00Z',
    shop: { name: 'Sony Official Store' },
    shipping_address: {
      name: 'Nguyễn Minh Anh',
      phone: '0909 123 456',
      detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
    },
    order_items: [
      {
        product_name: 'Tai nghe chụp tai Sony WH-1000XM5',
        variant_name: 'Đen - SKU SONY-XM5-BLK',
        unit_price: 7490000,
        quantity: 1,
        product_image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const orderApi = {
  /**
   * Lấy danh sách đơn hàng của Buyer: GET /orders (khớp order-commerce-service spec)
   * @param {Object} params - Query params (page, size, status)
   */
  getOrders: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/orders', { params });
        // Xử lý cả 2 chuẩn response envelope: { data: [...], meta } hoặc { data: { data: [...] } }
        const rawList = Array.isArray(response?.data) 
          ? response.data 
          : (Array.isArray(response?.data?.data) ? response.data.data : response?.data?.items);

        if (Array.isArray(rawList)) {
          return {
            data: {
              data: rawList,
              total: response?.meta?.total || rawList.length,
              page: response?.meta?.page || params.page || 1,
              size: response?.meta?.size || params.size || 20,
              total_pages: response?.meta?.total_pages || 1,
            },
            meta: response?.meta || { total: rawList.length }
          };
        }
      } catch (err) {
        console.warn('API Gateway GET /orders failed, falling back to local orders', err);
      }
    }
    
    const stored = getStoredOrders();
    const all = [...stored, ...INITIAL_DEMO_ORDERS];
    let filtered = all;
    if (params.status) {
      filtered = filtered.filter(o => o.status === params.status);
    }

    return {
      data: {
        data: filtered,
        total: filtered.length,
        page: params.page || 1,
        size: params.size || 20
      }
    };
  },

  /**
   * Lấy chi tiết đơn hàng: GET /orders/{orderId}
   * @param {string} orderId - ID của đơn hàng
   */
  getOrderDetail: async (orderId) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get(`/orders/${orderId}`);
        const orderData = response?.data?.data || response?.data || response;
        if (orderData) {
          return { data: { data: orderData } };
        }
      } catch (err) {
        console.warn(`API Gateway GET /orders/${orderId} failed, falling back to local order`, err);
      }
    }

    const stored = getStoredOrders();
    const all = [...stored, ...INITIAL_DEMO_ORDERS];
    const order = all.find(o => o.id === orderId || o.order_number === orderId);
    if (order) {
      return { data: { data: order } };
    }
    throw new Error('Không tìm thấy đơn hàng');
  },

  /**
   * Checkout chuẩn Backend: POST /checkout kèm Idempotency-Key bắt buộc
   * @param {Object} checkoutPayload - { cart_id, selected_item_ids, address_id, payment_method, voucher_codes }
   */
  checkout: async (checkoutPayload) => {
    const idempotencyKey = generateIdempotencyKey();

    if (!isMockMode()) {
      return apiClient.post('/checkout', checkoutPayload, {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });
    }

    // Mock response chuẩn Backend order-commerce-service §3.5
    const timestamp = Date.now().toString().slice(-6);
    const mockOrderNumber = `TC-${new Date().getFullYear()}${timestamp}`;
    const isVnpay = checkoutPayload.payment_method === 'VNPAY';

    return {
      data: {
        checkout_group_id: `group-${Date.now()}`,
        orders: [
          {
            order_id: `order-${Date.now()}`,
            order_number: mockOrderNumber,
            shop_id: 'shop-01',
            status: isVnpay ? 'PENDING_PAYMENT' : 'CONFIRMED',
            reservation_id: `res-${Date.now()}`,
            payment_status: isVnpay ? 'PENDING' : 'PENDING_COD',
          }
        ],
        payment_next_action: {
          type: isVnpay ? 'VNPAY_QR' : 'NONE',
          payment_id: isVnpay ? `pay-${Date.now()}` : null,
        },
        reservation_expires_at: isVnpay ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
      },
      meta: { request_id: `req-${Date.now()}` }
    };
  },

  /**
   * Tạo đơn hàng / Checkout thích ứng (tương thích cả giao diện cũ và backend mới)
   * @param {Object} orderData
   */
  createOrder: async (orderData) => {
    const timestamp = Date.now().toString().slice(-6);
    const orderNum = `TC-${new Date().getFullYear().toString().slice(-2)}${timestamp}`;
    const paymentMethodStandard = orderData.payment_method === 'VNPAY QR' ? 'VNPAY' : 'COD';

    // Tạo bản ghi local order để người dùng thấy ngay trên giao diện
    const newOrder = {
      id: `TACA${new Date().getFullYear().toString().slice(-2)}${timestamp}`,
      order_number: orderNum,
      status: paymentMethodStandard === 'VNPAY' ? 'PENDING_PAYMENT' : 'CONFIRMED',
      created_at: new Date().toISOString(),
      total_amount: orderData.total_amount || orderData.total || 0,
      shipping_fee: orderData.shipping_fee || 0,
      discount_amount: orderData.discount_amount || 0,
      payment_method: paymentMethodStandard,
      shop: { name: orderData.shopName || (orderData.items && orderData.items[0]?.shopName) || 'Taca Official Mall' },
      shipping_address: orderData.shipping_address || {
        name: 'Khách hàng Taca',
        phone: '0909 123 456',
        detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
      },
      order_items: (orderData.items || []).map(item => ({
        product_name: item.name || item.title,
        variant_name: item.variant || item.sku || 'Tiêu chuẩn',
        unit_price: item.price,
        quantity: item.quantity,
        product_image: item.image || ''
      }))
    };

    // Lưu vào local storage làm bộ nhớ đệm hiển thị tức thì
    const current = getStoredOrders();
    saveStoredOrders([newOrder, ...current]);

    // Chuẩn hóa payload theo đúng hợp đồng Backend POST /checkout (order-commerce-docs §3.5)
    const checkoutPayload = {
      cart_id: orderData.cart_id || (typeof window !== 'undefined' ? localStorage.getItem('taca_cart_id') : null) || `cart-${Date.now()}`,
      selected_item_ids: (orderData.items || []).map(item => String(item.id || item.sku_id || item.item_id)),
      address_id: orderData.shipping_address?.id || 'addr-default-01',
      payment_method: paymentMethodStandard,
      voucher_codes: orderData.voucher_codes || [],
    };

    if (!isMockMode()) {
      try {
        const res = await orderApi.checkout(checkoutPayload);
        return res;
      } catch (err) {
        console.warn('API Gateway POST /checkout failed, using client order cache', err);
        return { data: { data: newOrder } };
      }
    }

    return { data: { data: newOrder } };
  },

  /**
   * Hủy đơn hàng: PATCH /orders/{orderId}/cancel
   * @param {string} orderId
   * @param {number} version - Phiên bản đơn hàng (Optimistic Concurrency)
   * @param {string} reason - Lý do hủy
   */
  cancelOrder: async (orderId, version = 1, reason = 'BUYER_CANCEL') => {
    if (!isMockMode()) {
      try {
        await apiClient.patch(`/orders/${orderId}/cancel`, {
          reason,
          version,
        }, {
          headers: {
            'Idempotency-Key': generateIdempotencyKey(),
          }
        });
      } catch (err) {
        console.warn(`API Gateway PATCH /orders/${orderId}/cancel failed, updating locally`, err);
      }
    }

    const stored = getStoredOrders();
    const updated = stored.map(o => (o.id === orderId || o.order_number === orderId) ? { ...o, status: 'CANCELLED' } : o);
    saveStoredOrders(updated);
    return { data: { success: true } };
  }
};

export default orderApi;
