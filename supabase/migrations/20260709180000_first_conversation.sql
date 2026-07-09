-- Story 003.0 — First conversation with Samuel

alter table public.portfolio_companies
  add column if not exists first_conversation_status text not null default 'pending',
  add column if not exists first_conversation_answers jsonb not null default '{}'::jsonb,
  add column if not exists first_conversation_completed_at timestamptz;

alter table public.portfolio_companies
  drop constraint if exists portfolio_companies_first_conversation_status_check;

alter table public.portfolio_companies
  add constraint portfolio_companies_first_conversation_status_check
  check (first_conversation_status in ('pending', 'deferred', 'completed'));
