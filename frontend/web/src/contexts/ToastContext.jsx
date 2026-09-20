import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext({});

const ICON_MAP = {
  success: <CheckCircle2 size={18} className="text-[#3FBF5F] shrink-0" />,
  error: <XCircle size={18} className="text-[#FF3B2F] shrink-0" />,
  warning: <AlertCircle size={18} className="text-[#FFC700] shrink-0" />,
  info: <AlertCircle size={18} className="text-[#60A5FA] shrink-0" />,
};

const BORDER_MAP = {
  success: 'border-[#3FBF5F]/40',
  error: 'border-[#FF3B2F]/40',
  warning: 'border-[#FFC700]/40',
  info: 'border-[#60A5FA]/40',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, closing: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 250);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 bg-[#1B1B1A] border ${BORDER_MAP[t.type]} px-4 py-3 shadow-2xl ${t.closing ? 'sb-toast-out' : 'sb-toast-in'}`}
          >
            {ICON_MAP[t.type]}
            <span className="text-sm text-[#F3F1E7] font-semibold flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#9C9890] hover:text-white p-0.5 transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
