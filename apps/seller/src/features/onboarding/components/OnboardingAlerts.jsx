import PropTypes from 'prop-types';
import { AlertTriangle, XCircle } from 'lucide-react';

/**
 * Hiển thị các khối cảnh báo trạng thái KYC (Từ chối, Cần bổ sung, Blockers)
 */
export default function OnboardingAlerts({ kycStatus, rejectReason, blockers }) {
  const isRejectedOrNeedsInfo = kycStatus === 'REJECTED' || kycStatus === 'NEEDS_INFO';
  const hasBlockersOnly = blockers.length > 0 && !isRejectedOrNeedsInfo;

  return (
    <>
      {/* Cảnh báo khi bị từ chối hoặc cần bổ sung thông tin */}
      {isRejectedOrNeedsInfo && (
        <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
          kycStatus === 'NEEDS_INFO' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {kycStatus === 'NEEDS_INFO' ? (
            <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          ) : (
            <XCircle className="w-6 h-6 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
          )}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[14px]">
                {kycStatus === 'NEEDS_INFO' ? 'Hồ sơ cần bổ sung thông tin theo yêu cầu của Ban Quản Trị' : 'Hồ sơ thẩm định chưa được phê duyệt (Đã giữ nguyên bản nháp)'}
              </h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                kycStatus === 'NEEDS_INFO' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {kycStatus}
              </span>
            </div>
            <p className="text-[12px] opacity-90 leading-relaxed">
              Toàn bộ thông tin bạn đã nhập ở cả 4 bước vẫn được lưu trữ nguyên vẹn dưới dạng <strong>Bản nháp (Draft)</strong>. Vui lòng kiểm tra lý do bên dưới, chỉnh sửa các mục cần cập nhật và nhấn <strong>"Cập nhật & Gửi lại thẩm định"</strong> ở cuối trang.
            </p>
            {(rejectReason || blockers[0]) && (
              <div className="mt-2 p-3 bg-white/90 rounded-xl border border-rose-200/80 text-[12px] font-medium text-slate-800">
                <span className="font-bold text-rose-700 block mb-0.5">Lý do từ Ban Quản Trị:</span>
                <span className="italic">"{rejectReason || blockers[0]}"</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockers alert if any */}
      {hasBlockersOnly && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="font-bold">Các mục cần bổ sung để hoàn tất xét duyệt:</p>
            <ul className="list-disc list-inside text-[12px] mt-1 space-y-0.5">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

OnboardingAlerts.propTypes = {
  kycStatus: PropTypes.string.isRequired,
  rejectReason: PropTypes.string,
  blockers: PropTypes.arrayOf(PropTypes.string).isRequired,
};
