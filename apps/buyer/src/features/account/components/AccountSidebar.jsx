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
    <div className="w-[250px] bg-white rounded-lg shadow-sm py-6 flex-shrink-0 flex flex-col gap-6">
      {/* User Info */}
      <div className="flex flex-col px-6 mb-2">
        <div className="font-bold text-taca-text-main text-[16px] truncate">
          {user?.full_name || 'Người dùng'}
        </div>
        <div className="text-orange-500 text-[13px] font-medium mt-1">
          Thành viên Taca Gold
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-4 px-6 py-3 text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-50 text-taca-primary font-bold'
                    : 'text-taca-text-main hover:bg-gray-50 hover:text-taca-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] rounded-r-sm bg-[#00a69c]" />
                  )}
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${isActive ? 'bg-[#00a69c] text-white' : 'text-gray-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-2 mt-1 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 text-[14px] font-medium text-taca-text-main hover:bg-gray-50 hover:text-rose-600 text-left transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center text-gray-400 group-hover:text-rose-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AccountSidebar;
