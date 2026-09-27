import apiClient from '../../../../../../shared/utils/api-client';
import vietnamProvincesData from '../../../../../../shared/utils/vietnam_provinces.json';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 ngày theo chuẩn Cache-Control của BE

// Chuyển đổi đầy đủ 63 Tỉnh / Thành phố từ file JSON ở FE (shared/utils/vietnam_provinces.json)
export const ALL_63_PROVINCES = vietnamProvincesData.map((p) => {
  const code = String(p.c).padStart(2, '0');
  const name = p.n;
  const isCity = name.startsWith('Thành phố');
  const shortName = name.replace(/^(Thành phố|Tỉnh)\s+/i, '');
  const placeType = isCity ? 'Thành phố Trung ương' : 'Tỉnh';
  return {
    code,
    name,
    short_name: shortName,
    place_type: placeType
  };
});

// Lấy danh sách Quận / Huyện theo Tỉnh / Thành phố
export const getLocalDistrictsByProvince = (provinceCode) => {
  if (!provinceCode) return [];
  const normalized = String(provinceCode).trim();
  const matched = vietnamProvincesData.find(
    (p) => String(p.c) === normalized || String(p.c).padStart(2, '0') === normalized.padStart(2, '0')
  );
  if (!matched || !Array.isArray(matched.d)) return [];

  const provCode = String(matched.c).padStart(2, '0');
  return matched.d.map((district) => ({
    code: String(district.c),
    name: district.n,
    province_code: provCode
  }));
};

// Lấy danh sách Phường / Xã theo Quận / Huyện
export const getLocalWardsByDistrict = (provinceCode, districtCode) => {
  if (!provinceCode || !districtCode) return [];
  const normProv = String(provinceCode).trim();
  const matchedProv = vietnamProvincesData.find(
    (p) => String(p.c) === normProv || String(p.c).padStart(2, '0') === normProv.padStart(2, '0')
  );
  if (!matchedProv || !Array.isArray(matchedProv.d)) return [];

  const normDist = String(districtCode).trim();
  const matchedDist = matchedProv.d.find(
    (d) => String(d.c) === normDist || d.n === normDist
  );
  if (!matchedDist || !Array.isArray(matchedDist.w)) return [];

  const provCode = String(matchedProv.c).padStart(2, '0');
  const distCode = String(matchedDist.c);

  return matchedDist.w.map((ward) => ({
    code: String(ward.c).padStart(5, '0'),
    name: ward.n,
    district_code: distCode,
    district_name: matchedDist.n,
    province_code: provCode
  }));
};

// Tìm Quận / Huyện tương ứng với một Phường / Xã (hỗ trợ khi load edit địa chỉ)
export const findDistrictByWard = (provinceCode, wardCode, wardName) => {
  if (!provinceCode) return null;
  const normProv = String(provinceCode).trim();
  const matchedProv = vietnamProvincesData.find(
    (p) => String(p.c) === normProv || String(p.c).padStart(2, '0') === normProv.padStart(2, '0')
  );
  if (!matchedProv || !Array.isArray(matchedProv.d)) return null;

  const targetCode = wardCode ? String(wardCode).padStart(5, '0') : '';
  const targetName = wardName ? String(wardName).trim() : '';

  for (const d of matchedProv.d) {
    if (!Array.isArray(d.w)) continue;
    const found = d.w.some((w) => {
      if (targetCode && String(w.c).padStart(5, '0') === targetCode) return true;
      if (targetName && (w.n === targetName || targetName.includes(w.n))) return true;
      return false;
    });
    if (found) {
      return {
        code: String(d.c),
        name: d.n
      };
    }
  }
  return null;
};

// Trích xuất toàn bộ Phường / Xã của một Tỉnh / Thành phố từ file JSON ở FE (flat list)
export const getLocalWardsByProvince = (provinceCode) => {
  if (!provinceCode) return [];
  const normalized = String(provinceCode).trim();
  const matched = vietnamProvincesData.find(
    (p) => String(p.c) === normalized || String(p.c).padStart(2, '0') === normalized.padStart(2, '0')
  );
  if (!matched || !Array.isArray(matched.d)) return [];

  const provCode = String(matched.c).padStart(2, '0');
  return matched.d.flatMap((district) => {
    if (!Array.isArray(district.w)) return [];
    return district.w.map((ward) => ({
      code: String(ward.c).padStart(5, '0'),
      name: ward.n,
      district_code: String(district.c),
      district_name: district.n,
      province_code: provCode
    }));
  });
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
    // Bỏ qua lỗi đầy bộ nhớ
  }
};

export const locationApi = {
  /**
   * Lấy danh sách toàn bộ 63 Tỉnh / Thành phố Việt Nam: GET /locations/vn/provinces
   * Caching 1 ngày theo chuẩn BE.
   * Đảm bảo luôn trả về đầy đủ 63 tỉnh/thành từ file JSON FE nếu BE chưa có hoặc trả về thiếu (7-8 tỉnh mẫu).
   * @returns {Promise<Array<{ code: string, name: string, short_name: string, place_type: string }>>}
   */
  getProvinces: async () => {
    const cacheKey = 'taca_vn_provinces_v2';

    // Xóa bộ nhớ cache cũ (nếu từng cache 7-8 tỉnh trước đó)
    try {
      sessionStorage.removeItem('taca_vn_provinces');
      sessionStorage.removeItem('taca_vn_provinces_v1');
    } catch {
      // Bỏ qua
    }

    const cached = getCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length >= 63) {
      return cached;
    }

    try {
      const response = await apiClient.get('/locations/vn/provinces');
      const list = response?.data || response || [];
      // Chỉ sử dụng dữ liệu từ BE nếu có đầy đủ ít nhất 63 tỉnh/thành
      if (Array.isArray(list) && list.length >= 63) {
        setCache(cacheKey, list);
        return list;
      }
    } catch (err) {
      console.warn('Backend /locations/vn/provinces chưa phản hồi, sử dụng dữ liệu 63 tỉnh thành từ FE:', err?.message);
    }

    setCache(cacheKey, ALL_63_PROVINCES);
    return ALL_63_PROVINCES;
  },

  /**
   * Lấy danh sách Quận / Huyện của một Tỉnh / Thành phố
   * @param {string} provinceCode Mã tỉnh/thành
   * @returns {Promise<Array<{ code: string, name: string, province_code: string }>>}
   */
  getDistricts: async (provinceCode) => {
    if (!provinceCode) return [];
    return getLocalDistrictsByProvince(provinceCode);
  },

  /**
   * Lấy danh sách Phường / Xã theo Quận / Huyện (hoặc theo Tỉnh nếu không truyền districtCode)
   * @param {string} provinceCode Mã tỉnh/thành
   * @param {string} [districtCode] Mã quận/huyện
   * @returns {Promise<Array<{ code: string, name: string, province_code: string, district_code?: string }>>}
   */
  getWards: async (provinceCode, districtCode = null) => {
    if (!provinceCode) return [];
    if (districtCode) {
      return getLocalWardsByDistrict(provinceCode, districtCode);
    }

    const normalized = String(provinceCode).trim();
    const provCode = normalized.padStart(2, '0');

    const cacheKey = `taca_vn_wards_v2_${provCode}`;
    const cached = getCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    try {
      const response = await apiClient.get(`/locations/vn/provinces/${provCode}/wards`);
      const list = response?.data || response || [];
      if (Array.isArray(list) && list.length > 0) {
        setCache(cacheKey, list);
        return list;
      }
    } catch (err) {
      console.warn(`Backend /wards cho tỉnh ${provCode} chưa phản hồi, sử dụng dữ liệu xã phường từ FE:`, err?.message);
    }

    const fallbackWards = getLocalWardsByProvince(provCode);
    if (fallbackWards.length > 0) {
      setCache(cacheKey, fallbackWards);
    }
    return fallbackWards;
  },

  /**
   * Tìm Quận / Huyện tương ứng từ mã/tên xã phường
   */
  findDistrictByWard: (provinceCode, wardCode, wardName) => {
    return findDistrictByWard(provinceCode, wardCode, wardName);
  }
};
