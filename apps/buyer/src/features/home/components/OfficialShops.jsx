import { Link } from 'react-router-dom';
import { ShieldCheck, BadgePercent, RotateCcw, Star, ArrowRight } from 'lucide-react';

const SHOPS = [
  {
    id: 'shop1',
    name: 'Apple Authorised Reseller',
    slug: 'apple',
    badge: 'Flagship',
    promo: 'Ưu đãi iPhone 16 đến 5Tr',
    rating: '4.9',
    followers: '150k',
    logoText: '',
    bgGradient: 'from-slate-900 to-slate-800',
  },
  {
    id: 'shop-anker',
    name: 'Anker Official Store',
    slug: 'anker',
    badge: 'Chính hãng',
    promo: 'GaNPrime sạc 65W giảm 35%',
    rating: '4.9',
    followers: '98k',
    logoText: 'ANKER',
    bgGradient: 'from-blue-950 to-blue-900',
  },
  {
    id: 'shop-locklock',
    name: 'Lock&Lock Living Mall',
    slug: 'locklock',
    badge: 'Chính hãng',
    promo: 'Nồi chiên & Bình giữ nhiệt',
    rating: '4.8',
    followers: '120k',
    logoText: 'LOCK',
    bgGradient: 'from-amber-950 to-yellow-900',
  },
  {
    id: 'shop-nhanam',
    name: 'Nhã Nam Book Store',
    slug: 'nha-nam',
    badge: 'Nhà xuất bản',
    promo: 'Sách hay chọn lọc đồng giá',
    rating: '5.0',
    followers: '85k',
    logoText: 'NN',
    bgGradient: 'from-emerald-950 to-teal-900',
  },
  {
    id: 'shop-coolmate',
    name: 'Coolmate Basics Store',
    slug: 'coolmate',
    badge: 'Chính hãng',
    promo: 'Thời trang mặc hàng ngày',
    rating: '4.9',
    followers: '110k',
    logoText: 'COOL',
    bgGradient: 'from-indigo-950 to-slate-900',
  },
  {
    id: 'shop-samsung',
    name: 'Samsung Official Mall',
    slug: 'samsung',
    badge: 'Flagship',
    promo: 'Galaxy S25 Series AI',
    rating: '4.9',
    followers: '210k',
    logoText: 'SAMSUNG',
    bgGradient: 'from-sky-950 to-blue-950',
  },
];

const OfficialShops = () => {
  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
              MALL
            </span>
            <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-tight m-0">
              THƯƠNG HIỆU CHÍNH HÃNG 100%
            </h2>
          </div>
          <p className="text-[12px] text-slate-500 font-medium m-0 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              Cam kết 100% hàng thật
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <BadgePercent className="w-4 h-4 text-amber-500 shrink-0" />
              Hoàn tiền 111% nếu giả
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              Đổi trả miễn phí 15 ngày
            </span>
          </p>
        </div>

        <Link
          to="/search?q=mall"
          className="text-[12px] font-bold text-[#0A68FF] hover:text-[#0855D2] transition-colors no-underline whitespace-nowrap flex items-center gap-1 group"
        >
          <span>Xem tất cả Mall</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Shop Cards Grid - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {SHOPS.map((shop) => (
          <Link
            key={shop.id}
            to={`/shop/${shop.slug}`}
            className="flex items-center p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group no-underline cursor-pointer gap-3.5"
          >
            {/* Avatar logo */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${shop.bgGradient} flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform border border-white/20 text-white`}>
              <span className="font-black text-[12px] tracking-wider uppercase text-center px-1">
                {shop.logoText}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-extrabold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {shop.name}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 line-clamp-1 mt-0.5">
                {shop.promo}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {shop.rating}
                </span>
                <span>•</span>
                <span>{shop.followers} người theo dõi</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default OfficialShops;
