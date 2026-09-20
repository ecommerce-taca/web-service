import { useState, useEffect, useCallback } from 'react';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import AddressCard from '../components/AddressCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { authApi } from '../../auth/services/auth.api';
import PhoneVerificationModal from '../../auth/components/PhoneVerificationModal';
import { addressApi } from '../services/address.api';
import AddressFormModal from '../components/AddressFormModal';
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
  const [isNewEmailVerified, setIsNewEmailVerified] = useState(false);
  const [emailResendStatus, setEmailResendStatus] = useState(''); // 'sending', 'success', 'error'
  const [emailResendMessage, setEmailResendMessage] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const isPhoneChanged = formData.phone !== (user?.phone || '');

  const isEmailChanged = formData.email !== (user?.email || '');
  const needsPhoneVerification = isPhoneChanged && !isNewPhoneVerified;
  const needsEmailVerification = isEmailChanged && !isNewEmailVerified;
  const needsVerification = needsPhoneVerification || needsEmailVerification;

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
      if (login) {
        login(fetchedUser, response.data.tokens || null);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, [login]);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getAddresses();
      setAddresses(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  }, []);

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
     
    fetchAddresses();
  }, [user, fetchProfile, fetchAddresses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setIsNewPhoneVerified(false);
    }
    if (name === 'email') {
      setIsNewEmailVerified(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let finalPhone = formData.phone ? formData.phone.trim() : null;
      if (finalPhone && finalPhone.startsWith('0')) {
        finalPhone = '+84' + finalPhone.slice(1);
      }

      if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 14) {
          setError('Độ tuổi phải từ 14 tuổi trở lên.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        phone: finalPhone
      };

      await authApi.updateProfile(payload);
      setMessage('Cập nhật hồ sơ thành công.');
      await fetchProfile(); // refresh data
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
      // Giả lập xác thực email thành công sau 2s để test UI
      setTimeout(() => {
        setIsNewEmailVerified(true);
        setEmailResendMessage('Đã giả lập xác thực email thành công.');
      }, 2000);
    } catch (err) {
      setEmailResendStatus('error');
      setEmailResendMessage(err.message || 'Lỗi khi gửi email xác nhận.');
    }
  };

  const handlePhoneVerificationSuccess = () => {
    setMessage('Xác thực số điện thoại thành công! Hãy bấm Lưu thay đổi để hoàn tất.');
    setIsNewPhoneVerified(true);
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await addressApi.deleteAddress(addressId);
        fetchAddresses();
      } catch (err) {
        alert(err.message || 'Có lỗi xảy ra khi xóa địa chỉ.');
      }
    }
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
                  {(!user || !user.email_verified || isEmailChanged) && (
                    <button 
                      type="button"
                      onClick={handleResendEmail}
                      disabled={!formData.email || emailResendStatus === 'sending'}
                      className="text-[13px] font-bold text-taca-primary hover:text-taca-primary-hover underline whitespace-nowrap disabled:opacity-50 disabled:no-underline"
                    >
                      {emailResendStatus === 'sending' ? 'Đang gửi...' : (isEmailChanged ? 'Xác thực ngay' : 'Gửi lại email xác nhận')}
                    </button>
                  )}
                  {user?.email_verified && !isEmailChanged && (
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
                {(!user || !user.phone_verified || isPhoneChanged) && (
                  <button 
                    type="button"
                    onClick={() => setPhoneModalOpen(true)}
                    disabled={!formData.phone}
                    className="text-[13px] font-bold text-taca-primary hover:text-taca-primary-hover underline whitespace-nowrap disabled:opacity-50 disabled:no-underline"
                  >
                    Xác thực ngay
                  </button>
                )}
                {user?.phone_verified && !isPhoneChanged && (
                  <span className="text-[13px] text-green-600 font-medium whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                    ✓ Đã xác thực
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Ngày sinh</label>
              <div className="flex gap-3 max-w-[400px]">
                <select
                  className="flex-1 h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white"
                  value={formData.date_of_birth ? formData.date_of_birth.split('-')[2] : ''}
                  onChange={(e) => {
                    const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', ''];
                    const newDate = `${parts[0] || new Date().getFullYear()}-${parts[1] || '01'}-${e.target.value}`;
                    handleChange({ target: { name: 'date_of_birth', value: newDate }});
                  }}
                >
                  <option value="" disabled>Ngày</option>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = String(i + 1).padStart(2, '0');
                    return <option key={day} value={day}>{day}</option>;
                  })}
                </select>
                
                <select
                  className="flex-1 h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white"
                  value={formData.date_of_birth ? formData.date_of_birth.split('-')[1] : ''}
                  onChange={(e) => {
                    const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', ''];
                    const newDate = `${parts[0] || new Date().getFullYear()}-${e.target.value}-${parts[2] || '01'}`;
                    handleChange({ target: { name: 'date_of_birth', value: newDate }});
                  }}
                >
                  <option value="" disabled>Tháng</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = String(i + 1).padStart(2, '0');
                    return <option key={month} value={month}>Tháng {month}</option>;
                  })}
                </select>

                <select
                  className="flex-1 h-[40px] px-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] text-taca-text-main bg-white"
                  value={formData.date_of_birth ? formData.date_of_birth.split('-')[0] : ''}
                  onChange={(e) => {
                    const parts = formData.date_of_birth ? formData.date_of_birth.split('-') : ['', '', ''];
                    const newDate = `${e.target.value}-${parts[1] || '01'}-${parts[2] || '01'}`;
                    handleChange({ target: { name: 'date_of_birth', value: newDate }});
                  }}
                >
                  <option value="" disabled>Năm</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = String(new Date().getFullYear() - i);
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-2">
              <div className="col-span-2">
                {needsPhoneVerification && (
                  <p className="text-taca-sale text-[13px] mb-3">
                    * Vui lòng nhấn "Xác thực ngay" số điện thoại mới trước khi lưu thay đổi.
                  </p>
                )}
                {needsEmailVerification && (
                  <p className="text-taca-sale text-[13px] mb-3">
                    * Vui lòng nhấn "Xác thực ngay" email mới trước khi lưu thay đổi.
                  </p>
                )}
                <Button 
                  type="submit" 
                  disabled={loading || needsVerification} 
                  className={`w-full md:w-auto px-8 !rounded-lg h-11 text-[15px] ${needsVerification ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <Button 
              variant="secondary" 
              onClick={handleAddAddress}
              className="!py-1.5 !px-4 text-[14px] !rounded-lg border-taca-border bg-white text-taca-text-main"
            >
              + Thêm địa chỉ
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <AddressCard 
                  key={address.id}
                  isDefault={address.is_default}
                  name={address.recipient || address.name || formData.full_name}
                  phone={address.phone || formData.phone}
                  address={address.detail_address || [address.line1, address.ward, address.district, address.province, address.country || 'Việt Nam'].filter(Boolean).join(', ')}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-taca-text-muted bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Bạn chưa lưu địa chỉ nào.
              </div>
            )}
          </div>
        </section>
      </div>

      <PhoneVerificationModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        phone={formData.phone}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      />
      <AddressFormModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressData={selectedAddress}
        onSuccess={fetchAddresses}
      />
    </div>
  );
};

export default ProfilePage;
