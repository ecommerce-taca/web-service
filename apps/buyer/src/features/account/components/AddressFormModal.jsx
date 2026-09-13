import { useState, useEffect } from 'react';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import { addressApi } from '../services/address.api';

const AddressFormModal = ({ isOpen, onClose, addressData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    detail_address: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!addressData;

  useEffect(() => {
    if (isOpen) {
      if (isEdit && addressData) {
        setFormData({
          name: addressData.name || '',
          phone: addressData.phone || '',
          detail_address: addressData.detail_address || '',
          is_default: addressData.is_default || false
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          detail_address: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await addressApi.updateAddress(addressData.id, formData);
      } else {
        await addressApi.addAddress(formData);
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
            name="name"
            value={formData.name}
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
        
        <div className="grid grid-cols-[100px_1fr] items-start gap-4">
          <label className="text-[14px] text-taca-text-muted mt-2">Địa chỉ</label>
          <Input 
            name="detail_address"
            value={formData.detail_address}
            onChange={handleChange}
            className="!rounded-lg"
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
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
