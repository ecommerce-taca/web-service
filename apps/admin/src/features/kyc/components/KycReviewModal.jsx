import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { reviewKyc, getKycDetail } from '../../../services/admin-kyc.api';

export default function KycReviewModal({ isOpen, onClose, item, onDecisionSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shopId = item?.shop_id;
  const hasFullData = Boolean(item?.tax_code_masked && item?.documents?.length > 0);
  const [loadingDetail, setLoadingDetail] = useState(() => !hasFullData);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!isOpen || !shopId || hasFullData) return;

    let ignore = false;
    getKycDetail(shopId)
      .then((res) => {
        if (!ignore && res?.data) {
          const shop = res.data.shop || {};
          const kycCase = res.data.kyc_case || {};
          setDetail({
            ...item,
            shop_name: shop.name || item.shop_name,
            business_name: shop.business_name || item.business_name,
            tax_code_masked: shop.tax_code_masked || item.tax_code_masked || '---',
            documents: kycCase.documents || item.documents || [],
            legal_rep: kycCase.legal_rep || item.legal_rep,
            address: kycCase.address || item.address,
            bank_account: kycCase.bank_account || item.bank_account,
            risk_signal: kycCase.risk_signal || item.risk_signal,
          });
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải chi tiết KYC:', err);
      })
      .finally(() => {
        if (!ignore) setLoadingDetail(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, shopId, hasFullData, item]);

  if (!isOpen || !item) return null;

  const effectiveItem = detail || item;

  const handleDecision = async (decision) => {
    if (['NEEDS_INFO', 'REJECTED'].includes(decision) && (!reason || reason.trim().length < 10)) {
      setErrorMessage('Vui lòng nhập lý do tối thiểu 10 ký tự cho quyết định này.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await reviewKyc(item.shop_id, {
        decision,
        reason: reason.trim() || 'Hồ sơ và tài liệu hợp lệ.',
      });
      if (onDecisionSuccess) onDecisionSuccess(item.shop_id, decision);
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi thực hiện quyết định KYC.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
            Rủi ro cao
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            Rủi ro trung bình
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Rủi ro thấp
          </span>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[680px] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header matching Penpot */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[17px] font-black text-slate-900 uppercase tracking-tight">
              KYC REVIEW · {effectiveItem.shop_name}
            </h2>
            {loadingDetail ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                Đang nạp hồ sơ...
              </span>
            ) : (
              getRiskBadge(effectiveItem.risk_level)
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ duyệt"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-[13px]">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Legal Profile Grid */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-bold">Pháp nhân</span>
              <span className="col-span-2 font-bold text-slate-900">{effectiveItem.business_name || effectiveItem.business_type}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-bold">Mã số thuế</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">{effectiveItem.tax_code_masked || effectiveItem.tax_code || '---'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-bold">Đại diện</span>
              <span className="col-span-2 font-bold text-slate-900">{effectiveItem.legal_rep}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-bold">Địa chỉ</span>
              <span className="col-span-2 text-slate-800">{effectiveItem.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5">
              <span className="text-slate-500 font-bold">Ngân hàng</span>
              <span className="col-span-2 font-medium text-slate-900">{effectiveItem.bank_account}</span>
            </div>
          </div>

          {/* Documents Section matching Penpot */}
          <div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              TÀI LIỆU
            </div>
            <div className="space-y-2">
              {effectiveItem.documents && effectiveItem.documents.length > 0 ? (
                effectiveItem.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-slate-800 truncate">{doc.title || doc.file_name}</span>
                    </div>
                    <a
                      href={doc.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded-lg transition-colors shrink-0 text-decoration-none"
                    >
                      Xem
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 italic text-[12px]">Không có tài liệu đính kèm.</div>
              )}
            </div>
          </div>

          {/* Risk Signal Banner matching Penpot */}
          {effectiveItem.risk_signal && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[12px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold">Tín hiệu: </span>
                <span>{effectiveItem.risk_signal.replace(/^Tín hiệu:\s*/, '')}</span>
              </div>
            </div>
          )}

          {/* Reason Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
              Lý do hoặc ghi chú thẩm định (Bắt buộc nếu Từ chối / Yêu cầu bổ sung):
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập ghi chú hoặc lý do cần bổ sung tài liệu..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A68FF] text-[12px]"
            />
          </div>
        </div>

        {/* Modal Action Buttons matching Penpot */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('NEEDS_INFO')}
            className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[12px] transition-colors cursor-pointer disabled:opacity-50"
          >
            Yêu cầu bổ sung
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('REJECTED')}
            className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[12px] transition-colors cursor-pointer disabled:opacity-50"
          >
            Từ chối
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('APPROVED')}
            className="px-6 py-2.5 rounded-xl bg-[#0A68FF] hover:bg-[#0855D2] text-white font-bold text-[12px] shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : 'Phê duyệt KYC'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

KycReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onDecisionSuccess: PropTypes.func,
};
