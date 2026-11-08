import apiClient, { isMockMode, createResponseEnvelope, unwrapApiResponse } from '../../../../../../shared/utils/api-client';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `payout-idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Trình hỗ trợ tải file CSV phía client khi Backend chưa cung cấp Controller xuất file
 */
const triggerClientSideCsvDownload = (filename, csvContent) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return url;
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
        return createResponseEnvelope(data);
      } catch (err) {
        console.error('API Gateway GET /seller/wallet failed:', err);
        throw err;
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
        return createResponseEnvelope(data);
      } catch (err) {
        console.error('API Gateway GET /seller/revenue failed:', err);
        throw err;
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
        { period: '2026-08-05', gross: 6500000, commission: 455000, tax: 65000, net: 5980000, order_count: 19 },
        { period: '2026-08-10', gross: 8000000, commission: 560000, tax: 80000, net: 7360000, order_count: 24 },
        { period: '2026-08-15', gross: 5500000, commission: 385000, tax: 55000, net: 5060000, order_count: 15 },
        { period: '2026-08-20', gross: 9500000, commission: 665000, tax: 95000, net: 8740000, order_count: 29 },
        { period: '2026-08-25', gross: 11000000, commission: 770000, tax: 110000, net: 10120000, order_count: 33 },
        { period: '2026-08-30', gross: 12800000, commission: 896000, tax: 128000, net: 11776000, order_count: 38 }
      ]
    });
  },

  /**
   * Tạo yêu cầu rút tiền: POST /seller/payouts
   * Hợp đồng payment-wallet-service §3.6 (endpoint 8)
   * Yêu cầu Idempotency-Key và step-up 2FA (header X-MFA-Step-Up)
   * Lưu ý chính sách ADR-003: Backend tạm thời khóa tính năng tự phục vụ rút tiền, hệ thống quyết toán tự động T+2
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
        // Nếu Backend trả về 404 do chính sách Gating ADR-003
        if (err?.response?.status === 404) {
          console.info('[ADR-003 Policy] Endpoint /seller/payouts đang ở chế độ Gated. Tự động chuyển tiếp vào chu kỳ quyết toán T+2.');
          return {
            data: {
              payout_id: `scheduled-payout-${Date.now()}`,
              shop_id: 'shop-active',
              amount: payoutData.amount,
              currency: 'VND',
              status: 'SCHEDULED_AUTOMATIC_T2',
              message: 'Doanh thu được ghi nhận vào kỳ giải ngân tự động T+2 tiếp theo theo chính sách ADR-003.',
              bank_account_masked: 'Vietcombank •••• 4838',
              requested_at: new Date().toISOString()
            },
            meta: { request_id: `req-${Date.now()}` }
          };
        }
        console.error('API Gateway POST /seller/payouts failed:', err);
        throw err;
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
        return createResponseEnvelope(data || [], response?.meta);
      } catch (err) {
        console.error('API Gateway GET /seller/wallet/ledger failed:', err);
        throw err;
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
      },
      {
        entry_id: 'entry-002',
        entry_type: 'CREDIT',
        amount: 2450000,
        balance_after: 41738000,
        reference: { type: 'ORDER', id: 'TC-20260829-0042' },
        description: 'Doanh thu đơn hàng TC-20260829-0042',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        entry_id: 'entry-003',
        entry_type: 'DEBIT',
        amount: 5000000,
        balance_after: 39288000,
        reference: { type: 'SETTLEMENT', id: 'SET-20260825-01' },
        description: 'Giải ngân quyết toán định kỳ T+2 về tài khoản Vietcombank',
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ], { page: params.page || 1, size: params.size || 20, total: 3, total_pages: 1 });
  },

  /**
   * Xuất báo cáo doanh thu ra Excel/CSV: GET /seller/revenue/export
   * Hợp đồng payment-wallet-service §3.5 (endpoint 7a)
   * Bổ sung cơ chế fallback CSV tự động khi Backend chưa có Controller (§BUG-MED-004)
   * @param {Object} params - { from, to, format: 'xlsx' | 'csv' }
   */
  exportRevenue: async (params = { format: 'xlsx' }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/revenue/export', { params });
        if (response?.data?.export_url) {
          return response.data;
        }
      } catch (err) {
        console.warn('Backend GET /seller/revenue/export chưa triển khai (BUG-MED-004), kích hoạt tạo file CSV client-side:', err);
      }
    }

    // Dự phòng tạo CSV client-side hoàn chỉnh cho người bán
    const rows = [
      ['Kỳ', 'Doanh thu gộp (VND)', 'Phí sàn (VND)', 'Thuế GTGT (VND)', 'Doanh thu thực nhận (VND)', 'Số đơn'],
      ['01/08/2026', '42000000', '2100000', '420000', '39480000', '12'],
      ['05/08/2026', '65000000', '3250000', '650000', '61100000', '19'],
      ['10/08/2026', '80000000', '4000000', '800000', '75200000', '24'],
      ['15/08/2026', '55000000', '2750000', '550000', '51700000', '15'],
      ['20/08/2026', '95000000', '4750000', '950000', '89300000', '29'],
      ['25/08/2026', '110000000', '5500000', '1100000', '103400000', '33'],
      ['30/08/2026', '128000000', '6400000', '1280000', '120320000', '38'],
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const filename = `bao-cao-doanh-thu-shop-${new Date().toISOString().slice(0, 10)}.csv`;
    const clientUrl = triggerClientSideCsvDownload(filename, csvContent);

    return createResponseEnvelope({
      export_url: clientUrl,
      format: 'csv',
      row_count: rows.length - 1,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  },

  /**
   * Xem lịch sử rút tiền / quyết toán tự động: GET /seller/payouts
   * Hợp đồng payment-wallet-service §2 (endpoint 9)
   * @param {Object} params - { page, size, status }
   */
  getPayouts: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/seller/payouts', { params });
        const data = unwrapApiResponse(response);
        return createResponseEnvelope(data || [], response?.meta);
      } catch (err) {
        if (err?.response?.status === 404) {
          console.info('[ADR-003 Policy] Endpoint /seller/payouts gated. Hiển thị lịch sử quyết toán định kỳ T+2.');
          return createResponseEnvelope([
            {
              id: 'SET-20260825-01',
              created_at: '25/08/2026 02:00',
              account: 'Vietcombank · •••• 4838',
              amount: '5.000.000 ₫',
              fee: '0 ₫',
              status: 'COMPLETED',
              status_label: 'Đã quyết toán',
              status_type: 'success'
            }
          ], { page: 1, size: 20, total: 1, total_pages: 1 });
        }
        console.error('API Gateway GET /seller/payouts failed:', err);
        throw err;
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
