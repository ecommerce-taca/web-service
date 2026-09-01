import FlashProductCard from '../../products/components/FlashProductCard';

const FlashSaleSection = () => {
  const flashProducts = [
    { id: 1, name: 'iPhone 16 Pro Max', price: 28990000, discount: 12, soldPercentage: 80 },
    { id: 2, name: 'Củ sạc Anker GaN 65W', price: 1190000, discount: 20, soldPercentage: 65 },
    { id: 3, name: 'Atomic Habits', price: 119000, discount: 28, soldPercentage: 90 },
    { id: 4, name: 'Nồi chiên Lock&Lock', price: 2290000, discount: 35, soldPercentage: 45 },
  ];

  return (
    <section className="bg-white w-[1280px] h-[258px] border border-taca-border relative">
      {/* Header Row */}
      <div className="flex items-center px-5 pt-[22px]">
        <h2 className="text-[20px] font-extrabold text-taca-sale uppercase flex items-center gap-2 m-0">
          <span>🔥</span> GIÁ SỐC HÔM NAY
        </h2>
        <span className="text-[14px] font-extrabold text-taca-text-main ml-9">
          02 : 45 : 18
        </span>
        <a
          href="#"
          className="ml-auto text-[11px] font-bold text-taca-primary hover:underline no-underline"
        >
          Xem tất cả Deal Sốc  ›
        </a>
      </div>

      {/* Product Cards Row - 4 cards, each 286px wide */}
      <div className="flex gap-[22px] px-5 mt-[16px]">
        {flashProducts.map((product) => (
          <FlashProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discount={product.discount}
            soldPercentage={product.soldPercentage}
          />
        ))}
      </div>
    </section>
  );
};

export default FlashSaleSection;
