import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const USE_MOCK = isMockMode();
const STORAGE_KEY = 'taca_user_favorites';

const INITIAL_DEMO_FAVORITES = [
  {
    id: 1,
    product_id: 1,
    name: 'Apple iPhone 16 Pro Max 256GB - Titan Tự Nhiên',
    price: 29490000,
    original_price: 34990000,
    originalPrice: 34990000,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    sold: 1420,
    soldCount: 1420,
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 3,
    product_id: 3,
    name: 'Tai nghe Chống Ồn Không Dây Cao Cấp Sony WH-1000XM5',
    price: 7490000,
    original_price: 8490000,
    originalPrice: 8490000,
    discount: 11,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    sold: 920,
    soldCount: 920,
    isOfficial: true,
    tags: ['Chính hãng', 'Freeship']
  }
];

const getLocalFavorites = () => {
  if (typeof window === 'undefined') return INITIAL_DEMO_FAVORITES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_FAVORITES));
      return INITIAL_DEMO_FAVORITES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse favorites from localStorage', e);
    return INITIAL_DEMO_FAVORITES;
  }
};

const saveLocalFavorites = (favorites) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
};

export const favoritesApi = {
  /**
   * Lấy danh sách sản phẩm yêu thích
   * @param {Object} params - Query params (page, size, sort)
   */
  getFavorites: async (params = { page: 1, size: 20, sort: 'created_at,desc' }) => {
    if (!USE_MOCK) {
      try {
        const response = await apiClient.get('/users/me/favorites', { params });
        const items = response?.data || response || [];
        return {
          data: {
            data: Array.isArray(items) ? items : items.data || getLocalFavorites(),
            total: items.length || 0,
            page: params.page || 1,
            size: params.size || 20
          }
        };
      } catch (e) {
        console.warn('API Gateway favorites failed, using local storage', e);
      }
    }

    const items = getLocalFavorites();
    return {
      data: {
        data: items,
        total: items.length,
        page: params.page || 1,
        size: params.size || 20
      }
    };
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   * @param {string|number|Object} productOrId - ID hoặc Object sản phẩm
   */
  addFavorite: async (productOrId) => {
    const productId = typeof productOrId === 'object' ? productOrId.id || productOrId.product_id : productOrId;
    const current = getLocalFavorites();
    
    if (!current.some(item => String(item.id || item.product_id) === String(productId))) {
      const itemToSave = typeof productOrId === 'object' 
        ? { ...productOrId, id: productId, product_id: productId }
        : { 
            id: productId, 
            product_id: productId, 
            name: `Sản phẩm #${productId}`,
            price: 29490000,
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
            rating: 5.0,
            soldCount: 100
          };
      saveLocalFavorites([...current, itemToSave]);
    }

    if (!USE_MOCK) {
      try {
        return await apiClient.post('/users/me/favorites', { product_id: productId });
      } catch {
        return { data: { success: true } };
      }
    }

    return { data: { success: true } };
  },

  /**
   * Bỏ sản phẩm khỏi danh sách yêu thích
   * @param {string|number} productId - ID của sản phẩm
   */
  removeFavorite: async (productId) => {
    const current = getLocalFavorites();
    const updated = current.filter(item => String(item.id) !== String(productId) && String(item.product_id) !== String(productId));
    saveLocalFavorites(updated);

    if (!USE_MOCK) {
      try {
        return await apiClient.delete(`/users/me/favorites/${productId}`);
      } catch {
        return { data: { success: true } };
      }
    }

    return { data: { success: true } };
  },

  /**
   * Kiểm tra trạng thái yêu thích của danh sách sản phẩm
   * @param {Array<string|number>} productIds - Mảng ID sản phẩm
   */
  checkFavoriteStatus: async (productIds = []) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    const current = getLocalFavorites();
    const favoriteSet = new Set(current.map(i => String(i.id || i.product_id)));

    if (!USE_MOCK) {
      try {
        const response = await apiClient.get('/users/me/favorites/contains', { 
          params: { product_ids: ids.join(',') } 
        });
        return response;
      } catch {
        // Fallback to local check
        return { data: ids.filter(id => favoriteSet.has(String(id))) };
      }
    }

    return { data: ids.filter(id => favoriteSet.has(String(id))) };
  },

  /**
   * Alias tương thích với checkFavoriteStatus
   */
  checkFavorites: async (productIds = []) => {
    return favoritesApi.checkFavoriteStatus(productIds);
  }
};

export default favoritesApi;
