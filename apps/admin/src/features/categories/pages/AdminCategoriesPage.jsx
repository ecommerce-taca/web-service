import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Archive,
  Save,
  Percent,
  FolderTree,
  Tag,
  Check,
  Loader2,
} from 'lucide-react';
import adminCatalogApi from '../../../services/admin-catalog.api';
import CreateCategoryModal from '../components/CreateCategoryModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form edit state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    tax_percent: '10',
    inherit_tax: false,
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [showArchivePrompt, setShowArchivePrompt] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const selectCategory = useCallback((cat) => {
    setSelectedCategory(cat);
    const hasExplicitTax = cat.tax_rate_bps !== null && cat.tax_rate_bps !== undefined;
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      parent_id: cat.parent_id || '',
      tax_percent: hasExplicitTax ? (cat.tax_rate_bps / 100).toString() : '10',
      inherit_tax: !hasExplicitTax && Boolean(cat.parent_id),
      status: cat.status || 'ACTIVE',
    });
    setShowArchivePrompt(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    adminCatalogApi.getAdminCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data || [];
        setCategories(list);
        const allParentIds = new Set(list.filter((c) => !c.parent_id).map((c) => c.category_id));
        setExpandedKeys(allParentIds);
        if (list.length > 0) {
          selectCategory(list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Lỗi tải cây danh mục:', err);
        setError(err?.message || 'Không thể tải cây danh mục hệ thống. Vui lòng thử lại.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, selectCategory]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setReloadTrigger((v) => v + 1);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleExpand = (catId) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Build Tree Structure
  const treeNodes = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.category_id, { ...c, children: [] }));
    const roots = [];

    categories.forEach((c) => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(map.get(c.category_id));
      } else {
        roots.push(map.get(c.category_id));
      }
    });

    return roots;
  }, [categories]);

  // Filtered categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const qLower = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(qLower) ||
        c.slug.toLowerCase().includes(qLower) ||
        c.category_id.toLowerCase().includes(qLower)
    );
  }, [categories, searchQuery]);

  // Handle Save (STT 23: PATCH /admin/catalog/categories/{categoryId})
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      showToast('Tên danh mục không được để trống.');
      return;
    }

    const isRoot = !formData.parent_id;
    if (isRoot && formData.inherit_tax) {
      showToast('Danh mục gốc không thể chọn kế thừa thuế VAT.');
      return;
    }

    let taxRateBps = null;
    if (!formData.inherit_tax) {
      taxRateBps = Math.round(Number(formData.tax_percent) * 100);
    }

    try {
      setSaving(true);
      const res = await adminCatalogApi.updateCategory(selectedCategory.category_id, {
        version: selectedCategory.version || 1,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parent_id: formData.parent_id || null,
        tax_rate_bps: taxRateBps,
        status: formData.status,
      });

      showToast(`Đã lưu cập nhật cho danh mục "${formData.name}".`);
      handleRefresh();
      if (res?.data) {
        selectCategory(res.data);
      }
    } catch (err) {
      showToast(err?.message || 'Có lỗi khi lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Archive (STT 24: POST /admin/catalog/categories/{categoryId}/archive)
  const handleArchiveCategory = async () => {
    if (!selectedCategory) return;
    try {
      setArchiving(true);
      await adminCatalogApi.archiveCategory(selectedCategory.category_id, {
        version: selectedCategory.version || 1,
        reason: archiveReason.trim() || 'Lưu trữ theo sơ đồ taxonomy mới',
      });
      showToast(`Đã chuyển danh mục "${selectedCategory.name}" sang trạng thái ARCHIVED.`);
      setShowArchivePrompt(false);
      setArchiveReason('');
      handleRefresh();
    } catch (err) {
      showToast(err?.message || 'Không thể lưu trữ danh mục.');
    } finally {
      setArchiving(false);
    }
  };

  // Handle Create Success (STT 22)
  const handleCreateSuccess = async (payload) => {
    const res = await adminCatalogApi.createCategory(payload);
    showToast(`Đã tạo thành công danh mục "${payload.name}".`);
    handleRefresh();
    if (res?.data) {
      selectCategory(res.data);
    }
  };

  // Render tree branch
  const renderTreeBranch = (node, depth = 1) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(node.category_id);
    const isSelected = selectedCategory?.category_id === node.category_id;
    const isArchived = node.status === 'ARCHIVED';

    return (
      <div key={node.category_id} className="space-y-0.5 select-none">
        <div
          onClick={() => selectCategory(node)}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isSelected
              ? 'bg-[#0A68FF] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          style={{ paddingLeft: `${(depth - 1) * 16 + 12}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.category_id);
                }}
                className={`p-0.5 rounded hover:bg-black/10 cursor-pointer ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}
            <span className="truncate">{node.name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {node.tax_rate_bps !== null && node.tax_rate_bps !== undefined ? (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {node.tax_rate_bps / 100}% VAT
              </span>
            ) : (
              <span
                className={`text-[9px] px-1 py-0.5 rounded italic ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                Kế thừa
              </span>
            )}
            {isArchived && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                ARCHIVED
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderTreeBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      {/* Page Actions Bar (Giữ 1 tiêu đề chính trên AdminHeader, hiển thị thanh công cụ thao tác nhanh) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-[#0A68FF]" />
          <span>Sơ đồ danh mục sàn</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0A68FF]' : ''}`} />
            <span>Tải lại</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#0A68FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm danh mục mới</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Penpot Taca Admin / Categories: 330px tree : 718px detail) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Category Tree (320px - 360px) */}
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px]">
          {/* Tree Header & Search */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#0A68FF]" />
                <span>Cây danh mục sàn</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                  {categories.length}
                </span>
              </span>
              <span className="text-[11px] text-slate-400">Tối đa 5 cấp</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm danh mục hoặc slug..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]"
              />
            </div>
          </div>

          {/* Tree Body */}
          <div className="p-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 space-y-1">
            {loading ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#0A68FF] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Đang nạp cấu trúc cây taxonomy...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
                <p className="text-xs font-semibold text-rose-700">{error}</p>
              </div>
            ) : searchQuery.trim() ? (
              filteredCategories.length > 0 ? (
                filteredCategories.map((c) => (
                  <div
                    key={c.category_id}
                    onClick={() => selectCategory(c)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between ${
                      selectedCategory?.category_id === c.category_id
                        ? 'bg-[#0A68FF] text-white'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="font-mono text-[10px] opacity-70">Cấp {c.depth}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">Không có danh mục nào khớp.</p>
              )
            ) : treeNodes.length > 0 ? (
              treeNodes.map((root) => renderTreeBranch(root, 1))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">Chưa có danh mục nào.</p>
            )}
          </div>
        </div>

        {/* Right Column: Category Detail & Taxonomy Rules (Fills remaining width) */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          {selectedCategory ? (
            <form onSubmit={handleSaveCategory} className="divide-y divide-slate-100">
              {/* Detail Header */}
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ID: {selectedCategory.category_id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Version: {selectedCategory.version}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedCategory.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedCategory.status === 'ARCHIVED'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedCategory.status}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedCategory.name}
                </h2>

                <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 truncate">
                  Path: {selectedCategory.path || `/${selectedCategory.category_id}`}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tên hiển thị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Đường dẫn tĩnh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh mục cha
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => {
                      const newParent = e.target.value;
                      setFormData({
                        ...formData,
                        parent_id: newParent,
                        inherit_tax: Boolean(newParent),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                  >
                    <option value="">-- Là danh mục gốc --</option>
                    {categories
                      .filter((c) => c.category_id !== selectedCategory.category_id && c.status !== 'ARCHIVED')
                      .map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.name} · {c.path}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Thuế suất VAT */}
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#0A68FF]" />
                      Thuế suất VAT
                    </label>
                    {formData.parent_id && (
                      <label className="flex items-center gap-1.5 text-xs text-blue-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.inherit_tax}
                          onChange={(e) => setFormData({ ...formData, inherit_tax: e.target.checked })}
                          className="rounded text-[#0A68FF]"
                        />
                        <span>Kế thừa từ cha</span>
                      </label>
                    )}
                  </div>

                  {formData.inherit_tax ? (
                    <p className="text-xs text-blue-800 italic">
                      Danh mục con kế thừa thuế suất từ danh mục cha (<code>tax_rate_bps = null</code>).
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.tax_percent}
                        onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                        className="w-24 px-3 py-1.5 text-sm bg-white font-bold rounded-lg border border-blue-300 text-blue-900 focus:outline-hidden"
                      />
                      <span className="text-xs font-bold text-blue-900">%</span>
                      <span className="text-xs text-blue-700">
                        = {Math.round(Number(formData.tax_percent || 0) * 100)} bps
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Theo đặc tả Product Catalog §3.4: Thuế suất VAT lưu dạng basis point, 10% tương đương 1000 bps. Danh mục gốc bắt buộc phải có thuế suất.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-48 px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm dừng</option>
                    <option value="ARCHIVED">Lưu trữ</option>
                  </select>
                </div>

                {/* Penpot Taxonomy Attributes preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Thuộc tính bắt buộc ngành hàng
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Thương hiệu', 'Dòng sản phẩm', 'Dung lượng', 'Màu sắc', 'Xuất xứ', 'Bảo hành'].map((attr) => (
                      <span
                        key={attr}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Archive prompt section */}
                {showArchivePrompt && (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 space-y-3">
                    <div className="text-xs font-bold text-rose-900 flex items-center gap-2">
                      <Archive className="w-4 h-4 text-rose-600" />
                      Xác nhận lưu trữ mềm danh mục
                    </div>
                    <p className="text-xs text-rose-800">
                      Danh mục sau khi lưu trữ sẽ chuyển sang <code>ARCHIVED</code>, không nhận thêm sản phẩm mới.
                    </p>
                    <input
                      type="text"
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                      placeholder="Lý do lưu trữ..."
                      className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowArchivePrompt(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleArchiveCategory}
                        disabled={archiving}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                        Xác nhận lưu trữ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Footer Actions */}
              <div className="p-6 bg-slate-50 flex items-center justify-between">
                <div>
                  {selectedCategory.status !== 'ARCHIVED' && !showArchivePrompt && (
                    <button
                      type="button"
                      onClick={() => setShowArchivePrompt(true)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Lưu trữ danh mục
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#0A68FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-16 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Chọn một danh mục để xem chi tiết</p>
              <p className="text-xs text-slate-400">Hoặc bấm nút "+ Thêm danh mục mới" ở trên để khởi tạo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
