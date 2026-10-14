import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '@taca/ui-components';

export default function CartPage() {
  const {
    items,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    selectAll,
    deselectAll,
  } = useCart();

  const navigate = useNavigate();

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const discount = selectedItems.length > 0 ? (selectedSubtotal >= 20000000 ? 500000 : 200000) : 0;
  const total = Math.max(0, selectedSubtotal - discount);

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-taca-surface min-h-[60vh] py-16 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 border border-taca-border shadow-sm">
          <ShoppingCart className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-taca-text-main mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-taca-text-muted mb-6 max-w-sm">
          Hãy khám phá hàng ngàn sản phẩm chính hãng với ưu đãi hấp dẫn trên Taca!
        </p>
        <Link to="/">
          <Button variant="primary" className="px-8 h-11 rounded-[8px]">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-taca-surface min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[13px] text-taca-text-muted">
        <Link to="/" className="hover:text-taca-primary text-inherit no-underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-taca-text-main font-semibold">Giỏ hàng</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <h1 className="text-2xl font-bold text-taca-text-main mb-6">
          Giỏ hàng ({items.length} sản phẩm)
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Cart Items */}
          <div className="flex-1 bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-taca-border w-full">
            {/* Header row */}
            <div className="flex items-center mb-4 pb-4 border-b border-taca-border">
              <div className="flex items-center w-full md:w-1/2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
                <span className="ml-3 text-[12px] font-bold text-taca-text-muted uppercase tracking-wider">
                  Chọn tất cả ({items.length})
                </span>
              </div>
              <div className="hidden md:block w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Đơn giá</div>
              <div className="hidden md:block w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Số lượng</div>
              <div className="hidden md:block w-1/6 text-right text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Thành tiền</div>
            </div>

            {/* Items list */}
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row items-start py-4 border-b border-slate-100 last:border-0 last:pb-0 gap-3 md:gap-0">
                  {/* Left: Checkbox + Image + Title + Delete */}
                  <div className="flex items-start w-full md:w-1/2">
                    <div className="pt-2 md:pt-8 shrink-0">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </div>
                    <Link to={`/product/${item.productId}`} className="ml-3 sm:ml-4 w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 overflow-hidden border border-taca-border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="ml-3 sm:ml-4 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] min-w-0 flex-1">
                      <div>
                        <Link to={`/product/${item.productId}`} className="text-[13px] font-extrabold text-taca-text-main line-clamp-2 leading-tight hover:text-taca-primary no-underline">
                          {item.name}
                        </Link>
                        <p className="text-[11px] font-medium text-taca-text-muted mt-1">{item.variant}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-semibold text-taca-text-muted pt-1">
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item.id)} 
                          className="hover:text-taca-sale text-inherit bg-transparent border-none cursor-pointer p-0"
                        >
                          Xóa khỏi giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right / Bottom on Mobile: Price & Stepper & Line Total */}
                  <div className="flex items-center justify-between w-full md:w-1/2 pt-1 md:pt-8 pl-7 sm:pl-8 md:pl-0">
                    <div className="md:w-1/3 text-left md:text-center text-[13px] font-extrabold text-taca-sale">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                    
                    <div className="md:w-1/3 flex justify-center">
                      <div className="flex items-center border border-taca-border rounded h-8 bg-white overflow-hidden shadow-2xs">
                        <button 
                          type="button"
                          className="w-8 flex items-center justify-center text-taca-text-main text-[13px] font-bold hover:bg-slate-50 cursor-pointer border-none bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <span className="w-10 text-center text-[12px] font-bold text-taca-text-main select-none">
                          {item.quantity}
                        </span>
                        <button 
                          type="button"
                          className="w-8 flex items-center justify-center text-taca-text-main text-[13px] font-bold hover:bg-slate-50 cursor-pointer border-none bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block md:w-1/3 text-right text-[13px] font-extrabold text-taca-text-main">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-lg p-6 shadow-sm border border-taca-border flex flex-col flex-shrink-0">
            <h2 className="text-[14px] font-extrabold text-taca-text-main mb-6 uppercase">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-3 border-b border-taca-border pb-4 mb-4 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-taca-text-muted">Tạm tính ({selectedItems.length} sản phẩm)</span>
                <span className="font-bold text-taca-text-main">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedSubtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Giảm giá voucher</span>
                  <span className="font-bold">
                    - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-[14px] font-extrabold text-taca-text-main">Tổng thanh toán</span>
              <span className="text-[18px] font-extrabold text-taca-sale">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </span>
            </div>

            <Button 
              variant="primary"
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="w-full h-12 text-[14px] font-bold rounded-[8px] uppercase tracking-wider"
            >
              Mua hàng ({selectedItems.length})
            </Button>
            
            <p className="text-[11px] font-medium text-taca-text-muted text-center mt-4">
              Thanh toán an toàn • Bảo vệ người mua 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
