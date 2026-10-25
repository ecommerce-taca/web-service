import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductPurchase from '../components/ProductPurchase';
import ProductShopCard from '../components/ProductShopCard';
import ProductContentTabs from '../components/ProductContentTabs';
import ProductReviews from '../components/ProductReviews';
import { productApi } from '../services/product.api';
import { useFavorites } from '../hooks/useFavorites';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    productApi.getProductById(id)
      .then(res => {
        if (isMounted) {
          setProduct(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to load product detail', err);
          setError('Không thể tải thông tin sản phẩm');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

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
        <Link to="/" className="text-taca-primary font-medium hover:underline">
          Quay lại trang chủ
        </Link>
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
        <span className="text-taca-text-main font-semibold">{product.name}</span>
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
