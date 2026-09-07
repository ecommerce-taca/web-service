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

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
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

          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
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

    return Promise.reject(error.response?.data?.error || error);
  }
);

export default apiClient;
