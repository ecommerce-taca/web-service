import { useState } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import OrderDetailModal from '../components/OrderDetailModal';
import PrepareShipmentModal from '../components/PrepareShipmentModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function OrdersPage() {
  const { orders } = SELLER_MOCK_DATA;
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedOrderShipment, setSelectedOrderShipment] = useState(null);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận 38' },
    { id: 'preparing', label: 'Chuẩn bị 64' },
    { id: 'shipping', label: 'Đang giao 286' },
    { id: 'completed', label: 'Hoàn tất' },
  ];

  const filteredOrders = orders.items.filter((item) => {
    if (activeTab === 'pending' && item.status_type !== 'pending') return false;
    if (activeTab === 'preparing' && item.status_type !== 'preparing') return false;
    if (activeTab === 'shipping' && item.status_type !== 'shipping') return false;
    if (activeTab === 'completed' && item.status_type !== 'completed') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
          onClick={() => alert('Đang mở bảng xử lý giao vận hàng loạt theo đợt lấy hàng')}
          className="px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg font-bold text-[13px] shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>📦</span>
          <span>Xử lý hàng loạt</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {orders.metrics.map((m) => (
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
            onClick={() => alert('Bộ lọc nâng cao theo ngày, kênh vận chuyển, hình thức thanh toán')}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors"
          >
            Lọc
          </button>
          <button
            type="button"
            onClick={() => alert('Đã xuất danh sách đơn hàng ra file Excel')}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors"
          >
            Xuất
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
              {filteredOrders.map((order) => (
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
                          className="px-3 py-1 bg-indigo-50 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-lg text-[12px] font-semibold transition-colors shadow-2xs"
                        >
                          Chuẩn bị hàng
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetail(order)}
                        className="text-[12px] font-semibold text-slate-600 hover:text-slate-900"
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
        onConfirm={(ord) => {
          alert(`Đơn hàng ${ord.id} đã sẵn sàng bàn giao cho ${ord.carrier}!`);
        }}
      />
    </div>
  );
}
