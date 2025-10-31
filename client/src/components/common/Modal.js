import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

// Close (X) Icon
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

/**
 * A reusable Modal component using React Portal.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Function to call when modal should close
 * @param {React.Node} props.children - Content of the modal
 * @param {string} [props.title] - Optional title for the modal header
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Size of the modal
 */
const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  // Close modal on 'Escape' key press
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

  // Size variants
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!isOpen) {
    return null;
  }

  // Render the modal using a portal
  return ReactDOM.createPortal(
    <div
      // --- Backdrop ---
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300"
      onClick={onClose} // Close on backdrop click
      aria-modal="true"
      role="dialog"
      style={{ zIndex: 1000 }}
    >
      <div
        // --- Modal Panel ---
        className={`relative w-full rounded-lg bg-white shadow-xl flex flex-col transition-transform duration-300 transform ${sizeStyles[size]}`}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking panel
      >
        {/* --- Header with Title and Close Button --- */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title ? (
            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
              {title}
            </h3>
          ) : (
            <div /> // Empty div to keep close button on the right
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

        {/* --- Modal Content --- */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-portal') // This targets the <div> you added to index.html
  );
};

export default Modal;