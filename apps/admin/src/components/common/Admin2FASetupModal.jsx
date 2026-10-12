import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { setup2FA, verify2FA } from '../../services/admin-auth.api';

export default function Admin2FASetupModal({ isOpen, onClose, onEnrollSuccess }) {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleModalClose = () => {
    setSetupData(null);
    setTotpCode('');
    setErrorMessage('');
    setSuccess(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // #11 POST /auth/2fa/setup
    setup2FA()
      .then((res) => {
        if (!isMounted) return;
        const payload = res?.data || res;
        setSetupData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err?.response?.data?.message || err?.message || 'Không thể khởi tạo phiên thiết lập 2FA.'
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const extractSecret = (uri) => {
    if (!uri) return 'JBSWY3DPEHPK3PXP';
    const match = uri.match(/secret=([A-Z0-9]+)/i);
    return match ? match[1] : 'JBSWY3DPEHPK3PXP';
  };

  const secretKey = extractSecret(setupData?.otpauth_uri);
  const qrCodeUrl = setupData?.otpauth_uri
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setupData.otpauth_uri)}&size=200x200`
    : '';

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyEnroll = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã từ ứng dụng Authenticator.');
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    try {
      // #12 POST /auth/2fa/verify với purpose: 'ENROLL'
      const res = await verify2FA({
        purpose: 'ENROLL',
        setup_id: setupData?.setup_id,
        method: 'TOTP',
        code: totpCode.trim(),
      });

      const payload = res?.data || res;
      if (payload?.verified || payload?.status === 'ENABLED') {
        setSuccess(true);
        if (onEnrollSuccess) onEnrollSuccess();
        setTimeout(() => {
          if (onClose) onClose();
        }, 1800);
      } else {
        setErrorMessage('Mã xác thực không hợp lệ. Vui lòng kiểm tra lại đồng hồ thiết bị.');
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Kích hoạt 2FA thất bại. Vui lòng thử lại.'
      );
    } finally {
      setVerifying(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <div>
              <h2 className="text-[16px] font-bold text-white m-0">
                Thiết lập Xác thực 2 yếu tố (2FA TOTP)
              </h2>
              <span className="text-[11px] text-slate-400">
                #11 POST /auth/2fa/setup & #12 POST /auth/2fa/verify
              </span>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={handleModalClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white">Bật 2FA thành công!</h3>
              <p className="text-[13px] text-slate-400 max-w-sm mx-auto">
                Tài khoản quản trị của bạn hiện đã được bảo vệ với mã OTP 6 chữ số theo tiêu chuẩn RFC 6238 TOTP.
              </p>
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block w-6 h-6 border-2 border-[#0A68FF] border-t-transparent rounded-full animate-spin mb-2" />
              <div>Đang tạo khóa bí mật 2FA từ máy chủ...</div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-[12px] text-rose-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                {/* QR Code preview */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="TOTP QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs text-center">QR Code</div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-2 text-[12px] text-slate-300">
                  <p className="font-semibold text-white m-0">
                    1. Quét mã QR bằng ứng dụng Authenticator
                  </p>
                  <p className="text-slate-400 m-0">
                    Hỗ trợ Google Authenticator, Microsoft Authenticator, hoặc 1Password.
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 block">Hoặc nhập mã khóa thủ công:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2 py-1 bg-slate-800 rounded font-mono text-cyan-300 text-[11px]">
                        {secretKey}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="text-[11px] text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        {copied ? 'Đã chép!' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Form: Verify code */}
              <form onSubmit={handleVerifyEnroll} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
                    2. Nhập mã 6 số từ ứng dụng để kích hoạt
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 số"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-center font-mono text-[18px] tracking-widest placeholder:text-slate-500 focus:outline-none focus:border-[#0A68FF]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[13px] transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || totpCode.length < 6}
                    className="flex-1 py-2.5 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-[13px] shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {verifying ? 'Đang kích hoạt...' : 'Kích hoạt bảo mật 2FA'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

Admin2FASetupModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onEnrollSuccess: PropTypes.func,
};
