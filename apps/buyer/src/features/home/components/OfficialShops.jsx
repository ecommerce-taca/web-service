import { Link } from 'react-router-dom';

const SHOPS = [
  { name: 'Anker Flagship', icon: '⚡' },
  { name: 'Nhã Nam', icon: '📚' },
  { name: 'Lock&Lock', icon: '🍳' },
  { name: 'Coolmate', icon: '👕' },
];

const OfficialShops = () => {
  return (
    <section className="bg-white w-[1280px] h-[176px] border border-taca-border relative">
      {/* Header */}
      <div className="px-5 pt-5">
        <h2 className="text-[15px] font-extrabold text-taca-text-main uppercase m-0">
          ✓  THƯƠNG HIỆU CHÍNH HÃNG
        </h2>
        <p className="text-[11px] font-normal text-taca-text-muted mt-1 m-0">
          Cam kết 100% hàng thật · hoàn 111% nếu phát hiện giả
        </p>
      </div>

      {/* Shop Cards - 4 cards, each 286×76px */}
      <div className="flex gap-[22px] px-5 mt-4">
        {SHOPS.map((shop, index) => (
          <Link
            key={index}
            to={`/shop/${shop.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="w-[286px] h-[76px] border border-taca-border flex items-center p-3 gap-3 cursor-pointer hover:border-taca-primary transition-colors bg-white no-underline"
          >
            <div className="w-[48px] h-[48px] bg-[#f1f5f9] flex items-center justify-center text-[24px] flex-shrink-0">
              {shop.icon}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[12px] font-bold text-taca-text-main truncate">{shop.name}</span>
              <span className="text-[11px] font-semibold text-taca-primary mt-1">★ 4.9 · Official</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default OfficialShops;
