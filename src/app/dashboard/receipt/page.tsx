import { createClient } from "@/lib/supabase/server";
import ReceiptClient from "@/components/ReceiptClient";

export const dynamic = "force-dynamic";

export default async function ReceiptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-red-400">请先登录</p>;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "fulfilling")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-400">加载收货订单失败：{error.message}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">收货管理</h1>
      <ReceiptClient orders={data ?? []} />
    </div>
  );
}