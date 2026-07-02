"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "概览", icon: LayoutDashboard },
  { href: "/dashboard/admin/orders", label: "订单管理", icon: ShoppingCart },
  { href: "/dashboard/admin/users", label: "用户列表", icon: Users },
  { href: "/dashboard/admin/config", label: "套餐映射", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 rounded-xl bg-bg-elevated/60 p-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard/admin"
            ? pathname === "/dashboard/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-accent text-white shadow-md"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}