import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const BuyerApp = lazy(() => import('buyer/App'));
const SellerApp = lazy(() => import('seller/App'));
const AdminApp = lazy(() => import('admin/App'));

const Loading = () => <div className="p-8 text-center text-xl font-bold">Loading Micro-App...</div>;

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-slate-900 text-white p-4 flex gap-6 sticky top-0 z-50">
        <span className="font-bold text-sale">TACA MICRO-FE HOST</span>
        <Link to="/" className="hover:text-primary">Buyer Storefront</Link>
        <Link to="/seller" className="hover:text-primary">Seller Dashboard</Link>
        <Link to="/admin" className="hover:text-primary">Admin Portal</Link>
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
