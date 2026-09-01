import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';

export default function RemoteApp() {
  return (
    <Routes>
      <Route element={<BuyerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
      </Route>
    </Routes>
  );
}
