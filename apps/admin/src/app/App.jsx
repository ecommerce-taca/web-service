import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminKycPage from '../features/kyc/pages/AdminKycPage';
import AdminUsersRolesPage from '../features/users/pages/AdminUsersRolesPage';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminKycPage />} />
        <Route path="shops/kyc" element={<AdminKycPage />} />
        <Route path="users/roles" element={<AdminUsersRolesPage />} />
        <Route path="dashboard" element={<AdminKycPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const inRouter = useInRouterContext();

  if (inRouter) {
    return <AppRoutes />;
  }

  // Standalone mode on port 5176
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
