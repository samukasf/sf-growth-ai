-- Synchronize the production schema with the authenticated multi-company app.

create extension if not exists pgcrypto;

alter table public.companies
  add column if not exists slug text,
  add column if not exists company_size text,
  add column if not exists business_stage text,
  add column if not exists logo_url text,
  add column if not exists description text,
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.companies
set slug = concat(
  trim(both '-' from regexp_replace(lower(coalesce(name, 'empresa')), '[^a-z0-9]+', '-', 'g')),
  '-',
  left(id::text, 8)
)
where slug is null or btrim(slug) = '';

create unique index if not exists companies_slug_unique_idx
  on public.companies (slug);

create table if not exists public.portfolio_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  responsible_name text,
  email text,
  phone text,
  website text,
  instagram text,
  facebook text,
  city text,
  country text,
  employee_count text,
  main_objective text,
  notes text,
  operational_company_id uuid references public.companies(id) on delete cascade,
  brain_status text not null default 'inactive'
    check (brain_status in ('inactive', 'active')),
  brain_activated_at timestamptz,
  first_conversation_status text not null default 'pending'
    check (first_conversation_status in ('pending', 'deferred', 'completed')),
  first_conversation_answers jsonb not null default '{}'::jsonb,
  first_conversation_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_companies_created_at_idx
  on public.portfolio_companies (created_at desc);
create unique index if not exists portfolio_companies_operational_company_unique_idx
  on public.portfolio_companies (operational_company_id)
  where operational_company_id is not null;

insert into public.portfolio_companies (
  name, industry, website, instagram, city, country, operational_company_id
)
select
  coalesce(company.name, 'Empresa'),
  coalesce(company.industry, 'Não informado'),
  company.website,
  company.instagram,
  company.city,
  company.country,
  company.id
from public.companies company
where not exists (
  select 1 from public.portfolio_companies portfolio
  where portfolio.operational_company_id = company.id
);

create table if not exists public.meta_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  page_id text not null,
  page_name text,
  access_token text not null,
  token_type text,
  expires_at timestamptz,
  scopes text,
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint meta_oauth_connections_company_unique unique (company_id)
);

create index if not exists meta_oauth_connections_company_idx
  on public.meta_oauth_connections (company_id);

alter table public.executive_inbox_actions
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists row_id uuid default gen_random_uuid();

update public.executive_inbox_actions set row_id = gen_random_uuid() where row_id is null;
alter table public.executive_inbox_actions alter column row_id set not null;

do $$
declare
  current_primary_key text;
begin
  select constraint_name into current_primary_key
  from information_schema.table_constraints
  where table_schema = 'public'
    and table_name = 'executive_inbox_actions'
    and constraint_type = 'PRIMARY KEY'
  limit 1;

  if current_primary_key is not null and current_primary_key <> 'executive_inbox_actions_row_pkey' then
    execute format('alter table public.executive_inbox_actions drop constraint %I', current_primary_key);
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'executive_inbox_actions'
      and constraint_name = 'executive_inbox_actions_row_pkey'
  ) then
    alter table public.executive_inbox_actions
      add constraint executive_inbox_actions_row_pkey primary key (row_id);
  end if;
end $$;

create unique index if not exists executive_inbox_actions_user_session_item_idx
  on public.executive_inbox_actions (user_id, session_hash, company_ref, id);

-- Existing installations had a single company and no memberships. Preserve access
-- for the already-created accounts while all new companies use explicit ownership.
insert into public.company_members (company_id, user_id, role)
select company.id, profile.id,
  case when profile.role = 'admin' then 'admin' else 'member' end
from public.companies company
cross join public.user_profiles profile
where (select count(*) from public.companies) = 1
  and not exists (
    select 1 from public.company_members member
    where member.company_id = company.id and member.user_id = profile.id
  )
on conflict (company_id, user_id) do nothing;

update public.user_profiles profile
set company_id = company.id
from public.companies company
where (select count(*) from public.companies) = 1
  and profile.company_id is null;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members member
    where member.company_id = target_company_id
      and member.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_company_member(uuid) from public;
grant execute on function private.is_company_member(uuid) to authenticated, service_role;

alter table public.portfolio_companies enable row level security;
alter table public.meta_oauth_connections enable row level security;
alter table public.executive_inbox_actions enable row level security;

drop policy if exists "Development public read companies" on public.companies;
drop policy if exists "portfolio_companies_select" on public.portfolio_companies;
drop policy if exists "portfolio_companies_insert" on public.portfolio_companies;
drop policy if exists "portfolio_companies_update" on public.portfolio_companies;
drop policy if exists "portfolio_companies_authenticated_members" on public.portfolio_companies;

create policy "portfolio_companies_authenticated_members"
  on public.portfolio_companies
  for all
  to authenticated
  using (private.is_company_member(operational_company_id))
  with check (private.is_company_member(operational_company_id));

drop policy if exists "companies_authenticated_members" on public.companies;
create policy "companies_authenticated_members"
  on public.companies
  for all
  to authenticated
  using (private.is_company_member(id))
  with check (private.is_company_member(id));

drop policy if exists "company_members_authenticated_members" on public.company_members;
create policy "company_members_authenticated_members"
  on public.company_members
  for select
  to authenticated
  using (private.is_company_member(company_id));

drop policy if exists "user_profiles_company_members" on public.user_profiles;
create policy "user_profiles_company_members"
  on public.user_profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or private.is_company_member(company_id));

do $$
declare
  target_table text;
  old_policy record;
  target_tables text[] := array[
    'business_profiles', 'company_memory', 'executive_brains', 'business_twins',
    'ai_insights', 'ai_tasks', 'growth_reports', 'contacts', 'leads', 'deals',
    'marketing_campaigns', 'revenues', 'expenses', 'invoices', 'bank_accounts',
    'recurring_payments'
  ];
begin
  foreach target_table in array target_tables loop
    if to_regclass(format('public.%I', target_table)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', target_table);

    for old_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
        and roles = array['public']::name[]
    loop
      execute format('drop policy %I on public.%I', old_policy.policyname, target_table);
    end loop;

    execute format('drop policy if exists %I on public.%I',
      target_table || '_authenticated_members', target_table);
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.is_company_member(company_id)) with check (private.is_company_member(company_id))',
      target_table || '_authenticated_members', target_table
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;

grant select, insert, update, delete on public.companies to authenticated;
grant select on public.company_members to authenticated;
grant select on public.user_profiles to authenticated;
grant select, insert, update, delete on public.portfolio_companies to authenticated;

revoke all on table public.meta_oauth_connections from anon, authenticated;
revoke all on table public.google_oauth_connections from anon, authenticated;
revoke all on table public.executive_inbox_actions from anon, authenticated;
grant select, insert, update, delete on public.meta_oauth_connections to service_role;
grant select, insert, update, delete on public.google_oauth_connections to service_role;
grant select, insert, update, delete on public.executive_inbox_actions to service_role;

create index if not exists executive_inbox_actions_user_company_idx
  on public.executive_inbox_actions (user_id, company_ref, action_at asc);
create index if not exists ai_insights_executive_brain_idx
  on public.ai_insights (executive_brain_id);
create index if not exists ai_tasks_executive_brain_idx
  on public.ai_tasks (executive_brain_id);
create index if not exists ai_tasks_insight_idx
  on public.ai_tasks (insight_id);
create index if not exists ai_tasks_assigned_to_idx
  on public.ai_tasks (assigned_to);
create index if not exists deals_lead_idx on public.deals (lead_id);
create index if not exists deals_assigned_to_idx on public.deals (assigned_to);
create index if not exists leads_contact_idx on public.leads (contact_id);
create index if not exists leads_assigned_to_idx on public.leads (assigned_to);
create index if not exists invoices_contact_idx on public.invoices (contact_id);
create index if not exists invoices_deal_idx on public.invoices (deal_id);
create index if not exists expenses_bank_account_idx on public.expenses (bank_account_id);
create index if not exists recurring_payments_bank_account_idx
  on public.recurring_payments (bank_account_id);
create index if not exists revenues_invoice_idx on public.revenues (invoice_id);
create index if not exists revenues_bank_account_idx on public.revenues (bank_account_id);
