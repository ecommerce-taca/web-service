import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Package, CheckCircle2, Truck, AlertCircle, Clock } from 'lucide-react';
import { getShipmentCarriers } from '../services/seller-order.api';

export default function PrepareShipmentModal({ order, isOpen, onClose, onConfirm }) {
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState('GHN');
  const [loadingCarriers, setLoadingCarriers] = useState(true);
  const [pickupSlot, setPickupSlot] = useState('today');
  const [isPacked, setIsPacked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isOpen || !order) return;

    let ignore = false;

    getShipmentCarriers(order.id)
      .then((res) => {
        if (ignore) return;
        const carrierList = res?.carriers || [];
        setCarriers(carrierList);
        const firstAvailable = carrierList.find((c) => c.available);
        if (firstAvailable) {
          setSelectedCarrier(firstAvailable.carrier);
        } else if (carrierList.length > 0) {
          setSelectedCarrier(carrierList[0].carrier);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('Lỗi lấy danh sách carriers:', err);
          setErrorMessage('Không thể tải biểu phí hãng vận chuyển. Vui lòng thử lại.');
        }
      })
      .finally(() => {
        if (!ignore) setLoadingCarriers(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    if (!isPacked) {
      alert('Vui lòng đánh dấu xác nhận đã đóng gói đúng quy cách!');
      return;
    }
    const chosen = carriers.find((c) => c.carrier === selectedCarrier);
    if (chosen && !chosen.available) {
      alert(`Đơn vị vận chuyển ${chosen.carrier} không khả dụng cho đơn hàng này.`);
      return;
    }

    setIsConfirmed(true);
    setTimeout(() => {
      if (onConfirm) {
        onConfirm({
          ...order,
          carrier: selectedCarrier,
          carrierName: chosen?.name || selectedCarrier,
        });
      }
      setIsConfirmed(false);
      onClose();
    }, 1200);
  };

  const formatPrice = (val) => {
    if (typeof val !== 'number') return '—';
    return `${val.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#4F46E5]" aria-hidden="true" />
              <span>CHUẨN BỊ HÀNG & BÀN GIAO VẬN CHUYỂN</span>
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Đơn <span className="font-semibold text-slate-800">{order.id}</span> · SLA: <span className="text-amber-600 font-bold">{order.sla || '01:42:18'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-[13px] overflow-y-auto">
          {/* Product card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-slate-500" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-[13px]">
                {order.product || 'Sản phẩm đơn hàng'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {order.sku || 'Mã SKU'} · Số lượng: {order.quantity || 1}
              </p>
            </div>
          </div>

          {/* Carrier selection with live fee and ETA comparison (MISS-003) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                SO SÁNH & CHỌN ĐƠN VỊ VẬN CHUYỂN
              </label>
              <span className="text-[11px] text-slate-500">
                (API: GET /seller/orders/{order.id}/shipment/carriers)
              </span>
            </div>

            {loadingCarriers ? (
              <div className="p-6 text-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1" />
                <p className="text-[12px]">Đang tra cứu biểu phí và tuyến vận chuyển khả dụng...</p>
              </div>
            ) : errorMessage ? (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            ) : carriers.length === 0 ? (
              <p className="text-slate-400 text-[12px] italic">Không có hãng vận chuyển khả dụng.</p>
            ) : (
              <div className="space-y-2.5">
                {carriers.map((c) => {
                  const isSelected = selectedCarrier === c.carrier;
                  const isAvailable = c.available !== false;
                  return (
                    <div
                      key={c.carrier}
                      role="button"
                      tabIndex={isAvailable ? 0 : -1}
                      onClick={() => {
                        if (isAvailable) setSelectedCarrier(c.carrier);
                      }}
                      onKeyDown={(e) => {
                        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                          setSelectedCarrier(c.carrier);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        !isAvailable
                          ? 'border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#4F46E5] bg-indigo-50/40 ring-1 ring-[#4F46E5]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="carrier_choice"
                          checked={isSelected}
                          disabled={!isAvailable}
                          onChange={() => setSelectedCarrier(c.carrier)}
                          className="w-4 h-4 text-[#4F46E5] border-slate-300 focus:ring-[#4F46E5]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-[13px]">
                              {c.name || c.carrier}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                              {c.carrier}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            {c.estimate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                                <span>Giao trong {c.estimate.min_days} – {c.estimate.max_days} ngày</span>
                              </span>
                            )}
                            {!isAvailable && (
                              <span className="text-rose-600 font-semibold">
                                {c.unavailable_reason === 'REGION_NOT_COVERED'
                                  ? 'Chưa phủ sóng tuyến này'
                                  : 'Tạm không khả dụng'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isAvailable ? (
                          <div className="font-extrabold text-[14px] text-[#4F46E5]">
                            {formatPrice(c.fee)}
                          </div>
                        ) : (
                          <div className="text-[12px] text-slate-400 italic">Không hỗ trợ</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pickup time slots */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              THỜI GIAN LẤY HÀNG DỰ KIẾN
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupSlot('today')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  pickupSlot === 'today'
                    ? 'border-[#4F46E5] bg-indigo-50/50 text-[#4F46E5] font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[12px]">Hôm nay</div>
                <div className="text-[11px] opacity-80 mt-0.5">14:00 – 18:00 (Lấy nhanh)</div>
              </button>

              <button
                type="button"
                onClick={() => setPickupSlot('tomorrow')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  pickupSlot === 'tomorrow'
                    ? 'border-[#4F46E5] bg-indigo-50/50 text-[#4F46E5] font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[12px]">Ngày mai</div>
                <div className="text-[11px] opacity-80 mt-0.5">08:00 – 12:00 (Ca sáng)</div>
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
              Tôi đã kiểm tra sản phẩm, đóng gói đúng quy cách chống va đập và dán nhãn vận đơn hợp lệ lên kiện hàng.
            </span>
          </label>

          {isConfirmed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-center text-[12px] animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>Đã xác nhận sẵn sàng bàn giao cho {selectedCarrier}! Mã vận đơn đang được phát hành.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-[12px] transition-colors cursor-pointer"
          >
            In phiếu đóng gói
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[12px] font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors cursor-pointer"
            >
              Xác nhận sẵn sàng bàn giao
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
