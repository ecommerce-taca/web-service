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

/**
 * Lấy danh sách hãng vận chuyển và so sánh biểu phí trước khi giao hàng (MISS-003)
 * @param {string} orderId
 */
export const getShipmentCarriers = async (orderId) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.get(`/seller/orders/${orderId}/shipment/carriers`);
      return res?.data || res;
    } catch (err) {
      console.warn(`Lỗi gọi API /seller/orders/${orderId}/shipment/carriers:`, err);
      // Fallback mock nếu backend chưa khởi động
    }
  }

  await new Promise((r) => setTimeout(r, 250));
  return {
    order_id: orderId,
    carriers: [
      {
        carrier: 'GHN',
        name: 'Giao Hàng Nhanh (GHN Express)',
        available: true,
        fee: 32000,
        currency: 'VND',
        estimate: { min_days: 2, max_days: 4 },
      },
      {
        carrier: 'SPX',
        name: 'Shopee Express (SPX Express)',
        available: true,
        fee: 28000,
        currency: 'VND',
        estimate: { min_days: 3, max_days: 5 },
      },
      {
        carrier: 'J&T',
        name: 'J&T Express',
        available: false,
        fee: null,
        currency: 'VND',
        estimate: null,
        unavailable_reason: 'REGION_NOT_COVERED',
      },
    ],
    quote_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
};

/**
 * Xuất danh sách đơn hàng ra file Excel hoặc CSV (MISS-006)
 * @param {Object} params - { status, from, to, format }
 */
export const exportSellerOrders = async (params = {}) => {
  const exportFormat = params.format || 'xlsx';
  if (!isMockMode()) {
    try {
      const res = await apiClient.get('/seller/orders/export', {
        params: {
          ...params,
          format: exportFormat,
        },
      });
      return res?.data || res;
    } catch (err) {
      console.warn('Lỗi gọi API /seller/orders/export:', err);
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  const currentOrders = getStoredMockOrders();
  const count = currentOrders?.items?.length || 0;

  // Tạo mock signed download URL
  return {
    export_url: `https://storage.example/signed-download/orders-export-${Date.now()}.${exportFormat}`,
    format: exportFormat,
    row_count: count,
    generated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
};

/**
 * Hủy đơn hàng phía người bán theo quy định (MISS-007)
 * @param {string} orderId
 * @param {Object} payload - { reason, version }
 */
export const cancelSellerOrder = async (orderId, { reason = 'SELLER_REQUEST', version = 1 } = {}) => {
  if (!isMockMode()) {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      const res = await apiClient.post(
        `/seller/orders/${orderId}/cancel`,
        { reason, version },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return res?.data || res;
    } catch (err) {
      console.warn(`Lỗi gọi POST /seller/orders/${orderId}/cancel:`, err);
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 350));
  const currentOrders = getStoredMockOrders();
  const updatedItems = currentOrders.items.map((item) => {
    if (item.id === orderId) {
      return {
        ...item,
        status: 'Đã hủy',
        status_type: 'cancelled',
        cancel_reason: reason,
        version: (item.version || 1) + 1,
      };
    }
    return item;
  });

  const updatedOrders = {
    ...currentOrders,
    items: updatedItems,
  };
  saveStoredMockOrders(updatedOrders);
  return {
    order_id: orderId,
    status: 'CANCELLED',
    reason,
    version: version + 1,
  };
};
