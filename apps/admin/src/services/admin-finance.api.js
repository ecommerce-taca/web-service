import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

export const adminFinanceApi = {
  /**
   * Đối soát giao dịch sàn và VNPAY: GET /admin/payments/reconciliation (#10)
   * Quyền: FINANCE_OPS
   */
  getPaymentReconciliation: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/payments/reconciliation', { params });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/payments/reconciliation failed, using mock', err);
      }
    }
    return {
      data: [
        {
          payment_id: 'payment-01912fa1',
          provider: 'VNPAY',
          local_status: 'SUCCESS',
          provider_status: 'success',
          amount: 1094000,
          match: true,
          checked_at: new Date().toISOString()
        }
      ],
      meta: { page: 1, size: 20, total: 1, total_pages: 1, mismatch_count: 0 }
    };
  },

  /**
   * Xem danh sách version config commission sàn: GET /admin/fees (#11)
   */
  getFees: async () => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/fees');
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/fees failed, using mock', err);
      }
    }
    return {
      data: [
        {
          version_id: 'fee-version-01',
          scope: 'PLATFORM',
          rate_bps: 500, // 5%
          effective_from: '2026-01-01T00:00:00Z',
          note: 'Q1-Q4 Baseline fee'
        }
      ]
    };
  },

  /**
   * Cập nhật version commission sàn: PUT /admin/fees (#12)
   * Yêu cầu header 2FA: X-MFA-Step-Up
   */
  updateFees: async (feePayload, stepUpToken) => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.put('/admin/fees', feePayload, { headers });
      return response?.data;
    }
    return { data: { success: true, version_id: `fee-${Date.now()}` } };
  },

  /**
   * Xem cấu hình thuế: GET /admin/taxes (#13)
   */
  getTaxes: async () => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/taxes');
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/taxes failed, using mock', err);
      }
    }
    return {
      data: [
        {
          version_id: 'tax-version-01',
          tax_rate_bps: 100, // 1%
          effective_from: '2026-01-01T00:00:00Z'
        }
      ]
    };
  },

  /**
   * Cập nhật cấu hình thuế: PUT /admin/taxes (#14)
   */
  updateTaxes: async (taxPayload, stepUpToken) => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.put('/admin/taxes', taxPayload, { headers });
      return response?.data;
    }
    return { data: { success: true, version_id: `tax-${Date.now()}` } };
  },

  /**
   * Danh sách đợt quyết toán cho Shop: GET /admin/settlements (#15)
   */
  getSettlements: async (params = { page: 1, size: 20 }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/settlements', { params });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/settlements failed, using mock', err);
      }
    }
    return {
      data: [
        {
          batch_id: 'batch-01912fa',
          period: '2026-08',
          status: 'COMPLETED',
          total_gross: 1250000000,
          total_commission: 62500000,
          total_net: 1187500000
        }
      ],
      meta: { page: 1, size: 20, total: 1, total_pages: 1 }
    };
  },

  /**
   * Chi tiết đợt quyết toán theo Shop: GET /admin/settlements/{batchId} (#16)
   */
  getSettlementDetail: async (batchId) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get(`/admin/settlements/${batchId}`);
        return response?.data;
      } catch (err) {
        console.warn(`API Gateway GET /admin/settlements/${batchId} failed`, err);
      }
    }
    return {
      data: {
        batch_id: batchId,
        status: 'COMPLETED',
        shops: []
      }
    };
  },

  /**
   * Thử lại đợt quyết toán bị lỗi: POST /admin/settlements/{batchId}/retry (#17)
   */
  retrySettlement: async (batchId, stepUpToken) => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.post(`/admin/settlements/${batchId}/retry`, {}, { headers });
      return response?.data;
    }
    return { data: { batch_id: batchId, status: 'PROCESSING' } };
  },

  /**
   * Báo cáo tài chính toàn sàn: GET /admin/finance/summary (#18)
   */
  getFinanceSummary: async (params = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/finance/summary', { params });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/finance/summary failed, using mock', err);
      }
    }
    return {
      data: {
        gmv: 4850000000,
        commission_income: 242500000,
        tax_collected: 48500000,
        refunded: 12000000,
        payout_volume: 3800000000
      }
    };
  },

  /**
   * Xuất báo cáo tài chính toàn sàn ra Excel/CSV: GET /admin/finance/summary/export (#18a)
   */
  exportFinanceSummary: async (params = { format: 'xlsx' }) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/finance/summary/export', { params });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/finance/summary/export failed', err);
      }
    }
    return {
      data: {
        export_url: `https://storage.example/signed-download/finance-summary-export.${params.format || 'xlsx'}`,
        format: params.format || 'xlsx',
        generated_at: new Date().toISOString()
      }
    };
  }
};

export default adminFinanceApi;
