import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Check } from 'lucide-react';

/**
 * Overlay / Add SKU attribute Modal (Khớp Penpot)
 */
export default function AddAttributeModal({ isOpen, onClose, onAddAttribute }) {
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('PLAIN');
  const [newAttrValues, setNewAttrValues] = useState([]);
  const [tempValueInput, setTempValueInput] = useState('');

  if (!isOpen) return null;

  const handleAddTempValue = () => {
    if (tempValueInput.trim()) {
      setNewAttrValues([...newAttrValues, tempValueInput.trim()]);
      setTempValueInput('');
    }
  };

  const handleConfirm = () => {
    if (!newAttrName.trim() || newAttrValues.length === 0) return;
    onAddAttribute({
      name: newAttrName.trim(),
      display_as: newAttrType,
      values: newAttrValues
    });
    setNewAttrName('');
    setNewAttrType('PLAIN');
    setNewAttrValues([]);
    setTempValueInput('');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-[520px] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-[16px] font-bold text-slate-900 uppercase">
            THÊM THUỘC TÍNH SKU
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1">
            Tên thuộc tính *
          </label>
          <input
            type="text"
            value={newAttrName}
            placeholder="Ví dụ: Chất liệu, Phiên bản, Kết nối..."
            onChange={(e) => setNewAttrName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1">
            Kiểu hiển thị
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'PLAIN', label: 'Văn bản' },
              { id: 'COLOR_SWATCH', label: 'Màu sắc' },
              { id: 'IMAGE_THUMB', label: 'Hình ảnh' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setNewAttrType(type.id)}
                className={`py-2 px-3 text-[12px] font-semibold rounded-lg border cursor-pointer ${
                  newAttrType === type.id 
                    ? 'bg-[#f4f7ff] border-[#4F46E5] text-[#4F46E5]' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1">
            Giá trị thuộc tính *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tempValueInput}
              placeholder="Nhập giá trị rồi nhấn Enter"
              onChange={(e) => setTempValueInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTempValue();
                }
              }}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
            <button
              type="button"
              onClick={handleAddTempValue}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg cursor-pointer transition-colors"
            >
              Thêm
            </button>
          </div>

          {/* Tag list */}
          <div className="flex flex-wrap gap-2 pt-1">
            {newAttrValues.map((val, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => setNewAttrValues(newAttrValues.filter((_, i) => i !== idx))}
                  aria-label={`Xóa giá trị ${val}`}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>SKU matrix sẽ tự tạo lại theo mọi tổ hợp thuộc tính.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-[13px] font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!newAttrName.trim() || newAttrValues.length === 0}
            className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] rounded-lg cursor-pointer disabled:opacity-50"
          >
            Thêm thuộc tính
          </button>
        </div>
      </div>
    </div>
  );
}

AddAttributeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddAttribute: PropTypes.func.isRequired,
};
