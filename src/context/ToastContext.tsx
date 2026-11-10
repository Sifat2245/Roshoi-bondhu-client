import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const notify = {
    success: (message, title = "Success") =>
      showToast({ type: "success", title, message }),
    error: (message, title = "Error") =>
      showToast({ type: "error", title, message }),
    info: (message, title = "Notice") =>
      showToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={{ showToast, notify }}>
      {children}

      {/* Global Bottom-Right Toast Stack */}
      <div
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white dark:bg-[#242526] text-gray-900 dark:text-white rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-3.5 animate-in slide-in-from-bottom-3 duration-200 transition-all"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                )}
                {isError && <AlertCircle size={18} className="text-rose-500" />}
                {!isSuccess && !isError && (
                  <Info size={18} className="text-blue-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      notify: { success: () => {}, error: () => {}, info: () => {} },
    };
  }
  return context;
};

export default ToastProvider;
