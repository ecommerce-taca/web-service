import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Smartphone } from 'lucide-react';
import { SPECTRUM_STROKE } from '../constants/tones';

const CLOSE_ANIMATION_MS = 220;

// Popup "Phiên bản iOS sắp ra mắt"; Đồng ý dẫn tới khối đăng ký nhận thông báo
export default function IosComingSoonDialog({ onClose, onAccept }) {
  const [isClosing, setIsClosing] = useState(false);
  const acceptRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    acceptRef.current?.focus();
    return () => clearTimeout(timerRef.current);
  }, []);

  const closeWith = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    timerRef.current = setTimeout(callback, CLOSE_ANIMATION_MS);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeWith(onClose);
    }
  };

  return (
    <div
      className={`modal-scrim fixed inset-0 z-[100] flex items-center justify-center bg-slate-100/70 p-4 backdrop-blur-md ${isClosing ? 'closing' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeWith(onClose);
      }}
    >
      <div
        className="modal-box flex w-full max-w-[440px] flex-col gap-3.5 rounded-3xl bg-white p-7 shadow-[0_32px_70px_-28px_rgba(15,23,42,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-ios-dialog-h"
        aria-describedby="landing-ios-dialog-p"
        onKeyDown={handleKeyDown}
      >
        <span className="tint-soft flex h-[52px] w-[52px] items-center justify-center rounded-2xl" aria-hidden="true">
          <Smartphone size={26} strokeWidth={2} stroke={SPECTRUM_STROKE} />
        </span>
        <h2 id="landing-ios-dialog-h" className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">
          Phiên bản iOS sắp ra mắt
        </h2>
        <p id="landing-ios-dialog-p" className="m-0 text-[15px] leading-relaxed text-slate-700">
          Ứng dụng Taca dành cho iOS hiện chưa được phát hành. Hãy đăng ký email để chúng tôi thông báo ngay khi Taca
          có mặt trên App Store.
        </p>
        <div className="flex flex-wrap justify-end gap-2.5 pt-1.5">
          <button
            type="button"
            onClick={() => closeWith(onClose)}
            className="press cursor-pointer rounded-xl border-0 bg-slate-100 px-5 py-3 text-[15px] font-bold text-slate-900"
          >
            Để sau
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => closeWith(onAccept)}
            className="press grad-fill cursor-pointer rounded-xl border-0 px-[22px] py-3 text-[15px] font-bold"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}

IosComingSoonDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
};
