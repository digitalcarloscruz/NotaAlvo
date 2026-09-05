import type { SupabaseClient } from "@supabase/supabase-js";

export type Entitlements = {
  mentorDailyRequests: number;
  noticeMonthlyUploads: number;
  noticeMaxBytes: number;
  opportunityTracking: boolean;
  physicalHistory: boolean;
};

export const PILOT_ENTITLEMENTS: Entitlements = {
  mentorDailyRequests: 30,
  noticeMonthlyUploads: 5,
  noticeMaxBytes: 15 * 1024 * 1024,
  opportunityTracking: true,
  physicalHistory: true,
};

export async function getUserEntitlements(admin: SupabaseClient, userId: string): Promise<{ planCode: string; entitlements: Entitlements }> {
  const { data, error } = await admin.from("user_subscriptions")
    .select("plan_code, subscription_plans(entitlements)")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .or(`current_period_ends_at.is.null,current_period_ends_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Não foi possível verificar o plano.");
  if (!data) {
    const { data: previous, error: historyError } = await admin.from("user_subscriptions").select("id").eq("user_id", userId).eq("plan_code", "enem-express-2026").limit(1).maybeSingle();
    if (historyError) throw new Error("Não foi possível verificar o acesso.");
    if (previous) return { planCode: "expired", entitlements: { ...PILOT_ENTITLEMENTS, mentorDailyRequests: 0, noticeMonthlyUploads: 0, opportunityTracking: false, physicalHistory: false } };
  }
  const relation = data?.subscription_plans as unknown as { entitlements?: Partial<Entitlements> } | null;
  return {
    planCode: data?.plan_code ?? "pilot",
    entitlements: { ...PILOT_ENTITLEMENTS, ...(relation?.entitlements ?? {}) },
  };
}

export async function usageInWindow(admin: SupabaseClient, userId: string, metric: string, since: string) {
  const { data } = await admin.from("usage_events").select("quantity").eq("user_id", userId).eq("metric", metric).gte("created_at", since);
  return (data ?? []).reduce((sum, item) => sum + Number(item.quantity), 0);
}
