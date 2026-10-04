import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import Stripe from "stripe";
import { expect, it } from "vitest";
import { sessionTransition } from "./stripe-events";
import { ENEM_EXPRESS } from "./enem-express";

it("requires the full BRL price and paid status before fulfillment", () => {
  const session = { mode: "payment", currency: "brl", amount_total: 9700, metadata: { product: ENEM_EXPRESS.code }, payment_status: "unpaid" } as unknown as Stripe.Checkout.Session;
  expect(sessionTransition(session)).toBe("pending");
  expect(sessionTransition({ ...session, payment_status: "paid" })).toBe("paid");
  expect(() => sessionTransition({ ...session, amount_total: 97 })).toThrow();
  expect(() => sessionTransition({ ...session, currency: "usd" })).toThrow();
});

it("rejects altered payloads and stale webhook signatures", () => {
  const stripe = new Stripe("sk_test_placeholder");
  const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
  const secret = "whsec_test";
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe("evt_test");
  expect(() => stripe.webhooks.constructEvent(payload + " ", header, secret)).toThrow();
  const old = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 1000 });
  expect(() => stripe.webhooks.constructEvent(payload, old, secret)).toThrow();
});

it("atomically grants once, revokes, and resists late paid events", async () => {
  const db = new PGlite();
  const user = "00000000-0000-4000-8000-000000000001";
  const order = "00000000-0000-4000-8000-000000000002";
  try {
    await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key);");
    await db.exec(readFileSync("supabase/migrations/20260828090000_pilot_operations.sql", "utf8").split("create table if not exists public.usage_events")[0]);
    await db.exec("insert into public.subscription_plans(code,name,price_cents,entitlements) values ('enem-express-2026','ENEM Express',9700,'{}');");
    await db.exec(readFileSync("supabase/migrations/20260906120000_stripe_billing.sql", "utf8"));
    await db.query("insert into auth.users values ($1)", [user]);
    await db.query("insert into public.stripe_orders(id,user_id,attempt,result) values($1,$2,'{}','{}')", [order,user]);
    const apply = (id: string, status: string, checkout = "cs_test") => db.query("select public.apply_stripe_event($1,'test',$2,$3,$4,'pi_test')", [id,order,status,checkout]);
    await apply("evt1", "pending");
    expect((await db.query("select * from public.user_subscriptions")).rows).toHaveLength(0);
    await apply("evt2", "paid");
    await apply("evt2", "paid");
    if (Date.now() < Date.parse(ENEM_EXPRESS.accessEndsAt)) expect((await db.query("select * from public.user_subscriptions where status='active' and provider='stripe'")).rows).toHaveLength(1);
    await expect(apply("mismatch", "paid", "cs_other")).rejects.toThrow();
    expect((await db.query("select * from public.stripe_webhook_events where event_id='mismatch'")).rows).toHaveLength(0);
    await apply("refund", "revoked");
    await apply("late", "paid");
    expect((await db.query<{status:string}>("select status from public.stripe_orders")).rows[0].status).toBe("revoked");
    expect((await db.query("select * from public.user_subscriptions where status='active'")).rows).toHaveLength(0);
    expect((await db.query("select * from public.stripe_webhook_events")).rows).toHaveLength(4);
  } finally { await db.close(); }
});
