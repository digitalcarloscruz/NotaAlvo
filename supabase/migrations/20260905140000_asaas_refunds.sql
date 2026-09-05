-- Apply after the two existing Asaas migrations.
alter table public.asaas_webhook_events add column payment_id text, add column order_reference text;
create index asaas_events_order_reference_idx on public.asaas_webhook_events(order_reference);
create index asaas_events_checkout_idx on public.asaas_webhook_events(checkout_id);
alter table public.asaas_orders drop constraint asaas_orders_status_check;
alter table public.asaas_orders add constraint asaas_orders_status_check
  check (status in ('pending','paid','canceled','expired','revoked'));
create or replace function public.reconcile_asaas_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.asaas_webhook_events e
    where (e.checkout_id = new.checkout_id or e.order_reference = new.id::text)
    and e.event_type in ('PAYMENT_REFUNDED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE')) then
    new.status := 'revoked';
    update public.asaas_webhook_events e set processed_at = now()
      where (e.checkout_id = new.checkout_id or e.order_reference = new.id::text)
      and e.event_type in ('PAYMENT_REFUNDED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE');
    return new;
  end if;
  if new.status = 'revoked' then return new; end if;
  if new.checkout_id is not null then
    if exists (select 1 from public.asaas_webhook_events where checkout_id = new.checkout_id and event_type = 'CHECKOUT_PAID') then
      new.status := 'paid';
    elsif new.status <> 'paid' then
      select case event_type when 'CHECKOUT_CANCELED' then 'canceled' else 'expired' end
        into new.status from public.asaas_webhook_events
        where checkout_id = new.checkout_id and event_type in ('CHECKOUT_CANCELED', 'CHECKOUT_EXPIRED')
        order by received_at desc limit 1;
      new.status := coalesce(new.status, 'pending');
    end if;
    update public.asaas_webhook_events set processed_at = now()
      where checkout_id = new.checkout_id and processed_at is null
      and event_type in ('CHECKOUT_PAID', 'CHECKOUT_CANCELED', 'CHECKOUT_EXPIRED', 'CHECKOUT_CREATED');
  end if;
  return new;
end $$;
create or replace function public.activate_enem_express() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'revoked' then
    update public.user_subscriptions set status = 'canceled', updated_at = now()
      where user_id = new.user_id and provider = 'asaas' and external_subscription_id = new.id::text;
    return new;
  end if;
  if new.status <> 'paid' or new.product_name <> 'ENEM Express'
    or now() >= timestamptz '2026-11-16 00:00:00-03' then return new; end if;
  -- Serialize purchases belonging to the same account.
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if exists (select 1 from public.user_subscriptions where user_id = new.user_id
    and plan_code = 'enem-express-2026' and status = 'active') then return new; end if;
  update public.user_subscriptions set status = 'canceled', updated_at = now()
    where user_id = new.user_id and status in ('trialing', 'active');
  insert into public.user_subscriptions(user_id, plan_code, status, provider,
    external_subscription_id, current_period_ends_at)
  values (new.user_id, 'enem-express-2026', 'active', 'asaas', new.id::text,
    timestamptz '2026-11-16 00:00:00-03');
  return new;
end $$;

create or replace function public.process_asaas_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.asaas_orders set checkout_id = checkout_id
    where checkout_id = new.checkout_id or id::text = new.order_reference;
  if found then
    update public.asaas_webhook_events set processed_at = now() where event_id = new.event_id
      and event_type in ('PAYMENT_REFUNDED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE');
  end if;
  return new;
end $$;
-- Reconcile already received events. Revoked orders require manual review before reinstatement.
update public.asaas_orders set checkout_id = checkout_id;
