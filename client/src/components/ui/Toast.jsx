import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-xl" />;
      case 'error':
        return <FaExclamationCircle className="text-xl" />;
      case 'warning':
        return <FaExclamationCircle className="text-xl" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-xl" />;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed z-50 ${getPositionStyles()} transition-all duration-300 ${
        isLeaving ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      }`}
    >
      <div
        className={`
          ${getTypeStyles()}
          rounded-lg shadow-2xl p-4 min-w-80 max-w-md
          animate-slideIn card-interactive
          flex items-center space-x-3
        `}
      >
        <div className="animate-bounce-custom">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white transition-colors duration-200 hover:scale-110"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id || index}
          style={{ top: `${4 + index * 5}rem` }}
          className="absolute right-4 pointer-events-auto"
        >
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

export default Toast;