"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Plan, PlanMapping } from "@/lib/types";
import { Loader2, Plus, Trash2, Save, ExternalLink } from "lucide-react";

export default function PlanMappingsClient({
  plans,
  mappings: initialMappings,
}: {
  plans: Plan[];
  mappings: PlanMapping[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mappings, setMappings] = useState(initialMappings);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, {
    upstream_plan_name: string;
    upstream_plan_url: string;
    upstream_plan_id: string;
  }>>({});

  function initEdit(localPlanId: string) {
    const existing = mappings.find((m) => m.local_plan_id === localPlanId);
    setEditing((prev) => ({
      ...prev,
      [localPlanId]: {
        upstream_plan_name: existing?.upstream_plan_name ?? "",
        upstream_plan_url: existing?.upstream_plan_url ?? "",
        upstream_plan_id: existing?.upstream_plan_id ?? "",
      },
    }));
  }

  async function handleSave(planId: string) {
    const edit = editing[planId];
    if (!edit || !edit.upstream_plan_name.trim()) return;

    setBusyPlanId(planId);
    setError(null);

    const existing = mappings.find((m) => m.local_plan_id === planId);

    if (existing) {
      const { error: err } = await supabase
        .from("plan_mappings")
        .update({
          upstream_plan_name: edit.upstream_plan_name,
          upstream_plan_url: edit.upstream_plan_url || null,
          upstream_plan_id: edit.upstream_plan_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (err) { setError(err.message); setBusyPlanId(null); return; }
    } else {
      const { error: err } = await supabase.from("plan_mappings").insert({
        local_plan_id: planId,
        upstream_plan_name: edit.upstream_plan_name,
        upstream_plan_url: edit.upstream_plan_url || null,
        upstream_plan_id: edit.upstream_plan_id || null,
      });
      if (err) { setError(err.message); setBusyPlanId(null); return; }
    }

    setBusyPlanId(null);
    router.refresh();
  }

  async function handleDelete(planId: string) {
    setBusyPlanId(planId);
    const existing = mappings.find((m) => m.local_plan_id === planId);
    if (existing) {
      await supabase.from("plan_mappings").delete().eq("id", existing.id);
    }
    setMappings((prev) => prev.filter((m) => m.local_plan_id !== planId));
    setBusyPlanId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-elevated/60 text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">本站套餐</th>
              <th className="px-4 py-3 text-left font-medium">价格</th>
              <th className="px-4 py-3 text-left font-medium">上游套餐名称</th>
              <th className="px-4 py-3 text-left font-medium">上游链接（选填）</th>
              <th className="px-4 py-3 text-left font-medium">上游 ID（选填）</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const edit = editing[plan.id];
              const isEditing = !!edit;
              const isBusy = busyPlanId === plan.id;

              return (
                <tr
                  key={plan.id}
                  className="border-t border-border bg-bg-card transition-colors hover:bg-bg-elevated/40"
                >
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-text-muted">
                    ¥ {plan.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={edit.upstream_plan_name}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...p,
                            [plan.id]: { ...edit, upstream_plan_name: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-bg-card px-2 py-1.5 text-sm focus:border-accent/50 focus:outline-none"
                        placeholder="如：不限时2000G套餐"
                      />
                    ) : (
                      <span className="text-text-muted">
                        {mappings.find((m) => m.local_plan_id === plan.id)
                          ?.upstream_plan_name || "未配置"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={edit.upstream_plan_url}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...p,
                            [plan.id]: { ...edit, upstream_plan_url: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-bg-card px-2 py-1.5 text-sm focus:border-accent/50 focus:outline-none"
                        placeholder="上游套餐直达 URL"
                      />
                    ) : (
                      <span className="max-w-[200px] truncate block text-text-muted text-xs">
                        {mappings.find((m) => m.local_plan_id === plan.id)
                          ?.upstream_plan_url || "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={edit.upstream_plan_id}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...p,
                            [plan.id]: { ...edit, upstream_plan_id: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-bg-card px-2 py-1.5 text-sm focus:border-accent/50 focus:outline-none"
                        placeholder="可选"
                      />
                    ) : (
                      <span className="text-text-muted text-xs">
                        {mappings.find((m) => m.local_plan_id === plan.id)
                          ?.upstream_plan_id || "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(plan.id)}
                            disabled={isBusy}
                            className="rounded-lg p-1.5 text-green-400 transition-colors hover:bg-green-500/10 disabled:opacity-60"
                            title="保存"
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setEditing((p) => {
                                const next = { ...p };
                                delete next[plan.id];
                                return next;
                              })
                            }
                            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => initEdit(plan.id)}
                          disabled={isBusy}
                          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                          title="编辑映射"
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {mappings.find((m) => m.local_plan_id === plan.id) && (
                        <button
                          onClick={() => handleDelete(plan.id)}
                          disabled={isBusy}
                          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="删除映射"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}