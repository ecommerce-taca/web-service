const ShopProductFilter = () => {
  const categories = ["Tất cả", "iPhone", "Mac", "iPad", "Apple Watch", "Phụ kiện"];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat, index) => (
        <button
          key={cat}
          className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-pill text-[13px] sm:text-[14px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 ${
            index === 0
              ? 'bg-taca-primary text-white border-taca-primary'
              : 'bg-white text-taca-text-main border-taca-border hover:border-taca-primary hover:text-taca-primary'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default ShopProductFilter;
