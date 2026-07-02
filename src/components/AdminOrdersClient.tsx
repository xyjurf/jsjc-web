"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAsPaidAction, shipOrderAction } from "@/app/dashboard/admin/actions";
import { Loader2, Search, Send, X } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface OrderRow {
  id: string;
  order_no: string;
  user_id: string;
  plan_name: string;
  amount: number;
  status: string;
  delivery_data?: { note?: string; shipped_at?: string } | null;
  created_at: string;
  paid_at?: string | null;
}

type FilterStatus = "all" | "pending" | "paid" | "fulfilling" | "completed";

const STATUS_LABEL: Record<string, string> = {
  pending: "待确认支付",
  paid: "待发货",
  fulfilling: "已发货",
  completed: "已完成",
  cancelled: "已取消",
  failed: "失败",
};

function statusVariant(
  status: string
): "warning" | "success" | "info" | "neutral" | "error" | "active" {
  switch (status) {
    case "pending":
      return "warning";
    case "paid":
      return "info";
    case "fulfilling":
      return "active";
    case "completed":
      return "success";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersClient({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shipModal, setShipModal] = useState<{
    orderId: string;
    orderNo: string;
  } | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");

  const filtered = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  async function handleMarkAsPaid(orderId: string) {
    setBusyId(orderId);
    setAction("pay");
    setError(null);
    const res = await markAsPaidAction(orderId);
    setBusyId(null);
    setAction(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function handleShip() {
    if (!shipModal) return;
    setBusyId(shipModal.orderId);
    setAction("ship");
    setError(null);
    const res = await shipOrderAction(shipModal.orderId, deliveryNote);
    setBusyId(null);
    setAction(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setShipModal(null);
    setDeliveryNote("");
    router.refresh();
  }

  const FILTERS: [FilterStatus, string][] = [
    ["all", "全部"],
    ["pending", "待确认支付"],
    ["paid", "待发货"],
    ["fulfilling", "已发货"],
    ["completed", "已完成"],
  ];

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              filter === key
                ? "bg-accent text-white shadow-md"
                : "text-text-muted hover:text-text bg-bg-elevated/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-text-muted animate-float" />
          <p className="mt-4 text-text-muted">暂无该状态的订单。</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">套餐</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {order.order_no?.slice(0, 12) ?? order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    {order.user_id?.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">{order.plan_name}</td>
                  <td className="px-4 py-3 font-medium">
                    ¥ {Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={STATUS_LABEL[order.status] ?? order.status}
                      variant={statusVariant(order.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id)}
                        disabled={busyId === order.id}
                        className="btn-press rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
                      >
                        {busyId === order.id && action === "pay" ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            处理中
                          </span>
                        ) : (
                          "确认支付"
                        )}
                      </button>
                    )}
                    {order.status === "paid" && (
                      <button
                        onClick={() =>
                          setShipModal({
                            orderId: order.id,
                            orderNo: order.order_no ?? order.id.slice(0, 8),
                          })
                        }
                        className="btn-press rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-600 hover:shadow-md disabled:opacity-60"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Send className="h-3 w-3" />
                          发货
                        </span>
                      </button>
                    )}
                    {(order.status === "fulfilling" ||
                      order.status === "completed") && (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ship Modal */}
      {shipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md glass rounded-2xl p-6 animate-scale-in shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">发货</h3>
              <button
                onClick={() => {
                  setShipModal(null);
                  setDeliveryNote("");
                }}
                className="rounded-lg p-1 text-text-muted hover:text-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">订单号</span>
                <span className="font-mono">{shipModal.orderNo}</span>
              </div>
            </div>

            <label className="mb-2 block text-sm text-text-muted">
              发货信息
            </label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="输入订阅链接、账号信息等..."
              rows={4}
              className="input-glow w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text placeholder:text-text-muted/60 resize-none focus:outline-none"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShipModal(null);
                  setDeliveryNote("");
                  setError(null);
                }}
                disabled={busyId === shipModal.orderId}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card disabled:opacity-60"
              >
                取消
              </button>
              <button
                onClick={handleShip}
                disabled={busyId === shipModal.orderId || !deliveryNote.trim()}
                className="btn-press flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
              >
                {busyId === shipModal.orderId && action === "ship" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    发货中...
                  </span>
                ) : (
                  "确认发货"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}