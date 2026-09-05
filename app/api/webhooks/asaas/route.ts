import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { asaasEventSchema, validWebhookToken } from "@/lib/billing/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!token || token.length < 32) return NextResponse.json({ error: "Webhook indisponível." }, { status: 503 });
  if (!validWebhookToken(request.headers.get("asaas-access-token"), token)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Webhook indisponível." }, { status: 503 });
  const event = asaasEventSchema.safeParse(await request.json().catch(() => null));
  if (!event.success) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  // Store only operational fields; payer documents and card data are not retained.
  const { error } = await admin.from("asaas_webhook_events").upsert({
    event_id: event.data.id,
    event_type: event.data.event,
    checkout_id: event.data.checkout?.id ?? event.data.payment?.checkoutSession ?? null,
    payment_id: event.data.payment?.id ?? null,
    order_reference: event.data.payment?.externalReference ?? null,
    checkout_status: event.data.checkout?.status ?? null,
  }, { onConflict: "event_id", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: "Falha ao registrar evento." }, { status: 500 });
  return NextResponse.json({ received: true });
}
