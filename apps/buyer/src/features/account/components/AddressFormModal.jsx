import { useState, useEffect } from 'react';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import { addressApi } from '../services/address.api';
import provincesData from '../../../../../../shared/utils/vietnam_provinces.json';

const AddressFormModal = ({ isOpen, onClose, addressData, onSuccess }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    phone: '',
    line1: '',
    country: 'Việt Nam',
    province: '',
    district: '',
    ward: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!addressData;

  useEffect(() => {
    if (isOpen) {
      if (isEdit && addressData) {
        setFormData({
          recipient: addressData.recipient || addressData.name || '',
          phone: addressData.phone || '',
          line1: addressData.line1 || addressData.detail_address || '',
          country: 'Việt Nam',
          province: addressData.province || '',
          district: addressData.district || '',
          ward: addressData.ward || '',
          is_default: addressData.is_default || false
        });
      } else {
        setFormData({
          recipient: '',
          phone: '',
          line1: '',
          country: 'Việt Nam',
          province: '',
          district: '',
          ward: '',
          is_default: false
        });
      }
      setError('');
    }
  }, [isOpen, addressData, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const provinces = provincesData;
  const selectedProvinceObj = provinces.find(p => p.n === formData.province);
  const districts = selectedProvinceObj ? selectedProvinceObj.d : [];
  const selectedDistrictObj = districts.find(d => d.n === formData.district);
  const wards = selectedDistrictObj ? selectedDistrictObj.w : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Custom Validation
    const cleanPhone = formData.phone.replace(/\s+/g, '');
    const phoneRegex = /^(0|84|\+84)[3|5|7|8|9][0-9]{8}$/;
    
    if (!formData.recipient.trim()) {
      setError('Vui lòng nhập họ và tên.');
      setLoading(false);
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      setError('Số điện thoại không hợp lệ.');
      setLoading(false);
      return;
    }
    if (!formData.province || !formData.district || !formData.ward) {
      setError('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Xã/Phường.');
      setLoading(false);
      return;
    }
    if (!formData.line1.trim()) {
      setError('Vui lòng nhập địa chỉ cụ thể.');
      setLoading(false);
      return;
    }

    try {
      let finalPhone = cleanPhone;
      if (finalPhone.startsWith('0')) {
        finalPhone = '+84' + finalPhone.slice(1);
      } else if (finalPhone.startsWith('84')) {
        finalPhone = '+' + finalPhone;
      }
      
      const payload = {
        recipient: formData.recipient.trim(),
        phone: finalPhone,
        line1: formData.line1.trim(),
        ward: formData.ward,
        district: formData.district,
        province: formData.province,
        is_default: formData.is_default
      };

      if (isEdit) {
        await addressApi.updateAddress(addressData.id, payload);
      } else {
        await addressApi.addAddress(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'CẬP NHẬT ĐỊA CHỈ' : 'THÊM ĐỊA CHỈ MỚI'}
      width="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Họ và tên</label>
          <Input 
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            className="!rounded-lg"
            placeholder="VD: Nguyễn Minh Anh"
            required
          />
        </div>
        
        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Số điện thoại</label>
          <Input 
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="!rounded-lg"
            placeholder="VD: 0909 123 456"
            required
          />
        </div>
        
        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Quốc gia</label>
          <select
            name="country"
            value={formData.country}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, country: e.target.value, province: '', district: '', ward: '' }));
            }}
            className="h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white w-full"
            required
          >
            <option value="Việt Nam">Việt Nam</option>
          </select>
        </div>

        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Tỉnh/Thành</label>
          <select
            name="province"
            value={formData.province}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, province: e.target.value, district: '', ward: '' }));
            }}
            className="h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white w-full"
            required
          >
            <option value="" disabled>Chọn Tỉnh/Thành phố</option>
            {provinces.map(p => (
              <option key={p.c} value={p.n}>{p.n}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Quận/Huyện</label>
          <select
            name="district"
            value={formData.district}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, district: e.target.value, ward: '' }));
            }}
            className="h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white w-full"
            disabled={!formData.province}
            required
          >
            <option value="" disabled>Chọn Quận/Huyện</option>
            {districts.map(d => (
              <option key={d.c} value={d.n}>{d.n}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <label className="text-[14px] text-taca-text-muted">Xã/Phường</label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            className="h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white w-full"
            disabled={!formData.district}
            required
          >
            <option value="" disabled>Chọn Phường/Xã</option>
            {wards.map(w => (
              <option key={w.c} value={w.n}>{w.n}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] items-start gap-4">
          <label className="text-[14px] text-taca-text-muted mt-2">Địa chỉ cụ thể</label>
          <Input 
            name="line1"
            value={formData.line1}
            onChange={handleChange}
            className="!rounded-lg"
            placeholder="Số nhà, tên đường..."
            required
          />
        </div>

        <div className="grid grid-cols-[100px_1fr] items-center gap-4 mt-2">
          <div></div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-taca-primary rounded border-gray-300 focus:ring-taca-primary"
            />
            <span className="text-[14px] text-taca-text-main">Đặt làm địa chỉ mặc định</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-taca-border">
          <Button type="button" variant="secondary" onClick={onClose} className="!py-2 px-6 bg-gray-100 border-none text-taca-text-main">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={loading} className="!py-2 px-6">
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressFormModal;
