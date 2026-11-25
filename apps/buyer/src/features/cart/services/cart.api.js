import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY = 'taca_cart_items';
const CART_ID_KEY = 'taca_cart_id';
const META_CACHE_KEY = 'taca_cart_item_meta';

const ERROR_MESSAGES = {
  CART_INVALID_INPUT: 'Dữ liệu giỏ hàng không hợp lệ (số lượng từ 1 đến 999).',
  CART_UNAUTHENTICATED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  CART_FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này trên giỏ hàng.',
  CART_ITEM_NOT_FOUND: 'Sản phẩm không còn tồn tại trong giỏ hàng.',
  CART_PRODUCT_UNAVAILABLE: 'Sản phẩm hoặc phân loại này hiện không khả dụng.',
  CART_TOO_MANY_ITEMS: 'Giỏ hàng đã đạt giới hạn tối đa 100 sản phẩm.',
  CART_VERSION_CONFLICT: 'Giỏ hàng vừa được cập nhật, đang đồng bộ lại dữ liệu mới nhất.',
  CART_IDEMPOTENCY_CONFLICT: 'Thao tác bị xung đột yêu cầu, vui lòng thử lại.',
  CART_DEPENDENCY_UNAVAILABLE: 'Hệ thống kiểm tra sản phẩm/tồn kho tạm thời gián đoạn.',
  CART_STORAGE_UNAVAILABLE: 'Dịch vụ giỏ hàng tạm thời quá tải, vui lòng thử lại sau.',
  CART_INTERNAL_ERROR: 'Lỗi hệ thống giỏ hàng, vui lòng thử lại sau.',
};

const hasAccessToken = () =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('taca_access_token'));

export const getStoredCartId = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CART_ID_KEY) || null;
  } catch {
    return null;
  }
};

export const saveStoredCartId = (cartId) => {
  if (typeof window === 'undefined') return;
  try {
    if (cartId) {
      localStorage.setItem(CART_ID_KEY, String(cartId));
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const getStoredLocalCart = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredLocalCart = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch {
    // ignore storage errors
  }
};

export const getItemMetaCache = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(META_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveItemMeta = (skuId, meta) => {
  if (typeof window === 'undefined' || !skuId) return;
  try {
    const current = getItemMetaCache();
    current[String(skuId)] = {
      image: meta?.image || current[String(skuId)]?.image || '',
      shopName: meta?.shopName || current[String(skuId)]?.shopName || '',
    };
    localStorage.setItem(META_CACHE_KEY, JSON.stringify(current));
  } catch {
    // ignore storage errors
  }
};

/**
 * Map CartItemResponse từ Backend (snake_case) sang cấu trúc UI sử dụng.
 * Backend fields: item_id, product_id, sku_id, shop_id, title_snapshot,
 * sku_label_snapshot, unit_price_snapshot, quantity, line_total, available, availability_status
 */
export const mapCartItemFromApi = (raw, metaCache = {}) => {
  const itemId = String(raw?.item_id || raw?.id || '');
  const productId = String(raw?.product_id || raw?.productId || '');
  const skuId = String(raw?.sku_id || raw?.skuId || raw?.sku || '');
  const quantity = Math.max(1, Math.min(999, Math.trunc(Number(raw?.quantity) || 1)));
  const unitPrice = Number(raw?.unit_price_snapshot ?? raw?.price ?? 0);
  const lineTotal = Number(raw?.line_total ?? raw?.lineTotal ?? unitPrice * quantity);
  const availabilityStatus = raw?.availability_status || raw?.availabilityStatus || (raw?.available === false ? 'OUT_OF_STOCK' : 'AVAILABLE');
  const available = typeof raw?.available === 'boolean'
    ? raw.available
    : availabilityStatus === 'AVAILABLE' || availabilityStatus === 'STALE' || availabilityStatus === 'UNKNOWN';

  const cachedMeta = metaCache[skuId] || {};

  return {
    id: itemId,
    itemId,
    productId,
    skuId,
    sku: skuId,
    shopId: String(raw?.shop_id || raw?.shopId || ''),
    name: raw?.title_snapshot || raw?.name || 'Sản phẩm',
    variant: raw?.sku_label_snapshot || raw?.variant || 'Tiêu chuẩn',
    price: unitPrice,
    lineTotal,
    quantity,
    available,
    availabilityStatus,
    image: raw?.image || cachedMeta.image || '',
    shopName: raw?.shop_name || cachedMeta.shopName || '',
  };
};

/**
 * Tạo Idempotency-Key hợp lệ theo IdempotencyKeyValidator của BE (ASCII 33..126, length 1..128)
 */
const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `cart-${crypto.randomUUID()}`;
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Chuẩn hóa lỗi trả về từ GlobalExceptionHandler của cart-service:
 * { error: { code, message, details, trace_id } }
 */
export const normalizeCartError = (err) => {
  const status = err?.response?.status || 0;
  const apiError = err?.response?.data?.error;
  const code = apiError?.code || (status === 401 ? 'CART_UNAUTHENTICATED' : 'CART_INTERNAL_ERROR');
  const message = ERROR_MESSAGES[code] || apiError?.message || err?.message || 'Không thể kết nối dịch vụ giỏ hàng.';
  const normalized = new Error(message);
  normalized.code = code;
  normalized.status = status;
  normalized.details = apiError?.details || {};
  normalized.traceId = apiError?.trace_id || null;
  return normalized;
};

export const cartApi = {
  /**
   * Lấy giỏ hàng: GET /api/v1/cart
   * BE response: { data: { cart_id, items, item_count, updated_at }, meta: { request_id } }
   */
  getCart: async () => {
    if (!isMockMode() && hasAccessToken()) {
      try {
        const res = await apiClient.get('/cart');
        const payload = res?.data || res || {};
        const cartId = payload?.cart_id || null;
        const rawItems = Array.isArray(payload?.items) ? payload.items : [];
        const metaCache = getItemMetaCache();
        const items = rawItems.map((item) => mapCartItemFromApi(item, metaCache));

        saveStoredCartId(cartId);
        saveStoredLocalCart(items);

        return {
          data: {
            cart_id: cartId,
            items,
            item_count: items.length,
            updated_at: payload?.updated_at || null,
          },
        };
      } catch (err) {
        throw normalizeCartError(err);
      }
    }

    const localItems = getStoredLocalCart() || [];
    return {
      data: {
        cart_id: getStoredCartId(),
        items: localItems,
        item_count: localItems.length,
        updated_at: null,
      },
    };
  },

  /**
   * Thêm sản phẩm vào giỏ: POST /api/v1/cart/items
   * Strict DTO: { product_id, sku_id, quantity } (fail-on-unknown-properties: true)
   * Response 201: { data: { cart_id, item_id, quantity, line_total }, meta: { request_id } }
   */
  addItem: async (payload, idempotencyKey = createIdempotencyKey()) => {
    const productId = String(payload?.product_id || payload?.productId || '').trim();
    const skuId = String(payload?.sku_id || payload?.skuId || payload?.sku || '').trim();
    const quantity = Math.max(1, Math.min(999, Math.trunc(Number(payload?.quantity) || 1)));

    if (!productId || !skuId) {
      const invalidErr = new Error('Thiếu mã sản phẩm hoặc mã phân loại (SKU).');
      invalidErr.code = 'CART_INVALID_INPUT';
      invalidErr.status = 400;
      throw invalidErr;
    }

    const sanitizedBody = {
      product_id: productId,
      sku_id: skuId,
      quantity,
    };

    if (!isMockMode() && hasAccessToken()) {
      try {
        const res = await apiClient.post('/cart/items', sanitizedBody, {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        });
        const data = res?.data || res || {};
        if (data?.cart_id) {
          saveStoredCartId(data.cart_id);
        }
        return { data };
      } catch (err) {
        throw normalizeCartError(err);
      }
    }

    return {
      data: {
        cart_id: getStoredCartId() || 'local-cart',
        item_id: `${productId}-${skuId}`,
        quantity,
        line_total: (Number(payload?.price) || 0) * quantity,
      },
    };
  },

  /**
   * Cập nhật số lượng: PUT /api/v1/cart/items/{itemId}
   * Strict DTO: { quantity } (integer 1..999)
   * Response 200: { data: { item_id, quantity, line_total }, meta: { request_id } }
   */
  updateItemQuantity: async (itemId, quantity) => {
    const cleanQty = Math.max(1, Math.min(999, Math.trunc(Number(quantity) || 1)));

    if (!isMockMode() && hasAccessToken()) {
      try {
        const res = await apiClient.put(`/cart/items/${encodeURIComponent(itemId)}`, {
          quantity: cleanQty,
        });
        return { data: res?.data || res || {} };
      } catch (err) {
        throw normalizeCartError(err);
      }
    }

    return { data: { item_id: itemId, quantity: cleanQty } };
  },

  /**
   * Xóa mục khỏi giỏ hàng: DELETE /api/v1/cart/items/{itemId}
   * Response 204 No Content
   */
  removeItem: async (itemId) => {
    if (!isMockMode() && hasAccessToken()) {
      try {
        await apiClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
        return { data: { success: true } };
      } catch (err) {
        throw normalizeCartError(err);
      }
    }

    return { data: { success: true } };
  },

  /**
   * Dọn giỏ hàng local state (BE tự động dọn qua InternalCartController sau khi checkout)
   */
  clearCart: async () => {
    saveStoredLocalCart([]);
    saveStoredCartId(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(META_CACHE_KEY);
      } catch {
        // ignore storage errors
      }
    }
    return { data: { success: true } };
  },
};

export default cartApi;
