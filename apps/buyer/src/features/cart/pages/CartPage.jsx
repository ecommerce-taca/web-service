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
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[13px] text-slate-500">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Giỏ hàng</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Giỏ hàng ({items.length} sản phẩm)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Cart Items */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            {/* Header row */}
            <div className="flex items-center mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center w-1/2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                />
                <span className="ml-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Sản phẩm</span>
              </div>
              <div className="w-1/6 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">Đơn giá</div>
              <div className="w-1/6 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">Số lượng</div>
              <div className="w-1/6 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider">Thành tiền</div>
            </div>

            {/* Items list */}
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex items-start py-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start w-1/2">
                    <div className="pt-8">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </div>
                    <Link to={`/product/${item.id}`} className="ml-4 w-24 h-24 bg-indigo-50 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="ml-4 flex flex-col justify-between h-24">
                      <div>
                        <Link to={`/product/${item.id}`} className="text-[13px] font-extrabold text-slate-900 line-clamp-2 leading-tight hover:text-primary no-underline">{item.name}</Link>
                        <p className="text-[10px] font-medium text-slate-600 mt-1">{item.variant}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                        <button className="hover:text-primary flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          Lưu để mua sau
                        </button>
                        <button className="hover:text-rose-500">Xóa</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/6 text-center pt-8 text-[13px] font-extrabold text-rose-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </div>
                  
                  <div className="w-1/6 flex justify-center pt-8">
                    <div className="flex items-center border border-slate-200 rounded h-8 bg-white">
                      <button 
                        className="w-8 flex items-center justify-center text-slate-900 text-[12px] font-bold hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >-</button>
                      <input 
                        type="number" 
                        className="w-10 text-center border-x border-y-0 border-slate-200 text-[12px] font-bold text-slate-900 focus:ring-0 p-0 h-full bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button 
                        className="w-8 flex items-center justify-center text-slate-900 text-[12px] font-bold hover:bg-slate-50"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                  
                  <div className="w-1/6 text-right pt-8 text-[12px] font-extrabold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-[14px] font-extrabold text-slate-900 mb-6 uppercase">Tóm tắt đơn hàng</h2>
            
            <div className="flex flex-col mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Voucher</span>
                <button 
                  className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                  onClick={() => alert('Tính năng đổi voucher sẽ được cập nhật sớm!')}
                >
                  2 voucher đã áp dụng
                </button>
              </div>
              <div className="flex justify-end">
                <p className="text-violet-600 text-[12px] font-bold">APPLE300K + TACA200K</p>
              </div>
            </div>

            <div className="space-y-3 border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-600">Tạm tính</span>
                <span className="text-[12px] font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-600">Giảm giá</span>
                <span className="text-[12px] font-bold text-emerald-600">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-[14px] font-extrabold text-slate-900">Tổng cộng</span>
              <span className="text-[18px] font-extrabold text-rose-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              Mua hàng ({selectedItems.length})
            </button>
            
            <p className="text-[10px] font-medium text-slate-600 text-center mt-4">
              Thanh toán an toàn • Bảo vệ người mua
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
