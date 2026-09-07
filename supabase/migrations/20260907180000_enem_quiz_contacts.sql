-- Contacts submitted voluntarily after the free quiz; no marketing opt-in implied.
create table public.enem_quiz_contacts (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) <= 254),
  phone text,
  attempt jsonb not null,
  result jsonb not null,
  privacy_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.enem_quiz_contacts enable row level security;
revoke all on public.enem_quiz_contacts from anon, authenticated;
grant select, insert, update, delete on public.enem_quiz_contacts to service_role;
