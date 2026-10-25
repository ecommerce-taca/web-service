import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '@taca/ui-components';
import { paymentApi } from '../../payment/services/payment.api';
import { isMockMode } from '../../../../../../shared/utils/api-client';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function VnpayQrModal({
  isOpen,
  onClose,
  paymentId,
  orderId,
  amount = 0,
  expiresAt,
  onPaymentSuccess
}) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút mặc định (giây)
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING | SUCCESS | EXPIRED | FAILED
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const pollingRef = useRef(null);

  // Tính toán thời gian hết hạn dựa trên expiresAt
  useEffect(() => {
    if (!isOpen) return;

    if (expiresAt) {
      const expireTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expireTime - now) / 1000));
      setTimeLeft(remainingSeconds);
    } else {
      setTimeLeft(15 * 60);
    }

    setPaymentStatus('PENDING');
    setIsVerifying(false);
    setVerifyMessage('');
  }, [isOpen, expiresAt]);

  // Bộ đếm ngược thời gian hiệu lực
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'PENDING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  // Kiểm tra trạng thái thanh toán từ backend
  const checkStatus = useCallback(async (manual = false) => {
    if (!paymentId || paymentStatus === 'SUCCESS') return;

    if (manual) {
      setIsVerifying(true);
      setVerifyMessage('Đang kiểm tra kết quả giao dịch với cổng VNPAY...');
    }

    try {
      if (manual && isMockMode()) {
        // Trong chế độ phát triển/mock, việc bấm xác nhận sẽ kích hoạt chuyển trạng thái thành công
        await paymentApi.confirmMockPaymentSuccess(paymentId);
      }

      const res = await paymentApi.getPaymentStatus(paymentId);
      const data = res?.data?.data || res?.data;
      const currentStatus = data?.status;

      if (currentStatus === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
        setVerifyMessage('Xác nhận thanh toán thành công!');
        if (pollingRef.current) clearInterval(pollingRef.current);

        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess({ paymentId, orderId, data });
          }
        }, 1200);
      } else if (currentStatus === 'EXPIRED') {
        setPaymentStatus('EXPIRED');
        setVerifyMessage('Mã QR đã hết hạn hiệu lực.');
      } else if (currentStatus === 'FAILED') {
        setPaymentStatus('FAILED');
        setVerifyMessage('Giao dịch thanh toán không thành công.');
      } else if (manual) {
        setVerifyMessage('Chưa nhận được giao dịch từ ngân hàng. Vui lòng hoàn tất thanh toán trên ứng dụng ngân hàng.');
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra trạng thái thanh toán VNPAY:', err);
      if (manual) {
        setVerifyMessage('Không thể kết nối đến máy chủ thanh toán. Đang thử lại...');
      }
    } finally {
      if (manual) {
        setIsVerifying(false);
      }
    }
  }, [paymentId, orderId, paymentStatus, onPaymentSuccess]);

  // Tự động Polling mỗi 2.5 giây khi modal mở
  useEffect(() => {
    if (!isOpen || !paymentId || paymentStatus !== 'PENDING') return;

    pollingRef.current = setInterval(() => {
      checkStatus(false);
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, paymentId, paymentStatus, checkStatus]);

  if (!isOpen) return null;

  // Format phút:giây
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="THANH TOÁN VNPAY QR">
      <div className="p-6 flex flex-col items-center max-w-sm mx-auto text-center">
        <p className="text-[11px] text-[#475569] mb-4 w-full font-medium">
          Quét mã bằng ứng dụng ngân hàng hoặc ví VNPAY
        </p>

        {/* Khung QR Code - Kích thước chuẩn Penpot 270x270 */}
        <div className="w-[270px] h-[270px] bg-slate-900 p-3.5 rounded-2xl flex items-center justify-center mb-4 shadow-md relative overflow-hidden">
          {paymentStatus === 'SUCCESS' ? (
            <div className="w-full h-full bg-emerald-50 rounded-xl flex flex-col items-center justify-center p-4 animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-2 animate-bounce" />
              <span className="text-emerald-800 font-extrabold text-[14px]">Thanh toán thành công!</span>
              <span className="text-emerald-600 text-[11px] mt-1 font-medium">Đang chuyển đến đơn hàng...</span>
            </div>
          ) : paymentStatus === 'EXPIRED' ? (
            <div className="w-full h-full bg-amber-50 rounded-xl flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-14 h-14 text-amber-500 mb-2" />
              <span className="text-amber-800 font-extrabold text-[13px]">Mã QR đã hết hạn</span>
              <span className="text-amber-600 text-[11px] mt-1">Vui lòng đóng modal và tạo lại đơn hàng</span>
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-3 relative">
              {/* Dynamic QR SVG Pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                {/* 3 Định vị góc chuẩn QR */}
                <rect x="6" y="6" width="24" height="24" rx="3" />
                <rect x="10" y="10" width="16" height="16" fill="white" />
                <rect x="13" y="13" width="10" height="10" rx="2" />

                <rect x="70" y="6" width="24" height="24" rx="3" />
                <rect x="74" y="10" width="16" height="16" fill="white" />
                <rect x="77" y="13" width="10" height="10" rx="2" />

                <rect x="6" y="70" width="24" height="24" rx="3" />
                <rect x="10" y="74" width="16" height="16" fill="white" />
                <rect x="13" y="77" width="10" height="10" rx="2" />

                {/* Các khối dữ liệu QR động mô phỏng chuẩn VNPAY VietQR */}
                <rect x="36" y="8" width="8" height="14" />
                <rect x="48" y="6" width="14" height="6" />
                <rect x="52" y="16" width="12" height="6" />
                <rect x="34" y="34" width="32" height="32" rx="4" />
                <rect x="39" y="39" width="22" height="22" fill="white" />
                <rect x="44" y="44" width="12" height="12" rx="2" fill="#0A68FF" />

                <rect x="8" y="36" width="16" height="6" />
                <rect x="18" y="46" width="12" height="12" />
                <rect x="70" y="36" width="24" height="6" />
                <rect x="76" y="46" width="16" height="12" />
                <rect x="36" y="74" width="16" height="20" />
                <rect x="56" y="70" width="10" height="16" />
                <rect x="72" y="70" width="22" height="22" />
              </svg>

              {/* Logo VNPAY overlay giữa mã QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white px-2 py-0.5 rounded shadow-xs text-[10px] font-black text-[#0A68FF] border border-blue-100">
                  VNPAY
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Số tiền thanh toán chuẩn Penpot 18px #e11d48 */}
        <div className="flex justify-between items-center w-full mb-3 px-3 py-2.5 bg-slate-50 rounded-lg text-sm border border-taca-border">
          <span className="text-taca-text-muted font-medium text-[12px]">Số tiền thanh toán:</span>
          <span className="font-extrabold text-[#e11d48] text-[18px]">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
          </span>
        </div>

        {/* Thanh đếm ngược chuẩn Penpot: background #eef2ff, text #4f46e5 */}
        <div className="w-full bg-[#eef2ff] text-[#4f46e5] font-semibold text-[12px] py-2.5 px-3 rounded-lg mb-4 flex items-center justify-center gap-1.5 border border-indigo-100">
          <Clock className="w-4 h-4 text-[#4f46e5]" />
          <span>Mã còn hiệu lực trong <strong className="font-extrabold">{timeFormatted}</strong></span>
        </div>

        {/* Thông báo tiến trình xác thực */}
        {verifyMessage && (
          <div className="text-[11px] font-medium text-slate-600 mb-3 animate-in fade-in">
            {verifyMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-11 text-xs font-semibold"
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              disabled={isVerifying || paymentStatus === 'EXPIRED'}
              onClick={() => checkStatus(true)}
              className="flex-1 h-11 text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : isMockMode() ? (
                'Tôi đã thanh toán (Test)'
              ) : (
                'Kiểm tra thanh toán'
              )}
            </Button>
          </div>
          {isMockMode() && (
            <span className="text-[10px] text-amber-600 font-medium">
              Chế độ Mock: Bấm nút trên để giả lập thanh toán thành công
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

VnpayQrModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paymentId: PropTypes.string,
  orderId: PropTypes.string,
  amount: PropTypes.number,
  expiresAt: PropTypes.string,
  qrPayload: PropTypes.string,
  onPaymentSuccess: PropTypes.func
};
