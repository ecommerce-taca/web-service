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
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-[640px] rounded-card border border-taca-border bg-white px-5 py-10 text-center shadow-brand sm:px-8">
          <h2 className="mb-3 text-[20px] font-bold text-taca-text-main">{error || 'Không tìm thấy sản phẩm'}</h2>
          <Link to="/" className="inline-flex min-h-[44px] items-center rounded-control bg-taca-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-taca-primary-hover">
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
        <span className="text-taca-text-main font-semibold truncate max-w-[240px] sm:max-w-[420px]">{product.name}</span>
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
