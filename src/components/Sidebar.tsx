"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Server,
  Ticket,
  BarChart3,
  Gift,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  PackageCheck,
  Shield,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "概览", href: "/dashboard", icon: LayoutDashboard },
  { label: "套餐", href: "/dashboard/plans", icon: CreditCard },
  { label: "订单", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "收货管理", href: "/dashboard/receipt", icon: PackageCheck },
  { label: "管理面板", href: "/dashboard/admin", icon: Shield, adminOnly: true },
  { label: "节点", href: "/dashboard/nodes", icon: Server },
  { label: "工单", href: "/dashboard/tickets", icon: Ticket },
  { label: "使用量", href: "/dashboard/usage", icon: BarChart3 },
  { label: "邀请", href: "/dashboard/invite", icon: Gift },
  { label: "文档", href: "/dashboard/docs", icon: BookOpen },
  { label: "个人中心", href: "/dashboard/profile", icon: User },
];

export default function Sidebar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  // 从 localStorage 读取折叠状态
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    location.href = "/login";
  };

  return (
    <aside
      className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-text">
            极速机场
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && role !== "admin") return null;

          const isParentActive =
            item.href === "/dashboard/admin"
              ? pathname.startsWith("/dashboard/admin")
              : pathname === item.href;

          const active = isParentActive;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-accent/10 text-accent font-semibold border-l-[3px] border-accent"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text border-l-[3px] border-transparent"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ${
                  active
                    ? "text-accent"
                    : "text-text-muted group-hover:text-text group-hover:scale-110"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          title="退出登录"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-text-muted transition-colors duration-200 hover:bg-bg-elevated hover:text-text"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2 text-xs">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}