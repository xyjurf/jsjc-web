import { createClient } from "@/lib/supabase/server";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatCard {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

async function getStats() {
  const supabase = await createClient();

  const [pendingRes, paidRes, fulfillingRes, completedRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "fulfilling"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  return {
    pending: pendingRes.count ?? 0,
    paid: paidRes.count ?? 0,
    fulfilling: fulfillingRes.count ?? 0,
    completed: completedRes.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards: StatCard[] = [
    {
      label: "待确认支付",
      count: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-400",
    },
    {
      label: "待发货",
      count: stats.paid,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-blue-400",
    },
    {
      label: "已发货",
      count: stats.fulfilling,
      icon: <Truck className="h-5 w-5" />,
      color: "text-accent",
    },
    {
      label: "已完成",
      count: stats.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-400",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">管理面板</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="card-hover rounded-2xl border border-border bg-bg-card p-5 animate-fade-in-up"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-text-muted">{card.label}</span>
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{card.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}