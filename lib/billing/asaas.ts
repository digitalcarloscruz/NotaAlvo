import "server-only";

import { z } from "zod";

const configSchema = z.object({
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  key: z.string().min(1),
});

// Prices and product descriptions must come from a server-side catalog.
export const checkoutInput = z.object({
  orderId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  amountCents: z.number().int().positive().max(100_000_000),
  returnUrl: z.string().url().refine(value => new URL(value).protocol === "https:"),
  customerData: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
  }).optional(),
});

export class AsaasCheckoutError extends Error {
  constructor(readonly httpStatus: number, readonly codes: string[]) {
    super(`Asaas checkout failed (${httpStatus})`);
    this.name = "AsaasCheckoutError";
  }
}

export async function createAsaasCheckout(input: z.infer<typeof checkoutInput>) {
  const order = checkoutInput.parse(input);
  const config = configSchema.parse({ environment: process.env.ASAAS_ENVIRONMENT, key: process.env.ASAAS_API_KEY });
  const base = config.environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
  const callback = (status: string) => {
    const url = new URL(order.returnUrl);
    url.searchParams.set("checkout", status);
    return url.toString();
  };
  // Do not retry POST automatically: a timeout may still have created the checkout.
  const response = await fetch(`${base}/checkouts`, {
    method: "POST",
    headers: { access_token: config.key, "Content-Type": "application/json", "User-Agent": "NotaAlvo/2.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      billingTypes: ["PIX", "CREDIT_CARD"], chargeTypes: ["DETACHED"], minutesToExpire: 60,
      externalReference: order.orderId,
      callback: { successUrl: callback("returned"), cancelUrl: callback("canceled"), expiredUrl: callback("expired") },
      items: [{ name: order.name, description: order.description, quantity: 1, value: order.amountCents / 100 }],
      ...(order.customerData ? { customerData: order.customerData } : {}),
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // Log only known machine codes. Provider descriptions may contain personal data.
    const allowed = new Set(["invalid_object", "invalid_value", "invalid_action", "invalid_access_token", "access_token_not_found", "access_denied", "unauthorized", "invalid_customer", "invalid_billing_type"]);
    const codes = Array.isArray(body?.errors)
      ? body.errors.slice(0, 5).map((error: { code?: unknown }) => typeof error?.code === "string" && allowed.has(error.code) ? error.code : "unclassified")
      : [];
    throw new AsaasCheckoutError(response.status, codes);
  }
  const result = z.object({ id: z.string().min(1), link: z.string().url().nullish() }).parse(await response.json());
  const url = new URL(result.link ?? `https://${config.environment === "production" ? "asaas.com" : "sandbox.asaas.com"}/checkoutSession/show?id=${encodeURIComponent(result.id)}`);
  const host = config.environment === "production" ? "www.asaas.com" : "sandbox.asaas.com";
  if (url.protocol !== "https:" || ![host, ...(config.environment === "production" ? ["asaas.com"] : [])].includes(url.hostname) || url.username || url.password || url.port) throw new Error("Invalid Asaas checkout URL");
  return { id: result.id, link: url.toString() };
}
