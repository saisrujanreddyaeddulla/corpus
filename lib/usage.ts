import { supabaseAdmin } from "./supabase";
import { PLAN_LIMITS, PlanKey } from "./stripe";

// Ensures a usage_counters row exists for the current month, resetting
// counts if a new month has started.
async function currentPeriod(workspaceId: string) {
  const db = supabaseAdmin();
  const periodStart = new Date();
  periodStart.setDate(1);
  const periodStartStr = periodStart.toISOString().slice(0, 10);

  const { data: existing } = await db
    .from("usage_counters")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!existing) {
    const { data } = await db
      .from("usage_counters")
      .insert({ workspace_id: workspaceId, period_start: periodStartStr })
      .select()
      .single();
    return data;
  }

  if (existing.period_start !== periodStartStr) {
    const { data } = await db
      .from("usage_counters")
      .update({ period_start: periodStartStr, queries_used: 0 })
      .eq("workspace_id", workspaceId)
      .select()
      .single();
    return data;
  }

  return existing;
}

export async function checkQueryLimit(workspaceId: string, plan: PlanKey) {
  const period = await currentPeriod(workspaceId);
  const limit = PLAN_LIMITS[plan].maxQueriesPerMonth;
  return { allowed: period.queries_used < limit, used: period.queries_used, limit };
}

export async function incrementQueryUsage(workspaceId: string) {
  const db = supabaseAdmin();
  const period = await currentPeriod(workspaceId);
  await db
    .from("usage_counters")
    .update({ queries_used: period.queries_used + 1 })
    .eq("workspace_id", workspaceId);
}

export async function checkDocumentLimit(workspaceId: string, plan: PlanKey) {
  const db = supabaseAdmin();
  const { count } = await db
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);
  const limit = PLAN_LIMITS[plan].maxDocuments;
  return { allowed: (count ?? 0) < limit, used: count ?? 0, limit };
}
