import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_FAVORITES = [
  {
    id: 'FAV_1',
    product_id: 'PROD_1',
    name: 'Điện thoại iPhone 16 Pro Max 256GB',
    price: 34990000,
    original_price: 35990000,
    image: 'https://via.placeholder.com/200',
    stock_status: 'IN_STOCK',
    rating: 4.9,
    sold: 1200
  },
  {
    id: 'FAV_2',
    product_id: 'PROD_2',
    name: 'Tai nghe Bluetooth Apple AirPods Pro 2',
    price: 5990000,
    original_price: 6190000,
    image: 'https://via.placeholder.com/200',
    stock_status: 'IN_STOCK',
    rating: 4.8,
    sold: 3400
  },
  {
    id: 'FAV_3',
    product_id: 'PROD_3',
    name: 'Ốp lưng iPhone 16 Pro Max Magsafe Silicone',
    price: 1490000,
    original_price: 1490000,
    image: 'https://via.placeholder.com/200',
    stock_status: 'OUT_OF_STOCK',
    rating: 4.5,
    sold: 800
  }
];

export const favoritesApi = {
  getFavorites: async (params = {}) => {
    if (USE_MOCK) {
      await delay(800);
      return {
        data: {
          data: MOCK_FAVORITES,
          total: MOCK_FAVORITES.length,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
    return apiClient.get('/users/me/favorites', { params });
  },

  addFavorite: async (productId) => {
    if (USE_MOCK) {
      await delay(500);
      return { data: { success: true } };
    }
    return apiClient.post('/users/me/favorites', { product_id: productId });
  },

  removeFavorite: async (productId) => {
    if (USE_MOCK) {
      await delay(500);
      return { data: { success: true } };
    }
    return apiClient.delete(`/users/me/favorites/${productId}`);
  },

  checkFavorites: async (productIds) => {
    if (USE_MOCK) {
      await delay(300);
      const result = {};
      productIds.forEach(id => {
        result[id] = MOCK_FAVORITES.some(f => f.product_id === id);
      });
      return { data: result };
    }
    // Tham số có thể truyền qua query string dạng ?ids=1,2,3 hoặc body tùy thiết kế API
    return apiClient.get('/users/me/favorites/contains', { params: { ids: productIds.join(',') } });
  }
};
