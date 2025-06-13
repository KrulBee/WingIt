import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'react-feather';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-gradient-to-r from-success-500 to-success-600',
      borderClass: 'border-success-200 dark:border-success-800',
      textClass: 'text-success-800 dark:text-success-200'
    },
    error: {
      icon: AlertCircle,
      bgClass: 'bg-gradient-to-r from-danger-500 to-danger-600',
      borderClass: 'border-danger-200 dark:border-danger-800',
      textClass: 'text-danger-800 dark:text-danger-200'
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-gradient-to-r from-warning-500 to-warning-600',
      borderClass: 'border-warning-200 dark:border-warning-800',
      textClass: 'text-warning-800 dark:text-warning-200'
    },
    info: {
      icon: Info,
      bgClass: 'bg-gradient-to-r from-primary-500 to-primary-600',
      borderClass: 'border-primary-200 dark:border-primary-800',
      textClass: 'text-primary-800 dark:text-primary-200'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        max-w-sm w-full
        bg-white dark:bg-dark-800
        border ${config.borderClass}
        rounded-xl shadow-large
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-dark-700 rounded-t-xl overflow-hidden">
          <div 
            className={`h-full ${config.bgClass} animate-pulse-soft`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 ${config.bgClass} rounded-full flex items-center justify-center`}>
            <IconComponent size={16} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${config.textClass} mb-1`}>
              {title}
            </h4>
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
