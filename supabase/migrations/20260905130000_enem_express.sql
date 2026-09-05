insert into public.subscription_plans(code, name, price_cents, entitlements)
values ('enem-express-2026', 'ENEM Express', 9700,
  '{"mentorDailyRequests":30,"noticeMonthlyUploads":5,"noticeMaxBytes":15728640,"opportunityTracking":true,"physicalHistory":true}'::jsonb)
on conflict (code) do update set name = excluded.name, price_cents = excluded.price_cents,
  entitlements = excluded.entitlements, updated_at = now();

create function public.activate_enem_express() returns trigger
language plpgsql security definer set search_path = public as $$
begin
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
revoke all on function public.activate_enem_express() from public;
create trigger activate_enem_express after insert or update on public.asaas_orders
for each row execute function public.activate_enem_express();
