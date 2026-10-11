import PropTypes from 'prop-types';
import { Modal, Button } from '@taca/ui-components';

export default function DeliveryAddressModal({ 
  isOpen, 
  onClose, 
  addresses = [], 
  selectedAddress = null, 
  onSelectAddress 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ĐỊA CHỈ NHẬN HÀNG">
      <div className="p-6">
        <h3 className="font-bold text-taca-text-main mb-3 text-sm">Chọn địa chỉ đã lưu</h3>
        
        {addresses.length > 0 ? (
          <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
            {addresses.map((addr) => {
              const isSelected = selectedAddress && (selectedAddress.id === addr.id);
              return (
                <div 
                  key={addr.id}
                  onClick={() => onSelectAddress && onSelectAddress(addr)}
                  className={`border rounded-lg p-3.5 cursor-pointer transition-colors relative ${
                    isSelected 
                      ? 'border-taca-primary bg-indigo-50/40' 
                      : 'border-taca-border bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-taca-text-main text-[13px]">
                      {addr.recipient_name || addr.name || 'Người nhận'} • {addr.phone}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-taca-text-muted text-[12px]">
                    {addr.detail_address || addr.address}, {addr.ward_name || ''}, {addr.province_name || ''}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-taca-primary bg-indigo-50/30 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-1">
              <span className="w-1.5 h-1.5 bg-taca-primary rounded-full mr-2"></span>
              <span className="font-bold text-taca-text-main text-sm">Nguyễn Minh Anh • 0909 123 456</span>
            </div>
            <p className="text-taca-text-muted text-xs pl-3.5">28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
          </div>
        )}

        <Button 
          variant="primary"
          onClick={onClose}
          className="w-full h-11 rounded-[8px]"
        >
          Xác nhận địa chỉ
        </Button>
      </div>
    </Modal>
  );
}

DeliveryAddressModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addresses: PropTypes.array,
  selectedAddress: PropTypes.object,
  onSelectAddress: PropTypes.func,
};
