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
  checkout: z.object({ id: z.string().min(1).max(200), status: z.string().max(50) }).optional(),
});
