import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

const ADMIN_STORAGE_KEY = 'taca_user';
const ACCESS_TOKEN_KEY = 'taca_access_token';
const REFRESH_TOKEN_KEY = 'taca_refresh_token';

const DEMO_ADMIN = {
  id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
  full_name: 'Trần Hoàng',
  email: 'admin@taca.vn',
  email_verified: true,
  roles: ['ADMIN', 'SUPER_ADMIN', 'RISK_MANAGER'],
  status: 'ACTIVE',
  two_factor_enabled: true,
};

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    const hasAdminRole = user?.roles?.some((r) =>
      ['ADMIN', 'SUPER_ADMIN', 'RISK_MANAGER'].includes(r)
    );
    return hasAdminRole ? user : null;
  } catch {
    return null;
  }
};

export const hasAdminPrivilege = (user) => {
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'RISK_MANAGER'].includes(r));
};

export const signinAdmin = async ({ identifier, password }) => {
  if (isMockMode()) {
    await new Promise((res) => setTimeout(res, 350));
    const token = 'mock-admin-access-token-' + Date.now();
    const refreshToken = 'mock-admin-refresh-token-' + Date.now();
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
    window.dispatchEvent(new Event('auth:login'));
    return { user: DEMO_ADMIN, tokens: { access_token: token, refresh_token: refreshToken } };
  }

  try {
    const response = await apiClient.post('/auth/signin', {
      identifier: identifier.trim(),
      password,
      remember_me: true,
    });

    const payload = response.data || response;
    const user = payload.user || payload;
    const tokens = payload.tokens;

    if (!hasAdminPrivilege(user)) {
      throw new Error('Tài khoản này không có thẩm quyền truy cập Admin Console (Thiếu vai trò ADMIN).');
    }

    if (tokens?.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    }
    if (tokens?.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth:login'));

    return { user, tokens };
  } catch (error) {
    console.error('[AdminAuth] Signin failed:', error);
    throw error;
  }
};

export const quickDemoAdminLogin = () => {
  const token = 'mock-admin-jwt-token-' + Date.now();
  const refreshToken = 'mock-admin-refresh-token-' + Date.now();
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
  window.dispatchEvent(new Event('auth:login'));
  return DEMO_ADMIN;
};

export const signoutAdmin = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  try {
    if (!isMockMode() && refreshToken) {
      await apiClient.post('/auth/signout', {
        refresh_token: refreshToken,
        all_sessions: false,
      });
    }
  } catch (err) {
    console.warn('[AdminAuth] Signout request error, clearing local state anyway:', err);
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event('auth:logout'));
  }
};
