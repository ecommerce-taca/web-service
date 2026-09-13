const FilterSidebar = () => {
  return (
    <div className="w-[240px] bg-white border border-taca-border rounded-[8px] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-taca-border">
        <h3 className="text-[14px] font-extrabold text-taca-text-main m-0 uppercase tracking-wide">
          Bộ lọc tìm kiếm
        </h3>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Danh mục */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Danh mục</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Tai nghe</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Loa bluetooth</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Phụ kiện âm thanh</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-taca-border/50"></div>

        {/* Nơi bán */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Nơi bán</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">TP. Hồ Chí Minh</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Hà Nội</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-taca-border/50"></div>

        {/* Khoảng giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Khoảng giá</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Dưới 500.000 ₫</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">500K – 2 triệu</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Trên 2 triệu</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-taca-border/50"></div>

        {/* Thương hiệu */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Thương hiệu</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Sony</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">JBL</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Apple</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-taca-border/50"></div>

        {/* Đánh giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Đánh giá</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted flex items-center gap-1">
                <span className="text-[#faad14] tracking-[2px]">★★★★★</span> từ 4 sao
              </span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-taca-border/50"></div>

        {/* Dịch vụ & ưu đãi */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Dịch vụ & ưu đãi</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Freeship</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted">Hàng chính hãng</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-taca-border mt-auto">
        <button className="w-full py-2 bg-white border border-taca-primary text-taca-primary text-[13px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors">
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
