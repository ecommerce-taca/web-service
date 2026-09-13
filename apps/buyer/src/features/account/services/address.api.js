

// Mock data
let mockAddresses = [
  {
    id: 'addr-1',
    name: 'Nguyễn Minh Anh',
    phone: '0909 123 456',
    detail_address: '28 Nguyễn Huệ, Quận 1, TP.HCM',
    is_default: true
  }
];

export const addressApi = {
  /**
   * Lấy danh sách địa chỉ
   */
  getAddresses: async () => {
    // const response = await apiClient.get('/users/me/addresses', { params });
    // return response;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: { data: mockAddresses } });
      }, 300);
    });
  },

  /**
   * Thêm mới địa chỉ
   * @param {Object} data - Dữ liệu địa chỉ
   */
  addAddress: async (data) => {
    // const response = await apiClient.post('/users/me/addresses', data);
    // return response;
    return new Promise(resolve => {
      setTimeout(() => {
        const newAddress = { id: Date.now().toString(), ...data };
        if (data.is_default) {
          mockAddresses.forEach(a => a.is_default = false);
        }
        mockAddresses.push(newAddress);
        resolve({ data: newAddress });
      }, 300);
    });
  },

  /**
   * Cập nhật địa chỉ
   * @param {string} addressId - ID của địa chỉ
   * @param {Object} data - Dữ liệu cập nhật
   */
  updateAddress: async (addressId, data) => {
    // const response = await apiClient.put(`/users/me/addresses/${addressId}`, data);
    // return response;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockAddresses.findIndex(a => a.id === addressId);
        if (idx !== -1) {
          if (data.is_default) {
            mockAddresses.forEach(a => a.is_default = false);
          }
          mockAddresses[idx] = { ...mockAddresses[idx], ...data };
          resolve({ data: mockAddresses[idx] });
        } else {
          reject(new Error('Address not found'));
        }
      }, 300);
    });
  },

  /**
   * Xóa mềm địa chỉ
   * @param {string} addressId - ID của địa chỉ
   */
  deleteAddress: async (addressId) => {
    // const response = await apiClient.delete(`/users/me/addresses/${addressId}`);
    // return response;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockAddresses.findIndex(a => a.id === addressId);
        if (idx !== -1) {
          mockAddresses.splice(idx, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Address not found'));
        }
      }, 300);
    });
  }
};
