-- Inbox privada: receber um evento não concede acesso ao produto.
create table public.asaas_webhook_events (
  event_id text primary key,
  event_type text not null,
  checkout_id text,
  checkout_status text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.asaas_webhook_events enable row level security;
revoke all on public.asaas_webhook_events from anon, authenticated;
grant select, insert, update on public.asaas_webhook_events to service_role;
create index asaas_webhook_events_pending_idx
  on public.asaas_webhook_events (received_at) where processed_at is null;
comment on table public.asaas_webhook_events is
  'Eventos Asaas deduplicados; processamento comercial pendente da definição do produto.';

create table public.asaas_orders (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  attempt_hash text not null,
  attempt jsonb not null,
  result jsonb not null,
  product_name text not null,
  amount_cents integer not null check (amount_cents = 9700),
  checkout_id text unique,
  checkout_url text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'canceled', 'expired')),
  created_at timestamptz not null default now(),
  unique (user_id, attempt_hash)
);
alter table public.asaas_orders enable row level security;
revoke all on public.asaas_orders from anon, authenticated;
grant select, insert, update on public.asaas_orders to service_role;

-- A reconciliation trigger also handles webhooks arriving before checkout persistence.
create function public.reconcile_asaas_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
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
create trigger reconcile_asaas_order before insert or update on public.asaas_orders
for each row execute function public.reconcile_asaas_order();

create function public.process_asaas_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.asaas_orders set checkout_id = checkout_id where checkout_id = new.checkout_id;
  return new;
end $$;
create trigger process_asaas_event after insert on public.asaas_webhook_events
for each row execute function public.process_asaas_event();
revoke all on function public.reconcile_asaas_order() from public;
revoke all on function public.process_asaas_event() from public;
