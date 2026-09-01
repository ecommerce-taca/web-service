import HeroSection from '../components/HeroSection';
import FlashSaleSection from '../components/FlashSaleSection';
import FeaturedCategories from '../components/FeaturedCategories';
import OfficialShops from '../components/OfficialShops';
import CampaignBanner from '../components/CampaignBanner';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-[24px]">
      {/* Top Section: Hero (840px) + Campaigns (424px) side by side */}
      <div className="flex gap-[16px]">
        {/* Left: Hero Banner */}
        <HeroSection />

        {/* Right: 2 Campaign Banners stacked */}
        <div className="flex flex-col gap-[16px]">
          <CampaignBanner
            brand="OFFICIAL BRAND"
            title="Gian Hàng Anker Chính Hãng"
            subtitle="GaN Prime sạc siêu nhanh 65W"
            ctaText="Xem sản phẩm"
            bgColor="#1e1b4b"
            textColor="#FFFFFF"
          />
          <CampaignBanner
            brand="NHÃ NAM BOOK"
            title="Hội Sách Nhã Nam Tri Ân"
            subtitle="Sách hay chọn lọc · đồng giá từ 49K"
            ctaText="Mua ngay"
            bgColor="#7c2d12"
            textColor="#FFFFFF"
          />
        </div>
      </div>

      <FlashSaleSection />
      <FeaturedCategories />
      <OfficialShops />
    </div>
  );
};

export default HomePage;
