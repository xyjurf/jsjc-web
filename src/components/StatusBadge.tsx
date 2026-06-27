"use client";

import { cn } from "@/lib/utils";

type Variant = "active" | "success" | "warning" | "error" | "info" | "neutral";

const COLORS: Record<Variant, string> = {
  active: "bg-accent/15 text-accent",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-yellow-500/15 text-yellow-400",
  error: "bg-red-500/15 text-red-400",
  info: "bg-blue-500/15 text-blue-400",
  neutral: "bg-gray-500/15 text-gray-400",
};

const DOTS: Record<Variant, string> = {
  active: "bg-accent animate-pulse-glow",
  success: "bg-green-400",
  warning: "bg-yellow-400 animate-pulse",
  error: "bg-red-400",
  info: "bg-blue-400",
  neutral: "bg-gray-400",
};

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
  showDot?: boolean;
}

export default function StatusBadge({
  label,
  variant = "neutral",
  showDot = true,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${COLORS[variant]}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[variant]}`} />}
      {label}
    </span>
  );
}