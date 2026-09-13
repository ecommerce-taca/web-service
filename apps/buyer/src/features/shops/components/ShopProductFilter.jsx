const ShopProductFilter = () => {
  const categories = ["Tất cả", "iPhone", "Mac", "iPad", "Apple Watch", "Phụ kiện"];

  return (
    <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat, index) => (
        <button
          key={cat}
          className={`flex-shrink-0 px-6 py-2 rounded-[20px] text-[14px] font-bold border transition-colors ${
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
