import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = true; // Đã tắt Mock

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials) => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        data: {
          user: { id: 1, full_name: 'Nguyễn Minh Anh (Mock)', email: credentials.identifier.includes('@') ? credentials.identifier : '', phone: credentials.identifier.includes('@') ? '' : credentials.identifier, email_verified: false, phone_verified: false },
          tokens: { access_token: 'mock_access', refresh_token: 'mock_refresh' }
        }
      };
    }
    const response = await apiClient.post('/auth/signin', credentials);
    return response;
  },

  register: async (userData) => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        data: {
          user: { id: 1, full_name: userData.full_name, email: userData.email || '', phone: userData.phone || '', email_verified: false, phone_verified: false },
          tokens: { access_token: 'mock_access', refresh_token: 'mock_refresh' }
        }
      };
    }
    const response = await apiClient.post('/auth/signup', userData);
    return response;
  },

  logout: async () => {
    if (USE_MOCK) {
      await delay(500);
      return;
    }
    const refreshToken = localStorage.getItem('taca_refresh_token');
    if (refreshToken) {
      await apiClient.post('/auth/signout', { refresh_token: refreshToken });
    }
  },

  verifyEmail: async (token) => {
    if (USE_MOCK) {
      await delay(1500);
      if (token === 'error') throw new Error('Mã xác thực sai hoặc hết hạn');
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/email/verify', { token });
    return response;
  },

  resendEmailVerification: async () => {
    if (USE_MOCK) {
      await delay(1500);
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/email/resend', { purpose: 'EMAIL_VERIFY' });
    return response;
  },

  requestPhoneOtp: async (phone) => {
    if (USE_MOCK) {
      await delay(1500);
      return { data: { challenge_id: 'mock_challenge_123' } };
    }
    const response = await apiClient.post('/auth/phone/request-otp', { phone });
    return response;
  },

  verifyPhoneOtp: async (challenge_id, otp) => {
    if (USE_MOCK) {
      await delay(1500);
      if (otp !== '123456') throw new Error('Mã OTP không đúng. Hãy nhập 123456 để test.');
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/phone/verify-otp', { challenge_id, otp });
    return response;
  },

  forgotPassword: async (identifier) => {
    if (USE_MOCK) {
      await delay(1000);
      return { data: { success: true } };
    }
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { phone: identifier };
    const response = await apiClient.post('/auth/password/forgot', payload);
    return response;
  },

  resetPassword: async (token, newPassword) => {
    if (USE_MOCK) {
      await delay(1000);
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/password/reset', { token, password: newPassword });
    return response;
  },

  getProfile: async () => {
    if (USE_MOCK) {
      await delay(500);
      const savedUser = localStorage.getItem('taca_user');
      const user = savedUser ? JSON.parse(savedUser) : { id: 1, full_name: 'Nguyễn Minh Anh (Mock)', email: 'test@taca.vn', phone: '0909 123 456', email_verified: false, phone_verified: false, date_of_birth: '1995-01-01' };
      return {
        data: { user }
      };
    }
    const response = await apiClient.get('/users/me');
    return response;
  },

  updateProfile: async (data) => {
    if (USE_MOCK) {
      await delay(1000);
      const savedUser = localStorage.getItem('taca_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : { id: 1, email_verified: false, phone_verified: true };
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('taca_user', JSON.stringify(updatedUser));
      return { data: { user: updatedUser } };
    }
    const response = await apiClient.put('/users/me', data);
    return response;
  }
};
