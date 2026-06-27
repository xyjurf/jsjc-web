"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/types";
import {
  createOrderAction,
  payOrderAction,
} from "@/app/dashboard/plans/actions";
import {
  Check,
  Loader2,
  Zap,
  Infinity,
  Gauge,
  Monitor,
  Sparkles,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

type Filter = "all" | "cycle" | "traffic";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  无限: <Infinity className="h-4 w-4" />,
  高速: <Gauge className="h-4 w-4" />,
  设备: <Monitor className="h-4 w-4" />,
};

function featureIcon(f: string) {
  for (const [k, icon] of Object.entries(FEATURE_ICONS)) {
    if (f.includes(k)) return icon;
  }
  return <Check className="h-4 w-4 flex-shrink-0 text-accent" />;
}

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

  // 推荐套餐：找价格最高的活跃套餐
  const recommendedId =
    plans.length > 0
      ? plans.reduce((a, b) => (a.price > b.price ? a : b)).id
      : null;

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">选择最适合您的计划</h1>
          <p className="mt-1 text-sm text-text-muted">
            三网高质量线路，稳定流媒体解锁
          </p>
        </div>
        {/* Filter tabs */}
        <div className="inline-flex rounded-full bg-bg-elevated/60 p-1">
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
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "bg-accent text-white shadow-md"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 animate-shake">
          {error}
        </p>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((plan, idx) => {
          const isRecommended = plan.id === recommendedId;
          return (
            <div
              key={plan.id}
              className={`card-hover flex flex-col rounded-2xl border bg-bg-card p-6 animate-fade-in-up ${
                isRecommended
                  ? "border-accent/30 shadow-accent"
                  : "border-border"
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Recommended badge */}
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {isRecommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-secondary/15 px-2 py-0.5 text-xs font-medium text-accent-secondary">
                    <Sparkles className="h-3 w-3" />
                    推荐
                  </span>
                )}
              </div>

              {/* Price area */}
              <div className="mb-4 rounded-xl bg-bg-elevated/60 p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    ¥ {plan.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-muted">{plan.period}</p>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2.5 text-sm text-text-muted">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {featureIcon(f)}
                    {f}
                  </li>
                ))}
              </ul>

              {/* Subscribe button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={busyPlanId === plan.id}
                className={`btn-press w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 ${
                  isRecommended
                    ? "bg-accent hover:bg-accent-hover hover:shadow-accent"
                    : "bg-bg-elevated hover:bg-accent hover:shadow-accent"
                }`}
              >
                {busyPlanId === plan.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    处理中...
                  </span>
                ) : (
                  "立即订阅"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <Zap className="mx-auto h-10 w-10 text-text-muted animate-float" />
          <p className="mt-4 text-text-muted">暂无该分类的套餐。</p>
        </div>
      )}

      {/* Payment Modal */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm glass rounded-2xl p-6 animate-scale-in shadow-lg">
            <h3 className="mb-1 text-lg font-semibold">确认订单</h3>
            <p className="mb-4 text-sm text-text-muted">模拟支付（演示用）</p>

            <div className="mb-4 space-y-2.5 rounded-xl bg-bg-card p-4 text-sm">
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
              <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
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
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card disabled:opacity-60"
              >
                取消
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-press flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
              >
                {paying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    支付中...
                  </span>
                ) : (
                  "确认支付"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}