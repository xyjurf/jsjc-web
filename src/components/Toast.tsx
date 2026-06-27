"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export interface ToastData {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastProps {
  data: ToastData;
  onDismiss: (id: number) => void;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const BORDERS = {
  success: "border-l-accent",
  error: "border-l-red-400",
  info: "border-l-blue-400",
};

const ICON_COLORS = {
  success: "text-accent",
  error: "text-red-400",
  info: "text-blue-400",
};

export default function Toast({ data, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Progress bar
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = progressRef.current;
    if (bar) {
      // Trigger reflow for animation restart
      bar.style.transition = "none";
      bar.style.width = "100%";
      void bar.offsetHeight;
      bar.style.transition = "width 3.8s linear";
      bar.style.width = "0%";
    }
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    clearTimeout(timerRef.current);
    setTimeout(() => onDismiss(data.id), 300);
  };

  // Auto-dismiss after 4s
  useEffect(() => {
    timerRef.current = setTimeout(handleDismiss, 4000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Icon = ICONS[data.variant];

  return (
    <div
      className={`pointer-events-auto flex w-80 overflow-hidden rounded-xl border border-border bg-bg-card shadow-lg ${
        exiting ? "animate-slide-in-right [animation-direction:reverse] opacity-0 transition-opacity duration-300" : "animate-slide-in-right"
      }`}
    >
      {/* Left accent strip */}
      <div className={`w-1 flex-shrink-0 ${BORDERS[data.variant]} bg-transparent`} />

      <div className="flex-1 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${ICON_COLORS[data.variant]}`} />
            <p className="text-sm text-text">{data.message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded p-0.5 text-text-muted transition-colors hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div
          ref={progressRef}
          className={`h-full ${ICON_COLORS[data.variant]} w-full opacity-40`}
        />
      </div>
    </div>
  );
}