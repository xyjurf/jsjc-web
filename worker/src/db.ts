import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "./config";
import { getLogger } from "./logger";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.serviceRoleKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
  }
  return _supabase;
}

/** Fetch an order by ID (service_role bypasses RLS) */
export async function getOrder(orderId: string) {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
}

/** Claim the oldest paid order for fulfillment with advisory lock */
export async function claimNextOrder(): Promise<any | null> {
  const log = getLogger();
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    log.error({ err: error }, "claimNextOrder query error");
    return null;
  }

  // Mark as fulfilling
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "fulfilling",
      fulfillment_attempts: (data.fulfillment_attempts || 0) + 1,
    })
    .eq("id", data.id)
    .eq("status", "paid"); // optimistic lock

  if (updateErr) {
    log.warn({ err: updateErr, orderId: data.id }, "claimNextOrder update conflict");
    return null;
  }

  return { ...data, status: "fulfilling" };
}

/** Mark order as completed with delivery data */
export async function completeOrder(
  orderId: string,
  deliveryData: Record<string, any>,
  upstreamOrderId?: string
) {
  const { error } = await getSupabase()
    .from("orders")
    .update({
      status: "completed",
      delivery_data: deliveryData,
      upstream_order_id: upstreamOrderId || null,
      fulfilled_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;

  // Also call create_subscription RPC
  const { error: rpcErr } = await getSupabase().rpc("create_subscription", {
    p_order_id: orderId,
  });
  if (rpcErr) throw rpcErr;
}

/** Mark order as failed */
export async function failOrder(orderId: string, error: string) {
  const { error: updateErr } = await getSupabase()
    .from("orders")
    .update({
      status: "failed",
      fulfillment_error: error,
    })
    .eq("id", orderId);

  if (updateErr) throw updateErr;
}

/** Fetch upstream credentials from Supabase Vault (via RPC or raw query with service_role) */
export async function getUpstreamCredentials(): Promise<{
  email: string;
  password: string;
}> {
  const log = getLogger();

  // Try env first (convenient for dev)
  if (CONFIG.upstream.email && CONFIG.upstream.password) {
    return {
      email: CONFIG.upstream.email,
      password: CONFIG.upstream.password,
    };
  }

  // Try vault decrypted_secrets view (requires service_role)
  try {
    const { data, error } = await getSupabase()
      .from("vault_decrypted_secrets") // view name may vary
      .select("name, decrypted_secret")
      .in("name", ["upstream_email", "upstream_password"]);

    if (!error && data && data.length === 2) {
      const email = data.find((r: any) => r.name === "upstream_email")?.decrypted_secret;
      const password = data.find((r: any) => r.name === "upstream_password")?.decrypted_secret;
      if (email && password) return { email, password };
    }
  } catch {
    log.warn("Vault access failed, falling back to env vars");
  }

  throw new Error(
    "No upstream credentials found. Set UPSTREAM_EMAIL/UPSTREAM_PASSWORD env vars or configure Supabase Vault."
  );
}

/** Get plan mappings for the given local plan ID */
export async function getPlanMapping(planId: string): Promise<any | null> {
  const { data, error } = await getSupabase()
    .from("plan_mappings")
    .select("*")
    .eq("local_plan_id", planId)
    .single();

  if (error) return null;
  return data;
}