import { Link } from 'react-router-dom';
import ShopHero from '../components/ShopHero';
import ShopVouchers from '../components/ShopVouchers';
import ShopProductFilter from '../components/ShopProductFilter';
import ShopProductList from '../components/ShopProductList';

const ShopPage = () => {
  return (
    <div className="bg-taca-surface min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-[80px] py-4 text-[12px] text-taca-text-muted font-medium flex gap-2">
        <Link to="/" className="hover:text-taca-primary no-underline text-inherit">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-taca-primary no-underline text-inherit">Cửa hàng</Link>
        <span>/</span>
        <span className="text-taca-text-main">Taca Apple Flagship Store</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-[80px]">
        {/* Shop Header */}
        <ShopHero />
        
        {/* Vouchers */}
        <ShopVouchers />

        {/* Content Area */}
        <div className="bg-white p-6 border border-taca-border rounded-[12px]">
          <ShopProductFilter />
          <ShopProductList />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
