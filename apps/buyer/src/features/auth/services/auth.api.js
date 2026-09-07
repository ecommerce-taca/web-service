import apiClient from '../../../../../shared/utils/api-client';

export const authApi = {
  login: async (credentials) => {
    // credentials contains identifier and password
    const response = await apiClient.post('/auth/signin', credentials);
    return response;
  },

  register: async (userData) => {
    // userData contains full_name, email, password, and optionally phone
    const response = await apiClient.post('/auth/signup', userData);
    return response;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('taca_refresh_token');
    if (refreshToken) {
      await apiClient.post('/auth/signout', { refresh_token: refreshToken });
    }
  }
};
