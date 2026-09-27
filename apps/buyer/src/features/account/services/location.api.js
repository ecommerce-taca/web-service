import apiClient from '../../../../../../shared/utils/api-client';
import vietnamAddressData from '../../../../../../shared/utils/vietnam-address.json';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 ngày theo chuẩn Cache-Control của BE

// Danh mục Tỉnh / Thành phố chuẩn hóa từ file vietnam-address.json
export const ALL_PROVINCES = vietnamAddressData.map((p) => ({
  code: String(p.province_code || p.code).padStart(2, '0'),
  name: p.name,
  short_name: p.short_name || p.name,
  place_type: p.place_type || 'Tỉnh'
}));

// Tương thích ngược với các import cũ
export const ALL_63_PROVINCES = ALL_PROVINCES;

/**
 * Lấy danh sách toàn bộ Phường / Xã của một Tỉnh / Thành phố từ file vietnam-address.json
 * @param {string} provinceCode Mã tỉnh/thành (ví dụ: '01', '79')
 * @returns {Array<{ code: string, name: string, province_code: string }>}
 */
export const getLocalWardsByProvince = (provinceCode) => {
  if (!provinceCode) return [];
  const normalized = String(provinceCode).trim().padStart(2, '0');
  const matched = vietnamAddressData.find(
    (p) => String(p.province_code).padStart(2, '0') === normalized || String(p.code) === normalized
  );
  if (!matched || !Array.isArray(matched.wards)) return [];

  return matched.wards.map((w) => ({
    code: String(w.ward_code || w.code).padStart(5, '0'),
    name: w.name,
    province_code: String(w.province_code || matched.province_code).padStart(2, '0')
  }));
};

/**
 * Tìm Tỉnh / Thành phố theo mã
 */
export const findProvinceByCode = (provinceCode) => {
  if (!provinceCode) return null;
  const normalized = String(provinceCode).trim().padStart(2, '0');
  return ALL_PROVINCES.find((p) => p.code === normalized) || null;
};

/**
 * Tìm Phường / Xã theo mã
 */
export const findWardByCode = (provinceCode, wardCode) => {
  if (!provinceCode || !wardCode) return null;
  const wards = getLocalWardsByProvince(provinceCode);
  const normalized = String(wardCode).trim().padStart(5, '0');
  return wards.find((w) => w.code === normalized) || null;
};

/**
 * Tìm Tỉnh / Thành phố theo tên (hỗ trợ load bản ghi địa chỉ cũ)
 */
export const findProvinceByName = (name) => {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  return (
    ALL_PROVINCES.find(
      (p) =>
        p.name.toLowerCase() === clean ||
        p.short_name.toLowerCase() === clean ||
        clean.includes(p.name.toLowerCase()) ||
        clean.includes(p.short_name.toLowerCase()) ||
        p.name.toLowerCase().includes(clean)
    ) || null
  );
};

/**
 * Tìm Phường / Xã theo tên (hỗ trợ load bản ghi địa chỉ cũ)
 */
export const findWardByName = (provinceCode, wardName) => {
  if (!provinceCode || !wardName) return null;
  const wards = getLocalWardsByProvince(provinceCode);
  const clean = wardName.trim().toLowerCase();
  return (
    wards.find((w) => w.name.toLowerCase() === clean) ||
    wards.find((w) => clean.includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(clean)) ||
    null
  );
};

/**
 * Định dạng chuỗi hiển thị địa chỉ đầy đủ (gồm cả fallback tên tỉnh/xã từ mã code)
 */
export const formatAddressSummary = (address) => {
  if (!address) return '';
  if (address.detail_address) return address.detail_address;

  let wardName = address.ward;
  let provName = address.province;

  if (!provName && address.province_code) {
    const p = findProvinceByCode(address.province_code);
    if (p) provName = p.name;
  }

  if (!wardName && address.province_code && address.ward_code) {
    const w = findWardByCode(address.province_code, address.ward_code);
    if (w) wardName = w.name;
  }

  return [
    address.line1,
    address.line2,
    wardName,
    address.district, // Hiển thị district nếu có từ dữ liệu cũ
    provName,
    address.country_code === 'VN' ? 'Việt Nam' : (address.country || 'Việt Nam')
  ]
    .filter(Boolean)
    .join(', ');
};

const getCache = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
    sessionStorage.removeItem(key);
  } catch {
    // Bỏ qua lỗi truy cập storage
  }
  return null;
};

const setCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Bỏ qua lỗi bộ nhớ
  }
};

export const locationApi = {
  /**
   * Lấy danh sách Tỉnh / Thành phố: GET /locations/vn/provinces
   * Caching 1 ngày theo chuẩn Cache-Control của Backend.
   * Đọc fallback trực tiếp từ file vietnam-address.json.
   * @returns {Promise<Array<{ code: string, name: string, short_name: string, place_type: string }>>}
   */
  getProvinces: async () => {
    const cacheKey = 'taca_vn_provinces_v4';

    // Xóa cache cũ nếu có
    try {
      sessionStorage.removeItem('taca_vn_provinces');
      sessionStorage.removeItem('taca_vn_provinces_v1');
      sessionStorage.removeItem('taca_vn_provinces_v2');
      sessionStorage.removeItem('taca_vn_provinces_v3');
    } catch {
      // ignore
    }

    const cached = getCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    try {
      const response = await apiClient.get('/locations/vn/provinces');
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];
      if (list.length > 0) {
        const normalized = list.map((p) => ({
          code: String(p.code || p.province_code).padStart(2, '0'),
          name: p.name,
          short_name: p.short_name || p.name,
          place_type: p.place_type || 'Tỉnh'
        }));
        setCache(cacheKey, normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Backend /locations/vn/provinces chưa phản hồi, sử dụng dữ liệu từ vietnam-address.json:', err?.message);
    }

    setCache(cacheKey, ALL_PROVINCES);
    return ALL_PROVINCES;
  },

  /**
   * Lấy danh sách Phường / Xã của một Tỉnh / Thành phố: GET /locations/vn/provinces/{provinceCode}/wards
   * Caching 1 ngày theo chuẩn Cache-Control của Backend.
   * Đọc fallback trực tiếp từ file vietnam-address.json.
   * @param {string} provinceCode Mã tỉnh/thành
   * @returns {Promise<Array<{ code: string, name: string, province_code: string }>>}
   */
  getWards: async (provinceCode) => {
    if (!provinceCode) return [];
    const normalized = String(provinceCode).trim();
    const provCode = normalized.padStart(2, '0');

    const cacheKey = `taca_vn_wards_v4_${provCode}`;
    const cached = getCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    try {
      const response = await apiClient.get(`/locations/vn/provinces/${provCode}/wards`);
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];
      if (list.length > 0) {
        const normalized = list.map((w) => ({
          code: String(w.code || w.ward_code).padStart(5, '0'),
          name: w.name,
          province_code: String(w.province_code || provCode).padStart(2, '0')
        }));
        setCache(cacheKey, normalized);
        return normalized;
      }
    } catch (err) {
      console.warn(`Backend /locations/vn/provinces/${provCode}/wards chưa phản hồi, sử dụng dữ liệu từ vietnam-address.json:`, err?.message);
    }

    const fallbackWards = getLocalWardsByProvince(provCode);
    if (fallbackWards.length > 0) {
      setCache(cacheKey, fallbackWards);
    }
    return fallbackWards;
  },

  findProvinceByCode,
  findWardByCode,
  findProvinceByName,
  findWardByName,
  formatAddressSummary
};
