-- Revenue Agent Phase 1. Additive only: reuses contacts/leads/deals/activities.

alter table public.leads add column if not exists revenue_stage text default 'found';
alter table public.leads add column if not exists score_reason jsonb default '{}'::jsonb;
alter table public.leads add column if not exists opportunity_summary text;
alter table public.leads add column if not exists recommended_offer text;
alter table public.leads add column if not exists best_channel text;
alter table public.leads add column if not exists next_best_action text;
alter table public.leads add column if not exists next_action_at timestamptz;
alter table public.leads add column if not exists language text;
alter table public.leads add column if not exists confidence numeric default 0;

create table if not exists public.revenue_icp_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null default 'Default ICP',
  product_service text not null,
  description text,
  problem_solved text,
  primary_benefit text,
  price numeric,
  minimum_price numeric,
  markets jsonb not null default '[]'::jsonb,
  sectors jsonb not null default '[]'::jsonb,
  ideal_customer jsonb not null default '{}'::jsonb,
  arguments jsonb not null default '[]'::jsonb,
  differentiators jsonb not null default '[]'::jsonb,
  proofs jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  allowed_discounts jsonb not null default '{}'::jsonb,
  additional_offers jsonb not null default '[]'::jsonb,
  goals jsonb not null default '{}'::jsonb,
  autonomy_level integer not null default 1 check (autonomy_level between 0 and 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  source_type text not null,
  source_url text,
  external_id text,
  captured_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.lead_enrichment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  field_name text not null,
  field_value jsonb not null,
  source_url text,
  confidence numeric not null default 0 check (confidence between 0 and 1),
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  components jsonb not null default '{}'::jsonb,
  explanation text not null,
  problem_detected text,
  recommended_offer text,
  best_channel text,
  next_best_action text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  icp_profile_id uuid references public.revenue_icp_profiles(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_sequences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_id uuid references public.sales_campaigns(id) on delete cascade,
  name text not null,
  active boolean not null default false,
  stop_on_reply boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sequence_steps (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sequence_id uuid not null references public.sales_sequences(id) on delete cascade,
  step_order integer not null,
  delay_days integer not null default 0,
  channel text not null,
  instructions text,
  requires_approval boolean not null default true,
  unique(sequence_id, step_order)
);

create table if not exists public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  sequence_step_id uuid references public.sequence_steps(id) on delete set null,
  channel text not null,
  recipient text,
  subject text,
  body text not null,
  language text,
  status text not null default 'draft',
  approval_required boolean not null default true,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  idempotency_key text unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel text not null,
  external_thread_id text,
  intent text,
  sentiment text,
  close_probability integer check (close_probability between 0 and 100),
  recommended_response text,
  next_best_action text,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  title text not null,
  action_type text not null,
  due_at timestamptz,
  status text not null default 'open',
  priority integer not null default 2,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_insights (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  insight_type text not null,
  statement text not null,
  evidence jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0 check (confidence between 0 and 1),
  is_causal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales_ai_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  agent text not null,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  estimated_cost numeric,
  success boolean not null default true,
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppression_list (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  channel text not null,
  address text not null,
  reason text,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(company_id, channel, address)
);

create index if not exists idx_revenue_icp_company on public.revenue_icp_profiles(company_id);
create index if not exists idx_lead_sources_lead on public.lead_sources(lead_id);
create index if not exists idx_lead_enrichment_lead on public.lead_enrichment(lead_id);
create index if not exists idx_lead_scores_lead on public.lead_scores(lead_id, created_at desc);
create index if not exists idx_outreach_lead on public.outreach_messages(lead_id, created_at desc);
create index if not exists idx_sales_conversations_lead on public.sales_conversations(lead_id, last_message_at desc);
create index if not exists idx_sales_tasks_due on public.sales_tasks(company_id, status, due_at);
create index if not exists idx_sales_ai_runs_company on public.sales_ai_runs(company_id, created_at desc);

-- RLS: use the existing company_members tenant boundary used by the application.
alter table public.revenue_icp_profiles enable row level security;
alter table public.lead_sources enable row level security;
alter table public.lead_enrichment enable row level security;
alter table public.lead_scores enable row level security;
alter table public.sales_campaigns enable row level security;
alter table public.sales_sequences enable row level security;
alter table public.sequence_steps enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.sales_conversations enable row level security;
alter table public.sales_tasks enable row level security;
alter table public.sales_insights enable row level security;
alter table public.sales_ai_runs enable row level security;
alter table public.suppression_list enable row level security;

-- Policies deliberately mirror existing company-scoped access without service-role bypass in client code.
do $$
declare t text;
begin
  foreach t in array array['revenue_icp_profiles','lead_sources','lead_enrichment','lead_scores','sales_campaigns','sales_sequences','sequence_steps','outreach_messages','sales_conversations','sales_tasks','sales_insights','sales_ai_runs','suppression_list'] loop
    execute format('create policy %I on public.%I for all using (exists (select 1 from public.company_members cm where cm.company_id = %I.company_id and cm.user_id = auth.uid())) with check (exists (select 1 from public.company_members cm where cm.company_id = %I.company_id and cm.user_id = auth.uid()))', 'tenant_' || t, t, t, t);
  end loop;
end $$;
