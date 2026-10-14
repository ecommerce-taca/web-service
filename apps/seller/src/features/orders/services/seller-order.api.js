import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

const STORAGE_KEY_SELLER_ORDERS = 'taca_seller_orders_data';

const getStoredMockOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELLER_ORDERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Lỗi đọc mock orders từ localStorage:', err);
  }
  return SELLER_MOCK_DATA.orders;
};

const saveStoredMockOrders = (ordersData) => {
  try {
    localStorage.setItem(STORAGE_KEY_SELLER_ORDERS, JSON.stringify(ordersData));
  } catch (err) {
    console.warn('Lỗi ghi mock orders vào localStorage:', err);
  }
};

/**
 * Lấy danh sách đơn hàng cho người bán
 * @param {Object} params - { status, page, size, search }
 */
export const getSellerOrders = async (params = {}) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.get('/seller/orders', { params });
      return res?.data || res;
    } catch (err) {
      console.warn('Không thể gọi API /seller/orders từ backend, chuyển sang mock data:', err);
    }
  }

  // Giả lập độ trễ mạng trong môi trường Mock
  await new Promise((r) => setTimeout(r, 200));

  const currentOrders = getStoredMockOrders();
  const { status, search } = params;

  let items = [...currentOrders.items];

  if (status && status !== 'all') {
    items = items.filter((item) => item.status_type === status);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q)
    );
  }

  return {
    metrics: currentOrders.metrics,
    items,
    total: items.length,
    page: params.page || 1,
    size: params.size || 20,
  };
};

/**
 * Lấy chi tiết đơn hàng
 * @param {string} orderId
 */
export const getSellerOrderById = async (orderId) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.get(`/seller/orders/${orderId}`);
      return res?.data || res;
    } catch (err) {
      console.warn(`Lỗi gọi API /seller/orders/${orderId}, chuyển sang mock fallback:`, err);
    }
  }

  const currentOrders = getStoredMockOrders();
  const found = currentOrders.items.find((item) => item.id === orderId);
  if (!found) {
    throw new Error(`Không tìm thấy đơn hàng ${orderId}`);
  }
  return found;
};

/**
 * Xử lý hoặc bàn giao vận chuyển đơn hàng (SLA Fulfill)
 * @param {string} orderId
 * @param {Object} payload - { action: 'ACCEPT'|'SHIP', carrier, version }
 */
export const fulfillSellerOrder = async (orderId, { action = 'ACCEPT', carrier, version = 1 } = {}) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.patch(`/seller/orders/${orderId}/fulfill`, {
        action,
        carrier,
        version,
      });
      return res?.data || res;
    } catch (err) {
      console.warn(`Lỗi gọi PATCH /seller/orders/${orderId}/fulfill:`, err);
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  const currentOrders = getStoredMockOrders();
  const updatedItems = currentOrders.items.map((item) => {
    if (item.id === orderId) {
      if (action === 'SHIP') {
        return {
          ...item,
          status: 'Đang giao',
          status_type: 'shipping',
          carrier: carrier || item.carrier,
          sla: 'Đang giao',
        };
      }
      return {
        ...item,
        status: 'Chuẩn bị hàng',
        status_type: 'preparing',
        carrier: carrier || item.carrier,
      };
    }
    return item;
  });

  const updatedOrders = {
    ...currentOrders,
    items: updatedItems,
  };
  saveStoredMockOrders(updatedOrders);
  return { success: true, orderId, action, carrier };
};

/**
 * Xác nhận đơn hàng hàng loạt
 * @param {Array<string>} orderIds
 */
export const bulkAcceptSellerOrders = async (orderIds = []) => {
  if (!isMockMode()) {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const res = await apiClient.post(
        '/seller/orders/bulk-accept',
        { order_ids: orderIds },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return res?.data || res;
    } catch (err) {
      console.warn('Lỗi gọi API /seller/orders/bulk-accept:', err);
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 400));
  const currentOrders = getStoredMockOrders();
  const updatedItems = currentOrders.items.map((item) => {
    if (orderIds.includes(item.id)) {
      return {
        ...item,
        status: 'Chuẩn bị hàng',
        status_type: 'preparing',
      };
    }
    return item;
  });

  const updatedOrders = {
    ...currentOrders,
    items: updatedItems,
  };
  saveStoredMockOrders(updatedOrders);
  return { success: true, count: orderIds.length };
};
