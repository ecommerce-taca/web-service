import PropTypes from 'prop-types';

/**
 * Tab 3: Địa chỉ kho hàng & Lấy hàng (PUT /seller/onboarding/warehouse - §2.22)
 */
export default function WarehouseTab({
  warehouseName,
  setWarehouseName,
  warehouseContact,
  setWarehouseContact,
  warehousePhone,
  setWarehousePhone,
  warehouseProvince,
  setWarehouseProvince,
  warehouseDistrict,
  setWarehouseDistrict,
  warehouseWard,
  setWarehouseWard,
  warehousePostalCode,
  setWarehousePostalCode,
  warehouseAddressLine1,
  setWarehouseAddressLine1,
  saving,
  onSaveWarehouse
}) {
  return (
    <form onSubmit={onSaveWarehouse} className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          ĐỊA CHỈ KHO HÀNG & LẤY HÀNG (PUT /seller/onboarding/warehouse - §2.22)
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Đơn vị vận chuyển sẽ căn cứ theo địa chỉ này để đến lấy hàng. Hotline tự động chuyển chuẩn E.164 khi lưu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tên kho lấy hàng * (warehouse_name)
          </label>
          <input
            type="text"
            required
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Người phụ trách kho * (contact_name)
          </label>
          <input
            type="text"
            required
            value={warehouseContact}
            onChange={(e) => setWarehouseContact(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Số điện thoại liên hệ kho * (contact_phone)
          </label>
          <input
            type="text"
            required
            value={warehousePhone}
            onChange={(e) => setWarehousePhone(e.target.value)}
            placeholder="VD: 0901234567"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tỉnh / Thành phố * (province)
          </label>
          <input
            type="text"
            required
            value={warehouseProvince}
            onChange={(e) => setWarehouseProvince(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Quận / Huyện * (district)
          </label>
          <input
            type="text"
            required
            value={warehouseDistrict}
            onChange={(e) => setWarehouseDistrict(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Phường / Xã * (ward)
          </label>
          <input
            type="text"
            required
            value={warehouseWard}
            onChange={(e) => setWarehouseWard(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Mã bưu chính (postal_code)
          </label>
          <input
            type="text"
            value={warehousePostalCode}
            onChange={(e) => setWarehousePostalCode(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Địa chỉ chi tiết kho * (line1)
          </label>
          <input
            type="text"
            required
            value={warehouseAddressLine1}
            onChange={(e) => setWarehouseAddressLine1(e.target.value)}
            placeholder="Số nhà, tên đường, khu vực..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi kho hàng'}
        </button>
      </div>
    </form>
  );
}

WarehouseTab.propTypes = {
  warehouseName: PropTypes.string.isRequired,
  setWarehouseName: PropTypes.func.isRequired,
  warehouseContact: PropTypes.string.isRequired,
  setWarehouseContact: PropTypes.func.isRequired,
  warehousePhone: PropTypes.string.isRequired,
  setWarehousePhone: PropTypes.func.isRequired,
  warehouseProvince: PropTypes.string.isRequired,
  setWarehouseProvince: PropTypes.func.isRequired,
  warehouseDistrict: PropTypes.string.isRequired,
  setWarehouseDistrict: PropTypes.func.isRequired,
  warehouseWard: PropTypes.string.isRequired,
  setWarehouseWard: PropTypes.func.isRequired,
  warehousePostalCode: PropTypes.string,
  setWarehousePostalCode: PropTypes.func.isRequired,
  warehouseAddressLine1: PropTypes.string.isRequired,
  setWarehouseAddressLine1: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onSaveWarehouse: PropTypes.func.isRequired,
};
