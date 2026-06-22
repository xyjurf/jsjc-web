"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Server,
  Receipt,
  Users,
  User,
  Ticket,
  BarChart3,
  LogOut,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/dashboard/plans", label: "购买订阅", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "我的订单", icon: Receipt },
  { href: "/dashboard/nodes", label: "节点状态", icon: Server },
  { href: "/dashboard/usage", label: "流量明细", icon: BarChart3 },
  { href: "/dashboard/invite", label: "邀请好友", icon: Users },
  { href: "/dashboard/tickets", label: "工单支持", icon: Ticket },
  { href: "/dashboard/docs", label: "帮助文档", icon: FileText },
  { href: "/dashboard/profile", label: "个人中心", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col bg-sidebar border-r border-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5 border-b border-border">
        <Zap className="h-5 w-5 text-accent" />
        <span className="text-sm font-semibold">极速机场</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated hover:text-text transition"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}