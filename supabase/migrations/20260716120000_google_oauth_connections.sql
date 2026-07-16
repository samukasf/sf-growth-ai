-- Google OAuth connections (Gmail / Calendar / Drive / Contacts)
-- Used by integrations/gmail token repository.

create table if not exists public.google_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  google_email text,
  scope text not null default '',
  access_token text,
  access_token_expires_at timestamptz,
  refresh_token text not null,
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint google_oauth_connections_company_unique unique (company_id)
);

create index if not exists google_oauth_connections_company_idx
  on public.google_oauth_connections (company_id);

alter table public.google_oauth_connections enable row level security;

-- Service role bypasses RLS; authenticated members of the company can read status.
create policy "google_oauth_connections_select_members"
  on public.google_oauth_connections
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = google_oauth_connections.company_id
        and cm.user_id = auth.uid()
    )
  );
