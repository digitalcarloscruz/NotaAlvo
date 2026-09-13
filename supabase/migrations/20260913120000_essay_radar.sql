-- One shared, source-grounded editorial edition per week. Generation is server-only.
create table if not exists public.essay_radar_weeks (
  week_start date primary key,
  payload jsonb,
  generated_at timestamptz,
  lease_until timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.essay_radar_weeks enable row level security;
revoke all on public.essay_radar_weeks from anon, authenticated;
grant select on public.essay_radar_weeks to authenticated;
grant all on public.essay_radar_weeks to service_role;
create policy essay_radar_read on public.essay_radar_weeks for select to authenticated using (true);

create or replace function public.claim_essay_radar_week(p_week date)
returns boolean language plpgsql security definer set search_path = public as $$
declare claimed date;
begin
  insert into public.essay_radar_weeks (week_start, lease_until, attempts)
  values (p_week, now() + interval '5 minutes', 1)
  on conflict (week_start) do update
    set lease_until = now() + interval '5 minutes', attempts = essay_radar_weeks.attempts + 1
    where essay_radar_weeks.payload is null and essay_radar_weeks.lease_until < now()
      and essay_radar_weeks.attempts < 3
  returning week_start into claimed;
  return claimed is not null;
end $$;
revoke all on function public.claim_essay_radar_week(date) from public, anon, authenticated;
grant execute on function public.claim_essay_radar_week(date) to service_role;
