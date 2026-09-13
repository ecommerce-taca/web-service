
import { Modal } from '@taca/ui-components';

export default function DeliveryAddressModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ĐỊA CHỈ NHẬN HÀNG">
      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Chọn địa chỉ đã lưu</h3>
        <div className="border border-primary bg-primary/5 rounded-lg p-4 mb-6 cursor-pointer relative">
          <div className="flex items-center mb-1">
            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-2"></span>
            <span className="font-bold text-gray-900 text-sm">Nguyễn Minh Anh • 0909 123 456</span>
          </div>
          <p className="text-gray-600 text-sm pl-3.5">28 Nguyễn Huệ, Quận 1, TP.HCM</p>
        </div>

        <h3 className="font-bold text-gray-900 mb-4 text-sm">Hoặc thêm địa chỉ mới</h3>
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600 shrink-0">Họ tên</label>
            <input type="text" placeholder="Nguyễn Minh Anh" className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600 shrink-0">Số điện thoại</label>
            <input type="text" placeholder="0909 123 456" className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600 shrink-0">Địa chỉ</label>
            <input type="text" placeholder="Số nhà, đường, phường/xã..." className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors mt-2"
        >
          Xác nhận địa chỉ
        </button>
      </div>
    </Modal>
  );
}
