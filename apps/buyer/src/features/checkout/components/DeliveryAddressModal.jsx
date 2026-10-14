import { useState, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '@taca/ui-components';
import { Plus, Check, MapPin } from 'lucide-react';
import { formatPhoneDisplay } from '../../../../../../shared/utils/phone';

const AddressFormModal = lazy(() => import('../../account/components/AddressFormModal'));

export default function DeliveryAddressModal({ 
  isOpen, 
  onClose, 
  addresses = [], 
  selectedAddress = null, 
  onSelectAddress,
  onAddressCreated
}) {
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const handleSelect = (addr) => {
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
  };

  const handleAddressCreated = (newAddr) => {
    setIsAddAddressOpen(false);
    if (onAddressCreated) {
      onAddressCreated(newAddr);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="ĐỊA CHỈ NHẬN HÀNG" width="max-w-xl">
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-taca-text-main text-[14px]">Địa chỉ đã lưu trong tài khoản</h3>
            <button
              type="button"
              onClick={() => setIsAddAddressOpen(true)}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-taca-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-indigo-200"
            >
              <Plus size={14} />
              Thêm địa chỉ mới
            </button>
          </div>
          
          {addresses.length > 0 ? (
            <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
              {addresses.map((addr) => {
                const isSelected = selectedAddress && (selectedAddress.id === addr.id);
                const recipientName = addr.recipient || addr.recipient_name || addr.name || 'Người nhận';
                const phoneDisplay = formatPhoneDisplay(addr.phone || '0909123456');
                const fullAddress = [
                  addr.line1 || addr.detail_address || addr.address,
                  addr.line2,
                  addr.ward || addr.ward_name,
                  addr.province || addr.province_name
                ].filter(Boolean).join(', ');

                return (
                  <div 
                    key={addr.id}
                    onClick={() => handleSelect(addr)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                      isSelected 
                        ? 'border-taca-primary bg-indigo-50/40 shadow-xs' 
                        : 'border-taca-border bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-taca-primary bg-taca-primary text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-taca-text-main text-[13px]">
                              {recipientName}
                            </span>
                            <span className="text-[13px] font-semibold text-taca-text-main">
                              {phoneDisplay}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-taca-text-muted text-[12px] mt-1 leading-relaxed">
                            {fullAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 mb-6">
              <MapPin size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-[13px] font-bold text-taca-text-main mb-1">Chưa có địa chỉ nào được lưu</p>
              <p className="text-[12px] text-taca-text-muted mb-4">Vui lòng thêm địa chỉ nhận hàng để tiếp tục thanh toán thuận tiện hơn.</p>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(true)}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white bg-taca-primary hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                Thêm địa chỉ nhận hàng ngay
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-[8px]"
            >
              Đóng
            </Button>
            <Button 
              variant="primary"
              onClick={onClose}
              className="flex-1 h-11 rounded-[8px]"
            >
              Xác nhận sử dụng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal tạo địa chỉ mới trên màn hình checkout */}
      {isAddAddressOpen && (
        <Suspense fallback={null}>
          <AddressFormModal
            isOpen={isAddAddressOpen}
            onClose={() => setIsAddAddressOpen(false)}
            onSuccess={handleAddressCreated}
          />
        </Suspense>
      )}
    </>
  );
}

DeliveryAddressModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addresses: PropTypes.array,
  selectedAddress: PropTypes.object,
  onSelectAddress: PropTypes.func,
  onAddressCreated: PropTypes.func,
};
