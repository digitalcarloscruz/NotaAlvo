import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

export function validWebhookToken(received: string | null, expected: string | undefined) {
  if (!received || !expected || expected.length < 32) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const asaasEventSchema = z.object({
  id: z.string().min(1).max(200),
  event: z.string().min(1).max(100),
  payment: z.object({ id: z.string().min(1).max(200), externalReference: z.string().max(200).nullish(), checkoutSession: z.string().max(200).nullish() }).optional(),
  checkout: z.object({ id: z.string().min(1).max(200), status: z.string().max(50) }).optional(),
}).refine(value => (!value.event.startsWith("CHECKOUT_") || Boolean(value.checkout)) && (!value.event.startsWith("PAYMENT_") || Boolean(value.payment)), "Missing event resource");
