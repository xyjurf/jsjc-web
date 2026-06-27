import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Subscription } from "@/lib/types";
import { ShoppingBag, BarChart3, Zap, ArrowRight, Package } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [subsRes, orderRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
  ]);

  const subs = subsRes.data;
  const orderCount = orderRes.count;

  const subscriptions = (subs ?? []) as Subscription[];
  const active = subscriptions[0];

  const totalGb = subscriptions.reduce((s, x) => s + x.traffic_gb, 0);
  const usedGb = subscriptions.reduce((s, x) => s + Number(x.traffic_used_gb), 0);
  const remainGb = Math.max(totalGb - usedGb, 0);
  const usagePct = totalGb > 0 ? Math.min((usedGb / totalGb) * 100, 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="mt-1 text-sm text-text-muted">{user?.email}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="当前套餐"
            value={active ? active.plan_name : "未订阅"}
            icon={<Package className="h-5 w-5" />}
            accent="from-accent/20 to-accent/5"
            index={0}
          />
          <StatCard
            label="剩余流量"
            value={`${remainGb.toFixed(0)} GB`}
            sub={`总 ${totalGb} GB / 已用 ${usedGb.toFixed(1)} GB`}
            icon={<BarChart3 className="h-5 w-5" />}
            accent="from-accent-secondary/20 to-accent-secondary/5"
            index={1}
          />
          <StatCard
            label="已支付订单"
            value={`${orderCount ?? 0} 笔`}
            icon={<ShoppingBag className="h-5 w-5" />}
            accent="from-purple-500/20 to-purple-500/5"
            index={2}
          />
        </div>

        {/* Subscription Detail */}
        {active ? (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">当前订阅详情</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                活跃
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Detail label="套餐名称" value={active.plan_name} />
              <Detail label="套餐流量" value={`${active.traffic_gb} GB`} />
              <Detail
                label="开始时间"
                value={new Date(active.starts_at).toLocaleDateString("zh-CN")}
              />
              <Detail
                label="到期时间"
                value={
                  active.expires_at
                    ? new Date(active.expires_at).toLocaleDateString("zh-CN")
                    : "不限时"
                }
              />
            </div>

            {/* Traffic Progress Bar */}
            {totalGb > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-text-muted">
                  <span>流量使用</span>
                  <span>
                    {usedGb.toFixed(1)} / {totalGb} GB
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-700 ease-out"
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  已使用 {usagePct.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <Zap className="mx-auto h-10 w-10 text-text-muted animate-float" />
            <p className="mt-4 mb-5 text-text-muted text-sm">您还没有任何订阅</p>
            <Link
              href="/dashboard/plans"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-accent btn-press"
            >
              去购买订阅
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  index,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  index: number;
}) {
  return (
    <div
      className={`card-hover rounded-xl border border-border bg-gradient-to-br ${accent} p-5 animate-fade-in-up`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-muted">{label}</p>
        <span className="text-accent opacity-60">{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}