import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEnemExpressAvailable } from "@/lib/billing/enem-express";

export async function GET() {
  const session = await createClient();
  const admin = createAdminClient();
  if (!session || !admin) return NextResponse.json({ error: "Consulta indisponível." }, { status: 503 });
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  const { data, error } = await admin.from("asaas_orders").select("status").eq("user_id", auth.user.id).eq("product_name", "ENEM Express").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível consultar o pedido." }, { status: 503 });
  return NextResponse.json({ status: data?.status === "paid" && !isEnemExpressAvailable() ? "expired" : data?.status ?? "none" }, { headers: { "Cache-Control": "private, no-store" } });
}
