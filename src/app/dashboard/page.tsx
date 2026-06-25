import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Subscription } from "@/lib/types";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="mt-1 text-sm text-text-muted">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="当前套餐" value={active ? active.plan_name : "未订阅"} />
        <StatCard
          label="剩余流量"
          value={`${remainGb.toFixed(0)} GB`}
          sub={`总 ${totalGb} GB / 已用 ${usedGb.toFixed(1)} GB`}
        />
        <StatCard label="已支付订单" value={`${orderCount ?? 0} 笔`} />
      </div>

      {active ? (
        <div className="rounded-lg border border-border bg-bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">当前订阅详情</h3>
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
          {totalGb > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-text-muted">
                <span>流量使用</span>
                <span>
                  {usedGb.toFixed(1)} / {totalGb} GB
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.min((usedGb / totalGb) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-card p-8 text-center">
          <p className="mb-4 text-text-muted">您还没有任何订阅</p>
          <Link
            href="/dashboard/plans"
            className="inline-block rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            去购买订阅
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
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
