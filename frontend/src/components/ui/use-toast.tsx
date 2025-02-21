"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
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
            className={`p-4 rounded-lg shadow-xl border-l-4 flex items-start gap-3 w-80
              ${
                t.variant === "destructive"
                  ? "border-red-600 bg-red-400/25 text-red-300"
                  : t.variant === "success"
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-emerald-600 bg-emerald-50 text-emerald-800"
              } 
              animate-in slide-in-from-right-8 fade-in-80`}
          >
            <div className="flex-shrink-0">
              {t.variant === "destructive" ? (
                <XCircle className="w-5 h-5" />
              ) : t.variant === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{t.title}</h3>
              {t.description && (
                <p className="mt-1 text-sm opacity-90">{t.description}</p>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
              <div
                className={`h-full transition-all duration-300 ${
                  t.variant === "destructive"
                    ? "bg-red-600"
                    : t.variant === "success"
                    ? "bg-blue-600"
                    : "bg-emerald-600"
                }`}
                style={{ width: "100%" }}
              />
            </div>
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