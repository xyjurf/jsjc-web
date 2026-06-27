"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { payOrderAction } from "@/app/dashboard/plans/actions";
import { Loader2, ShoppingBag } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

function statusVariant(
  status: Order["status"]
): "warning" | "success" | "neutral" {
  switch (status) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    default:
      return "neutral";
  }
}

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "待支付",
  paid: "已支付",
  cancelled: "已取消",
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
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">我的订单</h1>
        </div>
        <div className="glass rounded-2xl p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-text-muted animate-float" />
          <p className="mt-4 text-text-muted">暂无订单记录。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">我的订单</h1>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated/60 text-text-muted">
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
                className="border-t border-border bg-bg-card transition-colors duration-150 hover:bg-bg-elevated/40"
              >
                <td className="px-4 py-3 font-mono text-xs">{o.order_no}</td>
                <td className="px-4 py-3">{o.plan_name}</td>
                <td className="px-4 py-3">
                  ¥ {Number(o.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={STATUS_LABEL[o.status]}
                    variant={statusVariant(o.status)}
                    showDot
                  />
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(o.created_at).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  {o.status === "pending" ? (
                    <button
                      onClick={() => handlePay(o.id)}
                      disabled={payingId === o.id}
                      className="btn-press rounded-xl bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
                    >
                      {payingId === o.id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          支付中...
                        </span>
                      ) : (
                        "去支付"
                      )}
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