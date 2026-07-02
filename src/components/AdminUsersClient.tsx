"use client";

import type { Profile } from "@/lib/types";
import { Shield, User } from "lucide-react";

export default function AdminUsersClient({ users }: { users: Profile[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-bg-elevated/60 text-text-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">用户 ID</th>
            <th className="px-4 py-3 text-left font-medium">邮箱</th>
            <th className="px-4 py-3 text-left font-medium">余额</th>
            <th className="px-4 py-3 text-left font-medium">角色</th>
            <th className="px-4 py-3 text-left font-medium">注册时间</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t border-border bg-bg-card transition-colors hover:bg-bg-elevated/40"
            >
              <td className="px-4 py-3 font-mono text-xs text-text-muted">
                {u.id.slice(0, 12)}...
              </td>
              <td className="px-4 py-3">{u.email || "—"}</td>
              <td className="px-4 py-3">¥ {Number(u.balance).toFixed(2)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  {u.role === "admin" ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  {u.role === "admin" ? "管理员" : "用户"}
                </span>
              </td>
              <td className="px-4 py-3 text-text-muted">
                {new Date(u.created_at).toLocaleString("zh-CN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-text-muted">暂无用户。</p>
        </div>
      )}
    </div>
  );
}