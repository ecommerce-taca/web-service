/**
 * Tab 7: Phân quyền nhân viên gian hàng (SELLER_STAFF - §2.32 / §2.33)
 */
export default function PermissionsTab() {
  return (
    <div className="space-y-6 text-[13px]">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-tight">
          PHÂN QUYỀN NHÂN VIÊN GIAN HÀNG (SELLER_STAFF - §2.32 / §2.33)
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Quản lý quyền hạn truy cập của các thành viên vận hành thuộc gian hàng.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
        <div className="p-4 flex items-center justify-between bg-slate-50">
          <div>
            <p className="font-bold text-slate-900">Minh Anh (Chủ sở hữu)</p>
            <p className="text-xs text-slate-500">minhanh@example.com · Vai trò: OWNER / ADMIN</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-[#4F46E5] border border-indigo-200 rounded-lg">
            Toàn quyền
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Trần Quốc Bảo (Vận hành kho)</p>
            <p className="text-xs text-slate-500">bao.tran@example.com · Vai trò: SELLER_STAFF</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">SHOP_READ</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">ORDER_FULFILL</span>
            </div>
          </div>
          <span className="text-xs text-slate-400">Được cấp: 2026-08-30</span>
        </div>
      </div>
    </div>
  );
}
