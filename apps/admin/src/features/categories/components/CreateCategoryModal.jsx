import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Layers, Plus, Loader2, AlertTriangle, Percent } from 'lucide-react';

export default function CreateCategoryModal({ isOpen, onClose, categories, onSuccess }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [taxPercent, setTaxPercent] = useState('10'); // Default 10% VAT -> 1000 bps
  const [inheritTax, setInheritTax] = useState(false);
  const [sortOrder, setSortOrder] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isRoot = !parentId;

  const handleNameChange = (val) => {
    setName(val);
    if (!slug || slug === val.trim().toLowerCase().replace(/\s+/g, '-').slice(0, -1)) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục.');
      return;
    }

    if (isRoot && (inheritTax || taxPercent === '' || isNaN(Number(taxPercent)))) {
      setError('Danh mục gốc (Root category) bắt buộc phải cấu hình thuế suất VAT cụ thể theo đặc tả §3.4.');
      return;
    }

    let taxRateBps = null;
    if (!inheritTax && taxPercent !== '') {
      taxRateBps = Math.round(Number(taxPercent) * 100);
      if (taxRateBps < 0 || taxRateBps > 10000) {
        setError('Thuế suất VAT phải nằm trong khoảng từ 0% đến 100% (0 đến 10.000 bps).');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');
      await onSuccess({
        parent_id: parentId || null,
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        tax_rate_bps: taxRateBps,
        sort_order: Number(sortOrder) || 1,
      });
      setName('');
      setSlug('');
      setParentId('');
      setTaxPercent('10');
      setInheritTax(false);
      onClose();
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A68FF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thêm danh mục mới</h3>
              <p className="text-xs text-slate-500 font-medium">Khởi tạo Taxonomy ngành hàng (STT 22: POST /admin/catalog/categories)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh mục cha (Parent Category)
            </label>
            <select
              value={parentId}
              onChange={(e) => {
                setParentId(e.target.value);
                if (e.target.value) {
                  setInheritTax(true);
                } else {
                  setInheritTax(false);
                  setTaxPercent('10');
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]"
            >
              <option value="">-- Danh mục gốc (Cấp 1 - Root) --</option>
              {categories
                .filter((c) => c.status !== 'ARCHIVED' && (c.depth || 1) < 5)
                .map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {'-'.repeat((c.depth || 1) - 1)} {c.name} (Cấp {c.depth || 1})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Độ sâu danh mục tối đa theo đặc tả là 5 cấp (<code>depth ≤ 5</code>).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tên hiển thị danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Thiết bị thông minh, Đồng hồ..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Đường dẫn tĩnh (Slug URL) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="thiet-bi-thong-minh"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]"
            />
          </div>

          {/* Thuế suất VAT (tax_rate_bps) */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#0A68FF]" />
                Thuế suất VAT (tax_rate_bps)
              </label>
              {!isRoot && (
                <label className="flex items-center gap-1.5 text-xs text-blue-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inheritTax}
                    onChange={(e) => setInheritTax(e.target.checked)}
                    className="rounded text-[#0A68FF]"
                  />
                  <span>Kế thừa từ danh mục cha</span>
                </label>
              )}
            </div>

            {inheritTax ? (
              <p className="text-xs text-blue-700 italic">
                Danh mục này sẽ tự động kế thừa thuế suất VAT từ nhánh cha (<code>tax_rate_bps = null</code>).
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  placeholder="10"
                  className="w-24 px-3 py-1.5 text-sm bg-white font-bold rounded-lg border border-blue-300 text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/30"
                />
                <span className="text-xs font-bold text-blue-900">%</span>
                <span className="text-xs text-blue-700">
                  (= {taxPercent ? Math.round(Number(taxPercent) * 100) : 0} bps)
                </span>
              </div>
            )}
            <p className="text-[11px] text-blue-800 leading-relaxed">
              {isRoot
                ? '⭐ Danh mục gốc bắt buộc phải có thuế suất VAT theo quy định sàn.'
                : 'Đơn vị lưu trữ cơ sở dữ liệu là Basis Points (10% = 1000 bps).'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Thứ tự hiển thị (sort_order)
            </label>
            <input
              type="number"
              min="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#0A68FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tạo danh mục</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

CreateCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
