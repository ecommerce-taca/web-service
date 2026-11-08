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
      <div className="py-6 sm:py-8 animate-pulse" aria-label="Đang tải thông tin sản phẩm">
        <div className="h-4 bg-taca-border rounded-control w-1/3 max-w-[220px] mb-5"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-brand-8">
          <div className="lg:col-span-5 aspect-square lg:h-[480px] lg:aspect-auto bg-taca-border rounded-card"></div>
          <div className="lg:col-span-7 flex flex-col gap-4 rounded-card border border-taca-border bg-white p-4 sm:p-6">
            <div className="h-7 bg-taca-border rounded-control w-3/4"></div>
            <div className="h-5 bg-taca-border rounded-control w-2/5"></div>
            <div className="h-16 bg-taca-surface rounded-card w-full"></div>
            <div className="h-24 bg-taca-surface rounded-card w-full"></div>
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
    <div className="py-4 sm:py-6 flex flex-col gap-5 sm:gap-brand-6">
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1 text-[12px] sm:text-[13px] text-taca-text-muted overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
        <Link to="/" className="text-taca-text-muted hover:text-taca-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/category/dien-thoai" className="text-taca-text-muted hover:text-taca-primary transition-colors">Điện thoại</Link>
        <span>/</span>
        <span className="text-taca-text-main font-semibold">{product.title || product.name}</span>
      </nav>

      <div className="flex flex-col gap-5 sm:gap-brand-6">
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
