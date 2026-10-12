import PropTypes from 'prop-types';

/**
 * Tab 1: Thông tin gian hàng & Pháp lý (GET /seller/shop & PUT /seller/shop)
 */
export default function ShopInfoTab({
  shopName,
  setShopName,
  slug,
  businessName,
  taxCodeMasked,
  desc,
  setDesc,
  logoUrl,
  setLogoUrl,
  saving,
  onSaveInfo
}) {
  return (
    <form onSubmit={onSaveInfo} className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          THÔNG TIN GIAN HÀNG & PHÁP LÝ (GET /seller/shop & PUT /seller/shop)
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Thông tin thương hiệu hiển thị công khai với khách hàng và tài liệu pháp lý định danh.
        </p>
      </div>

      {/* Logo section */}
      <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-16 h-16 rounded-xl bg-[#4F46E5] text-white font-extrabold flex items-center justify-center text-2xl shadow-sm overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
          ) : (
            <span>🍎</span>
          )}
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Nhập URL ảnh logo hoặc tải từ máy"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-full max-w-md"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            PNG/JPG/WEBP, tỉ lệ vuông 1:1, tối đa 2MB (logo_object_key).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tên gian hàng * (name)
          </label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Đường dẫn cửa hàng (slug)
          </label>
          <input
            type="text"
            disabled
            value={slug}
            className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tên công ty / Doanh nghiệp đăng ký (business_name)
          </label>
          <input
            type="text"
            disabled
            value={businessName}
            className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Mã số thuế đã mã hóa (tax_code_masked)
          </label>
          <input
            type="text"
            disabled
            value={taxCodeMasked}
            className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
          Mô tả gian hàng (description)
        </label>
        <textarea
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu hồ sơ gian hàng'}
        </button>
      </div>
    </form>
  );
}

ShopInfoTab.propTypes = {
  shopName: PropTypes.string.isRequired,
  setShopName: PropTypes.func.isRequired,
  slug: PropTypes.string,
  businessName: PropTypes.string,
  taxCodeMasked: PropTypes.string,
  desc: PropTypes.string,
  setDesc: PropTypes.func.isRequired,
  logoUrl: PropTypes.string,
  setLogoUrl: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onSaveInfo: PropTypes.func.isRequired,
};
