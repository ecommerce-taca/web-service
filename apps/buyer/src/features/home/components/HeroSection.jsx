import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section
      className="relative w-[840px] h-[318px] overflow-hidden"
      style={{ backgroundColor: '#1e1b4b' }}
    >
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-[#1e1b4b]" />

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 w-full h-[148px]"
        style={{ backgroundColor: '#111827' }}
      />

      {/* Content - positioned at bottom */}
      <div className="absolute left-[30px] bottom-0 flex flex-col items-start z-10">
        {/* Freeship badge */}
        <span className="text-white text-[11px] font-extrabold uppercase tracking-wider">
          FREESHIP 0Đ TOÀN QUỐC
        </span>

        {/* Main title */}
        <h1 className="text-white text-[26px] font-extrabold leading-[1.35] m-0 mt-2">
          ĐẠI TIỆC CÔNG NGHỆ 2026
        </h1>

        {/* Subtitle */}
        <p className="text-[#e5e7eb] text-[13px] font-medium m-0 mt-1">
          iPhone 16 Series &amp; Phụ Kiện Anker Giảm Đến 50%
        </p>

        {/* CTA Button */}
        <Link to="/search?q=khuyen-mai" className="inline-flex items-center justify-center bg-taca-primary text-white border-none h-[36px] px-6 text-[11px] font-extrabold cursor-pointer mt-2 mb-[4px] hover:bg-taca-primary-hover transition-colors no-underline">
          Khám phá ngay  ›
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
