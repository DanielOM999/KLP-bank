"use client";

// Imports the entire 'react' module to access components, hooks, and context functionality.
import * as React from "react";

// Imports icons from 'lucide-react' to visually represent different toast variants.
import { CheckCircle2, XCircle, Info } from "lucide-react";

// Defines the 'Toast' interface for individual toast notifications.
// Each toast includes an id, title, an optional description, and an optional variant.
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

// Defines the 'ToastContextType' for the toast context.
// Includes an array of toasts, a function to create a new toast, and a function to remove a toast.
type ToastContextType = {
  toasts: Toast[];
  toast: (options: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

// Creates the Toast context with an initial undefined value.
const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

// Defines the 'ToastProvider' component that wraps the application and provides toast functionality.
// Manages toast state, provides functions to add and remove toasts, and renders toast notifications.
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Defines the 'toast' function to create a new toast notification.
  // Generates a unique id using the current timestamp, adds the toast, and schedules its removal after 3 seconds.
  const toast = React.useCallback((options: Omit<Toast, "id">) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, ...options }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Defines the 'removeToast' function to remove a toast notification by its id.
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      {/* Renders toast notifications at the bottom-right corner */}
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
            {/* Renders the appropriate icon based on the toast variant */}
            <div className="flex-shrink-0">
              {t.variant === "destructive" ? (
                <XCircle className="w-5 h-5" />
              ) : t.variant === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            {/* Displays the toast title and description */}
            <div className="flex-1">
              <h3 className="font-medium">{t.title}</h3>
              {t.description && (
                <p className="mt-1 text-sm opacity-90">{t.description}</p>
              )}
            </div>
            {/* Renders a progress bar for the toast notification */}
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

// Exports the 'useToast' hook to allow components to trigger toast notifications.
// Throws an error if used outside of the 'ToastProvider'.
export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return { toast: context.toast };
}
