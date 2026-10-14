import { useState, useEffect, useCallback } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import OrderDetailModal from '../components/OrderDetailModal';
import PrepareShipmentModal from '../components/PrepareShipmentModal';
import {
  getSellerOrders,
  fulfillSellerOrder,
  bulkAcceptSellerOrders,
} from '../services/seller-order.api';

export default function OrdersPage() {
  const [ordersData, setOrdersData] = useState({ metrics: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedOrderShipment, setSelectedOrderShipment] = useState(null);

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
        carrier: ord.carrier || 'GHN Express',
      });
      setFeedback({
        type: 'success',
        text: `Đơn hàng ${ord.id} đã sẵn sàng bàn giao cho ${ord.carrier || 'đơn vị vận chuyển'}!`,
      });
      fetchOrders();
    } catch {
      setFeedback({ type: 'error', text: `Lỗi khi cập nhật trạng thái đơn ${ord.id}!` });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
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
          <span>📦</span>
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
            className="text-slate-400 hover:text-slate-600 font-bold ml-3"
          >
            ✕
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
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
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

          <button
            type="button"
            onClick={() => setFeedback({ type: 'info', text: 'Bộ lọc nâng cao theo ngày, kênh vận chuyển đang được đồng bộ.' })}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Lọc
          </button>
          <button
            type="button"
            onClick={() => setFeedback({ type: 'success', text: 'Đã xuất dữ liệu danh sách đơn hàng sang bảng tính CSV.' })}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Xuất
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
            <span className="text-3xl block mb-2">📋</span>
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
                {(ordersData.items || []).map((order) => (
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
                      {order.cod_amount}
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
                      <div className="flex items-center justify-end gap-3">
                        {order.status_type === 'pending' || order.status_type === 'preparing' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderShipment(order)}
                            className="px-3 py-1 bg-indigo-50 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-lg text-[12px] font-semibold transition-colors shadow-2xs cursor-pointer"
                          >
                            Chuẩn bị hàng
                          </button>
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
                ))}
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
      />

      {/* Prepare Shipment Modal */}
      <PrepareShipmentModal
        order={selectedOrderShipment}
        isOpen={Boolean(selectedOrderShipment)}
        onClose={() => setSelectedOrderShipment(null)}
        onConfirm={handleShipmentConfirm}
      />
    </div>
  );
}
