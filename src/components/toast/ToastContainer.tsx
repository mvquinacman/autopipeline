import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  actionLabel?: string;
  undoAction?: () => void | Promise<void>;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  onUndo: (toast: Toast) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onUndo }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'warning'
            ? AlertCircle
            : toast.type === 'info'
            ? Info
            : CheckCircle2;

        const iconColor =
          toast.type === 'error'
            ? 'text-overdue'
            : toast.type === 'warning'
            ? 'text-due'
            : toast.type === 'info'
            ? 'text-cobalt'
            : 'text-won';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto relative overflow-hidden bg-card border border-line rounded-card shadow-xl p-3 flex items-center gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200"
          >
            <Icon className={`size-4 shrink-0 ${iconColor}`} />
            <p className="text-xs font-semibold text-ink flex-1 leading-snug">{toast.message}</p>
            {toast.undoAction && (
              <button
                type="button"
                onClick={() => onUndo(toast)}
                className="px-2.5 py-1 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                {toast.actionLabel || 'Undo'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-sub hover:text-ink transition-colors p-1 rounded-control shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
