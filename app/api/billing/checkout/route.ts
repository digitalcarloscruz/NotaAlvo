import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAsaasCheckout } from "@/lib/billing/asaas";
import { ENEM_EXPRESS, isEnemExpressAvailable } from "@/lib/billing/enem-express";
import { parseQuizAttempt, evaluateQuiz } from "@/lib/enem/landing-quiz";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = process.env.ASAAS_SITE_ORIGIN;
  const product = ENEM_EXPRESS.name;
  if (process.env.ASAAS_CHECKOUT_ENABLED !== "true" || !origin || !isEnemExpressAvailable()) return NextResponse.json({ error: "Matrículas indisponíveis." }, { status: 503 });
  if (request.headers.get("origin") !== origin) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const session = await createClient();
  const admin = createAdminClient();
  if (!session || !admin) return NextResponse.json({ error: "Pagamento indisponível." }, { status: 503 });
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Entre ou crie sua conta para continuar." }, { status: 401 });
  const { data: paid, error: paidError } = await admin.from("asaas_orders").select("id").eq("user_id", auth.user.id).eq("product_name", product).eq("status", "paid").limit(1).maybeSingle();
  if (paidError) return NextResponse.json({ error: "Não foi possível verificar seus pedidos." }, { status: 503 });
  if (paid) return NextResponse.json({ error: "Você já possui o ENEM Express. Acesse sua conta." }, { status: 409 });
  const attempt = parseQuizAttempt(await request.json().catch(() => null));
  const result = attempt && evaluateQuiz(attempt.answers);
  if (!attempt || !result) return NextResponse.json({ error: "Conclua o quiz antes de continuar." }, { status: 422 });
  const attemptHash = createHash("sha256").update(JSON.stringify(attempt)).digest("hex");
  const id = randomUUID();
  const { error } = await admin.from("asaas_orders").insert({ id, user_id: auth.user.id, attempt_hash: attemptHash, attempt, result, product_name: product, amount_cents: 9700 });
  if (error?.code === "23505") {
    const { data: existing } = await admin.from("asaas_orders").select("checkout_url,status,created_at").eq("user_id", auth.user.id).eq("attempt_hash", attemptHash).single();
    if (existing?.status === "paid") return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 409 });
    if (existing?.checkout_url && existing.status === "pending" && Date.now() - Date.parse(existing.created_at) < 60 * 60 * 1000) return NextResponse.json({ url: existing.checkout_url });
    return NextResponse.json({ error: "Já existe um pedido para este quiz. Aguarde a confirmação ou entre em contato com o suporte." }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: "Não foi possível registrar o pedido." }, { status: 500 });
  try {
    const checkout = await createAsaasCheckout({ orderId: id, name: product, description: `${ENEM_EXPRESS.description} Acesso até ${ENEM_EXPRESS.accessEndLabel}.`, amountCents: ENEM_EXPRESS.amountCents, returnUrl: `${origin}/resultadodoquiz` });
    const { error: saveError } = await admin.from("asaas_orders").update({ checkout_id: checkout.id, checkout_url: checkout.link }).eq("id", id);
    if (saveError) throw new Error("Checkout persistence failed");
    return NextResponse.json({ url: checkout.link });
  } catch {
    // Retain the order to avoid double charging after an ambiguous network failure.
    return NextResponse.json({ error: "Não foi possível concluir a abertura do pagamento. Seu pedido foi preservado; procure o suporte antes de tentar novamente." }, { status: 502 });
  }
}
