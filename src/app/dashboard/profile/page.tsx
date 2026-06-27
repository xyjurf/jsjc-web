import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { User, Mail, IdCard, Calendar, DollarSign, Signal } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, subRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const profile = profileRes.data;
  const subCount = subRes.count;
  const p = profile as Profile | null;

  const initial = (user?.email ?? "?")[0].toUpperCase();

  return (
    <PageTransition>
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">个人中心</h1>
        <div className="max-w-2xl space-y-5">
          {/* Avatar + Name */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-blue-500 text-xl font-bold text-white shadow-accent">
                {initial}
              </div>
              <div>
                <p className="text-lg font-semibold">{user?.email}</p>
                <p className="text-sm text-text-muted">注册用户</p>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
              账户信息
            </h3>
            <dl className="space-y-1">
              <Row
                label="邮箱"
                value={user?.email ?? "—"}
                icon={<Mail className="h-4 w-4" />}
              />
              <Row
                label="用户 ID"
                value={user?.id ?? "—"}
                icon={<IdCard className="h-4 w-4" />}
                mono
              />
              <Row
                label="账户余额"
                value={`¥ ${Number(p?.balance ?? 0).toFixed(2)}`}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <Row
                label="活跃订阅"
                value={`${subCount ?? 0} 个`}
                icon={<Signal className="h-4 w-4" />}
              />
              <Row
                label="注册时间"
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleString("zh-CN")
                    : "—"
                }
                icon={<Calendar className="h-4 w-4" />}
                last
              />
            </dl>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function Row({
  label,
  value,
  icon,
  mono,
  last,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <dt className="flex items-center gap-2 text-text-muted">
        <span className="opacity-50">{icon}</span>
        {label}
      </dt>
      <dd className={`text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}