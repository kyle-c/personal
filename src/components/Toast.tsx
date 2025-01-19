import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export default Toast;