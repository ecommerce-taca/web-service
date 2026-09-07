import { Routes, Route } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import ProfilePage from '../features/account/pages/ProfilePage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import { AuthProvider } from '../features/auth/contexts/AuthProvider';
import AuthModal from '../features/auth/components/AuthModal';

export default function RemoteApp() {
  return (
    <AuthProvider>
      <AuthModal />
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
