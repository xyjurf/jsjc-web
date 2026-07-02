import { createClient } from "@/lib/supabase/server";
import AdminUsersClient from "@/components/AdminUsersClient";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="text-red-400">加载失败：{error.message}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">用户列表</h1>
      <AdminUsersClient users={(data ?? []) as Profile[]} />
    </div>
  );
}
