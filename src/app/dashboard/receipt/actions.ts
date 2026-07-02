"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function confirmReceiptAction(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "请先登录" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "fulfilling");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/receipt");
  revalidatePath("/dashboard/orders");
  return { ok: true };
}