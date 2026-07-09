-- Story 001.0 — Portfolio companies (agency client records)

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
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_companies_created_at_idx
  on public.portfolio_companies (created_at desc);

alter table public.portfolio_companies enable row level security;

create policy "portfolio_companies_select"
  on public.portfolio_companies
  for select
  using (true);

create policy "portfolio_companies_insert"
  on public.portfolio_companies
  for insert
  with check (true);
