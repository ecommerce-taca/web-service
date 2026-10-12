import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Dark Sidebar matching Penpot */}
      <AdminSidebar
        user={adminUser}
        onSignOut={handleSignOut}
        onOpen2FA={() => setIs2FASetupOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Admin Operations"
          subtitle="Quản trị sàn, hồ sơ KYC, phân quyền tài khoản & kiểm toán an ninh."
          searchValue={searchValue}
          onSearch={setSearchValue}
        />

        <main className="flex-1 p-8 overflow-y-auto">
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
