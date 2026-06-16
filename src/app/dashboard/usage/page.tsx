import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const subs = (data ?? []) as Subscription[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">流量明细</h1>
      {subs.length === 0 ? (
        <p className="text-text-muted">暂无订阅，无流量数据。</p>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const total = s.traffic_gb;
            const used = Number(s.traffic_used_gb);
            const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
            return (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-bg-card p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.plan_name}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(s.starts_at).toLocaleDateString("zh-CN")} 起 ·{" "}
                      {s.status === "active" ? "生效中" : "已过期"}
                    </p>
                  </div>
                  <span className="text-sm text-text-muted">
                    {used.toFixed(1)} / {total} GB
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
