"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/types";
import { createOrderAction, payOrderAction } from "@/app/dashboard/plans/actions";

type Filter = "all" | "cycle" | "traffic";

export default function PlansClient({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [checkout, setCheckout] = useState<{
    plan: Plan;
    orderId: string;
  } | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = plans.filter((p) =>
    filter === "all" ? true : p.category === filter
  );

  async function handleSubscribe(plan: Plan) {
    setBusyPlanId(plan.id);
    setError(null);
    const res = await createOrderAction(plan.id);
    setBusyPlanId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCheckout({ plan, orderId: res.orderId });
  }

  async function handlePay() {
    if (!checkout) return;
    setPaying(true);
    setError(null);
    const res = await payOrderAction(checkout.orderId);
    setPaying(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCheckout(null);
    router.push("/dashboard/orders");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">选择最适合您的计划</h1>

      {/* 筛选标签 */}
      <div className="mb-8 inline-flex rounded-full bg-bg-elevated p-1">
        {(
          [
            ["all", "全部"],
            ["cycle", "按周期"],
            ["traffic", "按流量"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-5 py-1.5 text-sm transition ${
              filter === key
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* 套餐卡片网格 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-lg border border-border bg-bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-medium">{plan.name}</h3>
            <div className="mb-4 rounded-md bg-bg-elevated p-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  ¥ {plan.price.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{plan.period}</p>
            </div>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-text-muted">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={busyPlanId === plan.id}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {busyPlanId === plan.id ? "处理中..." : "立即订阅"}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-text-muted">暂无该分类的套餐。</p>
      )}

      {/* 模拟支付弹窗 */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elevated p-6">
            <h3 className="mb-1 text-lg font-semibold">确认订单</h3>
            <p className="mb-4 text-sm text-text-muted">模拟支付（演示用）</p>
            <div className="mb-4 space-y-2 rounded-md bg-bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">套餐</span>
                <span>{checkout.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">周期</span>
                <span>{checkout.plan.period}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span className="text-text-muted">应付</span>
                <span className="font-bold text-accent">
                  ¥ {checkout.plan.price.toFixed(2)}
                </span>
              </div>
            </div>
            {error && (
              <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCheckout(null);
                  setError(null);
                  router.refresh();
                }}
                disabled={paying}
                className="flex-1 rounded-md border border-border py-2 text-sm text-text-muted transition hover:bg-bg-card disabled:opacity-60"
              >
                取消
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 rounded-md bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
              >
                {paying ? "支付中..." : "确认支付"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
