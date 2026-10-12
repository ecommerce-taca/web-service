import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {  Search, X, ShoppingBag } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { orderApi } from '../services/order.api';

const TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đang giao', value: 'SHIPPING' },
  { label: 'Đã giao', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' }
];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async (status) => {
    setLoading(true);
    try {
      const response = await orderApi.getOrders({ page: 1, size: 50, status: status || undefined });
      const items = response?.data?.data || response?.data || [];
      
      const formattedOrders = items.map(o => ({
        id: o.id,
        storeName: o.shop?.name || 'Gian hàng Taca',
        status: o.status,
        totalPrice: o.total_amount || 0,
        createdAt: o.created_at,
        items: (o.order_items || []).map(i => ({
          name: i.product_name,
          variant: i.variant_name || '',
          price: i.unit_price,
          quantity: i.quantity,
          image: i.product_image
        }))
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  // Lọc theo từ khóa tìm kiếm (Mã đơn hoặc tên sản phẩm)
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const query = search.trim().toLowerCase();
    return orders.filter(order => {
      const matchId = String(order.id).toLowerCase().includes(query);
      const matchShop = (order.storeName || '').toLowerCase().includes(query);
      const matchProduct = order.items.some(item => (item.name || '').toLowerCase().includes(query));
      return matchId || matchShop || matchProduct;
    });
  }, [orders, search]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-[20px] font-extrabold text-taca-text-main m-0 uppercase flex items-center gap-2">
              ĐƠN MUA CỦA TÔI
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 mb-0">
              Quản lý tiến độ giao hàng và lịch sử đơn đặt hàng của bạn
            </p>
          </div>

          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Mã đơn, Tên sản phẩm, Shop..."
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-taca-primary focus:bg-white w-full sm:w-[320px] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs Navigation */}
        <div className="flex gap-2 sm:gap-4 overflow-x-auto border-b border-slate-200/80 mb-6 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-3 px-2 text-[14px] font-bold cursor-pointer border-b-2 transition-all whitespace-nowrap bg-transparent flex items-center gap-2 ${
                  isActive
                    ? 'border-taca-primary text-taca-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/60 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-200 rounded-full w-24" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-16 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-50 text-taca-primary rounded-2xl flex items-center justify-center mb-3.5 shadow-xs">
                <ShoppingBag className="w-8 h-8 text-taca-primary" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800 mb-1">
                {search ? 'Không tìm thấy đơn hàng nào phù hợp' : 'Chưa có đơn hàng nào'}
              </h3>
              <p className="text-[13px] text-slate-500 max-w-sm mb-6 leading-relaxed">
                {search 
                  ? 'Hãy thử kiểm tra lại mã đơn hàng hoặc từ khóa tìm kiếm của bạn.' 
                  : 'Hãy dạo quanh cửa hàng và chọn những món đồ bạn yêu thích để đặt hàng ngay hôm nay!'}
              </p>
              <Link
                to="/"
                className="px-6 py-2.5 bg-taca-primary hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold transition-colors no-underline shadow-sm"
              >
                Khám phá mua sắm ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
