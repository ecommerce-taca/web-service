import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check } from 'lucide-react';

const VoucherCard = ({ voucher, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isExpired = voucher.status === 'EXPIRED';
  const isShop = voucher.provider === 'SHOP';

  const handleCopy = () => {
    if (isExpired) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(voucher.code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onCopy) onCopy(voucher.code);
  };

  return (
    <div className={`flex bg-white border ${isExpired ? 'border-gray-200 opacity-60' : 'border-[#00cba9] shadow-sm'} rounded-[8px] overflow-hidden relative`}>
      {/* Left part: Decorative ticket edge */}
      <div className={`w-[120px] ${isExpired ? 'bg-gray-400' : (isShop ? 'bg-[#ff9d00]' : 'bg-[#00cba9]')} text-white flex flex-col justify-center items-center p-3 relative border-r-2 border-dashed border-white`}>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-gray-200"></div>
        
        <span className="text-[20px] font-extrabold leading-none mb-1 text-center">
          {voucher.type === 'SHIPPING' ? 'Freeship' : (voucher.discount_percent ? `${voucher.discount_percent}%` : 'Giảm giá')}
        </span>
        <span className="text-[12px] text-center font-medium mt-1">
          {voucher.provider === 'SHOP' ? 'Cửa hàng' : 'Taca'}
        </span>
      </div>

      {/* Right part: Details */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[14px] font-bold text-taca-text-main m-0">{voucher.title}</h3>
            {isShop && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-sm">{voucher.shop_name}</span>}
          </div>
          <p className="text-[12px] text-taca-text-main font-semibold m-0 mb-1">{voucher.description}</p>
          <p className="text-[11px] text-gray-500 m-0 mb-3">Mã: <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{voucher.code}</span></p>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <div>
            {voucher.status === 'ACTIVE' && (
              <span className="text-[11px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded-sm block w-fit mb-1">
                Sắp hết hạn
              </span>
            )}
            <span className="text-[11px] text-gray-500">
              HSD: {new Date(voucher.valid_until).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <button 
            type="button"
            disabled={isExpired}
            onClick={handleCopy}
            className={`${
              isExpired
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-taca-primary hover:bg-taca-primary-hover text-white'
            } text-[12px] font-bold px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer`}
          >
            {isExpired ? (
              'Đã hết hạn'
            ) : copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Right decorative cutout */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-t border-b border-gray-200"></div>
    </div>
  );
};

VoucherCard.propTypes = {
  voucher: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    shop_name: PropTypes.string,
    status: PropTypes.string.isRequired,
    valid_until: PropTypes.string.isRequired,
    discount_percent: PropTypes.number
  }).isRequired,
  onCopy: PropTypes.func
};

export default VoucherCard;
