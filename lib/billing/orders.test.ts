import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("reconciles early and repeated events without reverting paid orders", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key);");
    await db.exec(readFileSync("supabase/migrations/20260905120000_asaas_webhook_inbox.sql", "utf8"));
    const plans = readFileSync("supabase/migrations/20260828090000_pilot_operations.sql", "utf8").split("create table if not exists public.usage_events")[0];
    await db.exec(plans);
    await db.exec(readFileSync("supabase/migrations/20260905130000_enem_express.sql", "utf8"));
    await db.exec(`insert into auth.users values ('00000000-0000-4000-8000-000000000001');
      insert into public.asaas_orders (id,user_id,attempt_hash,attempt,result,product_name,amount_cents)
      values ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','hash','{}','{}','ENEM Express',9700);
      insert into public.asaas_webhook_events(event_id,event_type,checkout_id) values ('evt1','CHECKOUT_PAID','checkout1');
      update public.asaas_orders set checkout_id='checkout1';`);
    expect((await db.query<{status:string}>("select status from public.asaas_orders")).rows[0].status).toBe("paid");
    await db.exec(`insert into public.asaas_webhook_events(event_id,event_type,checkout_id) values ('evt1','CHECKOUT_PAID','checkout1') on conflict do nothing;
      insert into public.asaas_webhook_events(event_id,event_type,checkout_id) values ('evt2','CHECKOUT_EXPIRED','checkout1');`);
    expect((await db.query<{status:string}>("select status from public.asaas_orders")).rows[0].status).toBe("paid");
    expect((await db.query("select * from public.asaas_webhook_events where processed_at is null")).rows).toHaveLength(0);
    expect((await db.query("select * from public.asaas_webhook_events")).rows).toHaveLength(2);
    const subscriptions = await db.query<{plan_code:string; status:string; ends:string}>("select plan_code,status,current_period_ends_at::text as ends from public.user_subscriptions");
    if (Date.now() < Date.parse("2026-11-16T03:00:00Z")) {
      expect(subscriptions.rows).toHaveLength(1);
      expect(subscriptions.rows[0].plan_code).toBe("enem-express-2026");
      expect(subscriptions.rows[0].status).toBe("active");
      expect(Date.parse(subscriptions.rows[0].ends)).toBe(Date.parse("2026-11-16T03:00:00Z"));
    } else expect(subscriptions.rows).toHaveLength(0);
  } finally { await db.close(); }
});
