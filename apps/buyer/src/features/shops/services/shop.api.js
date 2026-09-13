import apiClient from '../../../../../../shared/utils/api-client';

export const shopApi = {
  /**
   * Theo dõi một cửa hàng
   * @param {string} shopId - ID của cửa hàng
   */
  followShop: async (shopId) => {
    const response = await apiClient.post(`/shops/${shopId}/follow`);
    return response;
  },

  /**
   * Bỏ theo dõi một cửa hàng
   * @param {string} shopId - ID của cửa hàng
   */
  unfollowShop: async (shopId) => {
    const response = await apiClient.delete(`/shops/${shopId}/follow`);
    return response;
  },

  /**
   * Lấy danh sách các cửa hàng đang theo dõi
   * @param {Object} params - Query params (page, size, sort)
   */
  getFollowingShops: async (params = { page: 1, size: 20, sort: 'created_at,desc' }) => {
    const response = await apiClient.get('/users/me/following', { params });
    return response;
  },

  /**
   * Lấy số lượng người theo dõi cửa hàng
   * @param {string} shopId - ID của cửa hàng
   */
  getShopFollowerCount: async (shopId) => {
    const response = await apiClient.get(`/shops/${shopId}/followers/count`);
    return response;
  },

  /**
   * Lấy thông tin hồ sơ công khai của cửa hàng
   * @param {string} shopIdOrSlug - ID hoặc Slug của cửa hàng
   */
  getShopProfile: async (shopIdOrSlug) => {
    const response = await apiClient.get(`/shops/${shopIdOrSlug}`);
    return response;
  }
};
