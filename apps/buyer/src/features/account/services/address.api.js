import apiClient from '../../../../../../shared/utils/api-client';

export const addressApi = {
  /**
   * Lấy danh sách địa chỉ
   * @param {Object} params - Query params (page, size, sort)
   */
  getAddresses: async (params = { page: 1, size: 20, sort: 'created_at,desc' }) => {
    const response = await apiClient.get('/users/me/addresses', { params });
    return response;
  },

  /**
   * Thêm mới địa chỉ
   * @param {Object} data - Dữ liệu địa chỉ
   */
  addAddress: async (data) => {
    const response = await apiClient.post('/users/me/addresses', data);
    return response;
  },

  /**
   * Cập nhật địa chỉ
   * @param {string} addressId - ID của địa chỉ
   * @param {Object} data - Dữ liệu cập nhật
   */
  updateAddress: async (addressId, data) => {
    const response = await apiClient.put(`/users/me/addresses/${addressId}`, data);
    return response;
  },

  /**
   * Xóa mềm địa chỉ
   * @param {string} addressId - ID của địa chỉ
   */
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/users/me/addresses/${addressId}`);
    return response;
  }
};
