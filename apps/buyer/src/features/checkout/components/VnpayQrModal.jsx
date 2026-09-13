import React from 'react';
import { Modal } from '@taca/ui-components';

export default function VnpayQrModal({ isOpen, onClose, amount = 0 }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-8 flex flex-col items-center max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase text-center w-full">THANH TOÁN VNPAY QR</h2>
        <p className="text-sm text-gray-500 mb-8 text-center w-full">Quét mã bằng ứng dụng ngân hàng</p>
        
        <div className="w-64 h-64 bg-[#0F172A] p-4 flex items-center justify-center mb-6">
          <div className="w-full h-full bg-white flex items-center justify-center">
            <span className="font-bold text-4xl text-gray-900">QR</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center w-full mb-6">
          <span className="text-gray-600 text-sm">Số tiền</span>
          <span className="font-bold text-[#E53935] text-xl">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
          </span>
        </div>
        
        <div className="w-full bg-primary/10 text-primary font-medium text-sm text-center py-3 rounded-lg mb-6">
          Mã còn hiệu lực trong 09:42
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
        >
          Tôi đã thanh toán
        </button>
      </div>
    </Modal>
  );
}
