import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";
import { stripeClient } from "@/lib/billing/stripe";
import { STRIPE_EVENTS, sessionTransition } from "@/lib/billing/stripe-events";
import { ENEM_EXPRESS } from "@/lib/billing/enem-express";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook indisponível." }, { status: 503 });
  let stripe: Stripe;
  try { stripe = stripeClient(); } catch { return NextResponse.json({ error: "Stripe indisponível." }, { status: 503 }); }
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret); }
  catch { return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 }); }
  if (event.livemode !== /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "")) return NextResponse.json({ error: "Ambiente incompatível." }, { status: 400 });
  if (!(STRIPE_EVENTS as readonly string[]).includes(event.type)) return NextResponse.json({ received: true });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Banco indisponível." }, { status: 503 });
  try {
    let orderId: string | undefined;
    let state = "pending";
    let checkoutId: string | null = null;
    let paymentId: string | null = null;
    if (event.type.startsWith("checkout.session.")) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.product !== ENEM_EXPRESS.code) return NextResponse.json({ received: true });
      orderId = session.metadata.order_id;
      if (session.client_reference_id !== orderId) throw new Error("Order mismatch");
      state = sessionTransition(session);
      if (state !== "paid" && event.type === "checkout.session.expired") state = "expired";
      if (state !== "paid" && event.type === "checkout.session.async_payment_failed") state = "failed";
      checkoutId = session.id;
      paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
    } else {
      let charge: Stripe.Charge;
      if (event.type === "charge.refunded") charge = event.data.object as Stripe.Charge;
      else {
        const dispute = event.data.object as Stripe.Dispute;
        charge = typeof dispute.charge === "string" ? await stripe.charges.retrieve(dispute.charge) : dispute.charge as Stripe.Charge;
      }
      paymentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;
      if (!paymentId) return NextResponse.json({ received: true });
      const payment = await stripe.paymentIntents.retrieve(paymentId);
      if (payment.metadata.product !== ENEM_EXPRESS.code) return NextResponse.json({ received: true });
      orderId = payment.metadata.order_id;
      if (payment.currency !== "brl" || payment.amount !== 9700) throw new Error("Payment mismatch");
      // Partial refunds do not automatically remove full access; disputes stay blocked until review.
      if (event.type === "charge.refunded" && charge.amount_refunded < charge.amount) return NextResponse.json({ received: true });
      state = "revoked";
    }
    if (state === "paid" && !paymentId) throw new Error("Missing payment intent");
    if (!z.string().uuid().safeParse(orderId).success) throw new Error("Missing order reference");
    const { error } = await admin.rpc("apply_stripe_event", { p_event_id: event.id, p_event_type: event.type, p_order_id: orderId, p_status: state, p_checkout_id: checkoutId, p_payment_intent_id: paymentId });
    if (error) throw new Error("Persistence failed");
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "Não foi possível reconciliar o evento." }, { status: 500 }); }
}
