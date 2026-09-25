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

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taca_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt token refresh or broadcast logout for public auth endpoints
    const isAuthEndpoint = originalRequest?.url && (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/email') ||
      originalRequest.url.includes('/auth/password')
    );

    // Handle 401 Unauthorized for protected endpoints
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      // If it's the refresh endpoint itself that failed, don't retry it to avoid infinite loop
      if (originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
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
        // Broadcast logout event so Context can pick it up
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios.post(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`, {
          refresh_token: refreshToken
        })
        .then(({ data }) => {
          const newAccessToken = data.data.tokens.access_token;
          const newRefreshToken = data.data.tokens.refresh_token;

          localStorage.setItem('taca_access_token', newAccessToken);
          localStorage.setItem('taca_refresh_token', newRefreshToken);

          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          
          processQueue(null, newAccessToken);
          resolve(apiClient(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          localStorage.removeItem('taca_access_token');
          localStorage.removeItem('taca_refresh_token');
          localStorage.removeItem('taca_user');
          window.dispatchEvent(new Event('auth:logout'));
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

export default apiClient;
