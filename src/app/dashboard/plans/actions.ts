"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrderAction(planId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "请先登录" };

  const { data, error } = await supabase.rpc("create_order", {
    p_plan_id: planId,
  });
  if (error) return { ok: false, error: error.message };

  const order = Array.isArray(data) ? data[0] : data;
  return { ok: true, orderId: order.id };
}

export async function payOrderAction(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "请先登录" };

  const { error } = await supabase.rpc("pay_order", { p_order_id: orderId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  return { ok: true, orderId };
}
