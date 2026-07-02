import { createClient } from "@/lib/supabase/server";
import PlanMappingsClient from "@/components/PlanMappingsClient";
import type { Plan, PlanMapping } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const supabase = await createClient();

  const [plansRes, mappingsRes] = await Promise.all([
    supabase.from("plans").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("plan_mappings").select("*").order("created_at"),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">套餐映射配置</h1>
      <p className="mb-6 text-sm text-text-muted">
        配置本站套餐对应的上游网站套餐，Worker 将据此自动购买。
      </p>
      <PlanMappingsClient
        plans={(plansRes.data ?? []) as Plan[]}
        mappings={(mappingsRes.data ?? []) as PlanMapping[]}
      />
    </div>
  );
}
