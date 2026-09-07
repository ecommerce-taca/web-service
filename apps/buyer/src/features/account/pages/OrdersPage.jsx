import { useState } from 'react';
import OrderCard from '../components/OrderCard';

const DUMMY_ORDERS = [
  {
    id: 'TACA2408271',
    storeName: 'Taca Apple Flagship Store',
    status: 'ĐÃ GIAO',
    totalPrice: 29490000,
    items: [
      {
        name: 'iPhone 16 Pro Max 256GB',
        variant: 'Titan tự nhiên',
        price: 29490000,
        quantity: 1
      }
    ]
  },
  {
    id: 'TACA2408272',
    storeName: 'Sony Official Store',
    status: 'ĐANG VẬN CHUYỂN',
    totalPrice: 7490000,
    items: [
      {
        name: 'Tai nghe chụp tai Sony WH-1000XM5',
        variant: 'Đen',
        price: 7490000,
        quantity: 1
      }
    ]
  }
];

const TABS = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Filter orders based on active tab
  const filteredOrders = DUMMY_ORDERS.filter(order => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Đang giao' && order.status === 'ĐANG VẬN CHUYỂN') return true;
    if (activeTab === 'Đã giao' && order.status === 'ĐÃ GIAO') return true;
    return false;
  });

  return (
    <div>
      <h2 className="text-[20px] font-extrabold text-taca-text-main m-0 mb-6">Đơn mua</h2>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-taca-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent ${
              activeTab === tab
                ? 'border-taca-primary text-taca-primary'
                : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            Không có đơn hàng nào
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
