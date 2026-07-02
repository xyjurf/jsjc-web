"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";
import { Loader2, RotateCcw, CheckCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "paid",
  "fulfilling",
  "completed",
  "failed",
  "cancelled",
];

function statusVariant(s: OrderStatus): "warning" | "success" | "neutral" | "error" {
  switch (s) {
    case "pending":
      return "neutral";
    case "paid":
    case "fulfilling":
      return "warning";
    case "completed":
      return "success";
    case "failed":
    case "cancelled":
      return "error";
    default:
      return "neutral";
  }
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "待支付",
  paid: "已支付",
  fulfilling: "代购中",
  completed: "已发货",
  failed: "代购失败",
  cancelled: "已取消",
};

export default function AdminOrdersClient({ orders: _orders }: { orders: Order[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState(_orders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function handleRetry(orderId: string) {
    setBusyId(orderId);
    setError(null);
    const { error: err } = await supabase
      .from("orders")
      .update({ status: "paid", fulfillment_attempts: 0, fulfillment_error: null })
      .eq("id", orderId)
      .eq("status", "failed");
    setBusyId(null);
    if (err) {
      setError(err.message);
      return;
    }
    // Update local state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "paid" as OrderStatus, fulfillment_attempts: 0, fulfillment_error: null }
          : o
      )
    );
    router.refresh();
  }

  async function handleManualComplete(orderId: string) {
    const deliveryData = prompt("请输入发货数据（订阅链接/密钥 JSON 格式）：");
    if (!deliveryData) return;

    let parsed: any;
    try {
      parsed = JSON.parse(deliveryData);
    } catch {
      setError("JSON 格式无效");
      return;
    }

    setBusyId(orderId);
    setError(null);
    const { error: err } = await supabase.rpc("create_subscription", {
      p_order_id: orderId,
    });
    if (err) {
      setError(err.message);
      setBusyId(null);
      return;
    }
    const { error: err2 } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivery_data: parsed,
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    setBusyId(null);
    if (err2) {
      setError(err2.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed" as OrderStatus, delivery_data: parsed }
          : o
      )
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              filter === s
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-muted hover:text-text"
            }`}
          >
            {s === "all" ? "全部" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated/60 text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-left font-medium">套餐</th>
              <th className="px-4 py-3 text-left font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">重试</th>
              <th className="px-4 py-3 text-left font-medium">时间</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-t border-border bg-bg-card transition-colors hover:bg-bg-elevated/40"
              >
                <td className="px-4 py-3 font-mono text-xs">{o.order_no}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">
                  {o.user_id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3">{o.plan_name}</td>
                <td className="px-4 py-3">¥ {Number(o.amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={STATUS_LABEL[o.status]}
                    variant={statusVariant(o.status)}
                    showDot
                  />
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {o.fulfillment_attempts}/3
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {new Date(o.created_at).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {o.status === "failed" && (
                      <button
                        onClick={() => handleRetry(o.id)}
                        disabled={busyId === o.id}
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-60"
                        title="重试代购"
                      >
                        {busyId === o.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleManualComplete(o.id)}
                      disabled={busyId === o.id}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-green-500/10 hover:text-green-400 disabled:opacity-60"
                      title="手动发货"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-text-muted">暂无订单。</p>
        </div>
      )}
    </div>
  );
}