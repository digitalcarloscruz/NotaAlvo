-- Inventário read-only do banco NotaAlvo (Supabase Cloud ou Green).
-- Não contém secrets. Não altera nada: só SELECT em catálogos e contagens.
-- Execução (exemplo, com DATABASE_URL fora do repositório):
--   psql "$DATABASE_URL" -f scripts/matrix/notaalvo/inventory.sql

-- 1. Tamanho e schemas
select 'db_size' as k, pg_size_pretty(pg_database_size(current_database())) as v
union all select 'schemas', string_agg(nspname, ',' order by nspname) from pg_namespace where nspname not like 'pg\_%' and nspname <> 'information_schema'
union all select 'extensions', string_agg(extname || ' ' || extversion, ', ' order by extname) from pg_extension
union all select 'public_tables', count(*)::text from pg_tables where schemaname = 'public'
union all select 'public_tables_rls_off', coalesce(string_agg(c.relname, ','), 'none') from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
union all select 'policies_public', count(*)::text from pg_policies where schemaname = 'public'
union all select 'functions_public', count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'
union all select 'triggers_user', count(*)::text from pg_trigger where not tgisinternal
union all select 'publications', coalesce(string_agg(pubname, ','), 'none') from pg_publication
union all select 'pg_cron', case when exists (select 1 from pg_extension where extname = 'pg_cron') then 'yes' else 'no' end
union all select 'storage_buckets', coalesce(string_agg(id || case when public then '(public)' else '(private)' end, ','), 'none') from storage.buckets
union all select 'storage_objects', count(*)::text from storage.objects
union all select 'auth_users', count(*)::text from auth.users;

-- 2. Tabelas por tamanho (com RLS)
select c.relname as table_name, pg_size_pretty(pg_total_relation_size(c.oid)) as size, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by pg_total_relation_size(c.oid) desc;

-- 3. Funções públicas (SECURITY DEFINER exige revisão de search_path e grants)
select p.proname as fn, pg_get_function_identity_arguments(p.oid) as args, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by 1;

-- 4. Triggers de usuário (public, auth, storage)
select c.relname as table_name, n.nspname as schema_name, t.tgname as trigger_name, p.proname as fn, t.tgenabled
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
where not t.tgisinternal and n.nspname in ('public', 'auth', 'storage')
order by 2, 1, 3;

-- 5. Grants diretos para anon/authenticated em tabelas públicas (revisar contra RLS)
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;

-- 6. Migrações aplicadas (Supabase CLI)
select version, name from supabase_migrations.schema_migrations order by version;
