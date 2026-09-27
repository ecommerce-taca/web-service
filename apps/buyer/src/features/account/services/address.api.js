import apiClient from '../../../../../../shared/utils/api-client';
import { ALL_PROVINCES, getLocalWardsByProvince } from './location.api';

const isMockMode = () => {
  if (typeof window !== 'undefined') {
    const forceMock = localStorage.getItem('taca_force_mock');
    if (forceMock === 'true') return true;
    if (forceMock === 'false') return false;
  }
  return import.meta.env.VITE_USE_MOCK === 'true';
};

const resolveMockLocationNames = (provinceCode, wardCode) => {
  const normProv = String(provinceCode || '').padStart(2, '0');
  const normWard = String(wardCode || '').padStart(5, '0');
  const prov = ALL_PROVINCES.find((p) => p.code === normProv);
  const wards = getLocalWardsByProvince(normProv);
  const ward = wards.find((w) => w.code === normWard);
  return {
    province: prov?.name || 'Việt Nam',
    district: null,
    ward: ward?.name || ''
  };
};

const getStoredMockAddresses = () => {
  try {
    const stored = localStorage.getItem('taca_mock_addresses');
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  const defaultList = [
    {
      id: '01912f4b-7a1b-7c12-9c55-8b1c34a6d001',
      recipient: 'Nguyễn Minh Anh',
      phone: '+84909123456',
      line1: '28 Nguyễn Huệ',
      line2: 'Tòa nhà Bitexco',
      country_code: 'VN',
      province_code: '79',
      province: 'Thành phố Hồ Chí Minh',
      ward_code: '26740',
      ward: 'Phường Bến Nghé',
      district: null,
      postal_code: '700000',
      is_default: true,
      created_at: '2026-08-30T09:10:00Z',
      updated_at: '2026-08-30T09:10:00Z'
    }
  ];
  localStorage.setItem('taca_mock_addresses', JSON.stringify(defaultList));
  return defaultList;
};

const saveStoredMockAddresses = (addresses) => {
  try {
    localStorage.setItem('taca_mock_addresses', JSON.stringify(addresses));
  } catch {
    // ignore
  }
};

export const addressApi = {
  /**
   * Lấy danh sách địa chỉ: GET /users/me/addresses
   */
  getAddresses: async () => {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: { data: getStoredMockAddresses() } };
    }
    const response = await apiClient.get('/users/me/addresses');
    return response;
  },

  /**
   * Thêm mới địa chỉ: POST /users/me/addresses
   * Payload theo chuẩn BE:
   * {
   *   recipient, phone, line1, line2, country_code: "VN",
   *   province_code, ward_code, postal_code, is_default
   * }
   */
  addAddress: async (data) => {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const addresses = getStoredMockAddresses();
      if (data.is_default) {
        addresses.forEach(a => { a.is_default = false; });
      }
      const names = resolveMockLocationNames(data.province_code, data.ward_code);
      const newAddress = {
        id: 'addr_' + Date.now(),
        recipient: data.recipient,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        country_code: 'VN',
        province_code: data.province_code,
        province: names.province,
        ward_code: data.ward_code,
        ward: names.ward,
        district: names.district,
        postal_code: data.postal_code || null,
        is_default: Boolean(data.is_default),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      addresses.push(newAddress);
      saveStoredMockAddresses(addresses);
      return { data: newAddress };
    }
    const response = await apiClient.post('/users/me/addresses', data);
    return response;
  },

  /**
   * Cập nhật địa chỉ: PUT /users/me/addresses/{addressId}
   */
  updateAddress: async (addressId, data) => {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const addresses = getStoredMockAddresses();
      const idx = addresses.findIndex(a => a.id === addressId);
      if (idx !== -1) {
        if (data.is_default) {
          addresses.forEach(a => { a.is_default = false; });
        }
        const names = resolveMockLocationNames(data.province_code, data.ward_code);
        addresses[idx] = {
          ...addresses[idx],
          recipient: data.recipient,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || null,
          province_code: data.province_code,
          province: names.province,
          ward_code: data.ward_code,
          ward: names.ward,
          district: names.district,
          postal_code: data.postal_code || null,
          is_default: Boolean(data.is_default),
          updated_at: new Date().toISOString()
        };
        saveStoredMockAddresses(addresses);
        return { data: addresses[idx] };
      }
      throw new Error('Không tìm thấy địa chỉ.');
    }
    const response = await apiClient.put(`/users/me/addresses/${addressId}`, data);
    return response;
  },

  /**
   * Xóa mềm địa chỉ: DELETE /users/me/addresses/{addressId}
   */
  deleteAddress: async (addressId) => {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let addresses = getStoredMockAddresses();
      const wasDefault = addresses.find(a => a.id === addressId)?.is_default;
      addresses = addresses.filter(a => a.id !== addressId);
      if (wasDefault && addresses.length > 0) {
        addresses[0].is_default = true;
      }
      saveStoredMockAddresses(addresses);
      return { success: true };
    }
    const response = await apiClient.delete(`/users/me/addresses/${addressId}`);
    return response;
  }
};
