import apiClient, { isMockMode, createResponseEnvelope, unwrapApiResponse } from '../../../../../../shared/utils/api-client';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `payout-idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const sellerFinanceApi = {
  /**
   * Lấy thông tin ví người bán: GET /seller/wallet
   * Hợp đồng payment-wallet-service §3.4
   */
  getWallet: async () => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/wallet');
        const data = unwrapApiResponse(response);
        if (data) {
          return createResponseEnvelope(data);
        }
      } catch (err) {
        console.warn('API Gateway GET /seller/wallet failed, falling back to mock data', err);
      }
    }

    // Mock wallet data chuẩn spec
    return createResponseEnvelope({
      wallet_id: 'wal-shop-001',
      shop_id: 'shop-01',
      available_balance: 42800000,
      pending_balance: 5200000,
      currency: 'VND',
      status: 'ACTIVE',
      bank_account: {
        bank_name: 'Vietcombank',
        account_number: '•••• 4838',
        account_holder: 'NGUYEN MINH ANH'
      },
      settlement_cycle: 'Hàng ngày (T+2)',
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Lấy báo cáo doanh thu: GET /seller/revenue
   * Hợp đồng payment-wallet-service §3.5 (endpoint 7)
   * @param {Object} params - { from, to, granularity: 'DAY' | 'WEEK' | 'MONTH' }
   */
  getRevenue: async (params = { granularity: 'MONTH' }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/revenue', { params });
        const data = unwrapApiResponse(response);
        if (data) {
          return createResponseEnvelope(data);
        }
      } catch (err) {
        console.warn('API Gateway GET /seller/revenue failed, falling back to mock data', err);
      }
    }

    const { finance } = SELLER_MOCK_DATA;
    return createResponseEnvelope({
      range: {
        from: params.from || '2026-08-01',
        to: params.to || '2026-08-31',
        granularity: params.granularity || 'MONTH'
      },
      currency: 'VND',
      total_gmv: 128500000,
      monthly_revenue: finance.monthlyRevenue,
          monthly_growth: finance.monthlyGrowth,
          platform_fee: finance.platformFee,
          platform_fee_rate: finance.platformFeeRate,
          voucher_cost: 2100000,
          net_revenue: finance.settlement.net,
          settlement_status: 'Đã chốt',
          settlement_cycle: 'Hàng ngày (T+2)',
          summary: {
            gross: 2982000000,
            commission: 142000000,
            tax: 29820000,
            net: 2826400000,
            refunded: 38200000,
            shipping_subsidy: 24600000,
            order_count: 340
          },
          buckets: [
            { period: '2026-08-01', gross: 4200000, commission: 294000, tax: 42000, net: 3864000, order_count: 12 },
          ]
    });
  },

  /**
   * Tạo yêu cầu rút tiền: POST /seller/payouts
   * Hợp đồng payment-wallet-service §3.6 (endpoint 8)
   * Yêu cầu Idempotency-Key và step-up 2FA (header X-MFA-Step-Up)
   * @param {Object} payoutData - { amount, bank_account_id, reason }
   * @param {string} [stepUpToken] - Mã xác thực 2FA/OTP (X-MFA-Step-Up)
   */
  requestPayout: async (payoutData, stepUpToken = '') => {
    const idempotencyKey = generateIdempotencyKey();
    const headers = {
      'Idempotency-Key': idempotencyKey
    };
    if (stepUpToken) {
      headers['X-MFA-Step-Up'] = stepUpToken;
    }

    if (!isMockMode()) {
      try {
        const response = await apiClient.post('/seller/payouts', payoutData, { headers });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway POST /seller/payouts failed, falling back to mock', err);
      }
    }

    // Mock payout response chuẩn spec §3.6
    return {
      data: {
        payout_id: `payout-${Date.now()}`,
        shop_id: 'shop-01912f31',
        amount: payoutData.amount,
        currency: 'VND',
        status: 'REQUESTED',
        bank_account_masked: 'Vietcombank •••• 4838',
        requested_at: new Date().toISOString(),
        estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      meta: { request_id: `req-${Date.now()}` }
    };
  },

  /**
   * Xem lịch sử sổ cái chi tiết: GET /seller/wallet/ledger
   * Hợp đồng payment-wallet-service §3.5
   * @param {Object} params - { page, size, from, to, type }
   */
  getLedger: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/wallet/ledger', { params });
        const data = unwrapApiResponse(response);
        if (data) {
          return createResponseEnvelope(data, response?.meta);
        }
      } catch (err) {
        console.warn('API Gateway GET /seller/wallet/ledger failed, using mock data', err);
      }
    }

    return createResponseEnvelope([
      {
        entry_id: 'entry-001',
        entry_type: 'CREDIT',
        amount: 1062000,
        balance_after: 42800000,
        reference: { type: 'ORDER', id: 'TC-20260830-0001' },
        description: 'Doanh thu đơn hàng TC-20260830-0001',
        created_at: new Date().toISOString()
      }
    ], { page: params.page || 1, size: params.size || 20, total: 1, total_pages: 1 });
  },

  /**
   * Xuất báo cáo doanh thu ra Excel/CSV: GET /seller/revenue/export
   * Hợp đồng payment-wallet-service §3.5 (endpoint 7a)
   * @param {Object} params - { from, to, format: 'xlsx' | 'csv' }
   */
  exportRevenue: async (params = { format: 'xlsx' }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/revenue/export', { params });
        return response?.data || response;
      } catch (err) {
        console.warn('API Gateway GET /seller/revenue/export failed, using fallback', err);
      }
    }

    return createResponseEnvelope({
      export_url: `https://storage.example/signed-download/revenue-shop-export.${params.format || 'xlsx'}`,
      format: params.format || 'xlsx',
      row_count: 31,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  },

  /**
   * Xem lịch sử rút tiền: GET /seller/payouts
   * Hợp đồng payment-wallet-service §2 (endpoint 9)
   * @param {Object} params - { page, size, status }
   */
  getPayouts: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/payouts', { params });
        const data = unwrapApiResponse(response);
        if (data) {
          return createResponseEnvelope(data, response?.meta);
        }
      } catch (err) {
        console.warn('API Gateway GET /seller/payouts failed, using mock data', err);
      }
    }

    const { finance } = SELLER_MOCK_DATA;
    return createResponseEnvelope(
      finance.withdrawals || [],
      { page: params.page || 1, size: params.size || 20, total: 2, total_pages: 1 }
    );
  }
};

export default sellerFinanceApi;
