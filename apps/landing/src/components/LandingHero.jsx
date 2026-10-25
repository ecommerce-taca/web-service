import { useEffect, useRef, useState } from 'react';
import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import HeroArt from './HeroArt';
import { HERO_FEATURES, SECTION_IDS } from '../constants/landingContent';
import { TONES } from '../constants/tones';
import { searchUrl, storeUrl } from '../constants/links';

const FEATURE_ICONS = {
  genuine: ShieldCheck,
  modern: Sparkles,
  nationwide: Truck,
  refund: RotateCcw,
};

// Khối chữ nào đang ở giữa màn hình (1–4), 0 khi vẫn ở phần đầu hero
function useActiveFeature(containerRef) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = containerRef.current?.querySelectorAll('.feat');
      if (!items?.length) return;
      const viewportCenter = window.innerHeight / 2;
      let next = 0;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top + rect.height * 0.3 < viewportCenter) next = index + 1;
      });
      const lastRect = items[items.length - 1].getBoundingClientRect();
      if (lastRect.bottom < viewportCenter - 40) next = items.length;
      setActiveIndex(next);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [containerRef]);

  return activeIndex;
}

export default function LandingHero() {
  const [query, setQuery] = useState('');
  const featuresRef = useRef(null);
  const activeIndex = useActiveFeature(featuresRef);

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = query.trim();
    window.location.assign(searchUrl(keyword));
  };

  return (
    <section id={SECTION_IDS.top} className="tint-hero overflow-x-clip">
      <div className="hero-grid mx-auto max-w-[1200px] px-6 pb-16 pt-[72px]">
        <div className="hero-copy flex min-w-0 flex-col gap-6">
          <h1 className="m-0 text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.08] tracking-[-0.03em]">
            Mua chính hãng. <span className="grad-text">Bán toàn quốc.</span>
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-slate-600">
            Tìm sản phẩm, so sánh giá và đặt hàng không cần đăng nhập. Thanh toán trực tuyến hoặc khi nhận hàng.
            Taca là sàn thương mại điện tử nơi hàng nghìn shop bán trực tiếp cho bạn.
          </p>
          <form
            role="search"
            onSubmit={handleSearch}
            className="flex max-w-[560px] gap-2 rounded-[14px] border border-slate-300 bg-white p-1.5"
          >
            <label htmlFor="landing-hero-q" className="sr-only">Tìm sản phẩm</label>
            <input
              id="landing-hero-q"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm điện thoại, sách, đồ gia dụng…"
              className="min-w-0 flex-auto border-0 bg-transparent px-3.5 py-3 text-base text-slate-900 outline-offset-2"
            />
            <button
              type="submit"
              className="press grad-fill min-h-12 cursor-pointer whitespace-nowrap rounded-[10px] border-0 px-[22px] text-[15px] font-bold"
            >
              Tìm kiếm
            </button>
          </form>
          <div className="flex flex-wrap gap-3">
            <a href={storeUrl('/')} className="press grad-fill rounded-xl px-6 py-[15px] text-base font-bold no-underline">
              Mua sắm ngay
            </a>
            <a
              href={`#${SECTION_IDS.sell}`}
              className="press rounded-xl bg-white px-6 py-[15px] text-base font-bold text-slate-900 no-underline"
            >
              Bắt đầu bán hàng
            </a>
          </div>
        </div>

        <HeroArt activeIndex={activeIndex} onLeft={activeIndex === 2 || activeIndex === 4} />

        <div ref={featuresRef} className="hero-feats flex flex-col">
          {HERO_FEATURES.map((feature, index) => {
            const Icon = FEATURE_ICONS[feature.id];
            const tone = TONES[feature.tone];
            return (
              <div key={feature.id} className={`feat flex flex-col gap-3.5 ${activeIndex === index + 1 ? 'on' : ''}`}>
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: tone.background }}
                >
                  <Icon size={22} strokeWidth={2.2} color={tone.stroke} aria-hidden="true" />
                </span>
                <h3 className="m-0 text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.02em]">{feature.title}</h3>
                <p className="m-0 max-w-[460px] text-[17px] leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
