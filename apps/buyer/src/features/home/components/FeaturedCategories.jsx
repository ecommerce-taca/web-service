import { Link } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Điện thoại', icon: '📱' },
  { name: 'Laptop', icon: '💻' },
  { name: 'Gia dụng', icon: '🍳' },
  { name: 'TV', icon: '📺' },
  { name: 'Nhà sách', icon: '📚' },
  { name: 'Thời trang', icon: '👕' },
  { name: 'Làm đẹp', icon: '💄' },
];

const FeaturedCategories = () => {
  return (
    <section className="bg-white w-[1280px] h-[176px] border border-taca-border relative">
      {/* Title */}
      <h2 className="text-[15px] font-extrabold text-taca-text-main uppercase flex items-center gap-2 m-0 px-5 pt-5">
        <span>✦</span> DANH MỤC NỔI BẬT
      </h2>

      {/* Category Grid - 7 cards, each 148×92px */}
      <div className="flex gap-[28px] px-5 mt-[20px]">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={index}
            to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="w-[148px] h-[92px] border border-taca-border flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-taca-primary transition-colors bg-white no-underline"
          >
            <div className="w-[48px] h-[48px] bg-[#eef2ff] flex items-center justify-center text-[20px] group-hover:bg-indigo-100 transition-colors">
              {cat.icon}
            </div>
            <span className="text-[11px] font-bold text-taca-text-main">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
