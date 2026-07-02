import { createClient } from "@/lib/supabase/server";
import AdminOrdersClient from "@/components/AdminOrdersClient";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="text-red-400">加载失败：{error.message}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">订单管理</h1>
      <AdminOrdersClient orders={(data ?? []) as Order[]} />
    </div>
  );
}