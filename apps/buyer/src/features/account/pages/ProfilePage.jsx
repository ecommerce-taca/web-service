import { useState } from 'react';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import AddressCard from '../components/AddressCard';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: 'Nguyễn Minh Anh',
    email: 'minhanh@example.com',
    phone: '0909 123 456',
    dob: '1997-04-16',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Update profile:', formData);
    // TODO: Connect to backend API
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 flex-1">
        <h1 className="text-[20px] font-bold text-taca-text-main mb-6">Hồ sơ & địa chỉ</h1>
        
        {/* Profile Info Section */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold text-taca-text-main mb-6">Thông tin tài khoản</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[500px]">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Họ và tên</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="!rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Email</label>
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="!rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Số điện thoại</label>
              <Input 
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="!rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[14px] text-taca-text-muted">Ngày sinh</label>
              <Input 
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="!rounded-lg"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-2">
              <div></div>
              <Button type="submit" className="w-fit !rounded-lg h-11 px-8 text-[15px]">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </section>

        <div className="w-full h-[1px] bg-taca-border my-8"></div>

        {/* Address Book Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-taca-text-main">Sổ địa chỉ</h2>
            <Button variant="secondary" className="!py-1.5 !px-4 text-[14px] !rounded-lg">
              + Thêm địa chỉ
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <AddressCard 
              isDefault={true}
              name="Nguyễn Minh Anh"
              phone="0909 123 456"
              address="28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM"
              onEdit={() => console.log('Edit address')}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
