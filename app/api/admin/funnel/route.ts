import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isOwnerAdministrator } from "@/lib/auth/roles";

export const runtime = "nodejs";

async function administrator() {
  const session = await createClient();
  const admin = createAdminClient();
  if (!session || !admin) return null;
  const { data } = await session.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await admin.from("profiles").select("account_role").eq("id", data.user.id).maybeSingle();
  return profile?.account_role === "admin" || isOwnerAdministrator(data.user) ? admin : null;
}

export async function GET(request: Request) {
  const admin = await administrator();
  if (!admin) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });
  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days = [1, 7, 30, 90].includes(requested) ? requested : 7;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const count = (table: string, filter?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const query = admin.from(table).select("id", { count: "exact", head: true }).gte("created_at", since);
    return filter ? filter(query) : query;
  };
  const [events, contacts, profiles, orders, paid, recent] = await Promise.all([
    admin.from("funnel_events").select("visitor_id,event").gte("created_at", since).limit(50000),
    count("enem_quiz_contacts"),
    count("profiles"),
    count("asaas_orders"),
    count("asaas_orders", (q) => q.eq("status", "paid")),
    admin.from("enem_quiz_contacts").select("name,email,created_at,result").gte("created_at", since).order("created_at", { ascending: false }).limit(20),
  ]);
  if (events.error) return NextResponse.json({ error: "Execute a migração do funil para abrir este painel." }, { status: 503 });
  const visitors: Record<string, Set<string>> = {};
  for (const row of events.data ?? []) (visitors[row.event] ??= new Set()).add(row.visitor_id);
  const unique = (event: string) => visitors[event]?.size ?? 0;
  const { data: paidRows } = await admin.from("asaas_orders").select("amount_cents").eq("status", "paid").gte("created_at", since);
  return NextResponse.json({
    days,
    steps: {
      quizViews: unique("quiz_view"), quizStarted: unique("quiz_started"), quizCompleted: unique("quiz_completed"),
      contacts: contacts.count ?? 0, resultViews: unique("result_view"), checkoutClicks: unique("checkout_click"),
      signups: profiles.count ?? 0, checkoutsCreated: orders.count ?? 0, paid: paid.count ?? 0,
    },
    revenueCents: (paidRows ?? []).reduce((sum, row) => sum + row.amount_cents, 0),
    recentLeads: (recent.data ?? []).map((lead) => ({ name: lead.name, email: lead.email, createdAt: lead.created_at, correct: (lead.result as { correct?: number } | null)?.correct ?? null })),
  }, { headers: { "Cache-Control": "no-store" } });
}
