"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "仪表盘", icon: "◈" },
      { href: "/dashboard/docs", label: "使用文档", icon: "▤" },
    ],
  },
  {
    title: "订阅",
    items: [
      { href: "/dashboard/plans", label: "购买订阅", icon: "▣" },
      { href: "/dashboard/nodes", label: "节点状态", icon: "◉" },
    ],
  },
  {
    title: "财务",
    items: [
      { href: "/dashboard/orders", label: "我的订单", icon: "≣" },
      { href: "/dashboard/invite", label: "我的邀请", icon: "♺" },
    ],
  },
  {
    title: "用户",
    items: [
      { href: "/dashboard/profile", label: "个人中心", icon: "⚇" },
      { href: "/dashboard/tickets", label: "我的工单", icon: "✉" },
      { href: "/dashboard/usage", label: "流量明细", icon: "▥" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-semibold text-accent">极速机场</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.title && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-text-muted hover:bg-bg-card hover:text-text"
                      }`}
                    >
                      <span className="w-4 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-4 py-3 text-xs text-text-muted">
        极速机场 v1.7.4
      </div>
    </aside>
  );
}
