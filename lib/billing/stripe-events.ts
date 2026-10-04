import type Stripe from "stripe";
import { ENEM_EXPRESS } from "./enem-express";

export const STRIPE_EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.refunded", "charge.dispute.created", "charge.dispute.closed"] as const;
export function sessionTransition(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment" || session.currency !== "brl" || session.amount_total !== ENEM_EXPRESS.amountCents || session.metadata?.product !== ENEM_EXPRESS.code) throw new Error("Checkout does not match the offer");
  return session.payment_status === "paid" ? "paid" : "pending";
}
