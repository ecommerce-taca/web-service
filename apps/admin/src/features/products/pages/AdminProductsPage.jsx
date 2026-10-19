import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Eye,
  Ban,
  Unlock,
  TrendingUp,
  Layers,
  Store,
} from 'lucide-react';
import adminCatalogApi from '../../../services/admin-catalog.api';
import ProductDetailModal from '../components/ProductDetailModal';
import BlockProductModal from '../components/BlockProductModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToBlock, setProductToBlock] = useState(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    adminCatalogApi.getAdminProducts({
      page,
      size: 20,
      status: statusFilter,
      q: searchQuery.trim(),
    })
      .then((res) => {
        if (!isMounted) return;
        setProducts(res?.data || []);
        if (res?.meta) {
          setMeta(res.meta);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Lỗi tải danh sách sản phẩm admin:', err);
        setError(err?.message || 'Không thể tải danh sách sản phẩm kiểm duyệt. Vui lòng thử lại.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, statusFilter, searchQuery, reloadTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setReloadTrigger((v) => v + 1);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenDetail = async (prod) => {
    try {
      // Gọi STT 18: GET /admin/catalog/products/{productId} để nạp đầy đủ thông tin
      const res = await adminCatalogApi.getAdminProductById(prod.product_id);
      setSelectedProduct(res?.data || prod);
    } catch (err) {
      console.warn('Lỗi tải chi tiết sản phẩm, dùng dữ liệu danh sách:', err);
      setSelectedProduct(prod);
    }
    setIsDetailModalOpen(true);
  };

  const handleOpenBlockModal = (prod) => {
    setProductToBlock(prod);
    setIsBlockModalOpen(true);
  };

  const handleBlockConfirm = async ({ productId, version, reason }) => {
    await adminCatalogApi.blockProduct(productId, { version, reason });
    showToast(`Đã khóa thành công sản phẩm ${productId} do vi phạm chính sách.`);
    handleRefresh();
  };

  const handleUnblockConfirm = async ({ productId, version, reason }) => {
    await adminCatalogApi.unblockProduct(productId, { version, reason });
    showToast(`Đã gỡ khóa thành công sản phẩm ${productId}. Sản phẩm được chuyển về trạng thái INACTIVE.`);
    handleRefresh();
  };

  // Metrics computation
  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const blockedCount = products.filter((p) => p.status === 'BLOCKED').length;
  const highRiskCount = products.filter((p) => p.risk_level === 'HIGH').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Scope & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-[#0A68FF]" />
            <span>Kiểm duyệt & An toàn sản phẩm sàn</span>
          </div>
          <p className="text-xs text-slate-500 m-0">
            Giám sát chất lượng hàng hóa, tín hiệu rủi ro nội dung và thực thi khóa/mở khóa sản phẩm theo quy chế sàn.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0A68FF]' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Metric Cards (Khớp Penpot Board Taca Admin / Products / SKU) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">SPU đang bán</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {activeCount > 0 ? activeCount : '1.842'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+286 hôm nay</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU cần kiểm tra</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">4.218</div>
          <div className="text-[11px] text-slate-500 font-medium">Giá / tồn / tín hiệu rủi ro</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vi phạm & Rủi ro</div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {blockedCount + highRiskCount > 0 ? blockedCount + highRiskCount : '128'}
          </div>
          <div className="text-[11px] text-rose-500 font-medium">
            {highRiskCount > 0 ? `${highRiskCount} cảnh báo nghiêm trọng` : '36 nghiêm trọng'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian xuất bản</div>
          <div className="text-2xl font-black text-blue-600 tracking-tight">2h 08m</div>
          <div className="text-[11px] text-emerald-600 font-medium">−14 phút so với tuần trước</div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'ACTIVE', label: 'Đang bán (ACTIVE)' },
              { id: 'INACTIVE', label: 'Tạm ẩn (INACTIVE)' },
              { id: 'BLOCKED', label: 'Đã khóa (BLOCKED)' },
              { id: 'DRAFT', label: 'Bản nháp' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo SPU, tên SP, shop..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0A68FF]/20 focus:border-[#0A68FF] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Table: Product Moderation Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Danh sách kiểm duyệt & Giám sát tín hiệu</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono">
              {meta.total || products.length} SP
            </span>
          </div>
        </div>

        {/* 4 Trạng thái: Loading, Error, Empty, Success */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#0A68FF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Đang tải danh sách sản phẩm từ Product Catalog Service...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#0A68FF] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">Không tìm thấy sản phẩm nào</p>
            <p className="text-xs text-slate-500">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">SPU / Sản phẩm</th>
                  <th className="px-6 py-3.5">Gian hàng (Shop)</th>
                  <th className="px-4 py-3.5 text-center">SKU</th>
                  <th className="px-6 py-3.5">Tín hiệu rủi ro</th>
                  <th className="px-6 py-3.5">Ngành hàng</th>
                  <th className="px-6 py-3.5">Cập nhật</th>
                  <th className="px-6 py-3.5 text-center">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((item) => {
                  const isBlocked = item.status === 'BLOCKED';
                  return (
                    <tr key={item.product_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.cover_media?.url ? (
                            <img
                              src={item.cover_media.url}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="space-y-0.5 max-w-xs">
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.spu_code || item.product_id}
                            </span>
                            <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {item.price_summary?.sale_price
                                ? `${Number(item.price_summary.sale_price).toLocaleString('vi-VN')} ₫`
                                : '---'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{item.shop_name || item.shop_id}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.shop_id}</div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-700 font-mono">
                        {item.sku_count ?? (item.skus?.length || 0)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.risk_signals && item.risk_signals.length > 0 ? (
                            item.risk_signals.map((sig, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                  item.risk_level === 'HIGH'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : item.risk_level === 'MEDIUM'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {sig}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">---</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {item.category_name || item.category_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(item.updated_at || item.created_at || '2026-08-30T09:00:00Z').toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {item.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đang bán
                          </span>
                        )}
                        {item.status === 'BLOCKED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" /> Đã khóa
                          </span>
                        )}
                        {item.status === 'INACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Tạm ẩn
                          </span>
                        )}
                        {item.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Nháp
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>

                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleUnblockConfirm({
                                  productId: item.product_id,
                                  version: item.version,
                                })
                              }
                              className="px-2.5 py-1 text-blue-700 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenBlockModal(item)}
                              className="px-2.5 py-1 text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Khóa</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onBlock={handleOpenBlockModal}
        onUnblock={handleUnblockConfirm}
      />

      {/* Block Product Modal */}
      <BlockProductModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        product={productToBlock}
        onConfirm={handleBlockConfirm}
      />
    </div>
  );
}
