import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_VOUCHERS = [
  {
    id: 'TACA_FREESHIP_1',
    code: 'FREESHIP50K',
    title: 'Miễn phí vận chuyển',
    description: 'Giảm tối đa 50k cho đơn từ 150k',
    discount_amount: 50000,
    min_order_value: 150000,
    valid_until: '2026-12-31T23:59:59Z',
    type: 'SHIPPING',
    provider: 'TACA',
    status: 'ACTIVE'
  },
  {
    id: 'TACA_DISCOUNT_1',
    code: 'TACA10',
    title: 'Giảm 10%',
    description: 'Giảm 10% tối đa 100k cho đơn từ 500k',
    discount_percent: 10,
    max_discount_amount: 100000,
    min_order_value: 500000,
    valid_until: '2026-12-31T23:59:59Z',
    type: 'DISCOUNT',
    provider: 'TACA',
    status: 'ACTIVE'
  },
  {
    id: 'SHOP_DISCOUNT_1',
    code: 'APPLE500',
    title: 'Giảm 500k',
    description: 'Giảm 500k cho đơn từ 20 triệu (Apple Flagship Store)',
    discount_amount: 500000,
    min_order_value: 20000000,
    valid_until: '2026-10-31T23:59:59Z',
    type: 'DISCOUNT',
    provider: 'SHOP',
    shop_name: 'Apple Flagship Store',
    status: 'ACTIVE'
  },
  {
    id: 'TACA_EXPIRED_1',
    code: 'OLDCODE',
    title: 'Giảm 20k',
    description: 'Giảm 20k cho đơn từ 100k',
    discount_amount: 20000,
    min_order_value: 100000,
    valid_until: '2023-12-31T23:59:59Z',
    type: 'DISCOUNT',
    provider: 'TACA',
    status: 'EXPIRED'
  }
];

export const voucherApi = {
  getVouchers: async (params = {}) => {
    if (USE_MOCK) {
      await delay(800);
      let data = [...MOCK_VOUCHERS];
      
      if (params.provider) {
        data = data.filter(v => v.provider === params.provider);
      }
      if (params.status) {
        data = data.filter(v => v.status === params.status);
      }

      return {
        data: {
          data,
          total: data.length,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
    return apiClient.get('/vouchers', { params });
  },

  saveVoucher: async (code) => {
    if (USE_MOCK) {
      await delay(500);
      if (code === 'ERROR') throw new Error('Mã voucher không hợp lệ');
      return { data: { success: true } };
    }
    return apiClient.post('/vouchers/save', { code });
  }
};
