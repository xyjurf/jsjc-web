"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import { Bell, ShoppingCart, Info, Gift } from "lucide-react";

const TYPE_ICONS: Record<Notification["type"], React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4 text-accent" />,
  system: <Info className="h-4 w-4 text-blue-400" />,
  promo: <Gift className="h-4 w-4 text-amber-400" />,
};

export default function NotificationsPopover() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  function handleToggle() {
    if (!open) {
      loadNotifications();
    }
    setOpen(!open);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-bg-card hover:text-text"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 animate-slide-in-down overflow-hidden rounded-xl border border-border bg-bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">
              通知
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-text-muted">
                  ({unreadCount} 条未读)
                </span>
              )}
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                加载中...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                暂无通知
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-bg-elevated/40 ${
                    !n.is_read ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{TYPE_ICONS[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !n.is_read ? "font-medium" : ""
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-xs text-text-muted line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(n.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}