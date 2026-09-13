import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const mockCartItems = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max 256GB',
    variant: 'Titan tự nhiên - SKU IP16PM-256-NAT',
    price: 29490000,
    quantity: 1,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5',
    variant: 'Đen - SKU SONY-XM5-BLK',
    price: 7490000,
    quantity: 1,
    image: 'https://via.placeholder.com/150',
  }
];

export default function CartPage() {
  const [items, setItems] = useState(mockCartItems);
  const [selectedItems, setSelectedItems] = useState([1, 2]); // Check all by default
  const navigate = useNavigate();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const calculateSubtotal = () => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = 500000;
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Giỏ hàng</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Giỏ hàng ({items.length} sản phẩm)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              {/* Header row */}
              <div className="flex items-center text-sm font-medium text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center w-1/2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span className="ml-3">Sản phẩm</span>
                </div>
                <div className="w-1/6 text-center">Đơn giá</div>
                <div className="w-1/6 text-center">Số lượng</div>
                <div className="w-1/6 text-right">Thành tiền</div>
              </div>

              {/* Items list */}
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-start py-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start w-1/2">
                      <div className="pt-2">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        />
                      </div>
                      <div className="ml-4 w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                        {/* Image placeholder */}
                      </div>
                      <div className="ml-4 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-4">
                          <button className="text-gray-500 hover:text-primary flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            Lưu để mua sau
                          </button>
                          <button className="text-gray-500 hover:text-red-500">Xóa</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/6 text-center pt-2 font-bold text-[#E53935]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                    
                    <div className="w-1/6 flex justify-center pt-2">
                      <div className="flex items-center border border-gray-300 rounded h-8">
                        <button 
                          className="w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >-</button>
                        <input 
                          type="text" 
                          className="w-10 text-center border-x border-y-0 border-gray-300 text-sm focus:ring-0 p-0 h-full"
                          value={item.quantity}
                          readOnly
                        />
                        <button 
                          className="w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    
                    <div className="w-1/6 text-right pt-2 font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 mb-6 uppercase">TÓM TẮT ĐƠN HÀNG</h2>
              
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-600">Voucher</span>
                <div className="text-right">
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    2 voucher đã áp dụng
                  </button>
                  <p className="text-primary font-medium text-sm mt-2">APPLE300K + TACA200K</p>
                </div>
              </div>

              <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium text-[#00C853]">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                <span className="font-bold text-2xl text-[#E53935]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mua hàng ({selectedItems.length})
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Thanh toán an toàn • Bảo vệ người mua
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
