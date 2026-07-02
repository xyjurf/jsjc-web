"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types";
import { payOrderAction } from "@/app/dashboard/plans/actions";
import { Loader2, ShoppingBag, Check, Copy, ExternalLink } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

function statusVariant(
  status: OrderStatus
): "warning" | "success" | "neutral" | "error" {
  switch (status) {
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
  paid: "待处理",
  fulfilling: "代购中",
  completed: "已发货",
  failed: "代购失败",
  cancelled: "已取消",
};

const STATUS_TIP: Record<OrderStatus, string> = {
  pending: "请完成支付",
  paid: "等待系统代购",
  fulfilling: "系统正在上游网站下单中",
  completed: "订阅已开通",
  failed: "请联系客服处理",
  cancelled: "订单已取消",
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

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

  function copyDeliveryData(data: any) {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
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

      <div className="hidden md:block overflow-hidden rounded-2xl border border-border">
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
                  <div className="flex items-center justify-end gap-2">
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
                    ) : o.status === "completed" && o.delivery_data ? (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === o.id ? null : o.id)
                        }
                        className="btn-press rounded-xl bg-green-500/15 px-4 py-1.5 text-xs font-semibold text-green-400 transition-all duration-200 hover:bg-green-500/25"
                      >
                        <Check className="h-3.5 w-3.5 inline mr-1" />
                        查看订阅
                      </button>
                    ) : o.status === "failed" ? (
                      <span className="text-xs text-red-400/80" title={o.fulfillment_error || ""}>
                        请联系客服
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">
                        {STATUS_TIP[o.status]}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-text-muted">{o.order_no}</span>
              <StatusBadge label={STATUS_LABEL[o.status]} variant={statusVariant(o.status)} showDot />
            </div>
            <div className="flex justify-between text-sm">
              <span>{o.plan_name}</span>
              <span className="font-semibold">¥ {Number(o.amount).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-text-muted">
                {new Date(o.created_at).toLocaleString("zh-CN")}
              </span>
              {o.status === "pending" ? (
                <button
                  onClick={() => handlePay(o.id)}
                  disabled={payingId === o.id}
                  className="btn-press rounded-xl bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {payingId === o.id ? "支付中..." : "去支付"}
                </button>
              ) : o.status === "completed" && o.delivery_data ? (
                <button
                  onClick={() =>
                    setExpandedId(expandedId === o.id ? null : o.id)
                  }
                  className="rounded-xl bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400"
                >
                  查看订阅
                </button>
              ) : (
                <span className="text-xs text-text-muted">{STATUS_TIP[o.status]}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery data modal */}
      {expandedId && (() => {
        const order = orders.find((o) => o.id === expandedId);
        if (!order || !order.delivery_data) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg glass rounded-2xl p-6 animate-scale-in shadow-lg max-h-[80vh] overflow-y-auto">
              <h3 className="mb-1 text-lg font-semibold">订阅信息</h3>
              <p className="mb-4 text-sm text-text-muted">
                订单 {order.order_no} · {order.plan_name}
              </p>

              <div className="space-y-3">
                {order.delivery_data.subscription_links && order.delivery_data.subscription_links.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1">订阅链接：</p>
                    {order.delivery_data.subscription_links!.map((link: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-bg-card p-3 mb-1">
                        <code className="flex-1 text-xs break-all text-green-400">{link}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(link);
                            setCopiedText(true);
                            setTimeout(() => setCopiedText(false), 2000);
                          }}
                          className="flex-shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated hover:text-accent transition-colors"
                        >
                          {copiedText ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {order.delivery_data.config_texts && order.delivery_data.config_texts.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1">配置信息：</p>
                    {order.delivery_data.config_texts!.map((text: string, i: number) => (
                      <div key={i} className="rounded-lg bg-bg-card p-3 mb-1">
                        <pre className="text-xs whitespace-pre-wrap break-all text-text">{text}</pre>
                        <button
                          onClick={() => copyDeliveryData({ config: text })}
                          className="mt-2 text-xs text-accent hover:underline"
                        >
                          <Copy className="h-3 w-3 inline mr-1" />
                          复制
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!order.delivery_data.subscription_links?.length && !order.delivery_data.config_texts?.length && (
                  <div className="rounded-lg bg-bg-card p-4">
                    <pre className="text-xs whitespace-pre-wrap break-all text-text-muted">
                      {JSON.stringify(order.delivery_data, null, 2)}
                    </pre>
                    <button
                      onClick={() => copyDeliveryData(order.delivery_data)}
                      className="mt-2 text-xs text-accent hover:underline"
                    >
                      <Copy className="h-3 w-3 inline mr-1" />
                      复制全部
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setExpandedId(null)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}