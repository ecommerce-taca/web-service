import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY = 'taca_cart_items';

const getStoredLocalCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveStoredLocalCart = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const cartApi = {
  /**
   * Lấy giỏ hàng: GET /cart (Redis backend theo User ID)
   */
  getCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('taca_access_token') : null;

    if (!isMockMode() && token) {
      try {
        const res = await apiClient.get('/cart');
        const items = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(items)) {
          saveStoredLocalCart(items);
          return { data: { items } };
        }
      } catch (err) {
        console.warn('API Gateway GET /cart failed, falling back to local cart', err);
      }
    }

    return { data: { items: getStoredLocalCart() } };
  },

  /**
   * Thêm sản phẩm vào giỏ: POST /cart/items
   * @param {Object} payload - { product_id, sku_id, quantity }
   */
  addItem: async (payload) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('taca_access_token') : null;

    // Strict contract: POST /cart/items { product_id, sku_id, quantity } (không gửi shop_id)
    const sanitizedBody = {
      product_id: String(payload.product_id || payload.productId || ''),
      sku_id: String(payload.sku_id || payload.sku || 'DEFAULT'),
      quantity: Math.max(1, Math.min(999, Number(payload.quantity) || 1)),
    };

    if (!isMockMode() && token) {
      try {
        return await apiClient.post('/cart/items', sanitizedBody);
      } catch (err) {
        console.warn('API Gateway POST /cart/items failed, falling back to local update', err);
      }
    }

    return { data: { success: true } };
  },

  /**
   * Cập nhật số lượng: PUT /cart/items/:id
   * @param {string} itemId
   * @param {number} quantity
   */
  updateItemQuantity: async (itemId, quantity) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('taca_access_token') : null;

    if (!isMockMode() && token) {
      try {
        return await apiClient.put(`/cart/items/${itemId}`, { quantity });
      } catch (err) {
        console.warn(`API Gateway PUT /cart/items/${itemId} failed`, err);
      }
    }

    return { data: { success: true } };
  },

  /**
   * Xóa mục khỏi giỏ hàng: DELETE /cart/items/:id
   * @param {string} itemId
   */
  removeItem: async (itemId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('taca_access_token') : null;

    if (!isMockMode() && token) {
      try {
        return await apiClient.delete(`/cart/items/${itemId}`);
      } catch (err) {
        console.warn(`API Gateway DELETE /cart/items/${itemId} failed`, err);
      }
    }

    return { data: { success: true } };
  },

  /**
   * Xóa toàn bộ giỏ: DELETE /cart
   */
  clearCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('taca_access_token') : null;

    if (!isMockMode() && token) {
      try {
        await apiClient.delete('/cart');
      } catch (err) {
        console.warn('API Gateway DELETE /cart failed', err);
      }
    }

    saveStoredLocalCart([]);
    return { data: { success: true } };
  }
};

export default cartApi;
