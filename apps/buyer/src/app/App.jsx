import { lazy, Suspense } from 'react';
import { BrowserRouter, useInRouterContext, Routes, Route, Navigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import BuyerLayout from '../layouts/BuyerLayout';
import { AuthProvider } from '../features/auth/contexts/AuthProvider';
import { CartProvider } from '../features/cart/contexts/CartProvider';
import { FavoritesProvider } from '../features/products/contexts/FavoritesProvider';
import AuthModal from '../features/auth/components/AuthModal';
import ScrollToTop from '../components/common/ScrollToTop';
import { ErrorBoundary } from '@taca/ui-components';

// Route-level Lazy Loading (AUD-03)
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const SearchPage = lazy(() => import('../features/search/pages/SearchPage'));
const ProductDetailPage = lazy(() => import('../features/products/pages/ProductDetailPage'));
const CategoryLandingPage = lazy(() => import('../features/products/pages/CategoryLandingPage'));
const ShopPage = lazy(() => import('../features/shops/pages/ShopPage'));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const AccountLayout = lazy(() => import('../features/account/layouts/AccountLayout'));
const ProfilePage = lazy(() => import('../features/account/pages/ProfilePage'));
const OrdersPage = lazy(() => import('../features/account/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../features/account/pages/OrderDetailPage'));
const ReviewsPage = lazy(() => import('../features/account/pages/ReviewsPage'));
const VouchersPage = lazy(() => import('../features/account/pages/VouchersPage'));
const WishlistPage = lazy(() => import('../features/account/pages/WishlistPage'));
const FollowingShopsPage = lazy(() => import('../features/account/pages/FollowingShopsPage'));
const SellerRegisterPage = lazy(() => import('../features/account/pages/SellerRegisterPage'));
const CartPage = lazy(() => import('../features/cart/pages/CartPage'));
const CheckoutPage = lazy(() => import('../features/checkout/pages/CheckoutPage'));
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-8 h-8 border-3 border-taca-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px] font-medium text-slate-500">Đang tải trang...</span>
    </div>
  );
}

function SellerRedirectNotice() {
  const hostUrl = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:5173${window.location.pathname}${window.location.search}`
    : '/seller';

  return (
    <div className="py-16 text-center max-w-lg mx-auto space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center justify-center mx-auto shadow-xs">
        <Store className="w-8 h-8 text-[#4F46E5]" />
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
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route element={<BuyerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
            <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryLandingPage />} />
            
            {/* Dynamic Shop ID Routing (AUD-02) */}
            <Route path="/shop/:id" element={<ShopPage />} />
            <Route path="/shop/:shopId" element={<ShopPage />} />
            <Route path="/shops/:id" element={<ShopPage />} />
            <Route path="/shops/:shopId" element={<ShopPage />} />

            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
            
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="overview" element={<Navigate to="profile" replace />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="following" element={<FollowingShopsPage />} />
              <Route path="seller-register" element={<SellerRegisterPage />} />
            </Route>

            <Route path="/seller/*" element={<SellerRedirectNotice />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  const inRouter = useInRouterContext();

  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ErrorBoundary message="Không thể tải trang mua sắm. Vui lòng thử lại hoặc tải lại trang.">
            {inRouter ? (
              <AppContent />
            ) : (
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            )}
          </ErrorBoundary>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
