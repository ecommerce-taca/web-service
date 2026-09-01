
import { Routes, Route, Navigate } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import AccountLayout from '../features/account/layouts/AccountLayout';
import ProfilePage from '../features/account/pages/ProfilePage';

import OrdersPage from '../features/account/pages/OrdersPage';
import ReviewsPage from '../features/account/pages/ReviewsPage';
import VouchersPage from '../features/account/pages/VouchersPage';
import WishlistPage from '../features/account/pages/WishlistPage';

export default function RemoteApp() {
  return (
    <Routes>
      <Route element={<BuyerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="overview" element={<div className="p-8">Tổng quan (Sắp ra mắt)</div>} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="vouchers" element={<VouchersPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
