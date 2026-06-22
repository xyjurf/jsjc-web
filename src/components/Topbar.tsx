"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Topbar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-elevated px-6">
      {/* Spacer for balance with sidebar */}
      <div />

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-bg-card hover:text-text transition"
        >
          <span className="max-w-[180px] truncate">{email}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-bg-card py-1 shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-text-muted hover:bg-bg-elevated hover:text-text transition"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  );
}