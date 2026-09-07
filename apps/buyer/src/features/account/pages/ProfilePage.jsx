import { useState, useEffect } from 'react';
import { Input, Button } from '@taca/ui-components';
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
      // If no user in context, we might need to fetch profile
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getProfile();
      // Assuming response.data is the user object
      const fetchedUser = response.data.user || response.data;
      setFormData({
        full_name: fetchedUser.full_name || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        date_of_birth: fetchedUser.date_of_birth || ''
      });
      // Optionally update global state
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
      // PUT /users/me only accepts certain fields
      const payload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        phone: formData.phone || null
      };

      const response = await authApi.updateProfile(payload);
      setMessage('Cập nhật hồ sơ thành công.');
      // Refresh user state
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
    <div className="max-w-[800px] mx-auto p-6 bg-white rounded-xl shadow-sm border border-taca-border my-8">
      <h1 className="text-[24px] font-bold text-taca-text-main mb-8">Hồ sơ & địa chỉ</h1>

      <div className="mb-10">
        <h2 className="text-[18px] font-bold text-taca-text-main mb-6">Thông tin tài khoản</h2>

        {message && (
          <div className="bg-green-50 text-green-600 p-3 text-[14px] rounded-lg font-medium border border-green-200 mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[500px]">
          
          <div className="flex items-center gap-4">
            <div className="w-[120px] text-[14px] text-taca-text-muted flex-shrink-0">Họ và tên</div>
            <div className="flex-grow">
              <Input 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[120px] text-[14px] text-taca-text-muted flex-shrink-0">Email</div>
            <div className="flex-grow relative">
              <Input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[120px] text-[14px] text-taca-text-muted flex-shrink-0">Số điện thoại</div>
            <div className="flex-grow flex items-center gap-2">
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {user && user.phone && !user.phone_verified && (
                <button 
                  type="button"
                  onClick={() => setPhoneModalOpen(true)}
                  className="whitespace-nowrap text-[13px] font-bold text-white bg-taca-primary px-3 py-2 rounded-[8px] hover:bg-taca-primary-hover"
                >
                  Xác thực ngay
                </button>
              )}
              {user && user.phone && user.phone_verified && (
                <span className="text-[13px] text-green-600 font-medium whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                  ✓ Đã xác thực
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[120px] text-[14px] text-taca-text-muted flex-shrink-0">Ngày sinh</div>
            <div className="flex-grow">
              <Input 
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-[120px] flex-shrink-0"></div>
            <div>
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="w-full h-[1px] bg-taca-border mb-8"></div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-taca-text-main">Sổ địa chỉ</h2>
          <Button variant="outline" className="text-taca-primary border-taca-primary">
            + Thêm địa chỉ
          </Button>
        </div>

        {/* Placeholder for Address List */}
        <div className="border border-taca-border rounded-xl p-5 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-block border border-taca-primary text-taca-primary text-[12px] font-bold px-3 py-1 rounded-full mb-3">
                MẶC ĐỊNH
              </div>
              <div className="text-[14px] mb-2">
                <span className="font-bold text-taca-text-main">{formData.full_name || 'Nguyễn Minh Anh'}</span>
                <span className="mx-2 text-taca-text-muted">·</span>
                <span className="font-bold text-taca-text-main">{formData.phone || '0909 123 456'}</span>
              </div>
              <div className="text-[14px] text-taca-text-muted">
                28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM
              </div>
            </div>
            <button className="text-[14px] font-bold text-taca-primary hover:text-taca-primary-hover">
              Chỉnh sửa
            </button>
          </div>
        </div>

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
