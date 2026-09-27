import { useState, useEffect, useCallback } from 'react';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import AddressCard from '../components/AddressCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { authApi } from '../../auth/services/auth.api';
import PhoneVerificationModal from '../../auth/components/PhoneVerificationModal';
import { addressApi } from '../services/address.api';
import AddressFormModal from '../components/AddressFormModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { getAuthErrorMessage } from '../../auth/utils/authError';
import { formatPhoneDisplay, toBackendPhone, isValidVietnamesePhone } from '../../../../../../shared/utils/phone';
import PropTypes from 'prop-types';

const DateInput = ({ value, onChange }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  // Đồng bộ giá trị từ prop value (định dạng YYYY-MM-DD hoặc ISO string)
  useEffect(() => {
    if (value && value !== 'INVALID' && value.includes('-')) {
      const parts = value.split('T')[0].split('-');
      if (parts.length === 3) {
        const parsedYear = String(parseInt(parts[0], 10));
        const parsedMonth = String(parseInt(parts[1], 10));
        const parsedDay = String(parseInt(parts[2], 10));
        setYear(parsedYear);
        setMonth(parsedMonth);
        setDay(parsedDay);
        setError('');
      }
    } else if (!value) {
      setDay('');
      setMonth('');
      setYear('');
      setError('');
    }
  }, [value]);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 14;
  const minYear = currentYear - 120;
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Tính số ngày tối đa theo tháng và năm
  const getMaxDays = (m, y) => {
    if (!m) return 31;
    const yearVal = y ? parseInt(y, 10) : 2024;
    return new Date(yearVal, parseInt(m, 10), 0).getDate();
  };

  const daysCount = getMaxDays(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  const handleDateChange = (newDay, newMonth, newYear) => {
    let validDay = newDay;
    if (newDay && newMonth) {
      const maxD = getMaxDays(newMonth, newYear);
      if (parseInt(newDay, 10) > maxD) {
        validDay = String(maxD);
        setDay(validDay);
      }
    }

    if (!validDay && !newMonth && !newYear) {
      setError('');
      onChange('');
      return;
    }

    if (!validDay || !newMonth || !newYear) {
      setError('Vui lòng chọn đầy đủ ngày, tháng và năm sinh.');
      onChange('INVALID');
      return;
    }

    const d = parseInt(validDay, 10);
    const m = parseInt(newMonth, 10);
    const y = parseInt(newYear, 10);

    const dob = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 14 || age > 120) {
      setError('Độ tuổi phải từ 14 đến 120 tuổi.');
      onChange('INVALID');
      return;
    }

    setError('');
    const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(formatted);
  };

  const handleDaySelect = (e) => {
    const val = e.target.value;
    setDay(val);
    handleDateChange(val, month, year);
  };

  const handleMonthSelect = (e) => {
    const val = e.target.value;
    setMonth(val);
    handleDateChange(day, val, year);
  };

  const handleYearSelect = (e) => {
    const val = e.target.value;
    setYear(val);
    handleDateChange(day, month, val);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[360px]">
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {/* Ngày */}
        <div className="relative">
          <select
            value={day}
            onChange={handleDaySelect}
            className="w-full h-11 px-3 pr-8 border border-taca-border rounded-lg text-[14px] bg-white text-taca-text-main outline-none focus:border-taca-primary focus:ring-1 focus:ring-taca-primary cursor-pointer transition-all appearance-none"
          >
            <option value="">Ngày</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Tháng */}
        <div className="relative">
          <select
            value={month}
            onChange={handleMonthSelect}
            className="w-full h-11 px-3 pr-8 border border-taca-border rounded-lg text-[14px] bg-white text-taca-text-main outline-none focus:border-taca-primary focus:ring-1 focus:ring-taca-primary cursor-pointer transition-all appearance-none"
          >
            <option value="">Tháng</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Năm */}
        <div className="relative">
          <select
            value={year}
            onChange={handleYearSelect}
            className="w-full h-11 px-3 pr-8 border border-taca-border rounded-lg text-[14px] bg-white text-taca-text-main outline-none focus:border-taca-primary focus:ring-1 focus:ring-taca-primary cursor-pointer transition-all appearance-none"
          >
            <option value="">Năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
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
      {error && <span className="text-[12px] text-taca-sale font-medium">{error}</span>}
    </div>
  );
};

DateInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
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
  
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const userDisplayPhone = formatPhoneDisplay(user?.phone || '');
  const formDisplayPhone = formatPhoneDisplay(formData.phone || '');
  const isPhoneChanged = Boolean(formDisplayPhone && formDisplayPhone !== userDisplayPhone);
  const needsPhoneVerification = isPhoneChanged && !isNewPhoneVerified;
  const needsVerification = needsPhoneVerification;

  // Lấy dữ liệu profile đầy đủ từ server và đồng bộ vào Context + localStorage
  const fetchProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const fetchedUser = response?.data?.user || response?.data?.data || response?.data || response?.user || response;
      if (fetchedUser && typeof fetchedUser === 'object') {
        const dob = fetchedUser.date_of_birth ? String(fetchedUser.date_of_birth).split('T')[0] : '';
        setFormData({
          full_name: fetchedUser.full_name || '',
          email: fetchedUser.email || '',
          phone: formatPhoneDisplay(fetchedUser.phone || ''),
          date_of_birth: dob
        });
        updateUser?.(fetchedUser);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, [updateUser]);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getAddresses();
      setAddresses(response?.data?.data || response?.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  }, []);

  // Đồng bộ từ user khi đăng nhập hoặc dữ liệu user thay đổi
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        full_name: prev.full_name || user.full_name || '',
        email: user.email || prev.email || '',
        phone: prev.phone || formatPhoneDisplay(user.phone || ''),
        date_of_birth: prev.date_of_birth || (user.date_of_birth ? String(user.date_of_birth).split('T')[0] : '')
      }));
    }
  }, [user]);

  // Luôn tải bản cập nhật mới nhất từ backend khi reload trang
  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, [fetchProfile, fetchAddresses]);

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
      let finalPhone = formData.phone ? formData.phone.trim() : null;
      if (finalPhone) {
        const cleanPhone = finalPhone.replace(/\s+/g, '');
        if (!isValidVietnamesePhone(cleanPhone)) {
          setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, ví dụ: 0901234567).');
          setLoading(false);
          return;
        }
        finalPhone = toBackendPhone(cleanPhone);
      }

      if (formData.date_of_birth === 'INVALID') {
        setError('Ngày sinh chưa đầy đủ hoặc không hợp lệ.');
        setLoading(false);
        return;
      }

      if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        if (isNaN(dob.getTime())) {
          setError('Ngày sinh không hợp lệ.');
          setLoading(false);
          return;
        }
        
        const parts = formData.date_of_birth.split('-');
        if (
          dob.getFullYear() !== parseInt(parts[0], 10) ||
          dob.getMonth() + 1 !== parseInt(parts[1], 10) ||
          dob.getDate() !== parseInt(parts[2], 10)
        ) {
          setError('Ngày sinh không tồn tại (ví dụ: ngày 31 tháng 2).');
          setLoading(false);
          return;
        }

        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 14 || age > 120) {
          setError('Độ tuổi phải từ 14 đến 120 tuổi.');
          setLoading(false);
          return;
        }
      }

      // Theo quy ước Section 2.14 auth-user.md:
      // PUT /users/me chỉ gửi full_name, phone, date_of_birth
      const payload = {
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth && formData.date_of_birth !== 'INVALID' ? formData.date_of_birth : null,
        phone: finalPhone
      };

      await authApi.updateProfile(payload);
      setMessage('Cập nhật hồ sơ thành công.');
      await fetchProfile(); // Làm mới dữ liệu và đồng bộ vào Context / localStorage
    } catch (err) {
      setError(getAuthErrorMessage(err, 'profile'));
    } finally {
      setLoading(false);
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
        console.error('Lỗi xóa địa chỉ:', err);
        alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
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
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Email</label>
              <Input 
                name="email"
                type="email"
                value={formData.email}
                disabled
                readOnly
                className="!rounded-lg !bg-gray-100 !text-gray-500 cursor-not-allowed select-none border-gray-200"
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
                  placeholder="Nhập số điện thoại"
                  className="!rounded-lg flex-1"
                />
                {needsPhoneVerification && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => setPhoneModalOpen(true)}
                    className="whitespace-nowrap !py-2 !px-3 text-[13px] !rounded-lg text-taca-primary border-taca-primary"
                  >
                    Xác thực ngay
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <label className="text-[14px] text-taca-text-muted mt-2.5">Ngày sinh</label>
              <DateInput 
                value={formData.date_of_birth}
                onChange={(val) => setFormData(prev => ({...prev, date_of_birth: val}))}
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-2">
              <div className="col-span-2">
                {needsPhoneVerification && (
                  <p className="text-taca-sale text-[13px] mb-3">
                    * Vui lòng nhấn "Xác thực ngay" số điện thoại mới trước khi lưu thay đổi.
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

        {/* Password & Security Section */}
        <section className="mb-10 max-w-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-taca-text-main">Mật khẩu & Bảo mật</h2>
              <p className="text-[13px] text-taca-text-muted mt-1">
                Quản lý mật khẩu đăng nhập để bảo vệ an toàn cho tài khoản của bạn.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPasswordModalOpen(true)}
              className="!py-1.5 !px-4 text-[14px] !rounded-lg border-taca-border bg-white text-taca-text-main hover:border-taca-primary hover:text-taca-primary cursor-pointer"
            >
              Đổi mật khẩu
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                🔒
              </div>
              <div>
                <div className="text-[14px] font-bold text-taca-text-main">Mật khẩu tài khoản</div>
                <div className="text-[12px] text-taca-text-muted">Độ dài từ 12 - 72 ký tự theo chuẩn mã hóa Argon2id</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-[13px] font-bold text-taca-primary hover:underline cursor-pointer"
            >
              Cập nhật
            </button>
          </div>
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
                  address={
                    address.detail_address ||
                    [
                      address.line1,
                      address.line2,
                      address.ward,
                      address.district,
                      address.province,
                      address.country_code === 'VN' ? 'Việt Nam' : (address.country || 'Việt Nam')
                    ].filter(Boolean).join(', ')
                  }
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
        phone={toBackendPhone(formData.phone)}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      />
      <AddressFormModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressData={selectedAddress}
        onSuccess={fetchAddresses}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        email={formData.email || user?.email}
      />
    </div>
  );
};

export default ProfilePage;
