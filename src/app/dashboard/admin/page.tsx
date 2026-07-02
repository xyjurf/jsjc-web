import { createClient } from "@/lib/supabase/server";
import { ShoppingCart, Users, DollarSign, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = await createClient();

  const [ordersCount, usersCount, revenueResult, pendingCount] =
    await Promise.all([
      supabase.from("orders").select("count", { count: "exact" }),
      supabase.from("profiles").select("count", { count: "exact" }),
      supabase.from("orders").select("amount").eq("status", "completed"),
      supabase
        .from("orders")
        .select("count", { count: "exact" })
        .in("status", ["paid", "fulfilling"]),
    ]);

  const totalRevenue =
    revenueResult.data?.reduce((sum, o) => sum + Number(o.amount), 0) ?? 0;

  return {
    totalOrders: ordersCount.count ?? 0,
    totalUsers: usersCount.count ?? 0,
    totalRevenue,
    pendingOrders: pendingCount.count ?? 0,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "总订单数",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "用户数",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "总营收",
      value: `¥ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "待处理订单",
      value: stats.pendingOrders,
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">管理面板</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <div className={`rounded-xl ${bg} p-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}