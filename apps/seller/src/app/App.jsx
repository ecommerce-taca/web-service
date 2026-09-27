import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProductsPage from '../features/products/pages/ProductsPage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import VouchersPage from '../features/vouchers/pages/VouchersPage';
import FinancePage from '../features/finance/pages/FinancePage';
import SettingsPage from '../features/settings/pages/SettingsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="vouchers" element={<VouchersPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  // useInRouterContext returns false when outside a Router, true when inside
  const inRouter = useInRouterContext();

  if (inRouter) {
    return <AppRoutes />;
  }

  // Standalone mode (direct visit on port 5175)
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
