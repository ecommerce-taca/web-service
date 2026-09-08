import { useState, useEffect, useCallback } from 'react';
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
  const [isNewPhoneVerified, setIsNewPhoneVerified] = useState(false);
  const [emailResendStatus, setEmailResendStatus] = useState(''); // 'sending', 'success', 'error'
  const [emailResendMessage, setEmailResendMessage] = useState('');

  const isPhoneChanged = formData.phone !== (user?.phone || '');

  const fetchProfile = useCallback(async () => {
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
  }, [login]);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          date_of_birth: user.date_of_birth || ''
        });
      }, 0);
    } else {
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user, fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setIsNewPhoneVerified(false);
    }
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

  const handleResendEmail = async () => {
    setEmailResendStatus('sending');
    setEmailResendMessage('');
    try {
      await authApi.resendEmailVerification();
      setEmailResendStatus('success');
      setEmailResendMessage('Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setEmailResendStatus('error');
      setEmailResendMessage(err.message || 'Lỗi khi gửi email xác nhận.');
    }
  };

  const handlePhoneVerificationSuccess = () => {
    setMessage('Xác thực số điện thoại thành công! Hãy bấm Lưu thay đổi để hoàn tất.');
    setIsNewPhoneVerified(true);
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
            
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <label className="text-[14px] text-taca-text-muted mt-2">Email</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="!rounded-lg max-w-[200px]"
                  />
                  {(!user || !user.email_verified) && (
                    <button 
                      type="button"
                      onClick={handleResendEmail}
                      disabled={!formData.email || emailResendStatus === 'sending'}
                      className="text-[13px] font-bold text-taca-primary hover:text-taca-primary-hover underline whitespace-nowrap disabled:opacity-50 disabled:no-underline"
                    >
                      {emailResendStatus === 'sending' ? 'Đang gửi...' : 'Gửi lại email xác nhận'}
                    </button>
                  )}
                  {user?.email_verified && (
                    <span className="text-[13px] text-green-600 font-medium whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
                {emailResendStatus === 'success' && (
                  <span className="text-[12px] text-green-600">{emailResendMessage}</span>
                )}
                {emailResendStatus === 'error' && (
                  <span className="text-[12px] text-taca-sale">{emailResendMessage}</span>
                )}
              </div>
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
                {(!user || !user.phone_verified) && (
                  <button 
                    type="button"
                    onClick={() => setPhoneModalOpen(true)}
                    disabled={!formData.phone}
                    className="text-[13px] font-bold text-taca-primary hover:text-taca-primary-hover underline whitespace-nowrap disabled:opacity-50 disabled:no-underline"
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
              <div className="col-span-2">
                {(isPhoneChanged && !isNewPhoneVerified) && (
                  <p className="text-taca-sale text-[13px] mb-3">
                    * Vui lòng nhấn "Xác thực ngay" số điện thoại mới trước khi lưu.
                  </p>
                )}
                <Button 
                  type="submit" 
                  disabled={loading || (isPhoneChanged && !isNewPhoneVerified)} 
                  className="w-full md:w-auto px-8 !rounded-lg h-11 text-[15px]"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
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
