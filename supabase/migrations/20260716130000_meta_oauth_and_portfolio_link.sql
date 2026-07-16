-- Meta OAuth connections + link portfolio → operational companies

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

alter table public.meta_oauth_connections enable row level security;

create policy "meta_oauth_connections_select_members"
  on public.meta_oauth_connections
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = meta_oauth_connections.company_id
        and cm.user_id = auth.uid()
    )
  );

alter table public.portfolio_companies
  add column if not exists operational_company_id uuid
    references public.companies(id) on delete set null;

create index if not exists portfolio_companies_operational_company_idx
  on public.portfolio_companies (operational_company_id);
