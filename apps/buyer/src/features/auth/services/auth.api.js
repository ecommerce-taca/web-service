import apiClient from '../../../../../../shared/utils/api-client';

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
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/email/verify', { token });
    return response;
  },

  resendEmailVerification: async () => {
    const response = await apiClient.post('/auth/email/resend', { purpose: 'EMAIL_VERIFY' });
    return response;
  },

  requestPhoneOtp: async (phone) => {
    const response = await apiClient.post('/auth/phone/request-otp', { phone });
    return response;
  },

  verifyPhoneOtp: async (challenge_id, otp) => {
    const response = await apiClient.post('/auth/phone/verify-otp', { challenge_id, otp });
    return response;
  },

  forgotPassword: async (identifier) => {
    // API docs did not specify exactly, but usually it's email or phone
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { phone: identifier };
    const response = await apiClient.post('/auth/password/forgot', payload);
    return response;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/password/reset', { token, password: newPassword });
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response;
  },

  updateProfile: async (data) => {
    // data contains full_name, date_of_birth, etc.
    const response = await apiClient.put('/users/me', data);
    return response;
  }
};
