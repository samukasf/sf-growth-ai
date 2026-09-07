create table if not exists public.samuel_action_executions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  turn_id text not null,
  request_id text not null,
  action_id text not null,
  idempotency_key text not null,
  risk text not null check (risk in ('read','draft','mutate','sensitive')),
  status text not null check (status in ('started','verified','executed_unverified','failed')),
  confirmation_approved_at timestamptz,
  verification_evidence jsonb,
  error_code text,
  error_message text,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, idempotency_key)
);

create index if not exists samuel_action_executions_company_created_idx
  on public.samuel_action_executions (company_id, created_at desc);

create index if not exists samuel_action_executions_action_created_idx
  on public.samuel_action_executions (action_id, created_at desc);

alter table public.samuel_action_executions enable row level security;

comment on table public.samuel_action_executions is
  'Server-side audit and idempotency ledger for verified Samuel AI actions. RLS intentionally has no client policies; service-role access only.';
