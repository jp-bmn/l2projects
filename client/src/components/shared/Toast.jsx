import { useEffect } from 'react';
import useStore from '../../store/useStore';

const TYPE_STYLES = {
  success: 'bg-card border border-success text-success',
  error: 'bg-card border border-danger text-danger',
  warning: 'bg-card border border-warning text-warning',
};

const TYPE_ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
};

function ToastItem({ toast }) {
  const removeToast = useStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div className={`${TYPE_STYLES[toast.type] || TYPE_STYLES.success} rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 font-mono text-sm min-w-[280px]`}>
      <span>{TYPE_ICONS[toast.type] || '·'}</span>
      <span className="text-text-primary flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-text-dim hover:text-text-muted ml-2 bg-transparent border-0 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export default function Toast() {
  const toasts = useStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
