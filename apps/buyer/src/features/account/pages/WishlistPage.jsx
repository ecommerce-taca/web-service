import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../../products/components/ProductCard';
import { useFavorites } from '../../products/hooks/useFavorites';

const WishlistPage = () => {
  const { favorites, removeFavorite } = useFavorites();
  const [search, setSearch] = useState('');

  const handleRemoveFavorite = (productId) => {
    removeFavorite(productId);
  };

  const filteredFavorites = favorites.filter(fav => 
    (fav.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-[20px] font-bold text-taca-text-main m-0 uppercase">
            SẢN PHẨM YÊU THÍCH <span className="text-gray-400 font-normal text-[14px] ml-2">{favorites.length} sản phẩm</span>
          </h1>
          
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm trong yêu thích" 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-taca-primary w-[240px]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <button className="px-4 py-1.5 border border-taca-primary text-taca-primary rounded-full text-[13px] font-bold bg-taca-primary/5 cursor-pointer">
            Tất cả {favorites.length}
          </button>
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFavorites.map(product => {
              const productId = product.id || product.product_id;
              return (
                <ProductCard 
                  key={productId} 
                  id={productId}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice || product.original_price}
                  discount={product.discount}
                  rating={product.rating}
                  soldCount={product.soldCount || product.sold || 0}
                  image={product.image}
                  isOfficial={product.isOfficial}
                  tags={product.tags}
                  isFavorite={true}
                  onToggleFavorite={() => handleRemoveFavorite(productId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-[16px] font-bold text-taca-text-main mb-1">
              {search ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào trong danh sách yêu thích'}
            </h3>
            <p className="text-[13px] text-taca-text-muted max-w-sm mb-6">
              Hãy thả tim những sản phẩm bạn quan tâm để dễ dàng theo dõi và mua sắm sau này.
            </p>
            <Link
              to="/search"
              className="px-6 py-2.5 bg-taca-primary text-white rounded-lg text-[13px] font-semibold hover:bg-indigo-700 transition-colors no-underline"
            >
              Khám phá sản phẩm ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
