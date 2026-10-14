import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';
import {
  ALL_PROVINCES,
  getWardsByProvince,
  findProvinceByCode,
  findWardByCode,
  findProvinceByName,
  findWardByName,
} from '../../../../../../../shared/utils/location';

/**
 * Step 3: Địa chỉ kho hàng & Lấy hàng
 */
export default function WarehouseStep({
  warehouseForm,
  setWarehouseForm,
  selectedProvinceCode,
  setSelectedProvinceCode,
  selectedWardCode,
  setSelectedWardCode,
  wards,
  setWards,
  saving,
  onSaveWarehouse,
  onBackToKyc
}) {
  // Tự động phân giải mã Tỉnh/Xã theo tên nếu chưa có mã
  useEffect(() => {
    if (!selectedProvinceCode && warehouseForm.province) {
      const matchedP = findProvinceByName(warehouseForm.province);
      if (matchedP) {
        setSelectedProvinceCode(matchedP.code);
        const wList = getWardsByProvince(matchedP.code);
        setWards(wList);

        if (!selectedWardCode && warehouseForm.ward) {
          const matchedW = findWardByName(matchedP.code, warehouseForm.ward);
          if (matchedW) {
            setSelectedWardCode(matchedW.code);
          }
        }
      }
    }
  }, [warehouseForm.province, warehouseForm.ward, selectedProvinceCode, selectedWardCode, setSelectedProvinceCode, setSelectedWardCode, setWards]);
  return (
    <form onSubmit={onSaveWarehouse} className="space-y-6 text-[13px] max-w-3xl">
      <div>
        <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
          BƯỚC 3: ĐỊA CHỈ KHO HÀNG & LẤY HÀNG
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Chọn địa chỉ lấy hàng chuẩn hóa để đối tác vận chuyển đến lấy kiện hàng (PUT /seller/onboarding/warehouse).
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
            value={warehouseForm.warehouse_name}
            onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouse_name: e.target.value })}
            placeholder="VD: Kho Tổng Quận 1, Kho Hàng Thủ Đức..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Người phụ trách kho * (contact_name)
          </label>
          <input
            type="text"
            required
            value={warehouseForm.contact_name}
            onChange={(e) => setWarehouseForm({ ...warehouseForm, contact_name: e.target.value })}
            placeholder="VD: Nguyễn Văn A"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Hotline liên hệ lấy hàng * (contact_phone)
          </label>
          <input
            type="text"
            required
            value={warehouseForm.contact_phone}
            onChange={(e) => setWarehouseForm({ ...warehouseForm, contact_phone: e.target.value })}
            placeholder="VD: 0901234567"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        {/* Dropdown Tỉnh / Thành phố */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tỉnh / Thành phố *
          </label>
          <select
            value={selectedProvinceCode}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedProvinceCode(code);
              setSelectedWardCode('');
              const p = findProvinceByCode(code);
              const wList = getWardsByProvince(code);
              setWards(wList);
              setWarehouseForm((prev) => ({
                ...prev,
                province: p ? p.name : '',
                ward: '',
                district: '',
              }));
            }}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {ALL_PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Phường / Xã */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Phường / Xã *
          </label>
          <select
            value={selectedWardCode}
            onChange={(e) => {
              const wCode = e.target.value;
              setSelectedWardCode(wCode);
              const w = findWardByCode(selectedProvinceCode, wCode);
              setWarehouseForm((prev) => ({
                ...prev,
                ward: w ? w.name : '',
                district: '',
              }));
            }}
            disabled={!selectedProvinceCode}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#4F46E5] disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">{selectedProvinceCode ? '-- Chọn Phường / Xã --' : 'Vui lòng chọn Tỉnh/Thành trước'}</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Địa chỉ cụ thể * (line1: Số nhà, tên đường, tòa nhà...)
          </label>
          <input
            type="text"
            required
            value={warehouseForm.line1}
            onChange={(e) => setWarehouseForm({ ...warehouseForm, line1: e.target.value })}
            placeholder="VD: Số 28 Đường Nguyễn Huệ, Tòa nhà Bitexco..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Preview địa chỉ kho hàng */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold">Địa chỉ lấy hàng hoàn chỉnh: </span>
          <span className="font-medium text-slate-900">
            {warehouseForm.line1 ? `${warehouseForm.line1}, ` : ''}
            {warehouseForm.ward ? `${warehouseForm.ward}, ` : ''}
            {warehouseForm.province || 'Chưa hoàn tất chọn địa chỉ'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToKyc}
          className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          ← Quay lại bước 2
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu địa chỉ kho & Sang bước Ngân hàng →'}
        </button>
      </div>
    </form>
  );
}

WarehouseStep.propTypes = {
  warehouseForm: PropTypes.shape({
    warehouse_name: PropTypes.string.isRequired,
    contact_name: PropTypes.string.isRequired,
    contact_phone: PropTypes.string.isRequired,
    line1: PropTypes.string.isRequired,
    line2: PropTypes.string,
    ward: PropTypes.string.isRequired,
    district: PropTypes.string,
    province: PropTypes.string.isRequired,
    postal_code: PropTypes.string,
    carrier_preferences: PropTypes.array,
    cod_enabled: PropTypes.bool,
  }).isRequired,
  setWarehouseForm: PropTypes.func.isRequired,
  selectedProvinceCode: PropTypes.string.isRequired,
  setSelectedProvinceCode: PropTypes.func.isRequired,
  selectedWardCode: PropTypes.string.isRequired,
  setSelectedWardCode: PropTypes.func.isRequired,
  wards: PropTypes.arrayOf(PropTypes.object).isRequired,
  setWards: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onSaveWarehouse: PropTypes.func.isRequired,
  onBackToKyc: PropTypes.func.isRequired,
};
