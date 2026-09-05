import { describe, expect, it } from "vitest";
import { asaasEventSchema, validWebhookToken } from "./webhook";

describe("Asaas webhook", () => {
  const secret = "a".repeat(40);
  it("requires a configured strong token and an exact match", () => {
    expect(validWebhookToken(secret, secret)).toBe(true);
    expect(validWebhookToken(null, secret)).toBe(false);
    expect(validWebhookToken(secret, undefined)).toBe(false);
    expect(validWebhookToken("short", "short")).toBe(false);
    expect(validWebhookToken("b".repeat(40), secret)).toBe(false);
    expect(validWebhookToken(`${secret}x`, secret)).toBe(false);
  });
  it("accepts future fields without retaining payer information", () => {
    expect(asaasEventSchema.parse({ id: "evt_1", event: "CHECKOUT_PAID", checkout: { id: "abc", status: "PAID", customerData: { cpfCnpj: "private" } }, future: true }))
      .toEqual({ id: "evt_1", event: "CHECKOUT_PAID", checkout: { id: "abc", status: "PAID" } });
  });
  it("requires an event identifier for deduplication", () => {
    expect(asaasEventSchema.safeParse({ event: "CHECKOUT_PAID" }).success).toBe(false);
  });
});
