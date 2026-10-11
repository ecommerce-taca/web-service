import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';

const BuyerApp = lazy(() => import('buyer/App'));
const SellerApp = lazy(() => import('seller/App'));
const AdminApp = lazy(() => import('admin/App'));

const Loading = () => <div className="p-8 text-center text-xl font-bold">Loading Micro-App...</div>;

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <nav className="bg-slate-950 text-white px-6 py-2.5 flex items-center justify-between sticky top-0 z-[100] border-b border-slate-800 text-[12px] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-sale text-[13px] tracking-tight">TACA HOST</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Micro-Frontends</span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline ${
                isActive ? 'bg-[#0A68FF] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span>🛍</span>
            <span>Buyer Storefront</span>
          </NavLink>
          <NavLink
            to="/seller"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline ${
                isActive ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span>🏪</span>
            <span>Seller Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 no-underline ${
                isActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span>⚙</span>
            <span>Admin Portal</span>
          </NavLink>
        </div>
      </nav>
      
      <div className="w-full">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/seller/*" element={<SellerApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*" element={<BuyerApp />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
