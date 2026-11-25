import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Package,
  Minus,
  Plus,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '@taca/ui-components';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);

const AVAILABILITY_BADGE = {
  OUT_OF_STOCK: {
    label: 'Hết hàng',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  PRODUCT_UNAVAILABLE: {
    label: 'Ngừng kinh doanh',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  STALE: {
    label: 'Thông tin tạm chưa đồng bộ',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  UNKNOWN: {
    label: 'Chưa xác định tồn kho',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export default function CartPage() {
  const {
    items,
    loading,
    error,
    selectedIds,
    selectedItems,
    selectedSubtotal,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearError,
    toggleSelectItem,
    selectAll,
    deselectAll,
  } = useCart();

  const navigate = useNavigate();

  const selectableItems = items.filter((item) => item.available !== false);
  const isAllSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      navigate('/checkout');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="pb-8 space-y-6 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-lg p-6 border border-taca-border space-y-4">
            {[1, 2].map((key) => (
              <div key={key} className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
                <div className="w-24 h-24 bg-slate-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-4 w-24 bg-slate-200 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-[380px] h-56 bg-white rounded-lg p-6 border border-taca-border" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-taca-surface min-h-[60vh] py-16 flex flex-col items-center justify-center text-center px-4">
        {error && (
          <div className="mb-6 max-w-md w-full p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[13px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={refreshCart}
              className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-[12px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer shrink-0 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        )}
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
    <div className="pb-4 sm:pb-8 lg:pb-12">
      {/* Breadcrumb */}
      <div className="py-1 sm:py-2 text-[13px] text-taca-text-muted">
        <Link to="/" className="hover:text-taca-primary text-inherit no-underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-taca-text-main font-semibold">Giỏ hàng</span>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-taca-text-main">
            Giỏ hàng ({items.length} sản phẩm)
          </h1>
          <button
            type="button"
            onClick={refreshCart}
            disabled={loading}
            className="text-[12px] font-semibold text-taca-text-muted hover:text-taca-primary bg-transparent border-0 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[13px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={refreshCart}
                className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-[12px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đồng bộ lại</span>
              </button>
              <button
                type="button"
                onClick={clearError}
                className="text-[12px] font-semibold text-rose-600 hover:underline bg-transparent border-0 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Cart Items */}
          <div className="flex-1 bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-taca-border w-full">
            {/* Header row */}
            <div className="flex items-center mb-4 pb-4 border-b border-taca-border">
              <div className="flex items-center w-full md:w-1/2">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả sản phẩm khả dụng"
                  className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer"
                  checked={isAllSelected}
                  disabled={selectableItems.length === 0}
                  onChange={handleSelectAll}
                />
                <span className="ml-3 text-[12px] font-bold text-taca-text-muted uppercase tracking-wider">
                  Chọn tất cả ({selectableItems.length})
                </span>
              </div>
              <div className="hidden md:block w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Đơn giá</div>
              <div className="hidden md:block w-1/6 text-center text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Số lượng</div>
              <div className="hidden md:block w-1/6 text-right text-[11px] font-bold text-taca-text-muted uppercase tracking-wider">Thành tiền</div>
            </div>

            {/* Items list */}
            <div className="space-y-6">
              {items.map((item) => {
                const isUnavailable = item.available === false;
                const statusBadge =
                  item.availabilityStatus && item.availabilityStatus !== 'AVAILABLE'
                    ? AVAILABILITY_BADGE[item.availabilityStatus]
                    : null;
                const lineTotal = Number(item.lineTotal) || item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col md:flex-row items-start py-4 border-b border-slate-100 last:border-0 last:pb-0 gap-3 md:gap-0 ${
                      isUnavailable ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Left: Checkbox + Image + Title + Delete */}
                    <div className="flex items-start w-full md:w-1/2">
                      <div className="pt-2 md:pt-8 shrink-0">
                        <input
                          type="checkbox"
                          aria-label={`Chọn ${item.name}`}
                          className="w-4 h-4 text-taca-primary border-taca-border rounded focus:ring-taca-primary cursor-pointer disabled:cursor-not-allowed"
                          checked={!isUnavailable && selectedIds.includes(item.id)}
                          disabled={isUnavailable}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="ml-3 sm:ml-4 w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 overflow-hidden border border-taca-border flex items-center justify-center"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" aria-hidden="true" />
                        )}
                      </Link>
                      <div className="ml-3 sm:ml-4 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] min-w-0 flex-1">
                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-[13px] font-extrabold text-taca-text-main line-clamp-2 leading-tight hover:text-taca-primary no-underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] font-medium text-taca-text-muted mt-1">{item.variant}</p>
                          {statusBadge && (
                            <span
                              className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded border ${statusBadge.className}`}
                            >
                              {statusBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-semibold text-taca-text-muted pt-1.5">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="hover:text-taca-sale text-inherit bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Xóa khỏi giỏ</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right / Bottom on Mobile: Price & Stepper & Line Total */}
                    <div className="flex items-center justify-between w-full md:w-1/2 pt-1 md:pt-8 pl-7 sm:pl-8 md:pl-0">
                      <div className="md:w-1/3 text-left md:text-center text-[13px] font-extrabold text-taca-sale">
                        {formatCurrency(item.price)}
                      </div>

                      <div className="md:w-1/3 flex justify-center">
                        <div className="flex items-center border border-taca-border rounded h-8 bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            disabled={item.availabilityStatus === 'PRODUCT_UNAVAILABLE'}
                            className="w-8 h-full flex items-center justify-center text-taca-text-main hover:bg-slate-50 cursor-pointer border-none bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-10 text-center text-[12px] font-bold text-taca-text-main select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            disabled={isUnavailable || item.quantity >= 999}
                            className="w-8 h-full flex items-center justify-center text-taca-text-main hover:bg-slate-50 cursor-pointer border-none bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="hidden md:block md:w-1/3 text-right text-[13px] font-extrabold text-taca-text-main">
                        {formatCurrency(lineTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-lg p-6 shadow-sm border border-taca-border flex flex-col flex-shrink-0">
            <h2 className="text-[14px] font-extrabold text-taca-text-main mb-6 uppercase">Tóm tắt giỏ hàng</h2>

            <div className="space-y-3 border-b border-taca-border pb-4 mb-4 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-taca-text-muted">Đã chọn ({selectedItems.length} sản phẩm)</span>
                <span className="font-bold text-taca-text-main">
                  {formatCurrency(selectedSubtotal)}
                </span>
              </div>
              <p className="text-[11px] text-taca-text-muted leading-relaxed">
                Phí vận chuyển và mã giảm giá (voucher) sẽ được tính ở bước Thanh toán.
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-[14px] font-extrabold text-taca-text-main">Tạm tính</span>
              <span className="text-[18px] font-extrabold text-taca-sale">
                {formatCurrency(selectedSubtotal)}
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
