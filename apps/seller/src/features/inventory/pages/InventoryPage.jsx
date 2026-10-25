import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import MetricCard from '../../../components/common/MetricCard';
import StockAdjustModal from '../components/StockAdjustModal';
import { getSellerInventory } from '../services/seller-inventory.api';

export default function InventoryPage() {
  const [inventoryState, setInventoryState] = useState({ data: [], metrics: {}, meta: {} });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdjustItem, setSelectedAdjustItem] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSellerInventory({
        status: activeTab === 'ACTIVE' ? 'ACTIVE' : undefined,
        low_stock: activeTab === 'low_stock' ? true : undefined,
        search: searchQuery,
      });

      let items = res?.data || [];
      if (activeTab === 'out_of_stock') {
        items = items.filter((i) => i.available_qty === 0);
      }

      setInventoryState({
        data: items,
        metrics: res?.metrics || {},
        meta: res?.meta || {},
      });
    } catch (err) {
      console.warn('Lỗi tải dữ liệu kho hàng:', err);
      setFeedback({ type: 'error', text: 'Không thể tải danh sách tồn kho. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 120);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'ACTIVE', label: 'Đang hoạt động' },
    { id: 'low_stock', label: 'Cảnh báo sắp hết' },
    { id: 'out_of_stock', label: 'Hết hàng' },
  ];

  const handleAdjustSuccess = (res) => {
    setFeedback({
      type: 'success',
      text: `Đã cập nhật tồn kho SKU ${res.sku_id} thành công! Số lượng khả dụng mới: ${res.available_qty}.`,
    });
    fetchInventory();
    setTimeout(() => setFeedback(null), 4000);
  };

  const metrics = inventoryState.metrics || {};
  const metricCards = [
    {
      id: 'total_skus',
      label: 'Tổng SKU quản lý',
      value: String(metrics.total_skus || (inventoryState.data || []).length),
      trend: 'Toàn bộ danh mục shop',
      isPositive: true,
    },
    {
      id: 'total_available',
      label: 'Tồn khả dụng (Available)',
      value: (metrics.total_available || 0).toLocaleString(),
      trend: 'Sẵn sàng phục vụ đơn mới',
      isPositive: true,
    },
    {
      id: 'total_reserved',
      label: 'Đang giữ theo đơn (Reserved)',
      value: (metrics.total_reserved || 0).toLocaleString(),
      trend: 'Chờ hoàn tất fulfillment',
      isWarning: (metrics.total_reserved || 0) > 0,
    },
    {
      id: 'low_stock_count',
      label: 'Cảnh báo tồn thấp',
      value: String(metrics.low_stock_count || 0),
      trend: (metrics.low_stock_count || 0) > 0 ? 'Cần nhập thêm hàng' : 'Tồn kho ổn định',
      isWarning: (metrics.low_stock_count || 0) > 0,
      isPositive: (metrics.low_stock_count || 0) === 0,
    },
  ];

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · ${d.toLocaleDateString('vi-VN')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Quản lý kho hàng
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Theo dõi lượng tồn khả dụng, số lượng giữ theo đơn và điều chỉnh tồn kho SKU.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInventory}
          className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold text-[13px] shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>Làm mới kho</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-[13px] font-semibold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Đóng thông báo"
            className="text-slate-400 hover:text-slate-600 p-1 ml-3 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((m) => (
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Tìm theo SKU, tên SP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Đang tải dữ liệu kho hàng...</p>
          </div>
        ) : (inventoryState.data || []).length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" aria-hidden="true" />
            <p className="font-semibold text-slate-700">Không tìm thấy mã SKU nào</p>
            <p className="text-[12px] text-slate-400 mt-1">Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">MÃ SKU</th>
                  <th className="py-3.5 px-6">SẢN PHẨM & BIẾN THỂ</th>
                  <th className="py-3.5 px-6 text-center">TỒN KHẢ DỤNG</th>
                  <th className="py-3.5 px-6 text-center">ĐANG GIỮ (RESERVED)</th>
                  <th className="py-3.5 px-6">CẢNH BÁO TỒN</th>
                  <th className="py-3.5 px-6">CẬP NHẬT LẦN CUỐI</th>
                  <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(inventoryState.data || []).map((item) => {
                  const isLow = item.low_stock || item.available_qty <= 5;
                  const isOutOfStock = item.available_qty === 0;

                  return (
                    <tr key={item.sku_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-900 text-[13px]">
                          {item.seller_sku || item.sku_id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {item.sku_id}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          {item.product_name || 'Sản phẩm'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.sku_label || 'Tiêu chuẩn'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-extrabold text-[15px] ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {(item.available_qty || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-[12px]">
                          {(item.reserved_qty || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                            <span>Hết hàng</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                            <span>Tồn thấp (&le;5)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" aria-hidden="true" />
                            <span>Đầy đủ</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[12px]">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAdjustItem(item)}
                          className="px-3 py-1 bg-indigo-50 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-lg text-[12px] font-semibold transition-colors shadow-2xs cursor-pointer"
                        >
                          Điều chỉnh kho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjust Modal (MISS-004) */}
      {selectedAdjustItem && (
        <StockAdjustModal
          key={selectedAdjustItem.sku_id}
          item={selectedAdjustItem}
          isOpen={Boolean(selectedAdjustItem)}
          onClose={() => setSelectedAdjustItem(null)}
          onSuccess={handleAdjustSuccess}
        />
      )}
    </div>
  );
}
