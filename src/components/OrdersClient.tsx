"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { payOrderAction } from "@/app/dashboard/plans/actions";

const statusMap: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "待支付", cls: "bg-yellow-500/15 text-yellow-400" },
  paid: { label: "已支付", cls: "bg-accent/15 text-accent" },
  cancelled: { label: "已取消", cls: "bg-zinc-500/15 text-zinc-400" },
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(orderId: string) {
    setPayingId(orderId);
    setError(null);
    const res = await payOrderAction(orderId);
    setPayingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="text-text-muted">暂无订单记录。</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">套餐</th>
              <th className="px-4 py-3 text-left font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">创建时间</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t border-border bg-bg-card"
              >
                <td className="px-4 py-3 font-mono text-xs">{o.order_no}</td>
                <td className="px-4 py-3">{o.plan_name}</td>
                <td className="px-4 py-3">¥ {Number(o.amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusMap[o.status].cls}`}
                  >
                    {statusMap[o.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(o.created_at).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  {o.status === "pending" ? (
                    <button
                      onClick={() => handlePay(o.id)}
                      disabled={payingId === o.id}
                      className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                    >
                      {payingId === o.id ? "支付中..." : "去支付"}
                    </button>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
