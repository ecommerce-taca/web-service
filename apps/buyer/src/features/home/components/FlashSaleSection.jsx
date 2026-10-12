import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import FlashProductCard from '../../products/components/FlashProductCard';

const FLASH_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên - Chính Hãng VN/A',
    price: 28990000,
    discount: 12,
    soldPercentage: 82,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Củ Sạc Nhanh Anker 735 GaNPrime 65W 3 Cổng Tiện Lợi',
    price: 1190000,
    discount: 25,
    soldPercentage: 68,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Sách Thay Đổi Tí Hon Hiệu Quả Bất Ngờ (Atomic Habits)',
    price: 119000,
    discount: 30,
    soldPercentage: 91,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Nồi Chiên Không Dầu Lock&Lock Điện Tử 5.2L Dung Tích Lớn',
    price: 2290000,
    discount: 38,
    soldPercentage: 54,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
  },
];

const FlashSaleSection = () => {
  const [secondsLeft, setSecondsLeft] = useState(9918); // ~2h 45m 18s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 10800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shadow-2xs">
              <Flame className="w-5 h-5 text-rose-600 fill-rose-500" />
            </span>
            <h2 className="text-[20px] font-black text-rose-600 tracking-tight uppercase m-0">
              GIÁ SỐC HÔM NAY
            </h2>
          </div>

          {/* Dynamic Countdown Timer */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
              Kết thúc sau:
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 text-white font-mono text-[13px] font-black shadow-xs">
              {pad(hours)}
            </span>
            <span className="text-slate-400 font-black">:</span>
            <span className="px-2 py-1 rounded-md bg-slate-900 text-white font-mono text-[13px] font-black shadow-xs">
              {pad(minutes)}
            </span>
            <span className="text-slate-400 font-black">:</span>
            <span className="px-2 py-1 rounded-md bg-rose-600 text-white font-mono text-[13px] font-black shadow-xs animate-pulse">
              {pad(seconds)}
            </span>
          </div>
        </div>

        <Link
          to="/search?q=flashsale"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0A68FF] hover:text-[#0855D2] transition-colors no-underline group"
        >
          <span>Xem tất cả Deal Sốc</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Product Cards Grid - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {FLASH_PRODUCTS.map((product) => (
          <FlashProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discount={product.discount}
            soldPercentage={product.soldPercentage}
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
};

export default FlashSaleSection;
