import { useState, useEffect, useCallback, Fragment } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import ProductEditorModal from '../components/ProductEditorModal';
import ProductImportModal from '../components/ProductImportModal';
import sellerProductApi from '../services/seller-product.api';

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedSpuId, setExpandedSpuId] = useState(null);

  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'ACTIVE', label: 'Đang bán' },
    { id: 'OUT_OF_STOCK', label: 'Hết hàng' },
    { id: 'INACTIVE', label: 'Tạm ẩn' },
    { id: 'ARCHIVED', label: 'Đã lưu trữ' },
  ];

  // Fetch danh sách sản phẩm qua service (hỗ trợ Dual-Mode mock/live)
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await sellerProductApi.getProducts({
        status: activeTab,
        q: searchQuery.trim(),
        sort: 'newest',
        page: 1,
        size: 50
      });
      const dataItems = res?.data?.items || [];
      setItems(dataItems);
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm người bán:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Tính toán 4 thẻ chỉ số KPI động khớp Penpot "Taca Seller / Products"
  const totalSpu = items.length;
  const totalSku = items.reduce((acc, p) => acc + (p.sku_count || (p.skus ? p.skus.length : 1)), 0);
  const activeCount = items.filter(p => p.status === 'ACTIVE').length;
  const lowStockCount = items.filter(p => (Number(p.stock_display) || 0) <= 10).length;

  const metrics = [
    { id: 'spu', label: 'Tổng SPU', value: totalSpu.toLocaleString('vi-VN'), trend: '+24 tháng này', isPositive: true },
    { id: 'sku', label: 'Tổng SKU', value: totalSku.toLocaleString('vi-VN'), trend: `Bình quân ${(totalSku / (totalSpu || 1)).toFixed(1)} SKU/SPU`, isPositive: true },
    { id: 'active', label: 'Đang bán', value: activeCount.toLocaleString('vi-VN'), trend: `${Math.round((activeCount / (totalSpu || 1)) * 100)}% danh mục`, isPositive: true },
    { id: 'warning', label: 'Cảnh báo tồn kho', value: lowStockCount.toLocaleString('vi-VN'), trend: 'Cần nhập hàng', isWarning: lowStockCount > 0 },
  ];

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleTogglePublish = async (spu) => {
    try {
      if (spu.status === 'ACTIVE') {
        await sellerProductApi.unpublishProduct(spu.id || spu.productId);
      } else {
        await sellerProductApi.publishProduct(spu.id || spu.productId);
      }
      loadProducts();
    } catch (err) {
      alert(`Thao tác thất bại: ${err?.response?.data?.message || err.message}`);
    }
  };

  const handleArchiveProduct = async (spu) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn chuyển sản phẩm "${spu.title || spu.name}" vào danh sách lưu trữ?`);
    if (!isConfirmed) return;
    try {
      await sellerProductApi.archiveProduct(spu.id || spu.productId);
      alert('Đã lưu trữ sản phẩm thành công!');
      loadProducts();
    } catch (err) {
      alert(`Lỗi lưu trữ sản phẩm: ${err?.response?.data?.message || err.message}`);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await sellerProductApi.exportProductsExcelUrl();
      if (res?.data?.download_url) {
        alert('Đã sẵn sàng tải file Excel danh sách sản phẩm!');
      }
    } catch (err) {
      alert(`Lỗi xuất Excel: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Quản lý SPU, biến thể SKU, tồn kho, giá và trạng thái hiển thị.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>＋</span>
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* 4 Metric Cards (Khớp Penpot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            trend={m.trend}
            isPositive={m.isPositive}
            isWarning={m.isWarning}
          />
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Tìm tên SPU, mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#4F46E5] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Excel Import / Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📄</span>
            <span>Nhập Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊</span>
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* SPU & SKU Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-[14px]">
            Đang tải dữ liệu sản phẩm...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 text-[14px]">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-[14px]">
            Không tìm thấy sản phẩm nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">SẢN PHẨM / SPU</th>
                  <th className="py-3.5 px-6">BIẾN THỂ SKU</th>
                  <th className="py-3.5 px-6">GIÁ BÁN</th>
                  <th className="py-3.5 px-6">TỒN KHO</th>
                  <th className="py-3.5 px-6">ĐÃ BÁN</th>
                  <th className="py-3.5 px-6">TRẠNG THÁI</th>
                  <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((spu) => {
                  const isExpanded = expandedSpuId === spu.id;
                  const isOutOfStock = (Number(spu.stock_display) || 0) === 0;

                  return (
                    <Fragment key={spu.id || spu.productId}>
                      <tr className="group hover:bg-slate-50/40 transition-colors">
                        {/* SPU column */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900 text-[14px]">
                              {spu.title || spu.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              {spu.spu_code || spu.code || `SPU-${spu.id}`}
                            </div>
                          </div>
                        </td>

                        {/* Variant summary */}
                        <td className="py-4 px-6 text-[#4F46E5] font-medium text-[12px]">
                          {spu.sku_summary || `${spu.sku_count || (spu.skus ? spu.skus.length : 1)} SKU`}
                        </td>

                        {/* Price Range */}
                        <td className="py-4 px-6 font-extrabold text-slate-900">
                          {spu.price_range || (
                            spu.price_summary 
                              ? `${Number(spu.price_summary.min_price).toLocaleString('vi-VN')} – ${Number(spu.price_summary.max_price).toLocaleString('vi-VN')} ₫`
                              : '29.490.000 ₫'
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : 'text-slate-800'}`}>
                            {spu.stock_display ?? spu.total_stock ?? 0}
                          </span>
                        </td>

                        {/* Sold */}
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {(spu.sold_count || spu.sold || 0).toLocaleString('vi-VN')}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <StatusBadge 
                            status={
                              spu.status === 'ARCHIVED'
                                ? 'Đã lưu trữ'
                                : spu.status === 'ACTIVE'
                                ? 'Đang bán'
                                : isOutOfStock
                                ? 'Hết hàng'
                                : 'Tạm ẩn'
                            } 
                            type={
                              spu.status === 'ARCHIVED'
                                ? 'archived'
                                : spu.status === 'ACTIVE'
                                ? 'active'
                                : isOutOfStock
                                ? 'out_of_stock'
                                : 'hidden'
                            } 
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {spu.skus && spu.skus.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedSpuId(isExpanded ? null : spu.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                              >
                                {isExpanded ? 'Thu gọn ▴' : 'Xem SKU ▾'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(spu)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#4F46E5] bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                            >
                              Chỉnh sửa
                            </button>
                            {spu.status !== 'ARCHIVED' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(spu)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                >
                                  {spu.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveProduct(spu)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                                >
                                  Lưu trữ
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(spu)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                              >
                                Khôi phục
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && spu.skus && spu.skus.length > 0 && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={7} className="py-3 px-8">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Danh sách biến thể SKU ({spu.skus.length})
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {spu.skus.map((sku) => (
                                  <div key={sku.id || sku.sku_code} className="p-3 border border-slate-200 rounded-xl bg-slate-50/70 flex justify-between items-center text-[12px]">
                                    <div>
                                      <div className="font-semibold text-slate-800">{sku.name || sku.sku_code}</div>
                                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sku.sku_code}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-[#4F46E5]">{Number(sku.price?.sale_price || sku.price || 0).toLocaleString('vi-VN')} ₫</div>
                                      <div className="text-[11px] text-slate-500 mt-0.5">Kho: {sku.stock_display ?? 0}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product SPU/SKU Editor Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProduct(null);
        }}
        onSave={() => {
          loadProducts();
        }}
      />

      {/* Product Excel Import Modal (#7b - #7e) */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadProducts();
        }}
      />
    </div>
  );
}
