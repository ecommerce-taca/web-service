import PropTypes from 'prop-types';

/**
 * Tab 4: Đối tác vận chuyển & Hình thức COD
 */
export default function ShippingTab({
  codEnabled,
  setCodEnabled,
  carrierPreferences,
  setCarrierPreferences
}) {
  const availableCarriers = ['GHTK', 'GHN', 'SPX', 'Viettel Post', 'J&T Express'];

  return (
    <div className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          ĐỐI TÁC VẬN CHUYỂN & HÌNH THỨC COD
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Cấu hình các đơn vị vận chuyển được ưu tiên lấy hàng và phương thức giao hàng thanh toán COD.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
            <p className="text-xs text-slate-500 mt-0.5">Cho phép người mua thanh toán tiền mặt khi Shipper giao hàng.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
          </label>
        </div>

        <div className="border border-slate-200 rounded-xl p-5 space-y-3">
          <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Đơn vị vận chuyển liên kết</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availableCarriers.map((carrier) => {
              const isSelected = carrierPreferences.includes(carrier);
              return (
                <button
                  key={carrier}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setCarrierPreferences(carrierPreferences.filter((c) => c !== carrier));
                    } else {
                      setCarrierPreferences([...carrierPreferences, carrier]);
                    }
                  }}
                  className={`p-3 rounded-lg border text-left font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{carrier}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

ShippingTab.propTypes = {
  codEnabled: PropTypes.bool.isRequired,
  setCodEnabled: PropTypes.func.isRequired,
  carrierPreferences: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCarrierPreferences: PropTypes.func.isRequired,
};
