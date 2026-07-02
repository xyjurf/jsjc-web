"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "概览", icon: LayoutDashboard },
  { href: "/dashboard/admin/orders", label: "订单管理", icon: ShoppingCart },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 rounded-xl bg-bg-elevated/60 p-1 w-fit">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-accent text-white shadow-md"
                : "text-text-muted hover:text-text"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}