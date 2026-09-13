import apiClient from '../../../../../../shared/utils/api-client';

export const favoritesApi = {
  /**
   * Lấy danh sách sản phẩm yêu thích
   * @param {Object} params - Query params (page, size, sort)
   */
  getFavorites: async (params = { page: 1, size: 20, sort: 'created_at,desc' }) => {
    const response = await apiClient.get('/users/me/favorites', { params });
    return response;
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   * @param {string} productId - ID của sản phẩm
   */
  addFavorite: async (productId) => {
    const response = await apiClient.post('/users/me/favorites', { product_id: productId });
    return response;
  },

  /**
   * Bỏ sản phẩm khỏi danh sách yêu thích
   * @param {string} productId - ID của sản phẩm
   */
  removeFavorite: async (productId) => {
    const response = await apiClient.delete(`/users/me/favorites/${productId}`);
    return response;
  },

  /**
   * Kiểm tra trạng thái yêu thích của nhiều sản phẩm (batch)
   * @param {string[]} productIds - Mảng ID sản phẩm
   */
  checkFavoriteStatus: async (productIds) => {
    const response = await apiClient.get('/users/me/favorites/contains', { 
      params: { product_ids: productIds.join(',') } 
    });
    return response;
  }
};
