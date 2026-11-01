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
  { name: 'Điện thoại', slug: 'dien-thoai', icon: Smartphone, color: 'bg-taca-primary-light text-taca-primary border-taca-border', count: '1.2k+ SP' },
  { name: 'Laptop', slug: 'laptop', icon: Laptop, color: 'bg-taca-primary-light text-taca-primary border-taca-border', count: '850+ SP' },
  { name: 'Gia dụng', slug: 'gia-dung', icon: UtensilsCrossed, color: 'bg-amber-50 text-amber-600 border-amber-200', count: '2.4k+ SP' },
  { name: 'TV & Loa', slug: 'tv-loa', icon: Tv, color: 'bg-purple-50 text-purple-600 border-purple-200', count: '430+ SP' },
  { name: 'Nhà sách', slug: 'nha-sach', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', count: '3.1k+ SP' },
  { name: 'Thời trang', slug: 'thoi-trang', icon: Shirt, color: 'bg-rose-50 text-rose-600 border-rose-200', count: '4.8k+ SP' },
  { name: 'Làm đẹp', slug: 'lam-dep', icon: Sparkles, color: 'bg-pink-50 text-pink-600 border-pink-200', count: '1.9k+ SP' },
  { name: 'Voucher Hot', slug: 'voucher', icon: Tag, color: 'bg-orange-50 text-orange-600 border-orange-200', count: '99+ Mã' },
];

const FeaturedCategories = () => {
  return (
    <section className="relative rounded-panel border border-taca-border bg-white p-4 shadow-brand sm:p-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-slate-100 border-b">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-control border border-taca-border bg-taca-primary-light text-sm font-extrabold text-taca-primary shadow-brand">
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
          className="flex items-center gap-1 text-[12px] font-bold text-taca-primary transition-colors no-underline hover:text-taca-primary-hover group"
        >
          <span>Tất cả danh mục</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Grid - 8 items */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-8">
        {CATEGORIES.map((cat, index) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={index}
              to={`/category/${cat.slug}`}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-panel border border-taca-border bg-taca-surface p-2.5 text-center no-underline shadow-brand transition-all duration-300 hover:-translate-y-1 hover:border-taca-primary hover:bg-white hover:shadow-brand-lg sm:p-3.5"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300 ${cat.color}`}>
                <IconComponent className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <span className="mt-2.5 line-clamp-1 text-[12px] font-bold text-taca-text-main transition-colors group-hover:text-taca-primary">
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
