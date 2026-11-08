import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Star, Check, Plus } from 'lucide-react';
import { Button, Badge } from '@taca/ui-components';
import { shopApi } from '../services/shop.api';

const DEFAULT_SHOP_ID = '01912f31-7a1b-7c12-9c55-8b1c34a6d921';

const formatFollowersCount = (count) => {
  if (!count && count !== 0) return '0';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
  }
  return count.toLocaleString('vi-VN');
};

const ShopHero = ({ shopId, onShopLoaded }) => {
  const routeParams = useParams();
  const effectiveShopId = shopId || routeParams?.shopId || routeParams?.id || DEFAULT_SHOP_ID;

  const [shop, setShop] = useState(null);
  const [followersCount, setFollowersCount] = useState(12500);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followActionLoading, setFollowActionLoading] = useState(false);

  // Fetch dữ liệu Shop Profile (#45) & Followers Count (#44)
  const fetchShopData = useCallback(async () => {
    if (!effectiveShopId) return;
    setLoading(true);
    try {
      const [profileRes, countRes] = await Promise.allSettled([
        shopApi.getShopProfile(effectiveShopId),
        shopApi.getShopFollowerCount(effectiveShopId),
      ]);

      let loadedProfile = null;
      if (profileRes.status === 'fulfilled') {
        const payload = profileRes.value?.data || profileRes.value;
        loadedProfile = payload;
        setShop(payload);
        if (typeof payload.is_following === 'boolean') {
          setIsFollowing(payload.is_following);
        }
        if (onShopLoaded) {
          onShopLoaded(payload);
        }
      } else {
        console.error('[ShopHero] getShopProfile error:', profileRes.reason);
      }

      if (countRes.status === 'fulfilled') {
        const countPayload = countRes.value?.data || countRes.value;
        const count = countPayload?.followers_count ?? loadedProfile?.followers_count ?? 12500;
        setFollowersCount(count);
      } else if (loadedProfile?.followers_count) {
        setFollowersCount(loadedProfile.followers_count);
      }
    } catch (err) {
      console.error('[ShopHero] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveShopId, onShopLoaded]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // Xử lý Follow / Unfollow (#41 & #42)
  const handleToggleFollow = async () => {
    if (!effectiveShopId || followActionLoading) return;
    setFollowActionLoading(true);
    try {
      if (isFollowing) {
        // #42 DELETE /shops/{shopId}/follow
        await shopApi.unfollowShop(effectiveShopId);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        // #41 POST /shops/{shopId}/follow
        await shopApi.followShop(effectiveShopId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('[ShopHero] handleToggleFollow error:', err);
      alert(err?.response?.data?.message || err?.message || 'Thao tác theo dõi thất bại');
    } finally {
      setFollowActionLoading(false);
    }
  };

  if (loading && !shop) {
    return (
      <div className="bg-white p-4 sm:p-6 border border-taca-border rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-pulse">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] bg-taca-surface rounded-control" />
          <div className="space-y-3">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-24 h-10 bg-slate-200 rounded-[8px]" />
          <div className="w-24 h-10 bg-slate-200 rounded-[8px]" />
        </div>
      </div>
    );
  }

  const shopName = shop?.name || 'Gian hàng Taca';
  const isOfficial = shop?.is_official ?? true;
  const rating = shop?.rating || 4.9;
  const responseRate = shop?.response_rate || '98%';
  const responseTime = shop?.response_time || 'Hoạt động gần đây';
  const logoUrl = shop?.logo_url;

  return (
    <div className="bg-gradient-to-r from-[#F4F8FF] via-white to-white p-4 sm:p-6 border border-taca-border rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-brand">
      {/* Left side: Logo and Info */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
        {/* Shop Logo */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={shopName}
            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-control object-cover border border-taca-border shrink-0 bg-white"
          />
        ) : (
          <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] bg-white border border-taca-border text-taca-text-main flex flex-col items-center justify-center rounded-control shrink-0 text-[10px] font-bold p-1 text-center shadow-brand">
            <span className="text-taca-primary font-black tracking-tight text-[12px]">taca</span>
            <span className="uppercase tracking-wider line-clamp-2 leading-tight text-taca-text-muted">
              {shopName.slice(0, 15)}
            </span>
          </div>
        )}

        {/* Shop Info */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[18px] sm:text-[20px] font-bold text-taca-text-main m-0 leading-snug">
              {shopName}
            </h1>
            {isOfficial && (
              <Badge variant="official" className="border border-taca-primary/30 !rounded-pill text-[11px] font-bold">
                Official Store
              </Badge>
            )}
          </div>

          <div className="text-[13px] text-taca-text-muted flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{responseTime}</span>
          </div>

          <div className="text-[13px] text-taca-text-main font-medium flex flex-wrap items-center gap-3 sm:gap-4 mt-0.5">
            <span className="flex items-center gap-1">
              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </span>
              <span>Đánh giá</span>
            </span>
            <span className="text-taca-border">|</span>
            <span>{responseRate} phản hồi</span>
            <span className="text-taca-border">|</span>
            <span className="font-semibold text-taca-text-main">
              {formatFollowersCount(followersCount)} người theo dõi
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-end md:self-center shrink-0">
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          onClick={handleToggleFollow}
          disabled={followActionLoading}
          className={`flex-1 sm:flex-none px-4 sm:px-5 h-[40px] rounded-control text-[13px] font-bold cursor-pointer transition-colors ${
            isFollowing
              ? '!bg-white !text-taca-text-main !border-taca-border hover:!bg-taca-primary-light hover:!text-taca-primary hover:!border-taca-primary/30'
              : '!bg-taca-primary !border-taca-primary !text-white hover:!bg-taca-primary-hover focus-visible:!ring-2 focus-visible:!ring-taca-primary/30'
          }`}
        >
          {followActionLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </span>
          ) : isFollowing ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Đang theo dõi
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Theo dõi
            </span>
          )}
        </Button>

        <Button
          variant="primary"
          className="flex-1 sm:flex-none px-4 sm:px-5 h-[40px] rounded-control text-[13px] font-bold cursor-pointer hover:bg-taca-primary-hover transition-colors"
        >
          Chat ngay
        </Button>
      </div>
    </div>
  );
};

ShopHero.propTypes = {
  shopId: PropTypes.string,
  onShopLoaded: PropTypes.func,
};

export default ShopHero;
