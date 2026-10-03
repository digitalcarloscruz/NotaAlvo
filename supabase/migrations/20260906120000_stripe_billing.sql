-- Stripe is the provider for new orders; legacy Asaas records remain auditable.
create table public.stripe_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_name text not null default 'ENEM Express',
  amount_cents integer not null default 9700 check (amount_cents = 9700),
  currency text not null default 'brl' check (currency = 'brl'),
  attempt jsonb not null,
  result jsonb not null,
  checkout_id text unique,
  checkout_url text,
  payment_intent_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','expired','failed','revoked')),
  created_at timestamptz not null default now()
);
create unique index stripe_orders_one_purchase_idx on public.stripe_orders(user_id, product_name)
  where status in ('pending','paid','revoked');
alter table public.stripe_orders enable row level security;
revoke all on public.stripe_orders from anon, authenticated;
grant select, insert, update on public.stripe_orders to service_role;

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  order_id uuid references public.stripe_orders(id),
  received_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;
grant select, insert on public.stripe_webhook_events to service_role;

-- Lock order + account and commit event, payment state and entitlement together.
create function public.apply_stripe_event(
  p_event_id text, p_event_type text, p_order_id uuid, p_status text,
  p_checkout_id text default null, p_payment_intent_id text default null
) returns void language plpgsql security definer set search_path = public as $$
declare purchase public.stripe_orders;
begin
  if p_status not in ('pending','paid','expired','failed','revoked') then raise exception 'Invalid status'; end if;
  select * into purchase from public.stripe_orders where id = p_order_id for update;
  if not found then raise exception 'Unknown order'; end if;
  perform pg_advisory_xact_lock(hashtextextended(purchase.user_id::text, 0));
  if exists(select 1 from public.stripe_webhook_events where event_id = p_event_id) then return; end if;
  if purchase.checkout_id is not null and p_checkout_id is not null and purchase.checkout_id <> p_checkout_id then raise exception 'Session mismatch'; end if;
  if purchase.payment_intent_id is not null and p_payment_intent_id is not null and purchase.payment_intent_id <> p_payment_intent_id then raise exception 'Payment mismatch'; end if;
  insert into public.stripe_webhook_events(event_id,event_type,order_id) values(p_event_id,p_event_type,p_order_id);
  -- Revocation is sticky; favorable disputes require manual review.
  if purchase.status = 'revoked' then return; end if;
  if purchase.status = 'paid' and p_status in ('pending','expired','failed') then return; end if;
  update public.stripe_orders set status = p_status,
    checkout_id = coalesce(checkout_id,p_checkout_id),
    payment_intent_id = coalesce(payment_intent_id,p_payment_intent_id) where id = p_order_id;
  if p_status = 'revoked' then
    update public.user_subscriptions set status = 'canceled', updated_at = now()
      where user_id = purchase.user_id and provider = 'stripe' and external_subscription_id = p_order_id::text;
  elsif p_status = 'paid' and now() < timestamptz '2026-11-16 00:00:00-03' then
    if exists(select 1 from public.user_subscriptions where user_id = purchase.user_id and plan_code = 'enem-express-2026' and status = 'active' and current_period_ends_at > now()) then return; end if;
    update public.user_subscriptions set status = 'canceled', updated_at = now() where user_id = purchase.user_id and status in ('active','trialing');
    insert into public.user_subscriptions(user_id,plan_code,status,provider,external_subscription_id,current_period_ends_at)
      values(purchase.user_id,'enem-express-2026','active','stripe',p_order_id::text,timestamptz '2026-11-16 00:00:00-03');
  end if;
end $$;
revoke all on function public.apply_stripe_event(text,text,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_stripe_event(text,text,uuid,text,text,text) to service_role;
