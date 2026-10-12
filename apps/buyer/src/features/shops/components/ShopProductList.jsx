import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../../products/components/ProductCard';
import { productApi } from '../../products/services/product.api';

const ShopProductList = ({ shopId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    productApi
      .getShopProducts(shopId)
      .then((res) => {
        if (!isMounted) return;
        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        setProducts(items);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[ShopProductList] Lỗi khi tải sản phẩm gian hàng:', err);
        setError('Không thể tải danh sách sản phẩm gian hàng.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-taca-text-main m-0">Sản phẩm của gian hàng</h2>
        {!loading && !error && (
          <span className="text-[13px] text-taca-text-muted font-medium">
            {products.length} sản phẩm
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-600 text-[14px]">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-taca-text-muted text-[14px]">
          Gian hàng hiện chưa có sản phẩm nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id || product.product_id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ShopProductList.propTypes = {
  shopId: PropTypes.string,
};

export default ShopProductList;
