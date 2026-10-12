import { Link } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  UtensilsCrossed,
  Tv,
  BookOpen,
  Shirt,
  Sparkles,
  Tag,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Điện thoại', slug: 'dien-thoai', icon: Smartphone, color: 'bg-blue-50 text-blue-600 border-blue-200', count: '1.2k+ SP' },
  { name: 'Laptop', slug: 'laptop', icon: Laptop, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', count: '850+ SP' },
  { name: 'Gia dụng', slug: 'gia-dung', icon: UtensilsCrossed, color: 'bg-amber-50 text-amber-600 border-amber-200', count: '2.4k+ SP' },
  { name: 'TV & Loa', slug: 'tv-loa', icon: Tv, color: 'bg-purple-50 text-purple-600 border-purple-200', count: '430+ SP' },
  { name: 'Nhà sách', slug: 'nha-sach', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', count: '3.1k+ SP' },
  { name: 'Thời trang', slug: 'thoi-trang', icon: Shirt, color: 'bg-rose-50 text-rose-600 border-rose-200', count: '4.8k+ SP' },
  { name: 'Làm đẹp', slug: 'lam-dep', icon: Sparkles, color: 'bg-pink-50 text-pink-600 border-pink-200', count: '1.9k+ SP' },
  { name: 'Voucher Hot', slug: 'voucher', icon: Tag, color: 'bg-orange-50 text-orange-600 border-orange-200', count: '99+ Mã' },
];

const FeaturedCategories = () => {
  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-slate-100 border-b">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-2xs">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 uppercase tracking-tight m-0">
              DANH MỤC NỔI BẬT
            </h2>
            <p className="text-[11px] text-slate-500 m-0 font-medium">
              Khám phá hàng ngàn sản phẩm phân loại chất lượng cao
            </p>
          </div>
        </div>

        <Link
          to="/category"
          className="text-[12px] font-bold text-[#0A68FF] hover:text-[#0855D2] transition-colors no-underline flex items-center gap-1 group"
        >
          <span>Tất cả danh mục</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Grid - 8 items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 mt-5">
        {CATEGORIES.map((cat, index) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={index}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200/70 hover:border-indigo-400 bg-slate-50/40 hover:bg-white shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group no-underline text-center cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300 ${cat.color}`}>
                <IconComponent className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <span className="text-[12px] font-bold text-slate-800 mt-2.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedCategories;
