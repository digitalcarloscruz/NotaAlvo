-- Eventos anônimos do funil de conversão (quiz -> resultado -> matrícula -> pagamento).
create table public.funnel_events (
  id bigint generated always as identity primary key,
  visitor_id text not null check (length(visitor_id) between 8 and 64),
  event text not null check (event in ('quiz_view','quiz_started','quiz_completed','result_view','checkout_click','enrollment_view')),
  path text,
  created_at timestamptz not null default now()
);
create index funnel_events_event_created_idx on public.funnel_events (event, created_at desc);
create index funnel_events_visitor_idx on public.funnel_events (visitor_id);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;
grant select, insert on public.funnel_events to service_role;
