"use client";

import * as React from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

type ToastContextType = {
  toasts: Toast[];
  toast: (options: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: Omit<Toast, "id">) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, ...options }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded shadow-lg border ${
              t.variant === "destructive"
                ? "border-red-500 bg-red-400 text-white"
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            <strong>{t.title}</strong>
            {t.description && <div className="mt-1 text-sm">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return { toast: context.toast };
}
