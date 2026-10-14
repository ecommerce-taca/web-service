import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Flame, ShieldCheck } from 'lucide-react';
import ProductCard from '../../products/components/ProductCard';
import productApi from '../../products/services/product.api';

const TABS = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'bestseller', label: 'Bán chạy', icon: Zap },
  { id: 'deals', label: 'Giảm sâu', icon: Flame },
  { id: 'official', label: 'Chính hãng', icon: ShieldCheck },
];

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    productApi.getProducts({ size: 15 }, { signal: controller.signal })
      .then((res) => {
        const items = res?.data?.items || res?.data || [];
        setProducts(items);
      })
      .catch((err) => {
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
        console.error('Error loading home products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'bestseller') {
      return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }
    if (activeTab === 'deals') {
      return products.filter((p) => (p.discount || 0) > 15 || p.isFlashSale);
    }
    if (activeTab === 'official') {
      return products.filter((p) => p.isOfficial || p.shop_projection?.is_official);
    }
    return products;
  }, [products, activeTab]);

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-tight m-0">
              GỢI Ý HÔM NAY DÀNH CHO BẠN
            </h2>
            <p className="text-[11px] text-slate-500 m-0 font-medium">
              Sản phẩm được chọn lọc dựa trên sở thích và xu hướng mua sắm
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-taca-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {IconComponent && (
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-5">
          {filteredProducts.slice(0, 10).map((product) => (
            <ProductCard key={product.id || product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-sm">
          Không có sản phẩm nào trong mục này.
        </div>
      )}

      {/* View More Button */}
      <div className="pt-8 text-center">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[13px] border border-slate-200 transition-all shadow-2xs hover:shadow-xs no-underline"
        >
          <span>Xem thêm nhiều sản phẩm khác</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
};

export default RecommendedProducts;
