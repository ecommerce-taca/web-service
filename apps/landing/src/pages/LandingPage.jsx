import { useEffect, useState } from 'react';
import LandingHeader from '../components/LandingHeader';
import LandingHero from '../components/LandingHero';
import TrustStrip from '../components/TrustStrip';
import AudiencePaths from '../components/AudiencePaths';
import FeaturedCategoryGrid from '../components/FeaturedCategoryGrid';
import BuyingSteps from '../components/BuyingSteps';
import SellerSection from '../components/SellerSection';
import FeeSection from '../components/FeeSection';
import IosNotifyBlock from '../components/IosNotifyBlock';
import FaqSection from '../components/FaqSection';
import LandingFooter from '../components/LandingFooter';
import IosComingSoonDialog from '../components/IosComingSoonDialog';
import SpectrumDefs from '../components/SpectrumDefs';
import { SECTION_IDS } from '../constants/landingContent';
import { useLandingScroll } from '../hooks/useLandingScroll';
import { prefersReducedMotion } from '../utils/motion';
import '../landing.css';

const HEADER_SECTIONS = [SECTION_IDS.shop, SECTION_IDS.sell, SECTION_IDS.faq];

// Cuộn mượt khi bấm link neo (#fees, #faq...) trong lúc ở landing page
function useSmoothAnchorScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);
}

// Không cho chọn/sao chép nội dung trang; ô nhập liệu vẫn dùng bình thường
const blockCopy = (event) => {
  const tagName = event.target?.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
  event.preventDefault();
};

export default function LandingPage() {
  const [isIosDialogOpen, setIsIosDialogOpen] = useState(false);
  // Số lần khách bấm Đồng ý: khối đăng ký hiện ra từ lần đầu, các lần sau cuộn lại tới khối
  const [iosNotifyRequest, setIosNotifyRequest] = useState(0);
  const { isScrolled, showMiniSearch, activeSection } = useLandingScroll(HEADER_SECTIONS);

  useSmoothAnchorScroll();

  const handleAcceptIos = () => {
    setIsIosDialogOpen(false);
    setIosNotifyRequest((count) => count + 1);
  };

  return (
    <div
      className="taca-landing min-h-screen bg-white text-slate-900"
      onCopy={blockCopy}
      onCut={blockCopy}
      onDragStart={blockCopy}
    >
      <SpectrumDefs />
      <LandingHeader activeSection={activeSection} isScrolled={isScrolled} showMiniSearch={showMiniSearch} />
      <main>
        <LandingHero />
        <TrustStrip />
        <AudiencePaths />
        <FeaturedCategoryGrid />
        <BuyingSteps />
        <SellerSection />
        <FeeSection />
        {iosNotifyRequest > 0 && <IosNotifyBlock scrollRequest={iosNotifyRequest} />}
        <FaqSection />
      </main>
      <LandingFooter onOpenIosDialog={() => setIsIosDialogOpen(true)} />
      {isIosDialogOpen && (
        <IosComingSoonDialog onClose={() => setIsIosDialogOpen(false)} onAccept={handleAcceptIos} />
      )}
    </div>
  );
}
