"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Toast, { type ToastData } from "./Toast";

type ToastInput = Omit<ToastData, "id">;

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let toastId = 0;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((t: ToastInput) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]); // max 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: {
      success: (message) => addToast({ message, variant: "success" }),
      error: (message) => addToast({ message, variant: "error" }),
      info: (message) => addToast({ message, variant: "info" }),
    },
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast stack — fixed top-right */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} data={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}