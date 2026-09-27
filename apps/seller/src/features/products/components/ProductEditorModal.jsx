import { useState } from 'react';
import PropTypes from 'prop-types';

export default function ProductEditorModal({ isOpen, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [spuName, setSpuName] = useState('iPhone 16 Pro Max');
  const [category, setCategory] = useState('Điện thoại › Apple › iPhone');
  const [brand, setBrand] = useState('Apple');
  const [spuCode, setSpuCode] = useState('SPU-IP16PM');

  // Multi-attribute configuration
  const [attributes, setAttributes] = useState([
    { id: 1, name: 'Dung lượng', values: ['256GB', '512GB', '1TB'] },
    { id: 2, name: 'Màu sắc', values: ['Titan tự nhiên', 'Titan đen'] },
    { id: 3, name: 'Kết nối', values: ['Wi-Fi', '5G'] },
  ]);

  const [newValueInputs, setNewValueInputs] = useState({});

  // Matrix of SKU variants
  const [skus, setSkus] = useState([
    { id: 1, name: '256GB / Titan tự nhiên / Wi-Fi', code: 'IP16-256-NAT-WF', price: '29.490.000', stock: 38, enabled: true },
    { id: 2, name: '256GB / Titan tự nhiên / 5G', code: 'IP16-256-NAT-5G', price: '31.490.000', stock: 24, enabled: true },
    { id: 3, name: '512GB / Titan đen / Wi-Fi', code: 'IP16-512-BLK-WF', price: '35.990.000', stock: 18, enabled: true },
    { id: 4, name: '512GB / Titan đen / 5G', code: 'IP16-512-BLK-5G', price: '37.990.000', stock: 12, enabled: true },
  ]);

  const [notification, setNotification] = useState(null);

  if (!isOpen) return null;

  const handleAddValue = (attrId) => {
    const val = (newValueInputs[attrId] || '').trim();
    if (!val) return;
    setAttributes(attributes.map(a => a.id === attrId ? { ...a, values: [...a.values, val] } : a));
    setNewValueInputs({ ...newValueInputs, [attrId]: '' });
  };

  const handleRemoveValue = (attrId, valToRemove) => {
    setAttributes(attributes.map(a => a.id === attrId ? { ...a, values: a.values.filter(v => v !== valToRemove) } : a));
  };

  const handleToggleSku = (id) => {
    setSkus(skus.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handlePublish = () => {
    setNotification('Đăng bán sản phẩm thành công! Sản phẩm đã hiển thị công khai.');
    setTimeout(() => {
      if (onSave) onSave({ spuName, spuCode, skus });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[900px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight uppercase">
              THÊM SẢN PHẨM MỚI
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Tạo SPU và các biến thể SKU bán hàng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 4 Steps bar */}
        <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-[12px] font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`pb-1 flex items-center gap-1.5 ${step === 1 ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'hover:text-slate-700'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">1</span>
            <span>Thông tin cơ bản</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`pb-1 flex items-center gap-1.5 ${step === 2 ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'hover:text-slate-700'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">2</span>
            <span>Phân loại SKU</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`pb-1 flex items-center gap-1.5 ${step === 3 ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'hover:text-slate-700'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">3</span>
            <span>Giá & kho</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className={`pb-1 flex items-center gap-1.5 ${step === 4 ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'hover:text-slate-700'}`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">4</span>
            <span>Vận chuyển</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-8 text-[13px]">
          {/* Section 1: SPU Details */}
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-4">
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
                  onChange={(e) => setSpuName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  value={brand}
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: SKU Attributes */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase">
                THUỘC TÍNH SKU
              </h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">
              Tạo thuộc tính linh hoạt theo từng ngành hàng — không giới hạn màu sắc hoặc kích thước.
            </p>

            <div className="space-y-3">
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 cursor-move">⋮⋮</span>
                    <span className="font-bold text-slate-800 text-[13px]">
                      {attr.id} · {attr.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {attr.values.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(attr.id, val)}
                          className="text-slate-400 hover:text-rose-500 text-xs font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {/* Add value mini-input */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="＋ Giá trị"
                        value={newValueInputs[attr.id] || ''}
                        onChange={(e) => setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddValue(attr.id);
                          }
                        }}
                        className="w-24 px-2 py-1 bg-white border border-dashed border-slate-300 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:border-[#4F46E5]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddValue(attr.id)}
                        className="text-[11px] font-bold text-[#4F46E5] px-1 hover:underline"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px]">
              <button
                type="button"
                onClick={() => {
                  const newId = attributes.length + 1;
                  setAttributes([...attributes, { id: newId, name: `Thuộc tính ${newId}`, values: ['Mặc định'] }]);
                }}
                className="font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                ＋ Thêm thuộc tính
              </button>
              <span className="text-slate-500 font-medium">
                {attributes.length} thuộc tính · 18 tổ hợp SKU được tạo tự động
              </span>
            </div>
          </div>

          {/* Section 3: SKU Matrix Table */}
          <div className="pt-6 border-t border-slate-200">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              BIẾN THỂ ĐA THUỘC TÍNH
            </span>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">BIẾN THỂ ĐA THUỘC TÍNH</th>
                    <th className="py-2.5 px-4">MÃ SKU</th>
                    <th className="py-2.5 px-4">GIÁ BÁN (₫)</th>
                    <th className="py-2.5 px-4">TỒN KHO</th>
                    <th className="py-2.5 px-4 text-center">HIỂN THỊ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-800">{sku.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{sku.code}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          defaultValue={sku.price}
                          className="w-28 px-2 py-1 border border-slate-200 rounded text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={sku.stock}
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSku(sku.id)}
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-colors ${
                            sku.enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {sku.enabled ? 'ON' : 'OFF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
                Hiển thị 4 / 18 biến thể · <span className="text-[#4F46E5] font-semibold cursor-pointer">Mở rộng toàn bộ</span>
              </div>
            </div>
          </div>

          {/* SLA & Review Guarantee */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 font-medium flex items-center gap-2">
            <span>✓</span>
            <span>Không cần duyệt — sản phẩm hiển thị ngay sau khi đăng bán.</span>
          </div>

          {notification && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[#4F46E5] font-semibold text-center animate-in fade-in">
              ✓ {notification}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[13px] transition-colors"
          >
            Lưu bản nháp
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[13px] font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors"
            >
              Đăng bán ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};
