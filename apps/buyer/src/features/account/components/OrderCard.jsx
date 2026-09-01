import PropTypes from 'prop-types';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-white p-6 border border-taca-border rounded-[12px] mb-4">
      {/* Header: Store Name and Status */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[14px] font-bold text-taca-text-main m-0 flex items-center gap-2">
          {order.storeName}
        </h3>
        <span className={`text-[12px] font-bold uppercase ${order.status === 'ĐÃ GIAO' ? 'text-green-600' : 'text-orange-500'}`}>
          {order.status}
        </span>
      </div>

      <hr className="border-t border-taca-border my-4" />

      {/* Product Items */}
      {order.items.map((item, index) => (
        <div key={index} className="flex gap-4 mb-4">
          <div className="w-[80px] h-[80px] bg-[#f4f7ff] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-gray-400 text-xs">SKU Image</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-[14px] font-semibold text-taca-text-main m-0 mb-1">{item.name}</h4>
            <p className="text-[12px] text-gray-500 m-0">{item.variant} · x{item.quantity}</p>
          </div>
          <div className="flex items-center">
            <span className="text-[14px] font-bold text-taca-text-main">{item.price.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      ))}

      <hr className="border-t border-taca-border my-4" />

      {/* Footer: Total and Actions */}
      <div className="flex justify-between items-center">
        <div className="text-[14px]">
          <span className="text-gray-500 mr-2">Thành tiền</span>
          <span className="text-[16px] font-bold text-taca-primary">{order.totalPrice.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex gap-3">
          {order.status === 'ĐÃ GIAO' ? (
            <button className="bg-taca-primary text-white font-bold text-[13px] px-6 py-2 rounded-lg hover:bg-taca-primary-hover transition-colors">
              Đánh giá
            </button>
          ) : (
            <button className="border border-taca-border bg-white text-taca-text-main font-bold text-[13px] px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Theo dõi đơn
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
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        variant: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default OrderCard;
