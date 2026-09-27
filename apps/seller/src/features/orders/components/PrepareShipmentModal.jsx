import { useState } from 'react';
import PropTypes from 'prop-types';

export default function PrepareShipmentModal({ order, isOpen, onClose, onConfirm }) {
  const [carrier, setCarrier] = useState('GHN Express');
  const [pickupSlot, setPickupSlot] = useState('today');
  const [isPacked, setIsPacked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    if (!isPacked) {
      alert('Vui lòng đánh dấu xác nhận đã đóng gói đúng quy cách!');
      return;
    }
    setIsConfirmed(true);
    setTimeout(() => {
      if (onConfirm) onConfirm(order);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase">
              CHUẨN BỊ HÀNG
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Đơn <span className="font-semibold text-slate-800">{order.id}</span> · SLA: <span className="text-amber-600 font-bold">{order.sla || '01:42:18'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-[13px]">
          {/* Product card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-xl shrink-0">
              📦
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-[13px]">
                {order.product || 'iPhone 16 Pro Max 256GB'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {order.sku || 'SKU IP16PM-256-NAT'} · Số lượng: {order.quantity || 1}
              </p>
            </div>
          </div>

          {/* Carrier selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              ĐƠN VỊ VẬN CHUYỂN
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-[13px] font-medium focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="GHN Express">GHN Express (Giao Hàng Nhanh)</option>
              <option value="GHTK Express">GHTK (Giao Hàng Tiết Kiệm)</option>
              <option value="Viettel Post">Viettel Post</option>
              <option value="SPX Express">SPX Express</option>
            </select>
          </div>

          {/* Pickup time slots */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              THỜI GIAN LẤY HÀNG
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupSlot('today')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  pickupSlot === 'today'
                    ? 'border-[#4F46E5] bg-indigo-50/50 text-[#4F46E5] font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[12px]">Hôm nay</div>
                <div className="text-[11px] opacity-80 mt-0.5">14:00 – 18:00</div>
              </button>

              <button
                type="button"
                onClick={() => setPickupSlot('tomorrow')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  pickupSlot === 'tomorrow'
                    ? 'border-[#4F46E5] bg-indigo-50/50 text-[#4F46E5] font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[12px]">Ngày mai</div>
                <div className="text-[11px] opacity-80 mt-0.5">08:00 – 12:00</div>
              </button>
            </div>
          </div>

          {/* Packing confirmation checkbox */}
          <label className="flex items-start gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isPacked}
              onChange={(e) => setIsPacked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#4F46E5] rounded border-slate-300 focus:ring-[#4F46E5]"
            />
            <span className="text-[12px] text-amber-900 font-medium">
              Tôi đã đóng gói đúng quy cách và dán mã vận đơn hợp lệ lên kiện hàng.
            </span>
          </label>

          {isConfirmed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-center text-[12px] animate-in fade-in">
              ✓ Đã xác nhận chuẩn bị hàng thành công! Đang chờ shipper đến lấy.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-[12px] transition-colors"
          >
            In phiếu đóng gói
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[12px] font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors"
            >
              Xác nhận sẵn sàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

PrepareShipmentModal.propTypes = {
  order: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
};
