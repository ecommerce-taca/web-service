import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import { addressApi } from '../services/address.api';
import { locationApi } from '../services/location.api';
import { formatPhoneDisplay, toBackendPhone, isValidVietnamesePhone } from '../../../../../../shared/utils/phone';

const AddressFormModal = ({ isOpen, onClose, addressData, onSuccess }) => {
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!addressData;

  // 1. Tải danh mục Tỉnh / Thành phố khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await locationApi.getProvinces();
        if (isMounted) {
          setProvinces(data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách tỉnh thành:', err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    };

    loadProvinces();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Điền form khi modal mở hoặc addressData thay đổi
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    if (isEdit && addressData) {
      setRecipient(addressData.recipient || addressData.name || '');
      setPhone(formatPhoneDisplay(addressData.phone || ''));
      setLine1(addressData.line1 || addressData.detail_address || '');
      setLine2(addressData.line2 || '');
      setPostalCode(addressData.postal_code || '');
      setIsDefault(Boolean(addressData.is_default));

      let initProvinceCode = addressData.province_code ? String(addressData.province_code).padStart(2, '0') : '';
      let initWardCode = addressData.ward_code ? String(addressData.ward_code).padStart(5, '0') : '';

      // Tương thích ngược: nếu bản ghi cũ chỉ có tên province
      if (!initProvinceCode && addressData.province) {
        const provMatch = locationApi.findProvinceByName(addressData.province);
        if (provMatch) {
          initProvinceCode = provMatch.code;
        }
      }

      setProvinceCode(initProvinceCode);

      if (initProvinceCode) {
        setLoadingWards(true);
        locationApi
          .getWards(initProvinceCode)
          .then((wardList) => {
            const wList = wardList || [];
            setWards(wList);

            // Tương thích ngược: nếu chưa có ward_code nhưng có tên ward
            if (!initWardCode && addressData.ward) {
              const wMatch = locationApi.findWardByName(initProvinceCode, addressData.ward);
              if (wMatch) {
                initWardCode = wMatch.code;
              }
            }
            setWardCode(initWardCode || '');
          })
          .catch((err) => {
            console.error('Lỗi khởi tạo phường xã:', err);
          })
          .finally(() => {
            setLoadingWards(false);
          });
      } else {
        setWards([]);
        setWardCode('');
      }
    } else {
      setRecipient('');
      setPhone('');
      setLine1('');
      setLine2('');
      setProvinceCode('');
      setWardCode('');
      setWards([]);
      setPostalCode('');
      setIsDefault(false);
    }
  }, [isOpen, addressData, isEdit]);

  // 3. Xử lý khi người dùng chọn Tỉnh / Thành phố
  const handleProvinceChange = async (nextProvinceCode) => {
    setProvinceCode(nextProvinceCode);
    setWardCode(''); // Bắt buộc: reset ward khi đổi tỉnh/thành
    setWards([]);

    if (!nextProvinceCode) return;

    setLoadingWards(true);
    try {
      const wardList = await locationApi.getWards(nextProvinceCode);
      setWards(wardList || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phường xã:', err);
      setError('Không thể tải danh sách phường/xã. Vui lòng thử lại.');
    } finally {
      setLoadingWards(false);
    }
  };

  // 4. Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation checklist theo chuẩn Backend
    const cleanRecipient = recipient.trim();
    if (!cleanRecipient) {
      setError('Vui lòng nhập họ và tên người nhận.');
      setLoading(false);
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!isValidVietnamesePhone(cleanPhone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, ví dụ: 0901234567).');
      setLoading(false);
      return;
    }

    const finalPhone = toBackendPhone(cleanPhone);

    if (!provinceCode) {
      setError('Vui lòng chọn Tỉnh / Thành phố.');
      setLoading(false);
      return;
    }

    if (!wardCode) {
      setError('Vui lòng chọn Phường / Xã.');
      setLoading(false);
      return;
    }

    const cleanLine1 = line1.trim();
    if (!cleanLine1) {
      setError('Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường).');
      setLoading(false);
      return;
    }

    // Submit payload shape chính xác theo đặc tả Backend:
    // Gửi province_code và ward_code, tuyệt đối KHÔNG gửi province_name, ward_name, hay district
    const payload = {
      recipient: cleanRecipient,
      phone: finalPhone,
      line1: cleanLine1,
      line2: line2.trim() || null,
      country_code: 'VN',
      province_code: provinceCode,
      ward_code: wardCode,
      postal_code: postalCode.trim() || null,
      is_default: Boolean(isDefault)
    };

    try {
      if (isEdit && addressData?.id) {
        await addressApi.updateAddress(addressData.id, payload);
      } else {
        await addressApi.addAddress(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setError(msg || 'Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'CẬP NHẬT ĐỊA CHỈ GIAO HÀNG' : 'THÊM ĐỊA CHỈ MỚI'}
      width="max-w-[540px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Họ và tên người nhận"
            name="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />

          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ví dụ: 0901234567"
            required
          />
        </div>

        {/* Khu vực Tỉnh/Thành phố và Phường/Xã (2 cấp theo chuẩn BE, đã bỏ cấp Quận/Huyện) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tỉnh / Thành phố */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-taca-text-main">
              Tỉnh / Thành phố <span className="text-taca-sale">*</span>
            </label>
            <div className="relative">
              <select
                value={provinceCode}
                onChange={(e) => handleProvinceChange(e.target.value)}
                disabled={loadingProvinces}
                className="w-full h-11 px-3 pr-8 border border-taca-border rounded-lg text-[14px] bg-white text-taca-text-main outline-none focus:border-taca-primary focus:ring-1 focus:ring-taca-primary transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {loadingProvinces ? 'Đang tải tỉnh thành...' : '-- Chọn Tỉnh / Thành phố --'}
                </option>
                {provinces.map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Phường / Xã */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-taca-text-main">
              Phường / Xã <span className="text-taca-sale">*</span>
            </label>
            <div className="relative">
              <select
                value={wardCode}
                onChange={(e) => setWardCode(e.target.value)}
                disabled={!provinceCode || loadingWards}
                className="w-full h-11 px-3 pr-8 border border-taca-border rounded-lg text-[14px] bg-white text-taca-text-main outline-none focus:border-taca-primary focus:ring-1 focus:ring-taca-primary transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {!provinceCode
                    ? 'Chọn Tỉnh / Thành phố trước'
                    : loadingWards
                    ? 'Đang tải phường xã...'
                    : '-- Chọn Phường / Xã --'}
                </option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Địa chỉ chi tiết (line1) */}
        <Input
          label="Địa chỉ chi tiết (Số nhà, tên đường)"
          name="line1"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="Ví dụ: 123 Nguyễn Huệ"
          required
        />

        {/* Thông tin phụ (line2) và mã bưu chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tòa nhà, số tầng, căn hộ (Tùy chọn)"
            name="line2"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="Ví dụ: Tòa A, Căn 501"
          />

          <Input
            label="Mã bưu chính (Tùy chọn)"
            name="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Ví dụ: 700000"
          />
        </div>

        {/* Checkbox Đặt làm mặc định */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_default_addr"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer"
          />
          <label htmlFor="is_default_addr" className="text-[14px] text-taca-text-main cursor-pointer select-none">
            Đặt làm địa chỉ nhận hàng mặc định
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-taca-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="!px-6"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="!px-6"
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Thêm địa chỉ')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AddressFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addressData: PropTypes.shape({
    id: PropTypes.string,
    recipient: PropTypes.string,
    name: PropTypes.string,
    phone: PropTypes.string,
    line1: PropTypes.string,
    line2: PropTypes.string,
    detail_address: PropTypes.string,
    province_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ward_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    province: PropTypes.string,
    ward: PropTypes.string,
    district: PropTypes.string,
    postal_code: PropTypes.string,
    is_default: PropTypes.bool,
  }),
  onSuccess: PropTypes.func
};

export default AddressFormModal;
