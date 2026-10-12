import PropTypes from 'prop-types';

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
  onRemoveImage
}) {
  return (
    <div className="space-y-6">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
        THÔNG TIN SPU
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Tên sản phẩm (SPU) *
          </label>
          <input
            type="text"
            value={spuName}
            placeholder="Ví dụ: iPhone 16 Pro Max"
            onChange={(e) => setSpuName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Danh mục chính (Category) *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] bg-white text-xs font-semibold"
          >
            <option value="dien-thoai">Điện thoại & Tablet (dien-thoai)</option>
            <option value="laptop">Laptop & Máy tính (laptop)</option>
            <option value="am-thanh">Âm thanh & Phụ kiện (am-thanh)</option>
            <option value="gia-dung">Thiết bị thông minh & Gia dụng (gia-dung)</option>
            <option value="phu-kien">Phụ kiện công nghệ (phu-kien)</option>
            {category && !['dien-thoai', 'laptop', 'am-thanh', 'gia-dung', 'phu-kien'].includes(category) && (
              <option value={category}>{category}</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Thương hiệu
          </label>
          <input
            type="text"
            value={brand}
            placeholder="Apple, Samsung, Sony..."
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Mã SPU
          </label>
          <input
            type="text"
            value={spuCode}
            onChange={(e) => setSpuCode(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-mono"
          />
        </div>
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
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ×
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
                  <span className="text-xl text-slate-400 mb-1">📷</span>
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
};
