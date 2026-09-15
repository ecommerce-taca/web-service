import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock data for development when backend is not ready
const MOCK_ORDERS = {
  data: [
    {
      id: 'TACA2408271',
      status: 'COMPLETED',
      total_amount: 29490000,
      shipping_fee: 0,
      discount_amount: 0,
      shop: { name: 'Taca Apple Flagship Store' },
      shipping_address: {
        name: 'Nguyễn Minh Anh',
        phone: '0909 123 456',
        detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
      },
      order_items: [
        {
          product_name: 'iPhone 16 Pro Max 256GB',
          variant_name: 'Titan tự nhiên',
          unit_price: 29490000,
          quantity: 1,
          product_image: ''
        }
      ]
    },
    {
      id: 'TACA2408272',
      status: 'SHIPPING',
      total_amount: 7490000,
      shipping_fee: 30000,
      discount_amount: 10000,
      shop: { name: 'Sony Official Store' },
      shipping_address: {
        name: 'Nguyễn Minh Anh',
        phone: '0909 123 456',
        detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM'
      },
      order_items: [
        {
          product_name: 'Tai nghe chụp tai Sony WH-1000XM5',
          variant_name: 'Đen',
          unit_price: 7490000,
          quantity: 1,
          product_image: ''
        }
      ]
    }
  ]
};

export const orderApi = {
  /**
   * Lấy danh sách đơn hàng
   * @param {Object} params - Query params (page, size, status)
   */
  getOrders: async (params = { page: 1, size: 20 }) => {
    if (!USE_MOCK) {
      const response = await apiClient.get('/orders/me', { params });
      return response;
    }
    
    return new Promise(resolve => {
      setTimeout(() => {
        let filteredData = MOCK_ORDERS.data;
        if (params.status) {
          filteredData = filteredData.filter(o => o.status === params.status);
        }
        resolve({ data: { data: filteredData } });
      }, 500);
    });
  },

  /**
   * Lấy chi tiết đơn hàng
   * @param {string} orderId - ID của đơn hàng
   */
  getOrderDetail: async (orderId) => {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = MOCK_ORDERS.data.find(o => o.id === orderId);
        if (order) {
          resolve({ data: { data: order } });
        } else {
          reject(new Error('Không tìm thấy đơn hàng'));
        }
      }, 500);
    });
  }
};
