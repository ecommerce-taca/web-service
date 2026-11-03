import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-lg', // default width class
  hideCloseButton = false,
  hideHeader = false,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropMouseDown = (e) => {
    // Chỉ đóng modal nếu người dùng click trực tiếp vào vùng nền đen (backdrop)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={modalRef}
        className={`relative m-4 flex max-h-[90vh] w-full ${width} flex-col rounded-panel border border-taca-border bg-white shadow-brand-lg`}
        role="dialog"
        aria-modal="true"
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-taca-border">
            <h2 className="text-title font-bold text-taca-text-main">
              {title}
            </h2>
            {!hideCloseButton && (
              <button 
                onClick={onClose}
                className="rounded-control p-2 text-taca-text-muted transition-colors hover:bg-taca-surface hover:text-taca-text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {hideHeader && !hideCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 z-10 bg-white rounded-full shadow-sm text-taca-text-muted hover:text-taca-text-main transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  width: PropTypes.string,
  hideCloseButton: PropTypes.bool,
  hideHeader: PropTypes.bool,
};

export default Modal;
