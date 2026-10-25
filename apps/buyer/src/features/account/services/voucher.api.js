import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

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
    id: 'SHOP_DISCOUNT_APPLE300K',
    code: 'APPLE300K',
    title: 'Giảm 300.000 ₫',
    description: 'Đơn tối thiểu 10.000.000 ₫ (Cửa hàng)',
    discount_amount: 300000,
    min_order_value: 10000000,
    valid_until: '2026-12-31T23:59:59Z',
    type: 'DISCOUNT',
    provider: 'SHOP',
    shop_name: 'Apple Flagship Store',
    status: 'ACTIVE'
  },
  {
    id: 'TACA_DISCOUNT_TACA200K',
    code: 'TACA200K',
    title: 'Giảm 200.000 ₫ toàn sàn',
    description: 'Đơn tối thiểu 5.000.000 ₫',
    discount_amount: 200000,
    min_order_value: 5000000,
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

const MOCK_REDEMPTIONS = [
  {
    code: 'APPLE300K',
    scope: 'SHOP',
    shop_id: 'shop-01912f31',
    shop_name: 'Apple Flagship Store',
    order_id: 'TC-20260827-0001',
    discount_amount: 300000,
    redeemed_at: '2026-08-27T10:30:00Z'
  },
  {
    code: 'FREESHIP50K',
    scope: 'FREESHIP',
    shop_id: null,
    shop_name: 'Taca Sàn',
    order_id: 'TC-20260827-0001',
    discount_amount: 50000,
    redeemed_at: '2026-08-27T10:30:00Z'
  },
  {
    code: 'TACA10',
    scope: 'PLATFORM',
    shop_id: null,
    shop_name: 'Taca Sàn',
    order_id: 'TC-20260820-0012',
    discount_amount: 100000,
    redeemed_at: '2026-08-20T14:15:00Z'
  }
];

export const voucherApi = {
  /**
   * Lấy danh sách voucher khả dụng: GET /vouchers
   * Spec: order-commerce-docs §3.2a
   * @param {Object} params - { scope, shop_id, product_id, cart_id, status, page, size }
   */
  getVouchers: async (params = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/vouchers', { params });
        const items = response?.data?.data || response?.data || [];
        return {
          data: {
            data: Array.isArray(items) ? items : [],
            total: response?.meta?.total || (Array.isArray(items) ? items.length : 0),
            page: response?.meta?.page || params.page || 1,
            size: response?.meta?.size || params.size || 20
          },
          meta: response?.meta
        };
      } catch (err) {
        console.warn('API Gateway GET /vouchers failed, falling back to mock vouchers', err);
      }
    }

    await delay(300);
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
  },

  /**
   * Kiểm tra tính hợp lệ của voucher: GET /vouchers/validate?code=&cart_id=
   * Spec: order-commerce-docs §3.2
   * @param {string} code - Mã voucher cần kiểm tra
   * @param {string} cartId - ID giỏ hàng hiện tại của người mua
   */
  validateVoucher: async (code, cartId = '') => {
    const normalizedCode = String(code || '').trim().toUpperCase();

    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/vouchers/validate', {
          params: { code: normalizedCode, cart_id: cartId || 'cart-default' }
        });
        return response?.data || response;
      } catch (err) {
        console.warn('API Gateway GET /vouchers/validate failed', err);
      }
    }

    // Mock validation logic
    await delay(400);
    const found = MOCK_VOUCHERS.find(v => v.code.toUpperCase() === normalizedCode);
    if (!found) {
      return {
        data: {
          valid: false,
          code: normalizedCode,
          reason: 'NOT_FOUND',
          message: 'Mã voucher không tồn tại trong hệ thống'
        }
      };
    }

    if (found.status === 'EXPIRED') {
      return {
        data: {
          valid: false,
          code: normalizedCode,
          reason: 'EXPIRED',
          message: 'Mã voucher đã hết hạn sử dụng'
        }
      };
    }

    return {
      data: {
        valid: true,
        code: found.code,
        scope: found.provider === 'SHOP' ? 'SHOP' : 'PLATFORM',
        shop_id: found.provider === 'SHOP' ? 'shop-01912f31' : null,
        discount_type: found.discount_percent ? 'PERCENT' : 'FIXED',
        value: found.discount_percent || found.discount_amount,
        discount_amount: found.discount_amount || 50000,
        min_order: found.min_order_value || 0,
        expires_at: found.valid_until,
        warnings: []
      }
    };
  },

  /**
   * Lấy lịch sử voucher đã dùng của Buyer: GET /vouchers/redemptions
   * Spec: order-commerce-docs §3.2b
   * @param {Object} params - { page, size, from, to }
   */
  getVoucherRedemptions: async (params = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/vouchers/redemptions', { params });
        const items = response?.data?.data || response?.data || [];
        return {
          data: {
            data: Array.isArray(items) ? items : [],
            total: response?.meta?.total || (Array.isArray(items) ? items.length : 0),
            page: response?.meta?.page || params.page || 1,
            size: response?.meta?.size || params.size || 20
          },
          meta: response?.meta || { total_saved: 450000, currency: 'VND' }
        };
      } catch (err) {
        console.warn('API Gateway GET /vouchers/redemptions failed', err);
      }
    }

    await delay(300);
    const totalSaved = MOCK_REDEMPTIONS.reduce((sum, r) => sum + (r.discount_amount || 0), 0);

    return {
      data: {
        data: MOCK_REDEMPTIONS,
        total: MOCK_REDEMPTIONS.length,
        page: params.page || 1,
        size: params.size || 10
      },
      meta: {
        page: 1,
        size: 10,
        total: MOCK_REDEMPTIONS.length,
        total_pages: 1,
        total_saved: totalSaved,
        currency: 'VND'
      }
    };
  }
};

export default voucherApi;
