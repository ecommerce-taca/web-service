import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuyerLayout from '../layouts/BuyerLayout';
import HomePage from '../features/home/pages/HomePage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';
import CategoryLandingPage from '../features/products/pages/CategoryLandingPage';
import { AuthProvider } from '../features/auth/contexts/AuthProvider';
import AuthModal from '../features/auth/components/AuthModal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthModal />
        <Routes>
          <Route element={<BuyerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/category/:categorySlug?" element={<CategoryLandingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
