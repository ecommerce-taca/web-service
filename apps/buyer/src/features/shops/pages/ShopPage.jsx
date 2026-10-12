import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShopHero from '../components/ShopHero';
import ShopVouchers from '../components/ShopVouchers';
import ShopProductFilter from '../components/ShopProductFilter';
import ShopProductList from '../components/ShopProductList';
import { shopApi } from '../services/shop.api';

const DEFAULT_SHOP_ID = '01912f31-7a1b-7c12-9c55-8b1c34a6d921';

const ShopPage = () => {
  const { id, shopId: routeShopId } = useParams();
  const shopId = routeShopId || id || DEFAULT_SHOP_ID;
  const [shopName, setShopName] = useState('Gian hàng Taca');

  useEffect(() => {
    let isMounted = true;
    shopApi
      .getShopProfile(shopId)
      .then((res) => {
        if (!isMounted) return;
        const profile = res?.data || res;
        if (profile?.name) {
          setShopName(profile.name);
        }
      })
      .catch((err) => {
        console.warn('[ShopPage] Failed to load shop name for breadcrumb', err);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  return (
    <div className="bg-taca-surface min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="py-4 text-[12px] text-taca-text-muted font-medium flex gap-2 items-center">
        <Link to="/" className="hover:text-taca-primary no-underline text-inherit">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-taca-text-muted">Cửa hàng</span>
        <span>/</span>
        <span className="text-taca-text-main font-semibold truncate max-w-[280px]">
          {shopName}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Shop Header with real API integration */}
        <ShopHero shopId={shopId} onShopLoaded={(data) => data?.name && setShopName(data.name)} />

        {/* Vouchers */}
        <ShopVouchers />

        {/* Content Area */}
        <div className="bg-white p-6 border border-taca-border rounded-[12px]">
          <ShopProductFilter />
          <ShopProductList shopId={shopId} />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
