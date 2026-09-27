import { Link, useLocation } from 'react-router-dom';

export default function SellerNav() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const basePath = isShell ? '/seller' : '';

  const navItems = [
    { label: 'Tổng quan', path: `${basePath}/`, exact: true },
    { label: 'Quản lý sản phẩm', path: `${basePath}/products` },
    { label: 'Xử lý đơn hàng', path: `${basePath}/orders` },
    { label: 'Khuyến mãi & Voucher', path: `${basePath}/vouchers` },
    { label: 'Ví doanh thu & Rút tiền', path: `${basePath}/finance` },
    { label: 'Cài đặt gian hàng', path: `${basePath}/settings` },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path || location.pathname === `${item.path}/` || (basePath && location.pathname === basePath);
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="bg-white border-b border-slate-200 h-[54px] sticky top-[68px] z-30 px-6 lg:px-12 flex items-center overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 sm:gap-2 h-full">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative h-full flex items-center px-4 text-[13px] md:text-[14px] font-semibold whitespace-nowrap transition-colors ${
                active ? 'text-[#4F46E5]' : 'text-slate-600 hover:text-slate-900'
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
