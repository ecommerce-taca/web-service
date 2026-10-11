import PropTypes from 'prop-types';
import { Modal, Button } from '@taca/ui-components';

export default function VnpayQrModal({ isOpen, onClose, onSuccess, amount = 0 }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="THANH TOÁN VNPAY QR">
      <div className="p-6 flex flex-col items-center max-w-sm mx-auto text-center">
        <p className="text-xs text-taca-text-muted mb-4 w-full">
          Mở ứng dụng ngân hàng hoặc ví VNPAY để quét mã thanh toán
        </p>
        
        {/* QR Code Container */}
        <div className="w-56 h-56 bg-slate-900 p-3 rounded-xl flex items-center justify-center mb-5 shadow-inner">
          <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-3 relative">
            {/* SVG simulated QR Code pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
              {/* Corner squares */}
              <rect x="5" y="5" width="25" height="25" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="13" y="13" width="9" height="9" />
              <rect x="70" y="5" width="25" height="25" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="78" y="13" width="9" height="9" />
              <rect x="5" y="70" width="25" height="25" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="13" y="78" width="9" height="9" />
              {/* Random QR pixels */}
              <rect x="35" y="10" width="5" height="15" />
              <rect x="45" y="5" width="10" height="5" />
              <rect x="50" y="15" width="15" height="5" />
              <rect x="35" y="35" width="30" height="30" />
              <rect x="40" y="40" width="20" height="20" fill="white" />
              <rect x="45" y="45" width="10" height="10" fill="#0A68FF" />
              <rect x="10" y="35" width="15" height="5" />
              <rect x="20" y="45" width="10" height="10" />
              <rect x="70" y="35" width="25" height="5" />
              <rect x="75" y="45" width="15" height="10" />
              <rect x="35" y="75" width="15" height="20" />
              <rect x="55" y="70" width="10" height="15" />
              <rect x="70" y="70" width="25" height="25" />
            </svg>
          </div>
        </div>
        
        <div className="flex justify-between items-center w-full mb-3 px-2 py-2 bg-slate-50 rounded-lg text-sm border border-taca-border">
          <span className="text-taca-text-muted font-medium">Số tiền thanh toán:</span>
          <span className="font-extrabold text-taca-sale text-base">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
          </span>
        </div>
        
        <div className="w-full bg-indigo-50 text-taca-primary font-semibold text-[11px] py-2 rounded-md mb-6">
          ⏱ Mã QR có hiệu lực trong 10:00 phút
        </div>
        
        <div className="flex gap-3 w-full">
          <Button 
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-11 text-xs"
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="primary"
            onClick={onSuccess || onClose}
            className="flex-1 h-11 text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            Tôi đã thanh toán
          </Button>
        </div>
      </div>
    </Modal>
  );
}

VnpayQrModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  amount: PropTypes.number,
};
