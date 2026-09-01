import { Routes, Route } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import { AuthProvider } from '../features/auth/contexts/AuthProvider';
import AuthModal from '../features/auth/components/AuthModal';
import SearchLayout from '../features/search/layouts/SearchLayout';
import SearchPage from '../features/search/pages/SearchPage';

export default function RemoteApp() {
  return (
    <AuthProvider>
      <AuthModal />
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
        </Route>
        <Route path="/search" element={<SearchLayout />}>
          <Route index element={<SearchPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
