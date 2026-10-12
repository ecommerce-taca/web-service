import HeroSection from '../components/HeroSection';
import CampaignBanner from '../components/CampaignBanner';
import BenefitsBar from '../components/BenefitsBar';
import FlashSaleSection from '../components/FlashSaleSection';
import FeaturedCategories from '../components/FeaturedCategories';
import OfficialShops from '../components/OfficialShops';
import RecommendedProducts from '../components/RecommendedProducts';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Top Hero Row: Dynamic Carousel (flex-1) + 2 Campaign Banners stacked (w-[400px]) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left: Dynamic Hero Banner Carousel */}
        <HeroSection />

        {/* Right: 2 Stacked Premium Campaign Banners */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
          <CampaignBanner
            brand="OFFICIAL BRAND"
            title="Anker Flagship Store"
            subtitle="GaNPrime sạc siêu tốc 65W nhỏ gọn"
            ctaText="Khám phá ngay"
            bgColor="#1e1b4b"
            textColor="#FFFFFF"
            image="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&auto=format&fit=crop&q=80"
          />
          <CampaignBanner
            brand="NHÃ NAM BOOKS"
            title="Hội Sách Tri Ân Bạn Đọc"
            subtitle="Sách hay tuyển chọn đồng giá từ 49K"
            ctaText="Săn sách ngay"
            bgColor="#7c2d12"
            textColor="#FFFFFF"
            image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80"
          />
        </div>
      </div>

      {/* Consumer Protection & Service Guarantees */}
      <BenefitsBar />

      {/* Flash Sale Section with Real-time Countdown */}
      <FlashSaleSection />

      {/* Featured Categories with Vibrant Cards */}
      <FeaturedCategories />

      {/* Taca Mall Official Verified Brands */}
      <OfficialShops />

      {/* Recommended For You Product Catalog Grid */}
      <RecommendedProducts />
    </div>
  );
};

export default HomePage;
