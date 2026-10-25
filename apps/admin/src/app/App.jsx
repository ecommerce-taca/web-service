import { lazy, Suspense } from 'react';
import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { ErrorBoundary } from '@taca/ui-components';

// Route-level Lazy Loading (AUD-03)
const AdminKycPage = lazy(() => import('../features/kyc/pages/AdminKycPage'));
const AdminUsersRolesPage = lazy(() => import('../features/users/pages/AdminUsersRolesPage'));
const AdminAuditLogsPage = lazy(() => import('../features/audit/pages/AdminAuditLogsPage'));
const AdminFinancePage = lazy(() => import('../features/finance/pages/AdminFinancePage'));
const AdminFeesTaxesPage = lazy(() => import('../features/finance/pages/AdminFeesTaxesPage'));
const AdminProductsPage = lazy(() => import('../features/products/pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('../features/categories/pages/AdminCategoriesPage'));
const AdminVouchersPage = lazy(() => import('../features/vouchers/pages/AdminVouchersPage'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px] font-medium text-slate-500">Đang tải Admin Portal...</span>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminKycPage />} />
          <Route path="shops/kyc" element={<AdminKycPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users/roles" element={<AdminUsersRolesPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="fees" element={<AdminFeesTaxesPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="dashboard" element={<AdminKycPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const inRouter = useInRouterContext();

  return (
    <ErrorBoundary message="Đã xảy ra sự cố trong Cổng Quản Trị. Vui lòng thử lại hoặc tải lại trang.">
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
