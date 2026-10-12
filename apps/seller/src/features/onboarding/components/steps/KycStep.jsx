import PropTypes from 'prop-types';

/**
 * Step 2: Hồ sơ pháp lý & Định danh người bán (KYC)
 */
export default function KycStep({
  kycStatus,
  kycDocs,
  newDocType,
  setNewDocType,
  uploadingDoc,
  saving,
  hasBusinessReg,
  hasIdFront,
  hasIdBack,
  isKycComplete,
  onUploadKycDoc,
  onDeleteKycDoc,
  onBackToProfile,
  onContinueToWarehouse
}) {
  return (
    <div className="space-y-6 text-[13px] max-w-4xl">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
            BƯỚC 2: HỒ SƠ PHÁP LÝ & ĐỊNH DANH (KYC)
          </h2>
          <span
            className={`text-[12px] font-bold px-3 py-1 rounded-full ${
              kycStatus === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : kycStatus === 'PENDING'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Trạng thái: {kycStatus}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mt-1">
          Tải lên tài liệu pháp lý kinh doanh (Giấy chứng nhận ĐKKD / Hộ kinh doanh) theo quy định của sàn (khớp đặc tả API §2.23–§2.25).
        </p>
      </div>

      {/* Tài liệu Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-xl border transition-all ${hasBusinessReg ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/60 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[12px] text-slate-800">1. Giấy phép ĐKKD *</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasBusinessReg ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {hasBusinessReg ? '✓ ĐÃ TẢI' : 'BẮT BUỘC'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Giấy ĐKKD hoặc Giấy chứng nhận hộ kinh doanh (Backend API hỗ trợ)</p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${hasIdFront ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[12px] text-slate-800">2. CCCD Mặt trước</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasIdFront ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              {hasIdFront ? '✓ ĐÃ TẢI' : 'TÙY CHỌN'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Ảnh chụp rõ mặt trước CCCD người đại diện</p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${hasIdBack ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[12px] text-slate-800">3. CCCD Mặt sau</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${hasIdBack ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
              {hasIdBack ? '✓ ĐÃ TẢI' : 'TÙY CHỌN'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Ảnh chụp rõ mặt sau có chip CCCD</p>
        </div>
      </div>

      {/* Upload box */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800 text-[14px]">Tải lên tài liệu mới</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Chọn loại tài liệu cần tải *
            </label>
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="BUSINESS_REGISTRATION">1. Giấy chứng nhận ĐKKD / Đăng ký hộ kinh doanh (Hỗ trợ Backend)</option>
              <option value="CITIZEN_ID_FRONT">2. CCCD / Hộ chiếu đại diện (Mặt trước)</option>
              <option value="CITIZEN_ID_BACK">3. CCCD / Hộ chiếu đại diện (Mặt sau)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Chọn tệp (PDF, PNG, JPG - Tối đa 10MB) *
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={uploadingDoc}
              onChange={onUploadKycDoc}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#4F46E5] hover:file:bg-indigo-100"
            />
          </div>
        </div>
        {uploadingDoc && (
          <p className="text-xs text-[#4F46E5] font-semibold animate-pulse">
            Đang mã hóa SHA256 và tải lên bộ nhớ an toàn...
          </p>
        )}
      </div>

      {/* Documents table with Delete action */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-[14px]">
            Danh sách tài liệu đã tải ({kycDocs.length} tài liệu)
          </h3>
          <span className={`text-[12px] font-bold ${isKycComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isKycComplete ? '✓ Đã có tài liệu hợp lệ theo §2.25' : 'Cần tải lên Giấy phép ĐKKD'}
          </span>
        </div>

        {kycDocs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có tài liệu nào. Vui lòng tải lên ĐKKD, CCCD mặt trước và CCCD mặt sau.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {kycDocs.map((doc) => {
              const typeLabel =
                doc.document_type === 'BUSINESS_REGISTRATION'
                  ? 'Giấy phép ĐKKD'
                  : doc.document_type === 'CITIZEN_ID_FRONT' || doc.document_type === 'CITIZEN_ID'
                  ? 'CCCD Mặt trước'
                  : doc.document_type === 'CITIZEN_ID_BACK'
                  ? 'CCCD Mặt sau'
                  : doc.document_type;

              return (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
                        <span>{doc.original_file_name || doc.file_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {typeLabel}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(doc.size_bytes ? doc.size_bytes / (1024 * 1024) : 1.5).toFixed(2)} MB · {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('vi-VN') : 'Mới tải'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doc.status || 'VERIFIED'}
                    </span>
                    {/* Nút Xóa tài liệu nếu bấm nhầm */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onDeleteKycDoc(doc.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Xóa tài liệu nếu tải nhầm"
                    >
                      ✕ Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation actions */}
      <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToProfile}
          className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          ← Quay lại bước 1
        </button>

        <button
          type="button"
          onClick={onContinueToWarehouse}
          className={`px-6 py-2.5 rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 ${
            isKycComplete
              ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Xác nhận tài liệu & Tiếp tục sang Kho hàng →</span>
        </button>
      </div>
    </div>
  );
}

KycStep.propTypes = {
  kycStatus: PropTypes.string.isRequired,
  kycDocs: PropTypes.arrayOf(PropTypes.object).isRequired,
  newDocType: PropTypes.string.isRequired,
  setNewDocType: PropTypes.func.isRequired,
  uploadingDoc: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  hasBusinessReg: PropTypes.bool.isRequired,
  hasIdFront: PropTypes.bool.isRequired,
  hasIdBack: PropTypes.bool.isRequired,
  isKycComplete: PropTypes.bool.isRequired,
  onUploadKycDoc: PropTypes.func.isRequired,
  onDeleteKycDoc: PropTypes.func.isRequired,
  onBackToProfile: PropTypes.func.isRequired,
  onContinueToWarehouse: PropTypes.func.isRequired,
};
