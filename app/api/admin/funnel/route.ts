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
  const [events, contacts, profiles, orders, paid, leadRows, orderRows] = await Promise.all([
    admin.from("funnel_events").select("visitor_id,event").gte("created_at", since).limit(50000),
    count("enem_quiz_contacts"),
    count("profiles"),
    count("asaas_orders"),
    count("asaas_orders", (q) => q.eq("status", "paid")),
    admin.from("enem_quiz_contacts").select("name,email,phone,attempt,result,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
    admin.from("asaas_orders").select("attempt,status,created_at").order("created_at", { ascending: false }).limit(5000),
  ]);
  if (events.error) return NextResponse.json({ error: "Execute a migração do funil para abrir este painel." }, { status: 503 });
  const visitors: Record<string, Set<string>> = {};
  for (const row of events.data ?? []) (visitors[row.event] ??= new Set()).add(row.visitor_id);
  const unique = (event: string) => visitors[event]?.size ?? 0;
  const { data: paidRows } = await admin.from("asaas_orders").select("amount_cents").eq("status", "paid").gte("created_at", since);
  // Pedidos guardam a mesma tentativa do quiz; assim o lead é ligado à compra sem cruzar e-mails.
  type Result = { correct?: number; total?: number; areas?: Array<{ area: string; correct: number; total: number }> };
  const status = new Map<string, "paid" | "checkout">();
  for (const order of orderRows.data ?? []) {
    const key = JSON.stringify(order.attempt);
    if (order.status === "paid") status.set(key, "paid"); else if (!status.has(key)) status.set(key, "checkout");
  }
  const leads = (leadRows.data ?? []).map((lead) => {
    const result = (lead.result ?? {}) as Result;
    return { name: lead.name, email: lead.email, phone: lead.phone as string | null, createdAt: lead.created_at, correct: result.correct ?? null, total: result.total ?? 12, areas: result.areas ?? [], stage: status.get(JSON.stringify(lead.attempt)) ?? "lead" };
  });
  const scored = leads.filter((lead) => lead.correct !== null);
  const distribution = Array.from({ length: 13 }, (_, correct) => scored.filter((lead) => lead.correct === correct).length);
  const bands = [["0 a 4 acertos", 0, 4], ["5 a 8 acertos", 5, 8], ["9 a 12 acertos", 9, 12]].map(([label, min, max]) => {
    const group = scored.filter((lead) => lead.correct! >= (min as number) && lead.correct! <= (max as number));
    return { label, leads: group.length, checkouts: group.filter((lead) => lead.stage !== "lead").length, paid: group.filter((lead) => lead.stage === "paid").length };
  });
  const areaTotals = new Map<string, { correct: number; total: number }>();
  for (const lead of leads) for (const area of lead.areas) { const t = areaTotals.get(area.area) ?? { correct: 0, total: 0 }; t.correct += area.correct; t.total += area.total; areaTotals.set(area.area, t); }
  return NextResponse.json({
    days,
    averageCorrect: scored.length ? Math.round(scored.reduce((sum, lead) => sum + lead.correct!, 0) / scored.length * 10) / 10 : null,
    distribution, bands,
    areas: [...areaTotals].map(([area, t]) => ({ area, rate: t.total ? Math.round(t.correct / t.total * 100) : 0 })),
    leads: leads.slice(0, 100),
    steps: {
      quizViews: unique("quiz_view"), quizStarted: unique("quiz_started"), quizCompleted: unique("quiz_completed"),
      contacts: contacts.count ?? 0, resultViews: unique("result_view"), checkoutClicks: unique("checkout_click"),
      signups: profiles.count ?? 0, checkoutsCreated: orders.count ?? 0, paid: paid.count ?? 0,
    },
    revenueCents: (paidRows ?? []).reduce((sum, row) => sum + row.amount_cents, 0),
  }, { headers: { "Cache-Control": "no-store" } });
}
