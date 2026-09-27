import { Outlet } from 'react-router-dom';
import SellerHeader from './SellerHeader';
import SellerNav from './SellerNav';

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      <SellerHeader />
      <SellerNav />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* Seller Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 lg:px-12 text-center text-[12px] text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Taca Ecommerce System. Kênh Người Bán & Quản lý vận hành đa dịch vụ.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-700 cursor-pointer">Chính sách người bán</span>
            <span className="hover:text-slate-700 cursor-pointer">Quy chế hoạt động</span>
            <span className="hover:text-slate-700 cursor-pointer">Hỗ trợ: 1900 6688</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
