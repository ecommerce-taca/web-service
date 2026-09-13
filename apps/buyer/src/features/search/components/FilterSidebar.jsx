const FilterSidebar = () => {
  return (
    <div className="w-[240px] flex flex-col gap-8">
      {/* DANH MỤC */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[14px] font-extrabold text-taca-text-main m-0 uppercase tracking-wider">
          DANH MỤC
        </h3>
        <div className="flex flex-col gap-4">
          <LinkItem label="- Điện thoại" isActive />
          <LinkItem label="- Máy tính bảng" />
          <LinkItem label="- Đồng hồ thông minh" />
          <LinkItem label="- Phụ kiện điện thoại" />
          <LinkItem label="- Điện thoại phổ thông" />
        </div>
      </div>

      {/* BỘ LỌC NHANH */}
      <div className="flex flex-col gap-6">
        <h3 className="text-[14px] font-extrabold text-taca-text-main m-0 uppercase tracking-wider">
          BỘ LỌC NHANH
        </h3>

        {/* Thương hiệu */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Thương hiệu</h4>
          <div className="flex flex-col gap-3">
            <CheckboxItem label="Apple" />
            <CheckboxItem label="Samsung" />
            <CheckboxItem label="Xiaomi" />
            <CheckboxItem label="OPPO" />
          </div>
        </div>

        {/* Khoảng giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Khoảng giá</h4>
          <div className="flex flex-col gap-3">
            <CheckboxItem label="Dưới 5 triệu" />
            <CheckboxItem label="5 - 15 triệu" />
            <CheckboxItem label="Trên 15 triệu" />
          </div>
        </div>

        {/* Dịch vụ */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Dịch vụ</h4>
          <div className="flex flex-col gap-3">
            <CheckboxItem label="Chính hãng" />
            <CheckboxItem label="Freeship" />
            <CheckboxItem label="Giao 2H" />
          </div>
        </div>

        {/* Đánh giá */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[13px] font-bold text-taca-text-main m-0">Đánh giá</h4>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[14px] h-[14px] border-gray-300 rounded-sm text-taca-primary focus:ring-taca-primary" />
              <span className="text-[13px] text-taca-text-muted flex items-center gap-1">
                <span className="text-[#faad14] tracking-[1px] text-[15px]">★★★★★</span> từ 5 sao
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for reusability
const LinkItem = ({ label, isActive }) => (
  <span className={`text-[13px] cursor-pointer hover:text-taca-primary transition-colors ${isActive ? 'font-bold text-taca-primary' : 'text-taca-text-main font-medium'}`}>
    {label}
  </span>
);

const CheckboxItem = ({ label }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input type="checkbox" className="w-[14px] h-[14px] border-gray-400 rounded-sm text-taca-primary focus:ring-taca-primary group-hover:border-taca-primary transition-colors" />
    <span className="text-[13px] text-taca-text-main font-medium group-hover:text-taca-primary transition-colors">{label}</span>
  </label>
);

export default FilterSidebar;
