"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const titleMap: Record<string, string> = {
  "/dashboard": "仪表盘",
  "/dashboard/docs": "使用文档",
  "/dashboard/plans": "购买订阅",
  "/dashboard/nodes": "节点状态",
  "/dashboard/orders": "我的订单",
  "/dashboard/invite": "我的邀请",
  "/dashboard/profile": "个人中心",
  "/dashboard/tickets": "我的工单",
  "/dashboard/usage": "流量明细",
};

export default function Topbar({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const title = titleMap[pathname] ?? "极速机场";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg-elevated px-6">
      <h2 className="text-base font-medium text-text">{title}</h2>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-text-muted transition hover:bg-bg-card hover:text-text"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">
            {email.charAt(0).toUpperCase()}
          </span>
          {email}
          <span className="text-xs">▾</span>
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md border border-border bg-bg-elevated shadow-lg">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/profile");
              }}
              className="block w-full px-4 py-2 text-left text-sm text-text-muted transition hover:bg-bg-card hover:text-text"
            >
              个人中心
            </button>
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-red-400 transition hover:bg-bg-card"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
