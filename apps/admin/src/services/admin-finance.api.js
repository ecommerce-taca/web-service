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
   * Kích hoạt chạy tiến trình đối soát thủ công: POST /admin/payments/reconciliation/run
   * Quyền: FINANCE_OPS
   */
  runReconciliation: async () => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.post('/admin/payments/reconciliation/run');
        return response?.data;
      } catch (err) {
        console.warn('API Gateway POST /admin/payments/reconciliation/run failed, using mock', err);
      }
    }
    return {
      data: {
        reconciliation_job_id: `rec-job-${Date.now()}`,
        status: 'PROCESSING',
        started_at: new Date().toISOString(),
        message: 'Tiến trình đối soát giao dịch sàn và VNPAY đã được khởi động thành công.'
      }
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
          version_id: 'fee-01',
          name: 'Điện thoại chính hãng',
          scope: 'CATEGORY',
          scope_label: 'Điện thoại › Apple',
          category_id: 'cat-01912f20',
          rate_bps: 500, // 5.0%
          payment_rate_bps: 150, // 1.5%
          vat_rate_bps: 1000, // 10%
          effective_from: '2026-01-01T00:00:00Z',
          effective_to: '2026-12-31T23:59:59Z',
          effective_range: '01/01 – 31/12',
          status: 'ACTIVE',
          status_label: 'Hoạt động',
          note: 'Quy tắc biểu phí Apple chính hãng',
          created_by: 'admin-01912f01',
          created_at: '2026-01-01T08:00:00Z'
        },
        {
          version_id: 'fee-02',
          name: 'Làm đẹp cao cấp',
          scope: 'CATEGORY',
          scope_label: 'Làm đẹp › Premium',
          category_id: 'cat-beauty-01',
          rate_bps: 800, // 8.0%
          payment_rate_bps: 150, // 1.5%
          vat_rate_bps: 1000, // 10%
          effective_from: '2026-06-01T00:00:00Z',
          effective_to: '2026-12-31T23:59:59Z',
          effective_range: '01/06 – 31/12',
          status: 'ACTIVE',
          status_label: 'Hoạt động',
          note: 'Mỹ phẩm và chăm sóc sắc đẹp cao cấp',
          created_by: 'admin-01912f01',
          created_at: '2026-06-01T08:00:00Z'
        },
        {
          version_id: 'fee-03',
          name: 'Miễn phí seller mới',
          scope: 'SELLER_TIER',
          scope_label: 'Shop KYC < 30 ngày',
          category_id: null,
          rate_bps: 0, // 0.0%
          payment_rate_bps: 150, // 1.5%
          vat_rate_bps: 1000, // 10%
          effective_from: '2026-01-01T00:00:00Z',
          effective_to: null,
          effective_range: 'Rolling 30d',
          status: 'ACTIVE',
          status_label: 'Hoạt động',
          note: 'Chính sách ưu đãi kích cầu người bán mới',
          created_by: 'admin-01912f01',
          created_at: '2026-01-01T08:00:00Z'
        },
        {
          version_id: 'fee-04',
          name: 'Campaign 9.9',
          scope: 'CAMPAIGN',
          scope_label: 'SPU tham gia 9.9',
          category_id: null,
          rate_bps: 400, // 4.0%
          payment_rate_bps: 100, // 1.0%
          vat_rate_bps: 1000, // 10%
          effective_from: '2026-09-01T00:00:00Z',
          effective_to: '2026-09-12T23:59:59Z',
          effective_range: '01/09 – 12/09',
          status: 'PENDING',
          status_label: 'Chờ duyệt',
          note: 'Khuyến mãi mùa Siêu sale 9.9',
          created_by: 'admin-01912f02',
          created_at: '2026-08-20T10:00:00Z'
        },
        {
          version_id: 'fee-05',
          name: 'Cross-border',
          scope: 'PLATFORM',
          scope_label: 'Shop quốc tế',
          category_id: null,
          rate_bps: 950, // 9.5%
          payment_rate_bps: 200, // 2.0%
          vat_rate_bps: 0, // 0%
          effective_from: '2026-10-01T00:00:00Z',
          effective_to: '2026-12-31T23:59:59Z',
          effective_range: '01/10 – 31/12',
          status: 'DRAFT',
          status_label: 'Bản nháp',
          note: 'Quy chuẩn hàng nhập khẩu xuyên biên giới',
          created_by: 'admin-01912f02',
          created_at: '2026-08-25T11:00:00Z'
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
          effective_from: '2026-01-01T00:00:00Z',
          note: 'Thuế suất GTGT khấu trừ tại nguồn theo Thông tư 40/2021/TT-BTC'
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
   * Khớp Penpot Board Taca Admin / Finance
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
          batch_id: 'SET-240827-A',
          period: '26/08 – 27/08',
          sellers_count: 1842,
          total_gross: 128400000000,
          total_commission: 6420000000,
          total_net: 121980000000,
          status: 'PENDING_RECONCILIATION',
          status_label: 'Chờ đối soát'
        },
        {
          batch_id: 'SET-240826-B',
          period: '25/08 – 26/08',
          sellers_count: 1795,
          total_gross: 115200000000,
          total_commission: 5760000000,
          total_net: 109440000000,
          status: 'COMPLETED',
          status_label: 'Đã quyết toán'
        },
        {
          batch_id: 'SET-240825-C',
          period: '24/08 – 25/08',
          sellers_count: 1680,
          total_gross: 98600000000,
          total_commission: 4930000000,
          total_net: 93670000000,
          status: 'FAILED',
          status_label: 'Lỗi quyết toán'
        }
      ],
      meta: { page: 1, size: 20, total: 3, total_pages: 1 }
    };
  },

  /**
   * Chi tiết đợt quyết toán theo Shop: GET /admin/settlements/{batchId} (#16)
   * Hợp đồng payment-wallet §3.8
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
        batch_id: batchId || 'SET-240827-A',
        period: '26/08 – 27/08',
        status: batchId === 'SET-240825-C' ? 'FAILED' : 'COMPLETED',
        total_gross: 128400000000,
        total_commission: 6420000000,
        total_tax: 1284000000,
        total_net: 121980000000,
        shops: [
          {
            shop_id: 'shop-01912f31',
            shop_name: 'Taca Apple Flagship Store',
            bank_masked: 'Vietcombank •••• 4838',
            gross: 4280000000,
            commission: 214000000,
            tax: 42800000,
            net: 4023200000,
            released_amount: 4023200000,
            held_amount: 0,
            status: 'RELEASED'
          },
          {
            shop_id: 'shop-01912f32',
            shop_name: 'Samsung Official Store',
            bank_masked: 'BIDV •••• 9921',
            gross: 3150000000,
            commission: 157500000,
            tax: 31500000,
            net: 2961000000,
            released_amount: 2961000000,
            held_amount: 0,
            status: 'RELEASED'
          },
          {
            shop_id: 'shop-01912f33',
            shop_name: 'Anker Official Flagship',
            bank_masked: 'Techcombank •••• 3341',
            gross: 980000000,
            commission: 49000000,
            tax: 9800000,
            net: 921200000,
            released_amount: 850000000,
            held_amount: 71200000,
            status: 'PARTIALLY_HELD'
          }
        ]
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
