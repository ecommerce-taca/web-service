import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

const STORAGE_KEY_SELLER_VOUCHERS = 'taca_seller_vouchers_data';

const getStoredMockVouchers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELLER_VOUCHERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Lỗi đọc mock vouchers từ localStorage:', err);
  }
  return SELLER_MOCK_DATA.vouchers;
};

const saveStoredMockVouchers = (vouchersData) => {
  try {
    localStorage.setItem(STORAGE_KEY_SELLER_VOUCHERS, JSON.stringify(vouchersData));
  } catch (err) {
    console.warn('Lỗi ghi mock vouchers vào localStorage:', err);
  }
};

/**
 * Lấy danh sách voucher của cửa hàng
 * @param {Object} params - { status, page, size, search }
 */
export const getSellerVouchers = async (params = {}) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.get('/seller/vouchers', { params });
      return res?.data || res;
    } catch (err) {
      console.warn('Không thể kết nối API /seller/vouchers, chuyển sang mock fallback:', err);
    }
  }

  await new Promise((r) => setTimeout(r, 200));

  const currentVouchers = getStoredMockVouchers();
  const { status, search } = params;

  let items = [...currentVouchers.items];

  if (status && status !== 'all') {
    items = items.filter((item) => item.status_type === status);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }

  return {
    metrics: currentVouchers.metrics,
    items,
    total: items.length,
    page: params.page || 1,
    size: params.size || 20,
  };
};

/**
 * Tạo mới voucher cho cửa hàng
 * @param {Object} voucherData
 */
export const createSellerVoucher = async (voucherData) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.post('/seller/vouchers', voucherData);
      return res?.data || res;
    } catch (err) {
      console.warn('Lỗi khi gọi POST /seller/vouchers:', err);
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  const currentVouchers = getStoredMockVouchers();

  const newVoucher = {
    code: voucherData.code || `PROMO_${Date.now()}`,
    name: voucherData.name || 'Voucher khuyến mãi',
    type: voucherData.discountType === 'FIXED' ? 'Giảm theo đơn' : 'Phần trăm',
    discount: voucherData.discountValue || '300.000 ₫',
    condition: `Đơn từ ${voucherData.minOrder || '0 ₫'}`,
    used: 0,
    total: 1000,
    time_range: voucherData.dateRange || '20/08 – 31/08',
    status: 'Đang chạy',
    status_type: 'active',
  };

  const updatedVouchers = {
    ...currentVouchers,
    items: [newVoucher, ...currentVouchers.items],
  };

  saveStoredMockVouchers(updatedVouchers);
  return newVoucher;
};
