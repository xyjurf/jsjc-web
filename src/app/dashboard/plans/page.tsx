import { createClient } from "@/lib/supabase/server";
import PlansClient from "@/components/PlansClient";
import type { Plan } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    return (
      <p className="text-red-400">加载套餐失败：{error.message}</p>
    );
  }

  return <PlansClient plans={(data ?? []) as Plan[]} />;
}
