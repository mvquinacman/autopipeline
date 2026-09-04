import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer, type Toast } from '../components/toast/ToastContainer';

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = toast.duration ?? 5000;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 active toasts

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismissToast]
  );

  const handleUndo = useCallback(
    async (toast: Toast) => {
      if (toast.undoAction) {
        try {
          await toast.undoAction();
        } catch (err) {
          console.error('Failed to execute toast undo action:', err);
        }
      }
      dismissToast(toast.id);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} onUndo={handleUndo} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
