import "server-only";
import Stripe from "stripe";
import { ENEM_EXPRESS } from "./enem-express";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_(test|live)_/.test(key)) throw new Error("Stripe não configurado.");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}

export function stripeOrigin() {
  const url = new URL(process.env.STRIPE_SITE_ORIGIN ?? "");
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Origem inválida.");
  return url.origin;
}

export async function createStripeCheckout(order: { id: string; user_id: string; created_at: string }) {
  const origin = stripeOrigin();
  // Stable request body + key allow recovery after ambiguous network failures.
  return stripeClient().checkout.sessions.create({
    mode: "payment", client_reference_id: order.id,
    metadata: { order_id: order.id, product: ENEM_EXPRESS.code },
    payment_intent_data: { metadata: { order_id: order.id, product: ENEM_EXPRESS.code } },
    line_items: [{ price_data: { currency: "brl", unit_amount: ENEM_EXPRESS.amountCents,
      product_data: { name: ENEM_EXPRESS.name, description: `${ENEM_EXPRESS.description} Acesso até ${ENEM_EXPRESS.accessEndLabel}.` } }, quantity: 1 }],
    success_url: `${origin}/resultadodoquiz?checkout=returned`,
    cancel_url: `${origin}/resultadodoquiz?checkout=canceled`,
    expires_at: Math.floor(Date.parse(order.created_at) / 1000) + 3600,
  }, { idempotencyKey: `enem-express:${order.id}` });
}
