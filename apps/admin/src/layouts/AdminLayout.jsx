import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminHeader from '../components/layout/AdminHeader';
import AdminLoginModal from '../components/common/AdminLoginModal';
import Admin2FASetupModal from '../components/common/Admin2FASetupModal';
import { getAdminUser, signoutAdmin } from '../services/admin-auth.api';

export default function AdminLayout() {
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const headerInfo = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/categories')) {
      return {
        title: 'Categories & Taxonomy',
        subtitle: 'Quản trị cây danh mục sàn, thuế suất VAT và thuộc tính chuẩn ngành hàng.',
      };
    }
    if (path.includes('/products')) {
      return {
        title: 'Products / SKU',
        subtitle: 'Kiểm duyệt sản phẩm sàn, quản lý phân loại SKU và trạng thái hiển thị.',
      };
    }
    if (path.includes('/fees')) {
      return {
        title: 'Fees & Taxes',
        subtitle: 'Biểu phí nền tảng, thuế VAT tự động và cấu hình khấu trừ người bán.',
      };
    }
    if (path.includes('/finance')) {
      return {
        title: 'Finance & Settlements',
        subtitle: 'Đối soát tài chính theo phiên, quản lý số dư ký quỹ sàn và giải ngân.',
      };
    }
    if (path.includes('/campaigns')) {
      return {
        title: 'Campaigns & Marketing',
        subtitle: 'Chương trình khuyến mãi toàn sàn, mega sales và banner quảng bá.',
      };
    }
    if (path.includes('/orders')) {
      return {
        title: 'Orders & Disputes',
        subtitle: 'Xử lý khiếu nại đơn hàng, tranh chấp người mua - người bán và hoàn tiền.',
      };
    }
    if (path.includes('/vouchers')) {
      return {
        title: 'Platform Vouchers',
        subtitle: 'Mã giảm giá toàn sàn, ngân sách trợ giá và chính sách phát hành.',
      };
    }
    if (path.includes('/users') || path.includes('/roles')) {
      return {
        title: 'Users & Roles',
        subtitle: 'Phân quyền tài khoản quản trị, ma trận RBAC và bảo mật 2FA.',
      };
    }
    if (path.includes('/audit-logs')) {
      return {
        title: 'Audit Logs',
        subtitle: 'Nhật ký kiểm toán an ninh, vết truy vết thao tác và an toàn dữ liệu.',
      };
    }
    if (path.includes('/settings')) {
      return {
        title: 'System Settings',
        subtitle: 'Cấu hình hệ thống, ngưỡng rủi ro gian hàng và kết nối dịch vụ.',
      };
    }
    return {
      title: 'Shops / KYC Review',
      subtitle: 'Xác minh hồ sơ người bán, thẩm định pháp lý và kiểm soát rủi ro gian hàng.',
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      const current = getAdminUser();
      setAdminUser(current);
      if (!current) {
        setIsLoginModalOpen(true);
      }
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  const handleSignOut = async () => {
    await signoutAdmin();
    setAdminUser(null);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">
      {/* Mobile/Tablet Off-canvas Drawer with Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] h-full shadow-2xl flex flex-col">
            <AdminSidebar
              user={adminUser}
              onSignOut={handleSignOut}
              onOpen2FA={() => setIs2FASetupOpen(true)}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar (Part of flex flow, never overlaps content) */}
      <div className="hidden lg:flex w-[260px] shrink-0 flex-col h-screen sticky top-0 z-30 border-r border-slate-800 overflow-hidden">
        <AdminSidebar
          user={adminUser}
          onSignOut={handleSignOut}
          onOpen2FA={() => setIs2FASetupOpen(true)}
        />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          searchValue={searchValue}
          onSearch={setSearchValue}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </main>
      </div>

      {/* Admin Login Modal Guard with 2FA TOTP support (#12) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen || !adminUser}
        onClose={adminUser ? () => setIsLoginModalOpen(false) : undefined}
        onSuccess={() => {
          setAdminUser(getAdminUser());
          setIsLoginModalOpen(false);
        }}
      />

      {/* Admin 2FA Setup Modal (#11 & #12) */}
      <Admin2FASetupModal
        isOpen={is2FASetupOpen}
        onClose={() => setIs2FASetupOpen(false)}
        onEnrollSuccess={() => {
          setAdminUser(getAdminUser());
        }}
      />
    </div>
  );
}
