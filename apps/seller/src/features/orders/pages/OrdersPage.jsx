import { useState, useEffect, useCallback } from 'react';
import { Package, X, ClipboardList, Download } from 'lucide-react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import OrderDetailModal from '../components/OrderDetailModal';
import PrepareShipmentModal from '../components/PrepareShipmentModal';
import CancelOrderModal from '../components/CancelOrderModal';
import {
  getSellerOrders,
  fulfillSellerOrder,
  bulkAcceptSellerOrders,
  exportSellerOrders,
} from '../services/seller-order.api';

export default function OrdersPage() {
  const [ordersData, setOrdersData] = useState({ metrics: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedOrderShipment, setSelectedOrderShipment] = useState(null);
  const [selectedOrderCancel, setSelectedOrderCancel] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSellerOrders({
        status: activeTab,
        search: searchQuery,
      });
      setOrdersData(data);
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'preparing', label: 'Chuẩn bị' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn tất' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const handleBulkAccept = async () => {
    const pendingOrders = ordersData.items.filter((item) => item.status_type === 'pending');
    if (pendingOrders.length === 0) {
      setFeedback({ type: 'info', text: 'Hiện không có đơn hàng nào ở trạng thái Chờ xác nhận.' });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    try {
      const ids = pendingOrders.map((o) => o.id);
      await bulkAcceptSellerOrders(ids);
      setFeedback({
        type: 'success',
        text: `Đã xác nhận hàng loạt ${ids.length} đơn hàng thành công! Đang chuyển sang chuẩn bị hàng.`,
      });
      fetchOrders();
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi khi thực hiện xác nhận hàng loạt!' });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleShipmentConfirm = async (ord) => {
    try {
      await fulfillSellerOrder(ord.id, {
        action: 'SHIP',
        carrier: ord.carrier || 'GHN',
        version: ord.version || 1,
      });
      setFeedback({
        type: 'success',
        text: `Đơn hàng ${ord.id} đã sẵn sàng bàn giao cho ${ord.carrierName || ord.carrier || 'đơn vị vận chuyển'}!`,
      });
      fetchOrders();
    } catch {
      setFeedback({ type: 'error', text: `Lỗi khi cập nhật trạng thái đơn ${ord.id}!` });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleExportOrders = async (format = 'xlsx') => {
    setExporting(true);
    try {
      const res = await exportSellerOrders({
        status: activeTab !== 'all' ? activeTab : undefined,
        format,
      });

      if (res?.export_url) {
        // Tạo thẻ a ẩn để tải file an toàn
        const link = document.createElement('a');
        link.href = res.export_url;
        link.setAttribute('download', `orders_export_${Date.now()}.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setFeedback({
        type: 'success',
        text: `Đã xuất ${res?.row_count ?? (ordersData.items || []).length} đơn hàng ra file ${format.toUpperCase()} thành công!`,
      });
    } catch (err) {
      console.warn('Lỗi xuất đơn hàng:', err);
      setFeedback({ type: 'error', text: 'Có lỗi xảy ra khi xuất danh sách đơn hàng!' });
    } finally {
      setExporting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCancelSuccess = (res) => {
    setFeedback({
      type: 'success',
      text: `Đã hủy đơn hàng ${res.order_id || ''} thành công! Lý do: ${res.reason || 'Yêu cầu người bán'}.`,
    });
    fetchOrders();
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Xử lý đơn hàng
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Xác nhận, chuẩn bị, bàn giao vận chuyển và hỗ trợ người mua.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBulkAccept}
          className="px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg font-bold text-[13px] shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Package className="w-4 h-4 text-slate-700" aria-hidden="true" />
          <span>Xử lý hàng loạt</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-[13px] font-semibold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
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
        {(ordersData.metrics || []).map((m) => (
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

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Mã đơn / khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          {/* Export Orders Button (MISS-006) */}
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExportOrders('xlsx')}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            )}
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : (ordersData.items || []).length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" aria-hidden="true" />
            <p className="font-semibold text-slate-700">Không có đơn hàng nào phù hợp</p>
            <p className="text-[12px] text-slate-400 mt-1">Hãy thử đổi bộ lọc hoặc tìm kiếm mã đơn khác.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">MÃ ĐƠN</th>
                  <th className="py-3.5 px-6">KHÁCH HÀNG</th>
                  <th className="py-3.5 px-6">SẢN PHẨM</th>
                  <th className="py-3.5 px-6">TỔNG TIỀN</th>
                  <th className="py-3.5 px-6">TRẠNG THÁI / SLA</th>
                  <th className="py-3.5 px-6">VẬN CHUYỂN</th>
                  <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(ordersData.items || []).map((order) => {
                  const isCancellable = order.status_type === 'pending' || order.status_type === 'preparing';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{order.customer}</div>
                        <div className="text-[11px] text-slate-400">{order.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{order.product}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.sku} · x{order.quantity}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        {order.cod_amount || order.amount}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={order.status} type={order.status_type} />
                          {order.sla && (
                            <span className="text-[10px] font-mono font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              SLA {order.sla}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[12px] font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {order.carrier}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {isCancellable ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderShipment(order)}
                                className="px-3 py-1 bg-indigo-50 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-lg text-[12px] font-semibold transition-colors shadow-2xs cursor-pointer"
                              >
                                Chuẩn bị
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderCancel(order)}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                              >
                                Hủy
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetail(order)}
                            className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Chi tiết
                          </button>
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderDetail}
        isOpen={Boolean(selectedOrderDetail)}
        onClose={() => setSelectedOrderDetail(null)}
        onPrepare={(ord) => {
          setSelectedOrderDetail(null);
          setSelectedOrderShipment(ord);
        }}
        onCancel={(ord) => {
          setSelectedOrderDetail(null);
          setSelectedOrderCancel(ord);
        }}
      />

      {/* Prepare Shipment Modal (MISS-003) */}
      {selectedOrderShipment && (
        <PrepareShipmentModal
          key={selectedOrderShipment.id}
          order={selectedOrderShipment}
          isOpen={Boolean(selectedOrderShipment)}
          onClose={() => setSelectedOrderShipment(null)}
          onConfirm={handleShipmentConfirm}
        />
      )}

      {/* Cancel Order Modal (MISS-007) */}
      {selectedOrderCancel && (
        <CancelOrderModal
          key={selectedOrderCancel.id}
          order={selectedOrderCancel}
          isOpen={Boolean(selectedOrderCancel)}
          onClose={() => setSelectedOrderCancel(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
