import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Star,
  Ticket,
  Heart,
  Store,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Hồ sơ & địa chỉ', path: '/account/profile', icon: User },
    { name: 'Đơn mua', path: '/account/orders', icon: Package },
    { name: 'Đánh giá', path: '/account/reviews', icon: Star },
    { name: 'Voucher của tôi', path: '/account/vouchers', icon: Ticket },
    { name: 'Sản phẩm yêu thích', path: '/account/wishlist', icon: Heart },
    { name: 'Cửa hàng theo dõi', path: '/account/following', icon: Store },
  ];

  return (
    <div className="w-full lg:w-[250px] bg-white rounded-card shadow-brand py-4 lg:py-6 flex-shrink-0 flex flex-col gap-3 lg:gap-6 border border-taca-border">
      {/* User Info */}
      <div className="flex items-center justify-between lg:flex-col lg:items-start px-4 lg:px-6 mb-1 lg:mb-2">
        <div>
          <div className="font-bold text-taca-text-main text-[15px] lg:text-[16px] truncate">
            {user?.full_name || 'Người dùng'}
          </div>
          <div className="text-taca-warning text-[12px] lg:text-[13px] font-medium mt-0.5 lg:mt-1">
            Thành viên Taca Gold
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex lg:flex-col overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 lg:px-0 py-1 lg:py-0 gap-1 lg:gap-0">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-2 lg:gap-4 px-3.5 lg:px-6 py-2 lg:py-3 text-[13px] lg:text-[14px] font-medium transition-colors whitespace-nowrap rounded-control lg:rounded-none shrink-0 ${
                  isActive
                    ? 'bg-taca-primary-light text-taca-primary font-bold'
                    : 'text-taca-text-main hover:bg-taca-primary-light hover:text-taca-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator: Desktop left bar, Mobile bottom bar */}
                  {isActive && (
                    <>
                      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[4px] rounded-r-sm bg-taca-primary" />
                        <div className="lg:hidden absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-taca-primary" />
                    </>
                  )}
                  {/* Icon */}
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-control flex items-center justify-center shrink-0 ${isActive ? 'bg-taca-primary text-white' : 'text-taca-text-muted'}`}>
                    <IconComponent className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </div>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <div className="lg:pt-2 lg:mt-1 lg:border-t lg:border-taca-border flex items-center shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 lg:gap-4 px-3.5 lg:px-6 py-2 lg:py-3 text-[13px] lg:text-[14px] font-medium text-taca-text-main hover:bg-taca-primary-light hover:text-taca-primary text-left transition-colors cursor-pointer group whitespace-nowrap rounded-control lg:rounded-none w-full"
          >
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-control flex items-center justify-center text-taca-text-muted group-hover:text-taca-primary transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </div>
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AccountSidebar;
