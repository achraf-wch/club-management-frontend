import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const styles = {
  success: {
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    icon: 'text-emerald-600 dark:text-emerald-300',
    title: 'text-emerald-900 dark:text-emerald-100',
    text: 'text-emerald-700 dark:text-emerald-200',
  },
  error: {
    border: 'border-red-200 dark:border-red-800/60',
    bg: 'bg-red-50 dark:bg-red-950/80',
    icon: 'text-red-600 dark:text-red-300',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-700 dark:text-red-200',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    icon: 'text-amber-600 dark:text-amber-300',
    title: 'text-amber-900 dark:text-amber-100',
    text: 'text-amber-700 dark:text-amber-200',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800/60',
    bg: 'bg-blue-50 dark:bg-blue-950/80',
    icon: 'text-blue-600 dark:text-blue-300',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-200',
  },
};

const icons = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast = {
      id,
      type,
      message,
      title: options.title,
    };

    setToasts((current) => [...current, toast].slice(-4));
    window.setTimeout(() => dismiss(id), options.duration || 4500);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({
    toast: {
      success: (message, options) => showToast('success', message, options),
      error: (message, options) => showToast('error', message, options),
      warning: (message, options) => showToast('warning', message, options),
      info: (message, options) => showToast('info', message, options),
    },
    dismissToast: dismiss,
  }), [dismiss, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[10000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const style = styles[toast.type] || styles.info;
          return (
            <div key={toast.id} className={`rounded-xl border p-4 shadow-xl backdrop-blur ${style.border} ${style.bg}`}>
              <div className="flex items-start gap-3">
                <svg className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[toast.type] || icons.info} />
                </svg>
                <div className="min-w-0 flex-1">
                  {toast.title && <p className={`text-sm font-bold ${style.title}`}>{toast.title}</p>}
                  <p className={`text-sm leading-5 ${style.text}`}>{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className={`rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10 ${style.icon}`}
                  aria-label="Fermer la notification"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
