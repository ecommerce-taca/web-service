import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Tổng quan', path: '/account/overview', icon: '⌂' },
    { name: 'Hồ sơ & địa chỉ', path: '/account/profile', icon: '♙' },
    { name: 'Đơn mua', path: '/account/orders', icon: '▣' },
    { name: 'Đánh giá', path: '/account/reviews', icon: '★' },
    { name: 'Voucher của tôi', path: '/account/vouchers', icon: 'V' },
    { name: 'Sản phẩm yêu thích', path: '/account/wishlist', icon: '♥' },
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
        {navItems.map((item) => (
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
                <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${isActive ? 'bg-[#00a69c] text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <NavLink
            to="/account/seller-register"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-6 py-3 text-[13px] font-bold rounded-xl transition-colors mx-2 no-underline ${
                isActive
                  ? 'bg-indigo-50 text-[#4F46E5]'
                  : 'text-[#4F46E5] hover:bg-indigo-50/60'
              }`
            }
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center text-base shrink-0">
              🏪
            </div>
            <div>
              <div className="leading-tight">Đăng ký Bán hàng</div>
              <div className="text-[11px] text-slate-400 font-normal">Kênh Người Bán & Xét duyệt ↗</div>
            </div>
          </NavLink>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-3 text-[14px] font-medium text-taca-text-main hover:bg-gray-50 hover:text-taca-primary text-left transition-colors mt-1"
        >
          <div className="w-8 h-8 rounded flex items-center justify-center text-lg text-gray-400">
            ↗
          </div>
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default AccountSidebar;
