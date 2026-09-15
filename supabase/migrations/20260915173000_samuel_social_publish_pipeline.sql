create table if not exists public.samuel_social_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  request_key text not null,
  project_id text,
  platform text not null check (platform in ('facebook', 'instagram')),
  asset_path text not null,
  caption text not null default '',
  status text not null default 'queued' check (status in ('queued', 'processing', 'published', 'failed')),
  provider_container_id text,
  provider_post_id text,
  provider_payload jsonb not null default '{}'::jsonb,
  error_message text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint samuel_social_publish_jobs_company_request_unique unique (company_id, request_key)
);

create index if not exists samuel_social_publish_jobs_company_created_idx
  on public.samuel_social_publish_jobs (company_id, created_at desc);

create index if not exists samuel_social_publish_jobs_status_idx
  on public.samuel_social_publish_jobs (status, updated_at desc);

alter table public.samuel_social_publish_jobs enable row level security;

-- Publishing credentials and provider payloads are server-only. Authenticated users
-- reach this table exclusively through company-authorized route handlers.
create policy "samuel_social_publish_jobs_server_only"
  on public.samuel_social_publish_jobs
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
