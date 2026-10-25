import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setAuthHeader = (requestConfig, token) => {
  if (!requestConfig) return;
  if (!requestConfig.headers) {
    requestConfig.headers = {};
  }
  if (typeof requestConfig.headers.set === 'function') {
    requestConfig.headers.set('Authorization', `Bearer ${token}`);
  } else {
    requestConfig.headers['Authorization'] = `Bearer ${token}`;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taca_access_token');
    if (token) {
      setAuthHeader(config, token);
    } else if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Authorization');
      } else {
        delete config.headers['Authorization'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Do not attempt token refresh or broadcast logout for public auth endpoints
    const isAuthEndpoint = originalRequest?.url && (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/email') ||
      originalRequest.url.includes('/auth/password') ||
      originalRequest.url.includes('/auth/signout')
    );

    // Handle 401 Unauthorized for protected endpoints
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest?._retry) {
      // If it's the refresh endpoint itself that failed, don't retry it to avoid infinite loop
      if (originalRequest?.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          setAuthHeader(originalRequest, token);
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('taca_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        // Broadcast logout event so Context and other tabs can pick it up
        broadcastAuthLogout();
        return Promise.reject(error);
      }

      // Handle mock refresh when running in mock mode or with mock tokens
      if (isMockMode() || refreshToken.startsWith('mock-')) {
        const newAccessToken = 'mock-access-token-' + Date.now();
        localStorage.setItem('taca_access_token', newAccessToken);
        setAuthHeader(originalRequest, newAccessToken);
        processQueue(null, newAccessToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      }

      return new Promise((resolve, reject) => {
        axios.post(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`, {
          refresh_token: refreshToken
        })
        .then(({ data }) => {
          // Hỗ trợ cả 2 chuẩn response envelope: { data: { tokens: { access_token } } } và { tokens: { ... } }
          const payload = data?.data || data;
          const tokens = payload?.tokens || payload;
          const newAccessToken = tokens?.access_token || data?.access_token;
          const newRefreshToken = tokens?.refresh_token || data?.refresh_token || refreshToken;

          if (!newAccessToken) {
            throw new Error('AUTH_REFRESH_TOKEN_INVALID: Không tìm thấy access_token trong response.');
          }

          localStorage.setItem('taca_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('taca_refresh_token', newRefreshToken);
          }

          setAuthHeader(originalRequest, newAccessToken);
          
          processQueue(null, newAccessToken);
          resolve(apiClient(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          localStorage.removeItem('taca_access_token');
          localStorage.removeItem('taca_refresh_token');
          localStorage.removeItem('taca_user');
          broadcastAuthLogout();
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Phát tín hiệu đăng xuất đồng bộ trên cả cửa sổ hiện tại và toàn bộ các tab khác
 */
export const broadcastAuthLogout = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('auth:logout'));
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('taca_auth_channel');
      channel.postMessage({ type: 'AUTH_LOGOUT' });
      channel.close();
    } catch {
      // Fallback nếu trình duyệt chặn
    }
  }
};

// Lắng nghe sự kiện đăng xuất từ các tab khác (Cross-Tab Synchronization)
if (typeof window !== 'undefined') {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const authChannel = new BroadcastChannel('taca_auth_channel');
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'AUTH_LOGOUT') {
          window.dispatchEvent(new Event('auth:logout'));
        }
      };
    } catch {
      // Ignore
    }
  }

  // Fallback qua storage event khi token bị xóa từ tab khác
  window.addEventListener('storage', (e) => {
    if (e.key === 'taca_access_token' && !e.newValue) {
      window.dispatchEvent(new Event('auth:logout'));
    }
  });
}

export const isMockMode = () => {
  const flag = import.meta.env.VITE_USE_MOCK;
  if (flag === 'true' || flag === true) return true;
  if (flag === 'false' || flag === false) return false;
  if (typeof window !== 'undefined' && localStorage.getItem('taca_force_mock') === 'true') return true;
  return false;
};

export default apiClient;
