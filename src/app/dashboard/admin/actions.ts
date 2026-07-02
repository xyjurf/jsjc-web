"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "请先登录" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { supabase, user, error: "无权限" };
  }

  return { supabase, user, error: null };
}

export async function markAsPaidAction(orderId: string): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  const { error } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/orders");
  return { ok: true };
}

export async function shipOrderAction(
  orderId: string,
  deliveryData: string
): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  if (!deliveryData.trim()) {
    return { ok: false, error: "请输入发货信息" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "fulfilling",
      delivery_data: { note: deliveryData.trim(), shipped_at: new Date().toISOString() },
    })
    .eq("id", orderId)
    .eq("status", "paid");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/orders");
  revalidatePath("/dashboard/receipt");
  return { ok: true };
}