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
import SellerRegisterPage from '../features/account/pages/SellerRegisterPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import ScrollToTop from '../components/common/ScrollToTop';

function SellerRedirectNotice() {
  const hostUrl = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:5173${window.location.pathname}${window.location.search}`
    : '/seller';

  return (
    <div className="py-16 text-center max-w-lg mx-auto space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center justify-center text-3xl mx-auto shadow-xs">
        🏪
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Chuyển hướng sang Kênh Người Bán
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Bạn đang truy cập trực tiếp từ cổng độc lập <strong>Buyer (Port 5174)</strong>. Toàn bộ Kênh Người Bán và quy trình Onboarding hoạt động trên cổng tổng hợp <strong>Shell (Port 5173)</strong>.
        </p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={hostUrl}
          className="w-full sm:w-auto px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-sm shadow-sm transition-colors no-underline flex items-center justify-center gap-2"
        >
          <span>Mở tại Kênh Người Bán (Port 5173) →</span>
        </a>
        <a
          href="/"
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors no-underline"
        >
          ← Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}

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
            <Route path="seller-register" element={<SellerRegisterPage />} />
          </Route>

          <Route path="/seller/*" element={<SellerRedirectNotice />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
