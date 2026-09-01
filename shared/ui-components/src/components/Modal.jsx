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

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white shadow-2xl rounded-2xl border-2 border-taca-border w-full ${width} m-4 max-h-[90vh] flex flex-col relative`}
        role="dialog"
        aria-modal="true"
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-taca-border">
            <h2 className="text-[18px] font-bold text-taca-text-main">
              {title}
            </h2>
            {!hideCloseButton && (
              <button 
                onClick={onClose}
                className="p-1 text-taca-text-muted hover:text-taca-text-main transition-colors focus:outline-none"
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
};

export default Modal;
