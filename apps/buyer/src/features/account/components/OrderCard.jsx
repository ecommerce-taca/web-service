import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Package, 
  ShieldCheck, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { getOrderStatusInfo } from '../utils/orderStatus';
import { useCart } from '../../cart/hooks/useCart';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const statusInfo = getOrderStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const handleCardClick = () => {
    navigate(`/account/orders/${order.id}`);
  };

  const handleActionClick = (e, callback) => {
    e.stopPropagation();
    if (callback) callback();
  };

  const handleReorder = () => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart({
        id: item.id || `prod_${item.name}`,
        name: item.name,
        price: item.price,
        image: item.image,
        variant: item.variant,
        quantity: item.quantity,
        selected: true
      });
    });
    navigate('/cart');
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white p-5 sm:p-6 border border-slate-200/90 rounded-2xl hover:border-taca-primary/50 hover:shadow-sm transition-all cursor-pointer space-y-4"
    >
      {/* Header: Store Name, Order ID, Date & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-taca-primary flex items-center justify-center font-bold shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-slate-900">
                {order.storeName}
              </span>
              <span className="text-[12px] font-mono text-slate-400">
                #{order.id}
              </span>
            </div>
            {order.createdAt && (
              <p className="text-[11px] text-slate-400 mt-0.5 mb-0">
                Đặt lúc: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge & Link indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${statusInfo.colorClass}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusInfo.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
        </div>
      </div>

      {/* Product Items List */}
      <div className="space-y-3.5">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-3.5">
            {/* Product Image: cố định 64px không bị co méo */}
            <div className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Package className="w-7 h-7 text-slate-300" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-[14px] font-semibold text-slate-900 line-clamp-1 mb-1">
                {item.name}
              </h4>
              <div className="flex items-center gap-2 flex-wrap text-[12px]">
                {item.variant && (
                  <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {item.variant}
                  </span>
                )}
                <span className="text-slate-400">Số lượng: x{item.quantity}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0 whitespace-nowrap">
              <span className="text-[14px] font-bold text-slate-900">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </span>
              {item.quantity > 1 && (
                <p className="text-[11px] text-slate-400 mt-0.5 mb-0">
                  {item.price.toLocaleString('vi-VN')} ₫ / món
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total Price Row: Dòng riêng biệt, căn phải chuẩn, tuyệt đối không bị gãy hay chèn ép */}
      <div className="pt-3.5 border-t border-slate-100 flex items-baseline justify-end gap-2 text-right">
        <span className="text-[13px] text-slate-500 font-medium">Thành tiền:</span>
        <span className="text-[19px] sm:text-[20px] font-black text-taca-sale whitespace-nowrap tracking-tight">
          {order.totalPrice.toLocaleString('vi-VN')} ₫
        </span>
      </div>

      {/* Action Bar: Dòng nghiệp vụ bên dưới rõ ràng */}
      <div className="pt-3 border-t border-slate-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bảo vệ quyền lợi người mua · Đổi trả trong 7 ngày</span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {order.status === 'COMPLETED' ? (
            <>
              <button
                type="button"
                onClick={(e) => handleActionClick(e, handleReorder)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-taca-primary hover:text-taca-primary text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mua lại</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleActionClick(e, () => navigate(`/account/reviews`))}
                className="px-5 py-2 rounded-xl bg-taca-primary hover:bg-indigo-700 text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Đánh giá
              </button>
            </>
          ) : order.status === 'SHIPPING' ? (
            <button
              type="button"
              onClick={(e) => handleActionClick(e, () => navigate(`/account/orders/${order.id}`))}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Đã nhận được hàng
            </button>
          ) : order.status === 'PENDING' ? (
            <button
              type="button"
              onClick={(e) => handleActionClick(e, () => navigate(`/account/orders/${order.id}`))}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Hủy đơn hàng
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handleActionClick(e, handleReorder)}
              className="px-4 py-2 rounded-xl border border-taca-primary text-taca-primary hover:bg-taca-primary/5 text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mua lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

OrderCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    storeName: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    createdAt: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string.isRequired,
        variant: PropTypes.string,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
        image: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
};

export default OrderCard;
