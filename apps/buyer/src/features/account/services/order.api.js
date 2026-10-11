import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
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

// Default initial demo orders
const INITIAL_DEMO_ORDERS = [
  {
    id: 'TACA2408271',
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
   * Lấy danh sách đơn hàng
   * @param {Object} params - Query params (page, size, status)
   */
  getOrders: async (params = { page: 1, size: 20 }) => {
    if (!USE_MOCK) {
      try {
        const response = await apiClient.get('/orders/me', { params });
        return response;
      } catch (err) {
        console.warn('API Gateway /orders/me failed, falling back to local orders', err);
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
   * Lấy chi tiết đơn hàng
   * @param {string} orderId - ID của đơn hàng
   */
  getOrderDetail: async (orderId) => {
    if (!USE_MOCK) {
      try {
        const response = await apiClient.get(`/orders/${orderId}`);
        return response;
      } catch (err) {
        console.warn(`API Gateway /orders/${orderId} failed, falling back to local order`, err);
      }
    }

    const stored = getStoredOrders();
    const all = [...stored, ...INITIAL_DEMO_ORDERS];
    const order = all.find(o => o.id === orderId);
    if (order) {
      return { data: { data: order } };
    }
    throw new Error('Không tìm thấy đơn hàng');
  },

  /**
   * Tạo đơn hàng mới sau khi checkout
   * @param {Object} orderData
   */
  createOrder: async (orderData) => {
    const timestamp = Date.now().toString().slice(-6);
    const newOrder = {
      id: `TACA${new Date().getFullYear().toString().slice(-2)}${timestamp}`,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      total_amount: orderData.total_amount || orderData.total || 0,
      shipping_fee: orderData.shipping_fee || 0,
      discount_amount: orderData.discount_amount || 0,
      payment_method: orderData.payment_method || 'COD',
      shop: { name: orderData.shopName || (orderData.items && orderData.items[0]?.shopName) || 'Taca Official Mall' },
      shipping_address: orderData.shipping_address || {
        name: 'Khách hàng Taca',
        phone: '0909 123 456',
        detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
      },
      order_items: (orderData.items || []).map(item => ({
        product_name: item.name,
        variant_name: item.variant || item.sku || 'Tiêu chuẩn',
        unit_price: item.price,
        quantity: item.quantity,
        product_image: item.image || ''
      }))
    };

    // Save to local storage
    const current = getStoredOrders();
    saveStoredOrders([newOrder, ...current]);

    if (!USE_MOCK) {
      try {
        return await apiClient.post('/orders', orderData);
      } catch {
        return { data: { data: newOrder } };
      }
    }

    return { data: { data: newOrder } };
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderId
   */
  cancelOrder: async (orderId) => {
    const stored = getStoredOrders();
    const updated = stored.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o);
    saveStoredOrders(updated);
    return { data: { success: true } };
  }
};

export default orderApi;
