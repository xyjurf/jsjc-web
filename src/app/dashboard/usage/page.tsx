import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";
import { BarChart3, Wifi, Clock, HardDrive } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const subs = (data ?? []) as Subscription[];
  const totalGb = subs.reduce((s, x) => s + x.traffic_gb, 0);
  const totalUsed = subs.reduce((s, x) => s + Number(x.traffic_used_gb), 0);
  const totalPct = totalGb > 0 ? Math.min((totalUsed / totalGb) * 100, 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">流量明细</h1>
          <p className="mt-1 text-sm text-text-muted">各订阅流量使用统计</p>
        </div>

        {/* Overall summary bar */}
        {subs.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-5 w-5 text-accent" />
              <span className="font-semibold text-sm">总流量概览</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-700 ease-out"
                style={{ width: `${totalPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span>已用 {totalUsed.toFixed(1)} GB</span>
              <span>{totalPct.toFixed(1)}%</span>
              <span>总计 {totalGb} GB</span>
            </div>
          </div>
        )}

        {subs.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-text-muted animate-float" />
            <p className="mt-4 text-text-muted">暂无订阅，无流量数据。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map((s, idx) => {
              const total = s.traffic_gb;
              const used = Number(s.traffic_used_gb);
              const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
              const isActive = s.status === "active";
              return (
                <div
                  key={s.id}
                  className="card-hover rounded-xl border border-border bg-bg-card p-5 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? "bg-accent/15" : "bg-zinc-500/15"}`}
                      >
                        <Wifi
                          className={`h-5 w-5 ${isActive ? "text-accent" : "text-zinc-400"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{s.plan_name}</p>
                        <p className="text-xs text-text-muted">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(s.starts_at).toLocaleDateString("zh-CN")} 起 ·{" "}
                          {isActive ? "生效中" : "已过期"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">
                        <HardDrive className="inline h-4 w-4 mr-1 text-text-muted" />
                        {used.toFixed(1)} / {total} GB
                      </p>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-bg">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isActive
                          ? "bg-gradient-to-r from-accent to-blue-400"
                          : "bg-gradient-to-r from-zinc-500 to-zinc-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}