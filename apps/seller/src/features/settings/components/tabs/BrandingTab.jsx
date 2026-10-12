import PropTypes from 'prop-types';

/**
 * Tab 2: Nhận diện thương hiệu & Giao diện cửa hàng
 */
export default function BrandingTab({ shopId, shopName, slug, logoUrl, isShell }) {
  return (
    <div className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          NHẬN DIỆN THƯƠNG HIỆU & GIAO DIỆN CỬA HÀNG
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Cách gian hàng xuất hiện trên trang Người mua (Taca Buyer / Shop - §2.45).
        </p>
      </div>

      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🍎</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{shopName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Slug: /{slug || 'taca-apple-store'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                ✓ Chính hãng Official
              </span>
              <span className="text-xs text-slate-400">· 1.284 người theo dõi</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Xem thử trang gian hàng công khai của bạn:</span>
          <a
            href={isShell ? `/shop/${shopId || 'shop_apple_001'}` : `http://localhost:5173/shop/${shopId || 'shop_apple_001'}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Mở trang Người Mua ↗
          </a>
        </div>
      </div>
    </div>
  );
}

BrandingTab.propTypes = {
  shopId: PropTypes.string,
  shopName: PropTypes.string.isRequired,
  slug: PropTypes.string,
  logoUrl: PropTypes.string,
  isShell: PropTypes.bool.isRequired,
};
