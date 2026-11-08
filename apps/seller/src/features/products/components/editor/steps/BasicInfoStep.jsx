import PropTypes from 'prop-types';
import { X, Camera, Sparkles, Smartphone, Laptop, Headphones, Home, Cpu } from 'lucide-react';

const CATEGORY_PRESETS = [
  { id: 'dien-thoai', label: 'Điện thoại', icon: Smartphone },
  { id: 'laptop', label: 'Laptop & PC', icon: Laptop },
  { id: 'am-thanh', label: 'Âm thanh', icon: Headphones },
  { id: 'gia-dung', label: 'Gia dụng', icon: Home },
  { id: 'phu-kien', label: 'Phụ kiện', icon: Cpu },
];

const BRAND_PRESETS = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Dell', 'Asus', 'Logitech'];

const SINGLE_PRICE_PRESETS = ['99.000 ₫', '199.000 ₫', '499.000 ₫', '990.000 ₫', '2.490.000 ₫', '29.490.000 ₫'];

const SINGLE_STOCK_PRESETS = [10, 20, 50, 100, 200, 500];

function generateCodeFromName(name) {
  if (!name) return 'SPU-PRODUCT';
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
  return clean ? `SPU-${clean.toUpperCase()}` : 'SPU-PRODUCT';
}

/**
 * Step 1: Thông tin cơ bản SPU & Hình ảnh sản phẩm (S3 Presigned URL)
 */
export default function BasicInfoStep({
  spuName,
  setSpuName,
  category,
  setCategory,
  brand,
  setBrand,
  spuCode,
  setSpuCode,
  description,
  setDescription,
  images,
  uploadingImage,
  imageInputRef,
  onUploadImage,
  onRemoveImage,
  isMultiVariant,
  setIsMultiVariant,
  skuPrefix,
  setSkuPrefix,
  singleSkuCode,
  setSingleSkuCode,
  singleSkuPrice,
  setSingleSkuPrice,
  singleSkuStock,
  setSingleSkuStock
}) {
  return (
    <div className="space-y-6">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
        THÔNG TIN SPU
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tên SPU */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Tên sản phẩm (SPU) *
          </label>
          <input
            type="text"
            value={spuName}
            placeholder="Ví dụ: iPhone 16 Pro Max"
            onChange={(e) => setSpuName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] text-xs font-medium"
          />
        </div>

        {/* Danh mục Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">
              Danh mục chính (Category) *
            </label>
            <span className="text-[10px] text-slate-400">Chọn 1-click</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {CATEGORY_PRESETS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thương hiệu */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">
              Thương hiệu
            </label>
            <span className="text-[10px] text-slate-400">Gợi ý nhanh</span>
          </div>
          <input
            type="text"
            value={brand}
            placeholder="Apple, Samsung, Sony..."
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] text-xs mb-1.5"
          />
          <div className="flex flex-wrap gap-1">
            {BRAND_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b === 'Khác' ? '' : b)}
                className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all cursor-pointer ${
                  brand === b
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-bold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Mã SPU */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">
              Mã SPU (Product Code)
            </label>
            <button
              type="button"
              onClick={() => {
                const generated = generateCodeFromName(spuName);
                setSpuCode(generated);
                if (setSkuPrefix) setSkuPrefix(generated.replace(/^SPU-/, ''));
              }}
              className="text-[10px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              <span>Tạo mã từ tên</span>
            </button>
          </div>
          <input
            type="text"
            value={spuCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSpuCode(val);
              if (setSkuPrefix) setSkuPrefix(val.replace(/^SPU-/, '') || 'SPU');
            }}
            placeholder="Ví dụ: SPU-IP16PRO"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-mono text-xs uppercase"
          />
        </div>
      </div>

      {/* Phân loại cấu hình SKU & Biến thể */}
      <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 block">
              CẤU HÌNH BIẾN THỂ & MÃ SKU
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chọn hình thức bán hàng: Sản phẩm đơn (1 SKU) hoặc Sản phẩm đa biến thể (phân loại thuộc tính).
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsMultiVariant(true)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                isMultiVariant
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Đa biến thể (Nhiều SKU)
            </button>
            <button
              type="button"
              onClick={() => setIsMultiVariant(false)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                !isMultiVariant
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Sản phẩm đơn (1 SKU)
            </button>
          </div>
        </div>

        {isMultiVariant ? (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Tiền tố mã SKU (SKU Prefix) *
            </label>
            <input
              type="text"
              value={skuPrefix}
              placeholder="Ví dụ: IP16-PRO hoặc AO-POLO"
              onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
              className="w-full sm:w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-mono text-xs uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tiền tố này sẽ được dùng để tự động tạo mã SKU ở Bước 3 (Ví dụ: <code className="text-[#4F46E5] font-semibold">{skuPrefix || 'SKU'}-TITAN-256GB</code>).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mã SKU sản phẩm *
              </label>
              <input
                type="text"
                required
                value={singleSkuCode}
                placeholder="Ví dụ: IP16-STANDARD"
                onChange={(e) => setSingleSkuCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-mono text-xs uppercase font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Giá bán niêm yết (₫) *
              </label>
              <input
                type="text"
                value={singleSkuPrice}
                placeholder="29.490.000"
                onChange={(e) => setSingleSkuPrice(e.target.value)}
                onBlur={() => {
                  const clean = String(singleSkuPrice).replace(/\D/g, '');
                  if (clean) {
                    setSingleSkuPrice(Number(clean).toLocaleString('vi-VN'));
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-semibold text-xs mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {SINGLE_PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSingleSkuPrice(p.replace(' ₫', ''))}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-medium transition-all cursor-pointer border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                min="0"
                value={singleSkuStock}
                onChange={(e) => setSingleSkuStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-semibold text-xs mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {SINGLE_STOCK_PRESETS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setSingleSkuStock(cnt)}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-medium transition-all cursor-pointer border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
          Mô tả chi tiết sản phẩm
        </label>
        <textarea
          rows={3}
          value={description}
          placeholder="Mô tả công năng, thông số kỹ thuật, chế độ bảo hành..."
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>

      {/* Media Upload Section (#15, #16 S3 Presigned URL) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase">
            Hình ảnh sản phẩm (S3 Media)
          </label>
          <span className="text-[11px] text-slate-400">
            Ảnh đầu tiên làm ảnh bìa · Tối đa 8 ảnh
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((imgUrl, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#4F46E5] text-white text-[10px] font-bold rounded shadow-xs">
                  Ảnh bìa
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                aria-label="Xóa ảnh"
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}

          {/* Nút Upload qua Presigned S3 */}
          {images.length < 8 && (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#4F46E5] hover:bg-[#f8faff] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all"
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                className="hidden"
              />
              {uploadingImage ? (
                <span className="text-[12px] text-[#4F46E5] font-semibold animate-pulse">
                  Đang tải...
                </span>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-slate-400 mb-1" aria-hidden="true" />
                  <span className="text-[11px] font-bold text-slate-700">Tải ảnh lên</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">S3 Presigned</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

BasicInfoStep.propTypes = {
  spuName: PropTypes.string.isRequired,
  setSpuName: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
  brand: PropTypes.string.isRequired,
  setBrand: PropTypes.func.isRequired,
  spuCode: PropTypes.string.isRequired,
  setSpuCode: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  setDescription: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  uploadingImage: PropTypes.bool.isRequired,
  imageInputRef: PropTypes.object.isRequired,
  onUploadImage: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  isMultiVariant: PropTypes.bool.isRequired,
  setIsMultiVariant: PropTypes.func.isRequired,
  skuPrefix: PropTypes.string.isRequired,
  setSkuPrefix: PropTypes.func.isRequired,
  singleSkuCode: PropTypes.string.isRequired,
  setSingleSkuCode: PropTypes.func.isRequired,
  singleSkuPrice: PropTypes.string.isRequired,
  setSingleSkuPrice: PropTypes.func.isRequired,
  singleSkuStock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setSingleSkuStock: PropTypes.func.isRequired,
};

