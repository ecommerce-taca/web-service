import apiClient from '../../../../../../shared/utils/api-client';

/**
 * Kiểm tra xem ứng dụng có đang chạy ở chế độ Mock hay không.
 * - Ưu tiên đọc biến môi trường VITE_USE_MOCK trong file .env
 * - Cho phép tester ép bật/tắt nhanh bằng localStorage.setItem('taca_force_mock', 'true' | 'false')
 */
export const isMockMode = () => {
  if (typeof window !== 'undefined') {
    const forceMock = localStorage.getItem('taca_force_mock');
    if (forceMock === 'true') return true;
    if (forceMock === 'false') return false;
  }
  return import.meta.env.VITE_USE_MOCK === 'true';
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Lấy danh sách tài khoản Mock đã đăng ký và kích hoạt trong localStorage
const getMockUsers = () => {
  const data = localStorage.getItem('taca_mock_users');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  const initialUsers = [
    {
      id: '01912f31-7a1b-7c12-9c55-8b1c34a6d001',
      full_name: 'Nguyễn Minh Anh',
      email: 'test@taca.vn',
      phone: '+84909123456',
      password: 'Password123456@',
      email_verified: true,
      phone_verified: false,
      date_of_birth: '1995-01-01'
    },
    {
      id: '01912f31-7a1b-7c12-9c55-8b1c34a6d002',
      full_name: 'Tài Khoản Chưa Kích Hoạt',
      email: 'unverified@taca.vn',
      phone: '+84909888999',
      password: 'Password123456@',
      email_verified: false,
      phone_verified: false,
      date_of_birth: '1998-05-15'
    }
  ];
  localStorage.setItem('taca_mock_users', JSON.stringify(initialUsers));
  return initialUsers;
};

const saveMockUsers = (users) => {
  localStorage.setItem('taca_mock_users', JSON.stringify(users));
};

// Lấy danh sách đăng ký chờ xác thực email qua link (Pending)
const getMockPending = () => {
  const data = localStorage.getItem('taca_mock_pending');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return [];
};

const saveMockPending = (list) => {
  localStorage.setItem('taca_mock_pending', JSON.stringify(list));
};

export const authApi = {
  /**
   * Đăng nhập: POST /auth/signin
   * Hỗ trợ cả Mock và Backend thật qua API Gateway
   */
  login: async (credentials) => {
    if (isMockMode()) {
      await delay(600);
      const rawId = (credentials.identifier || '').trim().toLowerCase();
      const isEmail = rawId.includes('@');

      // 1. Kiểm tra danh sách người dùng đang chờ kích hoạt email (pending)
      const pendings = getMockPending();
      const pendingUser = pendings.find(p => {
        if (isEmail) return (p.email || '').toLowerCase() === rawId;
        const cleanUserPhone = (p.phone || '').replace(/\D/g, '');
        const cleanInputPhone = rawId.replace(/\D/g, '');
        return cleanUserPhone && cleanInputPhone && cleanUserPhone.endsWith(cleanInputPhone.slice(-9));
      });

      if (pendingUser) {
        const err = new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.');
        err.response = {
          status: 403,
          data: {
            error: {
              code: 'AUTH_EMAIL_NOT_VERIFIED',
              message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.'
            }
          }
        };
        throw err;
      }

      // 2. Tìm trong danh sách users chính thức
      const users = getMockUsers();
      const user = users.find(u => {
        if (isEmail) {
          return (u.email || '').toLowerCase() === rawId;
        }
        const cleanUserPhone = (u.phone || '').replace(/\D/g, '');
        const cleanInputPhone = rawId.replace(/\D/g, '');
        return cleanUserPhone && cleanInputPhone && cleanUserPhone.endsWith(cleanInputPhone.slice(-9));
      });

      if (!user) {
        const err = new Error('Email/Số điện thoại hoặc mật khẩu không chính xác.');
        err.response = {
          status: 401,
          data: {
            error: {
              code: 'AUTH_INVALID_CREDENTIALS',
              message: 'Email/Số điện thoại hoặc mật khẩu không chính xác.'
            }
          }
        };
        throw err;
      }

      // 3. Kiểm tra trạng thái xác thực email
      if (user.email_verified === false) {
        const err = new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.');
        err.response = {
          status: 403,
          data: {
            error: {
              code: 'AUTH_EMAIL_NOT_VERIFIED',
              message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.'
            }
          }
        };
        throw err;
      }

      // 4. Kiểm tra mật khẩu
      if (user.password && credentials.password !== user.password) {
        const err = new Error('Email/Số điện thoại hoặc mật khẩu không chính xác.');
        err.response = {
          status: 401,
          data: {
            error: {
              code: 'AUTH_INVALID_CREDENTIALS',
              message: 'Email/Số điện thoại hoặc mật khẩu không chính xác.'
            }
          }
        };
        throw err;
      }

      return {
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
            date_of_birth: user.date_of_birth
          },
          tokens: {
            token_type: 'Bearer',
            access_token: `mock_access_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            expires_in: 900
          }
        }
      };
    }

    // Kết nối Backend thật
    const payload = {
      identifier: credentials.identifier,
      password: credentials.password,
      remember_me: credentials.remember_me !== false
    };
    const response = await apiClient.post('/auth/signin', payload);
    const loggedUser = response.data?.user || response.user;
    if (loggedUser && loggedUser.email_verified === false) {
      const err = new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.');
      err.response = {
        status: 403,
        data: {
          error: {
            code: 'AUTH_EMAIL_NOT_VERIFIED',
            message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.'
          }
        }
      };
      throw err;
    }
    return response;
  },

  /**
   * Đăng ký tài khoản: POST /auth/signup
   * Tạo tài khoản với email_verified: false và gửi link kích hoạt đến email
   */
  register: async (userData) => {
    if (isMockMode()) {
      await delay(700);
      const users = getMockUsers();
      const targetEmail = (userData.email || '').trim().toLowerCase();

      // Kiểm tra email đã đăng ký và kích hoạt chưa
      const existingUser = users.find(u => (u.email || '').toLowerCase() === targetEmail);
      if (existingUser && existingUser.email_verified) {
        const err = new Error('Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.');
        err.response = {
          status: 409,
          data: {
            error: {
              code: 'AUTH_EMAIL_EXISTS',
              message: 'Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.'
            }
          }
        };
        throw err;
      }

      // Tạo mã token xác thực cho link gửi về email
      const verifyToken = `mock_token_${Date.now()}`;
      const pendings = getMockPending();
      const filtered = pendings.filter(p => (p.email || '').toLowerCase() !== targetEmail);

      const pendingUser = {
        id: `01912f31-7a1b-7c12-9c55-${Date.now().toString().slice(-12)}`,
        full_name: userData.full_name,
        email: targetEmail,
        phone: userData.phone || '',
        password: userData.password,
        email_verified: false,
        token: verifyToken,
        created_at: Date.now()
      };

      filtered.push(pendingUser);
      saveMockPending(filtered);

      return {
        data: {
          user: {
            id: pendingUser.id,
            full_name: pendingUser.full_name,
            email: targetEmail,
            email_verified: false,
            phone: userData.phone || '',
            phone_verified: false,
            roles: ['BUYER'],
            status: 'ACTIVE'
          },
          verification: {
            email_sent: true,
            expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            token: verifyToken // Token link phục vụ kiểm thử tiện lợi trong Mock mode
          }
        }
      };
    }

    // Kết nối Backend thật: chỉ gửi phone nếu người dùng có nhập
    const payload = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      ...(userData.phone && userData.phone.trim() ? { phone: userData.phone.trim() } : {})
    };
    const response = await apiClient.post('/auth/signup', payload);
    return response;
  },

  /**
   * Đăng xuất: POST /auth/signout
   */
  logout: async () => {
    if (isMockMode()) {
      await delay(200);
      return;
    }
    const refreshToken = localStorage.getItem('taca_refresh_token');
    if (refreshToken) {
      await apiClient.post('/auth/signout', { refresh_token: refreshToken });
    }
  },

  /**
   * Xác thực Email qua đường link (token): POST /auth/email/verify
   * Request body: { token: "..." }
   */
  verifyEmail: async (token) => {
    if (isMockMode()) {
      await delay(900);
      const cleanToken = String(token || '').trim();

      if (!cleanToken || cleanToken === 'error') {
        const err = new Error('Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.');
        err.response = {
          status: 400,
          data: {
            error: {
              code: 'AUTH_VERIFICATION_INVALID',
              message: 'Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.'
            }
          }
        };
        throw err;
      }

      const pendings = getMockPending();
      const pendingIndex = pendings.findIndex(p => p.token === cleanToken);

      if (pendingIndex !== -1) {
        const pendingUser = pendings[pendingIndex];
        const activatedUser = {
          id: pendingUser.id,
          full_name: pendingUser.full_name,
          email: pendingUser.email,
          phone: pendingUser.phone,
          password: pendingUser.password,
          email_verified: true,
          phone_verified: false,
          date_of_birth: ''
        };

        const users = getMockUsers();
        const updatedUsers = users.filter(u => (u.email || '').toLowerCase() !== (pendingUser.email || '').toLowerCase());
        updatedUsers.push(activatedUser);
        saveMockUsers(updatedUsers);

        // Xóa khỏi pending
        pendings.splice(pendingIndex, 1);
        saveMockPending(pendings);

        return {
          data: {
            user_id: activatedUser.id,
            email_verified: true,
            verified_at: new Date().toISOString(),
            user: {
              id: activatedUser.id,
              full_name: activatedUser.full_name,
              email: activatedUser.email,
              phone: activatedUser.phone,
              email_verified: true,
              phone_verified: false
            }
            // Không trả về tokens theo chuẩn Section 2.5 auth-user.md
          }
        };
      }

      const err = new Error('Đường dẫn xác thực không hợp lệ, đã hết hạn hoặc đã được sử dụng.');
      err.response = {
        status: 400,
        data: {
          error: {
            code: 'AUTH_VERIFICATION_INVALID',
            message: 'Đường dẫn xác thực không hợp lệ, đã hết hạn hoặc đã được sử dụng.'
          }
        }
      };
      throw err;
    }

    // Kết nối Backend thật theo đặc tả API
    const response = await apiClient.post('/auth/email/verify', { token });
    return response;
  },

  /**
   * Gửi lại email xác thực: POST /auth/email/resend
   */
  resendEmailVerification: async () => {
    if (isMockMode()) {
      await delay(700);
      const savedUser = localStorage.getItem('taca_user');
      let currentUser = null;
      try {
        currentUser = savedUser ? JSON.parse(savedUser) : null;
      } catch {
        // ignore
      }
      if (currentUser?.email_verified) {
        const err = new Error('Tài khoản này đã được xác thực trước đó.');
        err.response = {
          status: 409,
          data: {
            error: {
              code: 'AUTH_VERIFICATION_ALREADY_COMPLETE',
              message: 'Tài khoản này đã được xác thực trước đó.'
            }
          }
        };
        throw err;
      }
      return {
        data: {
          accepted: true,
          expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
        }
      };
    }

    const response = await apiClient.post('/auth/email/resend', {
      purpose: 'EMAIL_VERIFY'
    });
    return response;
  },

  requestPhoneOtp: async (phone) => {
    if (isMockMode()) {
      await delay(700);
      return { data: { challenge_id: 'mock_challenge_123' } };
    }
    const response = await apiClient.post('/auth/phone/request-otp', { phone });
    return response;
  },

  verifyPhoneOtp: async (challenge_id, otp) => {
    if (isMockMode()) {
      await delay(700);
      if (otp !== '123456') {
        const err = new Error('Mã OTP không đúng. Hãy nhập 123456 để test.');
        err.response = { status: 400, data: { message: 'Mã OTP không đúng. Hãy nhập 123456 để test.' } };
        throw err;
      }
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/phone/verify-otp', { challenge_id, otp });
    return response;
  },

  forgotPassword: async (identifier) => {
    if (isMockMode()) {
      await delay(700);
      return { data: { success: true } };
    }
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { phone: identifier };
    const response = await apiClient.post('/auth/password/forgot', payload);
    return response;
  },

  resetPassword: async (token, newPassword) => {
    if (isMockMode()) {
      await delay(700);
      return { data: { success: true } };
    }
    const response = await apiClient.post('/auth/password/reset', { token, password: newPassword });
    return response;
  },

  getProfile: async () => {
    if (isMockMode()) {
      await delay(400);
      const savedUser = localStorage.getItem('taca_user');
      if (!savedUser) {
        const err = new Error('Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập.');
        err.response = {
          status: 401,
          data: {
            error: {
              code: 'AUTH_UNAUTHORIZED',
              message: 'Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập.'
            }
          }
        };
        throw err;
      }
      return {
        data: { user: JSON.parse(savedUser) }
      };
    }
    const response = await apiClient.get('/users/me');
    return response;
  },

  updateProfile: async (data) => {
    if (isMockMode()) {
      await delay(700);
      const savedUser = localStorage.getItem('taca_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : { id: '01912f31-7a1b-7c12-9c55-8b1c34a6d001', email_verified: true, phone_verified: true };
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('taca_user', JSON.stringify(updatedUser));
      return { data: { user: updatedUser } };
    }
    const response = await apiClient.put('/users/me', data);
    return response;
  }
};
