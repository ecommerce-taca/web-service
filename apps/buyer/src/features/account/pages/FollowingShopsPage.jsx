import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, Search, X,  Users } from 'lucide-react';
import { Badge } from '@taca/ui-components';
import { shopApi } from '../../shops/services/shop.api';

const FollowingShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shopApi.getFollowingShops();
      const list = res?.data || [];
      setShops(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[FollowingShopsPage] fetchFollowing error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowing();

    const handleUpdate = () => {
      fetchFollowing();
    };
    window.addEventListener('taca:following_updated', handleUpdate);
    return () => {
      window.removeEventListener('taca:following_updated', handleUpdate);
    };
  }, [fetchFollowing]);

  const handleUnfollow = async (shopId) => {
    if (actionLoadingId) return;
    setActionLoadingId(shopId);
    try {
      await shopApi.unfollowShop(shopId);
      setShops((prev) => prev.filter((s) => s.shop_id !== shopId && s.id !== shopId));
    } catch (err) {
      console.error('[FollowingShopsPage] unfollow error:', err);
      alert('Không thể bỏ theo dõi gian hàng lúc này');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const name = shop.shop_name || shop.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-[20px] font-extrabold text-taca-text-main m-0 uppercase flex items-center gap-2">
              CỬA HÀNG ĐANG THEO DÕI
              <span className="text-slate-400 font-semibold text-[14px]">
                ({shops.length})
              </span>
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 mb-0">
              Cập nhật ưu đãi, sản phẩm mới nhất từ các gian hàng bạn quan tâm
            </p>
          </div>

          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm cửa hàng..."
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-taca-primary focus:bg-white w-full sm:w-[260px] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 animate-pulse flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                  <div className="h-8 bg-slate-200 rounded-lg" />
                  <div className="h-8 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShops.map((item) => {
              const shopId = item.shop_id || item.id;
              const name = item.shop_name || item.name || 'Gian hàng Taca';
              const rating = item.rating || 4.9;
              const followers = item.followers_count || 12500;
              const isOfficial = item.is_official ?? true;
              const isUnfollowing = actionLoadingId === shopId;

              return (
                <div
                  key={shopId}
                  className="p-5 border border-slate-200/90 rounded-2xl bg-white hover:border-taca-primary/50 hover:shadow-sm transition-all flex flex-col justify-between h-full"
                >
                  {/* Top: Avatar & Info */}
                  <div className="flex items-start gap-4">
                    {/* Shop Avatar */}
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex flex-col items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                        <Store className="w-6 h-6 text-white/90" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/shop/${shopId}`}
                          className="font-bold text-[15px] text-slate-900 hover:text-taca-primary no-underline transition-colors line-clamp-1"
                          title={name}
                        >
                          {name}
                        </Link>
                        {isOfficial && (
                          <Badge variant="official" className="text-[10px] py-0 px-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold shrink-0">
                            Mall
                          </Badge>
                        )}
                      </div>

                      <div className="text-[12px] text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rating}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{(followers >= 1000 ? `${(followers / 1000).toFixed(1)}k` : followers)} theo dõi</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to={`/shop/${shopId}`}
                      className="px-3 py-2 rounded-xl bg-indigo-50/70 hover:bg-taca-primary text-taca-primary hover:text-white text-[12px] font-bold no-underline transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Xem Shop</span>
                    </Link>
                    <button
                      type="button"
                      disabled={isUnfollowing}
                      onClick={() => handleUnfollow(shopId)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-[12px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isUnfollowing ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Bỏ theo dõi</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 mt-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 text-taca-primary rounded-2xl flex items-center justify-center mb-3.5 shadow-xs">
              <Store className="w-8 h-8 text-taca-primary" />
            </div>
            <h3 className="text-[16px] font-bold text-taca-text-main mb-1">
              {search ? 'Không tìm thấy cửa hàng nào phù hợp' : 'Bạn chưa theo dõi cửa hàng nào'}
            </h3>
            <p className="text-[13px] text-taca-text-muted max-w-sm mb-6 leading-relaxed">
              Theo dõi các gian hàng uy tín để cập nhật mã giảm giá độc quyền, thông báo flash sale và sản phẩm mới nhất.
            </p>
            <Link
              to="/search"
              className="px-6 py-2.5 bg-taca-primary hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold transition-colors no-underline shadow-sm"
            >
              Khám phá gian hàng nổi bật
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingShopsPage;
