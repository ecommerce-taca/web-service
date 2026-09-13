import PropTypes from 'prop-types';

const VoucherCard = ({ voucher }) => {
  return (
    <div className="flex bg-white border border-taca-border rounded-[12px] overflow-hidden mb-4 relative shadow-sm">
      {/* Left part: Discount value */}
      <div className="w-[120px] bg-taca-primary text-white flex flex-col justify-center items-center p-4 relative border-r-2 border-dashed border-white">
        <span className="text-[24px] font-extrabold leading-none mb-1">{voucher.discount}</span>
        <span className="text-[12px] text-center opacity-90">{voucher.type === 'shipping' ? 'Freeship' : 'Giảm giá'}</span>
        
        {/* Cutout circles for styling */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-taca-background"></div>
      </div>

      {/* Right part: Details */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-taca-text-main m-0 mb-1">{voucher.title}</h3>
          <p className="text-[12px] text-gray-500 m-0 mb-2">Đơn tối thiểu {voucher.minOrder.toLocaleString('vi-VN')}đ</p>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <div>
            <span className="text-[11px] text-orange-500 bg-orange-50 px-2 py-1 rounded-sm block w-fit mb-1">
              Sắp hết hạn
            </span>
            <span className="text-[11px] text-gray-400">HSD: {voucher.expiry}</span>
          </div>
          <button className="bg-taca-primary text-white text-[12px] font-bold px-4 py-1.5 rounded-lg hover:bg-taca-primary-hover transition-colors">
            Sử dụng
          </button>
        </div>
      </div>
    </div>
  );
};

VoucherCard.propTypes = {
  voucher: PropTypes.shape({
    id: PropTypes.string.isRequired,
    discount: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['shipping', 'discount']).isRequired,
    title: PropTypes.string.isRequired,
    minOrder: PropTypes.number.isRequired,
    expiry: PropTypes.string.isRequired,
  }).isRequired,
};

export default VoucherCard;
