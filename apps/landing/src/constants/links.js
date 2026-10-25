// Landing page chạy ở cổng riêng nên mọi link vào cửa hàng phải là URL tuyệt đối tới shell.
// Cấu hình bằng VITE_STORE_URL; mặc định là shell khi chạy local.
const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

export const storeUrl = (path = '/') => `${STORE_URL}${path}`;

export const searchUrl = (keyword) =>
  storeUrl(keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/search');
