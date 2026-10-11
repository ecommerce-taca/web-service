import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

const DEMO_SELLER_USER = {
  id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
  full_name: 'Nguyễn Minh Anh',
  email: 'minhanh@example.com',
  phone: '+84901234567',
  roles: ['BUYER', 'SELLER'],
  default_shop_id: '01912f49-7a1b-7c12-9c55-8b1c34a6d921',
};

export const getSellerUser = () => {
  try {
    const raw = localStorage.getItem('taca_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const token = localStorage.getItem('taca_access_token');
  if (token) return DEMO_SELLER_USER;
  return null;
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('taca_access_token'));
};

export const signinSeller = async ({ identifier, password, remember_me = true }) => {
  if (!isMockMode()) {
    try {
      const res = await apiClient.post('/auth/signin', {
        identifier,
        password,
        remember_me,
      });

      const payload = res?.data || res;
      const user = payload?.user || res?.user || DEMO_SELLER_USER;
      const tokens = payload?.tokens || payload;
      const accessToken = tokens?.access_token || payload?.access_token;
      const refreshToken = tokens?.refresh_token || payload?.refresh_token;

      if (accessToken) {
        localStorage.setItem('taca_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('taca_refresh_token', refreshToken);
        }
        localStorage.setItem('taca_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth:login'));
      }
      return { user, tokens: { access_token: accessToken, refresh_token: refreshToken } };
    } catch (err) {
      console.warn('Backend signin failed, fallbacking if in dev environment:', err);
      throw err;
    }
  }

  // Mock signin mode
  await new Promise((r) => setTimeout(r, 350));
  const mockToken = `mock_seller_access_${Date.now()}`;
  localStorage.setItem('taca_access_token', mockToken);
  localStorage.setItem('taca_refresh_token', `mock_seller_refresh_${Date.now()}`);
  localStorage.setItem('taca_user', JSON.stringify(DEMO_SELLER_USER));
  window.dispatchEvent(new Event('auth:login'));

  return {
    user: DEMO_SELLER_USER,
    tokens: { access_token: mockToken, refresh_token: 'mock_refresh' },
  };
};

export const quickDemoLogin = () => {
  const mockToken = `mock_seller_access_${Date.now()}`;
  localStorage.setItem('taca_access_token', mockToken);
  localStorage.setItem('taca_refresh_token', `mock_seller_refresh_${Date.now()}`);
  localStorage.setItem('taca_user', JSON.stringify(DEMO_SELLER_USER));
  window.dispatchEvent(new Event('auth:login'));
  return DEMO_SELLER_USER;
};

export const signoutSeller = async () => {
  const refreshToken = localStorage.getItem('taca_refresh_token');
  try {
    if (!isMockMode() && refreshToken) {
      await apiClient.post('/auth/signout', { refresh_token: refreshToken });
    }
  } catch (err) {
    console.error('Lỗi khi signout:', err);
  } finally {
    localStorage.removeItem('taca_access_token');
    localStorage.removeItem('taca_refresh_token');
    localStorage.removeItem('taca_user');
    localStorage.removeItem('taca_seller_kyc_documents');
    localStorage.removeItem('taca_seller_onboarding_data');
    localStorage.removeItem('taca_seller_shop_data');
    window.dispatchEvent(new Event('auth:logout'));
  }
};
