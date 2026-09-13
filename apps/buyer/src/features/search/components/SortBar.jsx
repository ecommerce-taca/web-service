const SortBar = () => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-[14px] font-semibold text-taca-text-main">Sắp xếp:</span>
      <div className="flex items-center gap-2">
        <button className="px-5 py-2 border border-taca-primary bg-[#f4f7ff] text-taca-primary text-[13px] font-semibold rounded-[8px] cursor-pointer hover:bg-taca-primary hover:text-white transition-colors">
          Phổ biến
        </button>
        <button className="px-5 py-2 border border-taca-border bg-white text-taca-text-main text-[13px] font-semibold rounded-[8px] cursor-pointer hover:border-taca-primary hover:text-taca-primary transition-colors">
          Bán chạy
        </button>
        <button className="px-5 py-2 border border-taca-border bg-white text-taca-text-main text-[13px] font-semibold rounded-[8px] cursor-pointer hover:border-taca-primary hover:text-taca-primary transition-colors">
          Mới nhất
        </button>
        <button className="px-5 py-2 border border-taca-border bg-white text-taca-text-main text-[13px] font-semibold rounded-[8px] cursor-pointer hover:border-taca-primary hover:text-taca-primary transition-colors">
          Giá thấp → cao
        </button>
      </div>
    </div>
  );
};

export default SortBar;
