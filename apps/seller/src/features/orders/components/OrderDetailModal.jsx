import { useState } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from '../../../components/common/StatusBadge';

export default function OrderDetailModal({ order, isOpen, onClose, onPrepare }) {
  const [copied, setCopied] = useState(false);
  const [actionDone, setActionDone] = useState(null);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.address || '28 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[760px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                ĐƠN HÀNG {order.id || '#TACA2408271'}
              </h2>
              <StatusBadge
                status={order.status || 'Chờ xác nhận'}
                type={order.status_type || order.statusType || 'pending'}
              />
            </div>
            <p className="text-[12px] text-slate-500 mt-1">
              Đặt lúc 14:22 · 26/08/2026 · Thanh toán khi nhận hàng (COD)
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

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-[13px]">
          {/* Section: Buyer */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                NGƯỜI MUA
              </span>
              <button
                type="button"
                onClick={() => alert(`Mở khung chat với ${order.customer || 'Nguyễn Minh Anh'}`)}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                💬 Chat với buyer
              </button>
            </div>
            <p className="text-[13px] font-semibold text-slate-900 mt-1.5">
              {order.customer || 'Nguyễn Minh Anh'} · <span className="text-amber-600 font-bold">Taca Gold</span> · 42 đơn · 0 tranh chấp
            </p>
          </div>

          {/* Section: Products */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              SẢN PHẨM
            </span>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white">
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-[14px] text-slate-900">
                    {order.product || 'iPhone 16 Pro Max 256GB'}
                  </h4>
                  <span className="font-extrabold text-[14px] text-slate-900">
                    {order.cod_amount || order.amount || '29.490.000 ₫'}
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-1">
                  Titan tự nhiên · {order.sku || 'SKU IP16PM-256-NAT'} · x{order.quantity || 1}
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 font-medium">
                  Kho sau đơn: 37 sản phẩm
                </div>
              </div>
            </div>
          </div>

          {/* Section: Shipping */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                GIAO HÀNG
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
              >
                {copied ? '✓ Đã sao chép' : 'Sao chép địa chỉ'}
              </button>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <p className="font-semibold text-slate-900">
                {order.customer || 'Nguyễn Minh Anh'} · {order.phone || '0909 123 456'}
              </p>
              <p className="text-slate-600">
                {order.address || '28 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'}
              </p>
              <p className="text-[#4F46E5] font-medium pt-1 text-[12px]">
                {order.carrier || 'GHN Express'} · Lấy hàng hôm nay 14:00 – 18:00
              </p>
            </div>
          </div>

          {/* Section: Financial breakdown */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              THANH TOÁN & ĐỐI SOÁT
            </span>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Giá sản phẩm</span>
                <span className="font-semibold text-slate-900">29.490.000 ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Voucher shop</span>
                <span className="text-rose-600 font-semibold">−300.000 ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí nền tảng (5%)</span>
                <span className="text-rose-600 font-semibold">−1.459.500 ₫</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-[14px]">Doanh thu dự kiến</span>
                <span className="font-extrabold text-[16px] text-emerald-600">27.730.500 ₫</span>
              </div>
            </div>
          </div>

          {/* Buyer note */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[12px] text-amber-800">
            <strong>Ghi chú người mua:</strong> Gọi trước khi giao.
          </div>

          {actionDone && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-[13px] text-center">
              ✓ {actionDone}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActionDone('Đã gửi yêu cầu từ chối đơn hàng.')}
            className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-[12px] transition-colors"
          >
            Từ chối đơn
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[12px] transition-colors"
            >
              In phiếu
            </button>
            <button
              type="button"
              onClick={() => {
                if (onPrepare) {
                  onPrepare(order);
                } else {
                  setActionDone('Đã xác nhận & chuyển sang bước chuẩn bị hàng.');
                }
              }}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-semibold text-[12px] shadow-sm transition-colors"
            >
              Xác nhận & chuẩn bị
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

OrderDetailModal.propTypes = {
  order: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrepare: PropTypes.func,
};
