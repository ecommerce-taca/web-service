import { Link, useLocation } from 'react-router-dom';

export default function SellerNav() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

    const navItems = [
    { label: 'Tổng quan', path: `${basePath}/`, exact: true },
    { label: 'Quản lý sản phẩm', path: `${basePath}/products` },
    { label: 'Quản lý kho hàng', path: `${basePath}/inventory` },
    { label: 'Xử lý đơn hàng', path: `${basePath}/orders` },
    { label: 'Khuyến mãi & Voucher', path: `${basePath}/vouchers` },
    { label: 'Ví doanh thu & Rút tiền', path: `${basePath}/finance` },
    { label: 'Cài đặt gian hàng', path: `${basePath}/settings` },
    { label: 'Hồ sơ & KYC', path: `${basePath}/onboarding` },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path || location.pathname === `${item.path}/` || (basePath && location.pathname === basePath);
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav
      className="bg-white h-[52px] px-4 sm:px-6 lg:px-12 border-t border-slate-100 flex items-center overflow-x-auto no-scrollbar"
      aria-label="Điều hướng Kênh Người Bán"
    >
      <div className="flex items-center gap-0.5 sm:gap-1 h-full min-w-max">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`relative h-full flex items-center px-3 sm:px-4 text-body font-bold whitespace-nowrap transition-colors focus-visible:bg-indigo-50 focus-visible:text-[#4F46E5] ${
                active ? 'text-[#4F46E5]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#4F46E5] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
