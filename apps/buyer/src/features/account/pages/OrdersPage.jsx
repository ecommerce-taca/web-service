import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (status) => {
    setLoading(true);
    try {
      const response = await orderApi.getOrders({ page: 1, size: 50, status: status || undefined });
      const items = response.data.data || response.data || [];
      // Map API data to UI structure (this depends on real API structure, assuming similar)
      const formattedOrders = items.map(o => ({
        id: o.id,
        storeName: o.shop?.name || 'Cửa hàng',
        status: o.status,
        totalPrice: o.total_amount || 0,
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 flex-1">
        <h2 className="text-[20px] font-extrabold text-taca-text-main m-0 mb-6">Đơn mua</h2>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-taca-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent ${
                activeTab === tab.value
                  ? 'border-taca-primary text-taca-primary'
                  : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} onClick={() => navigate(`/account/orders/${order.id}`)} className="cursor-pointer">
                <OrderCard order={order} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Không có đơn hàng nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
