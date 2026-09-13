import React from 'react';
import Modal from '../../../../../shared/ui-components/src/components/Modal';

export default function ApplyVoucherModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CHỌN VOUCHER">
      <div className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          <p className="text-sm text-gray-500 mb-6">Áp dụng tối đa 1 voucher cửa hàng + 1 voucher Taca</p>
          
          <h3 className="font-bold text-gray-900 mb-3 text-sm">NHẬP MÃ VOUCHER</h3>
          <div className="flex gap-3 mb-8">
            <input 
              type="text" 
              placeholder="Nhập mã voucher" 
              className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" 
            />
            <button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              Áp dụng
            </button>
          </div>

          <h3 className="font-bold text-gray-900 mb-4 text-sm">VOUCHER CỬA HÀNG</h3>
          <div className="mb-8 space-y-4">
            {/* Store Voucher Card */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white relative">
              <div className="w-1/3 bg-[#FFF5F5] border-r border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                <span className="font-bold text-2xl text-[#E53935]">300K</span>
                <span className="text-xs font-medium text-[#E53935] mt-1">CỬA HÀNG</span>
              </div>
              <div className="w-2/3 p-4 pr-12 relative flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 text-base mb-1">Giảm 300.000 đ</h4>
                <p className="text-sm text-gray-500 mb-2">Đơn tối thiểu 10.000.000 đ</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#E53935] font-medium text-xs">APPLE300K</span>
                    <p className="text-[#00C853] text-xs mt-1">✓ Đủ điều kiện - HSD 31/08/2026</p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <input type="checkbox" checked readOnly className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-gray-900 mb-4 text-sm">VOUCHER TACA</h3>
          <div className="space-y-4">
            {/* Taca Voucher Card 1 */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white relative">
              <div className="w-1/3 bg-[#F5F3FF] border-r border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                <span className="font-bold text-2xl text-primary">200K</span>
                <span className="text-xs font-medium text-primary mt-1">TACA</span>
              </div>
              <div className="w-2/3 p-4 pr-12 relative flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 text-base mb-1">Giảm 200.000 đ toàn sàn</h4>
                <p className="text-sm text-gray-500 mb-2">Đơn tối thiểu 5.000.000 đ</p>
                <div>
                  <span className="text-primary font-medium text-xs">TACA200K</span>
                  <p className="text-[#00C853] text-xs mt-1">✓ Tốt nhất cho đơn hàng này</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <input type="checkbox" checked readOnly className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Taca Voucher Card 2 */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white relative">
              <div className="w-1/3 bg-[#EBF5FF] border-r border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                <span className="font-bold text-xl text-[#2563EB]">FREE</span>
                <span className="text-xs font-medium text-[#2563EB] mt-1 text-center">VẬN CHUYỂN</span>
              </div>
              <div className="w-2/3 p-4 pr-12 relative flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 text-base mb-1">Miễn phí vận chuyển tối đa 50K</h4>
                <p className="text-sm text-gray-500 mb-2">Áp dụng cho đơn từ 299.000 đ</p>
                <div>
                  <span className="text-[#2563EB] font-medium text-xs">FREESHIPMAX</span>
                  <p className="text-[#00C853] text-xs mt-1">Có thể chọn thay TACA200K</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <input type="checkbox" readOnly className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Taca Voucher Card 3 - Disabled */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative opacity-70">
              <div className="w-1/3 bg-[#FFFBEB] border-r border-dashed border-gray-300 flex flex-col items-center justify-center p-4 grayscale">
                <span className="font-bold text-2xl text-[#D97706]">9%</span>
                <span className="text-xs font-medium text-[#D97706] mt-1 text-center">TOÀN SÀN</span>
              </div>
              <div className="w-2/3 p-4 pr-12 relative flex flex-col justify-center">
                <h4 className="font-bold text-gray-500 text-base mb-1">Giảm 9% tối đa 500K</h4>
                <p className="text-sm text-gray-400 mb-2">Đơn tối thiểu 50.000.000 đ</p>
                <div>
                  <p className="text-[#E53935] text-xs">Chưa đủ giá trị đơn hàng</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <input type="checkbox" disabled className="w-5 h-5 text-gray-300 border-gray-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center justify-between rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div>
            <p className="font-medium text-gray-900 text-sm">2 voucher đã chọn</p>
            <p className="font-bold text-[#00C853] mt-1">Tiết kiệm 500.000 đ</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Áp dụng voucher
          </button>
        </div>
      </div>
    </Modal>
  );
}
