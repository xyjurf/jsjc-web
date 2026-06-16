import { createClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/OrdersClient";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-400">加载订单失败：{error.message}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">我的订单</h1>
      <OrdersClient orders={(data ?? []) as Order[]} />
    </div>
  );
}
