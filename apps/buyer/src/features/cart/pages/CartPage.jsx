import { Link, useNavigate } from 'react-router-dom';
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
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 text-4xl mb-4 border border-taca-border shadow-sm">
          🛒
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
          <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-taca-border w-full">
            {/* Header row */}
            <div className="flex items-center mb-4 pb-4 border-b border-taca-border">
              <div className="flex items-center w-1/2">
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
              <div className="w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Đơn giá</div>
              <div className="w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Số lượng</div>
              <div className="w-1/6 text-right text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Thành tiền</div>
            </div>

            {/* Items list */}
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex items-start py-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start w-1/2">
                    <div className="pt-8">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </div>
                    <Link to={`/product/${item.productId}`} className="ml-4 w-24 h-24 bg-slate-50 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 overflow-hidden border border-taca-border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="ml-4 flex flex-col justify-between min-h-[96px]">
                      <div>
                        <Link to={`/product/${item.productId}`} className="text-[13px] font-extrabold text-taca-text-main line-clamp-2 leading-tight hover:text-taca-primary no-underline">
                          {item.name}
                        </Link>
                        <p className="text-[11px] font-medium text-taca-text-muted mt-1">{item.variant}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-semibold text-taca-text-muted">
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
                  
                  <div className="w-1/6 text-center pt-8 text-[13px] font-extrabold text-taca-sale">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </div>
                  
                  <div className="w-1/6 flex justify-center pt-8">
                    <div className="flex items-center border border-taca-border rounded h-8 bg-white overflow-hidden">
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
                  
                  <div className="w-1/6 text-right pt-8 text-[13px] font-extrabold text-taca-text-main">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
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
