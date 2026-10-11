import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import SearchPage from '../features/search/pages/SearchPage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import ShopPage from '../features/shops/pages/ShopPage';
import { AuthProvider } from '../features/auth/contexts/AuthProvider';
import { CartProvider } from '../features/cart/contexts/CartProvider';
import { FavoritesProvider } from '../features/products/contexts/FavoritesProvider';
import AuthModal from '../features/auth/components/AuthModal';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import AccountLayout from '../features/account/layouts/AccountLayout';
import ProfilePage from '../features/account/pages/ProfilePage';
import OrdersPage from '../features/account/pages/OrdersPage';
import OrderDetailPage from '../features/account/pages/OrderDetailPage';
import ReviewsPage from '../features/account/pages/ReviewsPage';
import VouchersPage from '../features/account/pages/VouchersPage';
import WishlistPage from '../features/account/pages/WishlistPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import ScrollToTop from '../components/common/ScrollToTop';

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <AuthModal />
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
          <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryLandingPage />} />
          <Route path="/shop/:id" element={<ShopPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
          
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="overview" element={<div className="p-8">Tổng quan (Sắp ra mắt)</div>} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  const inRouter = useInRouterContext();

  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          {inRouter ? (
            <AppContent />
          ) : (
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          )}
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
