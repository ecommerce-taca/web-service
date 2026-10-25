import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

const STORAGE_KEY_VOUCHERS = 'taca_admin_vouchers';

const INITIAL_MOCK_VOUCHERS = [
  {
    voucher_id: 'vch-01912fc7',
    code: 'TACA200K',
    title: 'Giảm 200.000₫ cho đơn từ 2.000.000₫',
    scope: 'PLATFORM',
    discount_type: 'FIXED',
    value: 200000,
    min_order: 2000000,
    usage_limit: 1000,
    used_count: 812,
    status: 'ACTIVE',
    starts_at: '2026-08-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    version: 1,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    voucher_id: 'vch-01912fc8',
    code: 'FREESHIPMAX',
    title: 'Miễn phí vận chuyển tối đa 30.000₫ cho đơn từ 150.000₫',
    scope: 'FREESHIP',
    discount_type: 'FIXED',
    value: 30000,
    min_order: 150000,
    usage_limit: 5000,
    used_count: 3240,
    status: 'ACTIVE',
    starts_at: '2026-08-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    version: 1,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    voucher_id: 'vch-01912fc9',
    code: 'TACA10PCT',
    title: 'Giảm 10% cho đơn từ 500.000₫ toàn sàn',
    scope: 'PLATFORM',
    discount_type: 'PERCENT',
    value: 10,
    min_order: 500000,
    usage_limit: 2000,
    used_count: 1420,
    status: 'ACTIVE',
    starts_at: '2026-09-01T00:00:00Z',
    expires_at: '2026-11-30T23:59:59Z',
    version: 1,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    voucher_id: 'vch-01912fd0',
    code: 'TACA9SALE',
    title: 'Siêu Sale 9.9 - Giảm 8% đơn từ 5.000.000₫',
    scope: 'PLATFORM',
    discount_type: 'PERCENT',
    value: 8,
    min_order: 5000000,
    usage_limit: 500,
    used_count: 500,
    status: 'EXPIRED',
    starts_at: '2026-09-09T00:00:00Z',
    expires_at: '2026-09-09T16:59:59Z',
    version: 1,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    voucher_id: 'vch-01912fd1',
    code: 'TACASUMMER',
    title: 'Khuyến mãi Hè Rực Rỡ 100K',
    scope: 'PLATFORM',
    discount_type: 'FIXED',
    value: 100000,
    min_order: 1000000,
    usage_limit: 500,
    used_count: 120,
    status: 'INACTIVE',
    starts_at: '2026-06-01T00:00:00Z',
    expires_at: '2026-07-31T23:59:59Z',
    version: 1,
    created_at: '2026-06-01T08:00:00Z',
  },
];

const getStoredVouchers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOUCHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(INITIAL_MOCK_VOUCHERS));
      return [...INITIAL_MOCK_VOUCHERS];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[AdminVoucherApi] Error reading stored vouchers:', err);
    return [...INITIAL_MOCK_VOUCHERS];
  }
};

const saveStoredVouchers = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(list));
  } catch (err) {
    console.warn('[AdminVoucherApi] Error saving stored vouchers:', err);
  }
};

export const adminVoucherApi = {
  /**
   * Danh sách voucher toàn sàn: GET /admin/vouchers (#24, order-commerce.md §3.8)
   * Query: status?, code?, scope?, page?, size?
   */
  getAdminVouchers: async (params = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/admin/vouchers', { params });
        return response?.data;
      } catch (err) {
        console.warn('API Gateway GET /admin/vouchers failed, falling back to mock:', err);
      }
    }

    const { status, code, scope, page = 1, size = 20 } = params;
    let list = getStoredVouchers();

    if (status && status !== 'ALL') {
      list = list.filter((v) => v.status === status);
    }
    if (scope && scope !== 'ALL') {
      list = list.filter((v) => v.scope === scope);
    }
    if (code) {
      const q = code.toUpperCase();
      list = list.filter((v) => v.code.toUpperCase().includes(q) || v.title?.toUpperCase().includes(q));
    }

    const total = list.length;
    const startIdx = (page - 1) * size;
    const paginated = list.slice(startIdx, startIdx + size);

    return {
      data: paginated,
      meta: {
        page: Number(page),
        size: Number(size),
        total,
        total_pages: Math.ceil(total / size) || 1,
        active_count: getStoredVouchers().filter((v) => v.status === 'ACTIVE').length,
        freeship_count: getStoredVouchers().filter((v) => v.scope === 'FREESHIP' && v.status === 'ACTIVE').length,
        total_redemptions: getStoredVouchers().reduce((sum, v) => sum + (v.used_count || 0), 0),
      },
    };
  },

  /**
   * Tạo voucher toàn sàn mới: POST /admin/vouchers (#23, order-commerce.md §3.8)
   * Quyền: VOUCHER_MANAGE + header 2FA: X-MFA-Step-Up
   */
  createAdminVoucher: async (payload, stepUpToken = '') => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.post('/admin/vouchers', payload, { headers });
      return response?.data;
    }

    const list = getStoredVouchers();
    const existing = list.find((v) => v.code.toUpperCase() === payload.code.toUpperCase());
    if (existing) {
      const err = new Error(`Mã voucher '${payload.code}' đã tồn tại trên hệ thống.`);
      err.response = { data: { error: { code: 'ORDER_VOUCHER_CODE_EXISTS', message: err.message } } };
      throw err;
    }

    const newVoucher = {
      voucher_id: `vch-${Date.now().toString(36)}`,
      code: payload.code.toUpperCase(),
      title: payload.title || `Voucher ${payload.code.toUpperCase()}`,
      scope: payload.scope || 'PLATFORM', // PLATFORM | FREESHIP
      discount_type: payload.discount_type || 'FIXED', // FIXED | PERCENT
      value: Number(payload.value) || 0,
      min_order: Number(payload.min_order) || 0,
      usage_limit: Number(payload.usage_limit) || 1000,
      used_count: 0,
      status: 'ACTIVE',
      starts_at: payload.starts_at || new Date().toISOString(),
      expires_at: payload.expires_at,
      version: 1,
      created_at: new Date().toISOString(),
    };

    list.unshift(newVoucher);
    saveStoredVouchers(list);

    return {
      data: newVoucher,
      meta: { request_id: `req-vch-${Date.now()}` },
    };
  },

  /**
   * Cập nhật voucher toàn sàn: PUT /admin/vouchers/{voucherId} (#25, order-commerce.md §3.8)
   * Quyền: VOUCHER_MANAGE + header 2FA: X-MFA-Step-Up
   */
  updateAdminVoucher: async (voucherId, payload, stepUpToken = '') => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.put(`/admin/vouchers/${voucherId}`, payload, { headers });
      return response?.data;
    }

    const list = getStoredVouchers();
    const idx = list.findIndex((v) => v.voucher_id === voucherId);
    if (idx < 0) {
      const err = new Error('Không tìm thấy voucher.');
      err.response = { data: { error: { code: 'ORDER_VOUCHER_NOT_FOUND', message: err.message } } };
      throw err;
    }

    const updated = {
      ...list[idx],
      ...payload,
      code: payload.code ? payload.code.toUpperCase() : list[idx].code,
      version: (list[idx].version || 1) + 1,
      updated_at: new Date().toISOString(),
    };

    list[idx] = updated;
    saveStoredVouchers(list);

    return {
      data: updated,
      meta: { request_id: `req-vch-${Date.now()}` },
    };
  },

  /**
   * Dừng phát hành / Ngừng kích hoạt voucher: DELETE /admin/vouchers/{voucherId} (#26, order-commerce.md §3.8)
   * Soft archive/inactivate
   * Body: { version } + header 2FA: X-MFA-Step-Up
   */
  deleteAdminVoucher: async (voucherId, { version = 1 } = {}, stepUpToken = '') => {
    if (!isMockMode()) {
      const headers = stepUpToken ? { 'X-MFA-Step-Up': stepUpToken } : {};
      const response = await apiClient.delete(`/admin/vouchers/${voucherId}`, {
        data: { version },
        headers,
      });
      return response?.data;
    }

    const list = getStoredVouchers();
    const target = list.find((v) => v.voucher_id === voucherId);
    if (target) {
      target.status = 'INACTIVE';
      target.version = (target.version || 1) + 1;
      target.deactivated_at = new Date().toISOString();
      saveStoredVouchers(list);
    }

    return {
      data: {
        voucher_id: voucherId,
        status: 'INACTIVE',
      },
      meta: { request_id: `req-vch-${Date.now()}` },
    };
  },
};

export default adminVoucherApi;
