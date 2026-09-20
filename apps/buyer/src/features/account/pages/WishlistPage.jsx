import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../products/components/ProductCard';
import { favoritesApi } from '../services/favorites.api';

const WishlistPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await favoritesApi.getFavorites();
      setFavorites(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoritesApi.removeFavorite(productId);
      setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
    } catch (error) {
      console.error('Failed to remove favorite', error);
      alert('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  const filteredFavorites = favorites.filter(fav => 
    fav.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        <div className="flex justify-between items-center mb-6">
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
          <button className="px-4 py-1.5 border border-taca-primary text-taca-primary rounded-full text-[13px] font-bold bg-taca-primary/5">
            Tất cả {favorites.length}
          </button>
          <button className="px-4 py-1.5 border border-gray-200 text-taca-text-main rounded-full text-[13px] hover:bg-gray-50 transition-colors">
            Đang giảm giá 0
          </button>
          <button className="px-4 py-1.5 border border-gray-200 text-taca-text-main rounded-full text-[13px] hover:bg-gray-50 transition-colors">
            Sắp hết hàng 0
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải sản phẩm yêu thích...</div>
        ) : filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFavorites.map(product => (
              <ProductCard 
                key={product.id} 
                id={product.product_id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                rating={product.rating}
                sold={product.sold}
                image={product.image}
                isFavorite={true}
                onToggleFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
            Chưa có sản phẩm nào trong danh sách yêu thích
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
