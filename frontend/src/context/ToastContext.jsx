import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const warn = useCallback((msg) => addToast(msg, "warn"), [addToast]);
  const error = useCallback((msg) => addToast(msg, "error"), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, warn, error, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg transition-all transform translate-y-0 backdrop-blur-md ${
              toast.type === "success"
                ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
                : toast.type === "warn"
                ? "bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-500/10"
                : "bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toast.type === "error" && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
