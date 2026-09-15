import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createAsaasCheckout } from "./asaas";
const order = { orderId: "00000000-0000-4000-8000-000000000001", name: "Nota Alvo — ENEM Express 2026", description: "Preparação", amountCents: 9700, returnUrl: "https://www.notaalvo.com.br/resultadodoquiz", customerData: { name: "Ana Estudante", email: "ana@example.com" } };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("builds the documented production URL when Asaas returns only an id", async () => {
  vi.stubEnv("ASAAS_ENVIRONMENT", "production");
  vi.stubEnv("ASAAS_API_KEY", "test");
  const fetch = vi.fn().mockResolvedValue(Response.json({ id: "session-1" }));
  vi.stubGlobal("fetch", fetch);
  expect(await createAsaasCheckout(order)).toEqual({ id: "session-1", link: "https://asaas.com/checkoutSession/show?id=session-1" });
  const payload = JSON.parse(fetch.mock.calls[0][1].body);
  expect(payload.items[0].value).toBe(97);
  expect(payload.externalReference).toBe(order.orderId);
  expect(payload.chargeTypes).toEqual(["DETACHED"]);
  expect(payload.items[0].name).toBe("Nota Alvo — ENEM Express 2026");
  expect(payload.customerData).toEqual(order.customerData);
});
it("rejects a checkout link outside the provider", async () => {
  vi.stubEnv("ASAAS_ENVIRONMENT", "production");
  vi.stubEnv("ASAAS_API_KEY", "test");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ id: "session-1", link: "https://asaas.com.attacker.test/" })));
  await expect(createAsaasCheckout(order)).rejects.toThrow("Invalid Asaas checkout URL");
});
