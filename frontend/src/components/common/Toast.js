import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const icons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo
  };

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const Icon = icons[type];

  return (
    <div
      className={`
        ${styles[type]}
        border-l-4 p-4 rounded-lg shadow-lg
        flex items-start gap-3
        animate-slideIn
        min-w-[320px] max-w-md
      `}
      role="alert"
    >
      {/* Icono */}
      <Icon className={`${iconStyles[type]} flex-shrink-0 mt-0.5`} size={20} />

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium">{message}</p>

      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default Toast;
