import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductPurchase from '../components/ProductPurchase';
import ProductShopCard from '../components/ProductShopCard';
import ProductContentTabs from '../components/ProductContentTabs';
import ProductReviews from '../components/ProductReviews';
import { productApi } from '../services/product.api';
import { useFavorites } from '../hooks/useFavorites';
import { normalizeProduct } from '../../../../../../shared/utils/adapters/product.adapter';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback((targetId) => {
    setLoading(true);
    setError(null);

    productApi.getProductById(targetId)
      .then(res => {
        const raw = res?.data?.data || res?.data || res;
        const normalized = normalizeProduct(raw);
        setProduct(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load product detail', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại!');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchProduct(id);
    }
    return () => {
      isMounted = false;
    };
  }, [id, fetchProduct]);

  if (loading) {
    return (
      <div className="py-12 max-w-[1440px] mx-auto px-4 lg:px-[80px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-[400px] bg-gray-200 rounded-xl"></div>
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Không tìm thấy sản phẩm'}</h2>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => fetchProduct(id)}
            className="px-4 py-2 bg-taca-primary text-white rounded-lg font-medium hover:bg-taca-primary-dark transition-colors cursor-pointer text-sm"
          >
            Thử lại
          </button>
          <Link to="/" className="text-taca-primary font-medium hover:underline text-sm">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[13px] text-taca-text-muted">
        <Link to="/" className="text-taca-text-muted hover:text-taca-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/category/dien-thoai" className="text-taca-text-muted hover:text-taca-primary transition-colors">Điện thoại</Link>
        <span>/</span>
        <span className="text-taca-text-main font-semibold">{product.title || product.name}</span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Product Purchase (Gallery & Info) */}
        <ProductPurchase 
          product={product} 
          isFavorite={isFavorite(product.id)}
          onToggleFavorite={() => toggleFavorite(product)}
        />
        
        {/* Shop Card */}
        {product.shop && <ProductShopCard shop={product.shop} />}
        
        {/* Content Tabs */}
        <ProductContentTabs 
          description={product.description} 
          reviewCount={product.reviewCount} 
        />

        {/* Ratings & Comments */}
        <ProductReviews 
          productId={product.id || id}
          rating={product.rating} 
          reviewCount={product.reviewCount} 
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
