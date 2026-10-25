import { lazy, Suspense } from 'react';
import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { ErrorBoundary } from '@taca/ui-components';

// Route-level Lazy Loading (AUD-03)
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const ProductsPage = lazy(() => import('../features/products/pages/ProductsPage'));
const InventoryPage = lazy(() => import('../features/inventory/pages/InventoryPage'));
const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'));
const VouchersPage = lazy(() => import('../features/vouchers/pages/VouchersPage'));
const FinancePage = lazy(() => import('../features/finance/pages/FinancePage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));
const OnboardingPage = lazy(() => import('../features/onboarding/pages/OnboardingPage'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px] font-medium text-slate-500">Đang tải Kênh Người Bán...</span>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<SellerLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="vouchers" element={<VouchersPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  // useInRouterContext returns false when outside a Router, true when inside
  const inRouter = useInRouterContext();

  return (
    <ErrorBoundary message="Đã xảy ra sự cố trong Kênh Người Bán. Vui lòng tải lại trang.">
      {inRouter ? (
        <AppRoutes />
      ) : (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      )}
    </ErrorBoundary>
  );
}
