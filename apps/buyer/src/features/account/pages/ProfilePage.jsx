import { useState, useEffect } from 'react';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import AddressCard from '../components/AddressCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { authApi } from '../../auth/services/auth.api';
import PhoneVerificationModal from '../../auth/components/PhoneVerificationModal';

const ProfilePage = () => {
  const { user, login } = useAuth(); // login handles updating the user context
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [isPhoneModalOpen, setPhoneModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || ''
      });
    } else {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getProfile();
      const fetchedUser = response.data.user || response.data;
      setFormData({
        full_name: fetchedUser.full_name || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        date_of_birth: fetchedUser.date_of_birth || ''
      });
      if (login && response.data.tokens) {
        login(fetchedUser, response.data.tokens);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        phone: formData.phone || null
      };

      const response = await authApi.updateProfile(payload);
      setMessage('Cập nhật hồ sơ thành công.');
      if (login) {
        const updatedUser = response.data.user || response.data;
        login(updatedUser, null); // preserve existing tokens
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationSuccess = () => {
    setMessage('Xác thực số điện thoại thành công!');
    fetchProfile(); // Re-fetch to get phone_verified = true
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 flex-1">
        <h1 className="text-[20px] font-bold text-taca-text-main mb-6">Hồ sơ & địa chỉ</h1>
        
        {/* Profile Info Section */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold text-taca-text-main mb-6">Thông tin tài khoản</h2>
          
          {message && (
            <div className="bg-green-50 text-green-600 p-3 text-[14px] rounded-lg font-medium border border-green-200 mb-6 max-w-[500px]">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-6 max-w-[500px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[500px]">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Họ và tên</label>
              <Input 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="!rounded-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Email</label>
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="!rounded-lg bg-gray-50 text-gray-500"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Số điện thoại</label>
              <div className="flex items-center gap-3">
                <Input 
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="!rounded-lg max-w-[200px]"
                />
                {(!user || !user.phone_verified) && formData.phone && (
                  <button 
                    type="button"
                    onClick={() => setPhoneModalOpen(true)}
                    className="text-[13px] font-bold text-taca-primary hover:text-taca-primary-hover underline whitespace-nowrap"
                  >
                    Xác thực ngay
                  </button>
                )}
                {user?.phone_verified && (
                  <span className="text-[13px] text-green-600 font-medium whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                    ✓ Đã xác thực
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Ngày sinh</label>
              <Input 
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="!rounded-lg"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-2">
              <div></div>
              <Button type="submit" disabled={loading} className="w-fit !rounded-lg h-11 px-8 text-[15px]">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </section>

        <div className="w-full h-[1px] bg-taca-border my-8"></div>

        {/* Address Book Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-taca-text-main">Sổ địa chỉ</h2>
            <Button variant="secondary" className="!py-1.5 !px-4 text-[14px] !rounded-lg border-taca-border bg-white text-taca-text-main">
              + Thêm địa chỉ
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <AddressCard 
              isDefault={true}
              name={formData.full_name || 'Nguyễn Minh Anh'}
              phone={formData.phone || '0909 123 456'}
              address="28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM"
              onEdit={() => console.log('Edit address')}
            />
          </div>
        </section>
      </div>

      <PhoneVerificationModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        phone={formData.phone}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      />
    </div>
  );
};

export default ProfilePage;
