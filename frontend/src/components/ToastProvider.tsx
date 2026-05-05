import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const duration = 4000;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), duration);
    const interval = setInterval(() => {
      setProgress(p => Math.max(0, p - (100 / (duration / 50))));
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 className="text-status-open" size={20} />,
    warning: <AlertTriangle className="text-status-warning" size={20} />,
    error:   <AlertCircle className="text-status-error" size={20} />,
    info:    <Info className="text-primary-600" size={20} />,
  };

  const borders = {
    success: 'border-status-open/30 bg-white',
    warning: 'border-status-warning/30 bg-white',
    error:   'border-status-error/30 bg-white',
    info:    'border-primary-100 bg-white',
  };

  const barColors = {
    success: 'bg-status-open',
    warning: 'bg-status-warning',
    error:   'bg-status-error',
    info:    'bg-primary-600',
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border shadow-xl flex items-start gap-4 p-5 animate-[slide-left_0.4s_ease-out]",
      borders[toast.type]
    )}>
      <div className="mt-0.5 shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="font-bold text-navy-900 text-sm leading-tight">{toast.title}</h4>
        <p className="text-xs text-navy-500 mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className="absolute top-4 right-4 text-navy-300 hover:text-navy-600 transition-colors"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-navy-50">
        <div 
          className={cn("h-full transition-all duration-50" , barColors[toast.type])} 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
