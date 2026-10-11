import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminHeader from '../components/layout/AdminHeader';
import AdminLoginModal from '../components/common/AdminLoginModal';
import { getAdminUser, signoutAdmin } from '../services/admin-auth.api';

export default function AdminLayout() {
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
      <AdminSidebar user={adminUser} onSignOut={handleSignOut} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Shops / KYC"
          subtitle="Xác minh người bán, hồ sơ pháp lý và tín hiệu rủi ro."
          searchValue={searchValue}
          onSearch={setSearchValue}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Login Modal Guard */}
      <AdminLoginModal
        isOpen={isLoginModalOpen || !adminUser}
        onClose={adminUser ? () => setIsLoginModalOpen(false) : undefined}
        onSuccess={() => {
          setAdminUser(getAdminUser());
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}
