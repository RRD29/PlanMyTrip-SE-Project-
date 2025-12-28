import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';


const CloseIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!isOpen) {
    return null;
  }

  
  return ReactDOM.createPortal(
    <div
      
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300"
      onClick={onClose} 
      aria-modal="true"
      role="dialog"
      style={{ zIndex: 1000 }}
    >
      <div
        
        className={`relative w-full rounded-lg bg-white shadow-xl flex flex-col transition-transform duration-300 transform ${sizeStyles[size]}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title ? (
            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
              {title}
            </h3>
          ) : (
            <div /> 
          )}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-portal') 
  );
};

export default Modal;