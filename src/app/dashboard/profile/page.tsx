import { createClient } from "@/lib/supabase/server";
import type { Profile, Subscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  const { count: subCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const p = profile as Profile | null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">个人中心</h1>
      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg border border-border bg-bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">账户信息</h3>
          <dl className="space-y-3 text-sm">
            <Row label="邮箱" value={user?.email ?? "—"} />
            <Row label="用户 ID" value={user?.id ?? "—"} mono />
            <Row
              label="账户余额"
              value={`¥ ${Number(p?.balance ?? 0).toFixed(2)}`}
            />
            <Row label="活跃订阅" value={`${subCount ?? 0} 个`} />
            <Row
              label="注册时间"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleString("zh-CN")
                  : "—"
              }
            />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : ""}>{value}</dd>
    </div>
  );
}
