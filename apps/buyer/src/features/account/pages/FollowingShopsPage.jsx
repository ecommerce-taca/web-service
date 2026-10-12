import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {  Badge } from '@taca/ui-components';
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-[20px] font-bold text-taca-text-main m-0 uppercase flex items-center gap-2">
            CỬA HÀNG ĐANG THEO DÕI
            <span className="text-gray-400 font-normal text-[14px]">
              ({shops.length} cửa hàng)
            </span>
          </h1>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm cửa hàng..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-taca-primary w-[240px]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-5 border border-slate-100 rounded-xl bg-slate-50 animate-pulse flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
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
                  className="p-5 border border-slate-200 rounded-xl bg-white hover:border-taca-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    {/* Shop Avatar */}
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={name}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-[9px] shrink-0 p-1 text-center">
                        <span className="text-[#0A68FF] text-[10px]">taca</span>
                        <span className="line-clamp-2 uppercase leading-tight">{name.slice(0, 10)}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/shop/${shopId}`}
                          className="font-bold text-[15px] text-slate-800 hover:text-taca-primary no-underline transition-colors line-clamp-1"
                        >
                          {name}
                        </Link>
                        {isOfficial && (
                          <Badge variant="official" className="text-[10px] py-0 px-1.5 border border-taca-primary shrink-0">
                            Mall
                          </Badge>
                        )}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-3">
                        <span className="text-amber-500 font-semibold">★ {rating}</span>
                        <span>•</span>
                        <span>{(followers >= 1000 ? `${(followers / 1000).toFixed(1)}k` : followers)} người theo dõi</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    <Link
                      to={`/shop/${shopId}`}
                      className="px-3.5 py-1.5 rounded-lg border border-taca-primary text-taca-primary hover:bg-taca-primary/5 text-[12px] font-bold no-underline transition-colors"
                    >
                      Xem Shop
                    </Link>
                    <button
                      type="button"
                      disabled={isUnfollowing}
                      onClick={() => handleUnfollow(shopId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      {isUnfollowing ? 'Đang bỏ...' : 'Bỏ theo dõi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-[#0A68FF] rounded-full flex items-center justify-center text-2xl mb-3">
              🏪
            </div>
            <h3 className="text-[16px] font-bold text-taca-text-main mb-1">
              {search ? 'Không tìm thấy cửa hàng nào phù hợp' : 'Bạn chưa theo dõi cửa hàng nào'}
            </h3>
            <p className="text-[13px] text-taca-text-muted max-w-sm mb-6">
              Theo dõi các thương hiệu và gian hàng uy tín để nhận thông báo khuyến mãi và mã giảm giá độc quyền.
            </p>
            <Link
              to="/search"
              className="px-6 py-2.5 bg-taca-primary text-white rounded-lg text-[13px] font-semibold hover:bg-indigo-700 transition-colors no-underline"
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
