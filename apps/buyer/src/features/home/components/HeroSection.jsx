import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'FREESHIP 0Đ TOÀN QUỐC',
    title: 'ĐẠI TIỆC CÔNG NGHỆ 2026',
    subtitle: 'iPhone 16 Series & Phụ Kiện Anker Giảm Đến 50%',
    ctaText: 'Khám phá ngay',
    url: '/category/dien-thoai',
    bgGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#312e81]',
    badgeBg: 'bg-amber-400 text-slate-950',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    tag: 'VOUCHER 500.000Đ HÔM NAY',
    title: 'TUẦN LỄ XUÂN RỰC RỠ',
    subtitle: 'Hàng Hiệu Thời Trang & Mỹ Phẩm Nhập Khẩu Giảm Sâu',
    ctaText: 'Săn Deal Ngay',
    url: '/category/thoi-trang',
    bgGradient: 'from-[#4c0519] via-[#831843] to-[#be185d]',
    badgeBg: 'bg-rose-300 text-slate-950',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    tag: 'BẢO HÀNH CHÍNH HÃNG 24 THÁNG',
    title: 'GIA DỤNG TIỆN NGHI 2026',
    subtitle: 'Thiết Bị Nhà Bếp Thông Minh Lock&Lock Đồng Giá Từ 199K',
    ctaText: 'Mua Ngay',
    url: '/category/gia-dung',
    bgGradient: 'from-[#022c22] via-[#064e3b] to-[#047857]',
    badgeBg: 'bg-emerald-300 text-slate-950',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative flex-1 h-[320px] rounded-2xl overflow-hidden shadow-sm group select-none">
      {/* Background with active slide gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-all duration-700`} />

      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative pattern lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Slide Content */}
      <div className="relative z-10 h-full flex items-center justify-between px-10">
        {/* Left text column */}
        <div className="max-w-[480px] space-y-3">
          <div className="inline-block">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs ${slide.badgeBg}`}>
              {slide.tag}
            </span>
          </div>

          <h1 className="text-white text-[30px] font-black leading-tight tracking-tight drop-shadow-sm">
            {slide.title}
          </h1>

          <p className="text-white/85 text-[13px] font-medium leading-relaxed drop-shadow-xs">
            {slide.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to={slide.url}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-300 font-extrabold text-[12px] shadow-md transition-all hover:scale-105 no-underline cursor-pointer group/btn"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right product hero visual */}
        <div className="hidden sm:flex relative items-center justify-center w-[240px] h-[240px]">
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-[220px] h-[220px] object-cover rounded-2xl shadow-2xl border border-white/20 transform hover:rotate-1 hover:scale-105 transition-all duration-300"
          />
        </div>
      </div>

      {/* Left/Right Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer z-20 border border-white/20"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer z-20 border border-white/20"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-4 left-10 flex items-center gap-2 z-20">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
