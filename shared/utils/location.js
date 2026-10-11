import vietnamAddressData from './vietnam-address.json';

/**
 * Danh mục Tỉnh / Thành phố chuẩn hóa từ vietnam-address.json
 */
export const ALL_PROVINCES = vietnamAddressData.map((p) => ({
  code: String(p.province_code || p.code).padStart(2, '0'),
  name: p.name,
  short_name: p.short_name || p.name,
  place_type: p.place_type || 'Tỉnh',
}));

/**
 * Lấy danh sách toàn bộ Phường / Xã của một Tỉnh / Thành phố
 * @param {string} provinceCode Mã tỉnh/thành (ví dụ: '01', '79')
 * @returns {Array<{ code: string, name: string, province_code: string }>}
 */
export const getWardsByProvince = (provinceCode) => {
  if (!provinceCode) return [];
  const normalized = String(provinceCode).trim().padStart(2, '0');
  const matched = vietnamAddressData.find(
    (p) => String(p.province_code).padStart(2, '0') === normalized || String(p.code) === normalized
  );
  if (!matched || !Array.isArray(matched.wards)) return [];

  return matched.wards.map((w) => ({
    code: String(w.ward_code || w.code).padStart(5, '0'),
    name: w.name,
    province_code: String(w.province_code || matched.province_code).padStart(2, '0'),
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
  const wards = getWardsByProvince(provinceCode);
  const normalized = String(wardCode).trim().padStart(5, '0');
  return wards.find((w) => w.code === normalized) || null;
};

/**
 * Tìm Tỉnh / Thành phố theo tên
 */
export const findProvinceByName = (name) => {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  return (
    ALL_PROVINCES.find(
      (p) =>
        p.name.toLowerCase() === clean ||
        p.short_name.toLowerCase() === clean ||
        p.name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '') === clean.replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '')
    ) || null
  );
};

/**
 * Tìm Phường / Xã theo tên
 */
export const findWardByName = (provinceCode, wardName) => {
  if (!provinceCode || !wardName) return null;
  const wards = getWardsByProvince(provinceCode);
  const clean = wardName.trim().toLowerCase();
  return (
    wards.find(
      (w) =>
        w.name.toLowerCase() === clean ||
        w.name.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '') === clean.replace(/^(phường|xã|thị trấn)\s+/i, '')
    ) || null
  );
};

export default {
  ALL_PROVINCES,
  getWardsByProvince,
  findProvinceByCode,
  findWardByCode,
  findProvinceByName,
  findWardByName,
};
