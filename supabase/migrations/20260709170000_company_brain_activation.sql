-- Story 002.0 — Company Brain activation fields

alter table public.portfolio_companies
  add column if not exists brain_status text not null default 'inactive',
  add column if not exists brain_activated_at timestamptz;

alter table public.portfolio_companies
  drop constraint if exists portfolio_companies_brain_status_check;

alter table public.portfolio_companies
  add constraint portfolio_companies_brain_status_check
  check (brain_status in ('inactive', 'active'));

create policy "portfolio_companies_update"
  on public.portfolio_companies
  for update
  using (true)
  with check (true);
