import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import AccountLayout from '../features/account/layouts/AccountLayout';
import ProfilePage from '../features/account/pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
          
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="overview" element={<div className="p-8">Tổng quan (Sắp ra mắt)</div>} />
            <Route path="orders" element={<div className="p-8">Đơn mua (Sắp ra mắt)</div>} />
            <Route path="reviews" element={<div className="p-8">Đánh giá (Sắp ra mắt)</div>} />
            <Route path="vouchers" element={<div className="p-8">Voucher (Sắp ra mắt)</div>} />
            <Route path="wishlist" element={<div className="p-8">Sản phẩm yêu thích (Sắp ra mắt)</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
