import { Outlet, Link, useLocation } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';

const AccountLayout = () => {
  const location = useLocation();

  const getBreadcrumbName = () => {
    if (location.pathname.includes('profile')) return 'Hồ sơ & địa chỉ';
    if (location.pathname.includes('orders')) return 'Đơn mua';
    if (location.pathname.includes('reviews')) return 'Đánh giá';
    if (location.pathname.includes('vouchers')) return 'Voucher của tôi';
    if (location.pathname.includes('wishlist')) return 'Sản phẩm yêu thích';
    return 'Tổng quan';
  };

  return (
    <div className="bg-taca-surface min-h-screen pb-12">
      {/* Container */}
      <div className="max-w-[1440px] mx-auto px-[80px]">
        {/* Breadcrumb */}
        <div className="py-4 text-[13px] text-taca-text-muted">
          <Link to="/" className="hover:text-taca-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="hover:text-taca-primary transition-colors cursor-pointer">Tài khoản</span>
          <span className="mx-2">/</span>
          <span className="text-taca-text-main font-medium">{getBreadcrumbName()}</span>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6 mt-4 items-start">
          <AccountSidebar />
          
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-taca-border min-h-[600px] overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
