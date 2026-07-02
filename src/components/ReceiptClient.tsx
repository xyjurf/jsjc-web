"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmReceiptAction } from "@/app/dashboard/receipt/actions";
import { Check, Loader2, PackageCheck } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface ReceiptOrder {
  id: string;
  order_no: string;
  plan_name: string;
  amount: number;
  status: string;
  delivery_data?: { note?: string; shipped_at?: string } | null;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReceiptClient({ orders }: { orders: ReceiptOrder[] }) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleConfirm(orderId: string) {
    setConfirmingId(orderId);
    setError(null);
    const res = await confirmReceiptAction(orderId);
    setConfirmingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div>
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
            {error}
          </div>
        )}
        <div className="py-16 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-text-muted animate-float" />
          <p className="mt-4 text-text-muted">暂无待收货的订单。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          const deliveryNote = order.delivery_data?.note;
          const shippedAt = order.delivery_data?.shipped_at;

          return (
            <div
              key={order.id}
              className="card-hover rounded-2xl border border-border bg-bg-card p-5 animate-fade-in-up"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{order.plan_name}</span>
                    <StatusBadge label="待收货" variant="active" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                    <span>
                      订单号:{" "}
                      <span className="font-mono text-xs">
                        {order.order_no?.slice(0, 12) ?? order.id.slice(0, 8)}
                      </span>
                    </span>
                    <span>¥ {Number(order.amount).toFixed(2)}</span>
                    <span>
                      发货时间:{" "}
                      {shippedAt
                        ? formatTime(shippedAt)
                        : formatTime(order.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {deliveryNote && (
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-bg-elevated hover:text-text"
                    >
                      {isExpanded ? "收起详情" : "查看详情"}
                    </button>
                  )}
                  <button
                    onClick={() => handleConfirm(order.id)}
                    disabled={confirmingId === order.id}
                    className="btn-press rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
                  >
                    {confirmingId === order.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        确认中...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        确认收货
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded delivery info */}
              {isExpanded && deliveryNote && (
                <div className="mt-4 rounded-xl bg-bg-elevated/60 p-4 animate-fade-in">
                  <h4 className="mb-2 text-sm font-medium text-text-muted">
                    发货信息
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm text-text font-mono leading-relaxed">
                    {deliveryNote}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}