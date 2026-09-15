-- SaaS-grade tenant-scoped Meta / WhatsApp connection model.
-- Additive and backwards-compatible with the existing single-page Meta connection.

alter table public.meta_oauth_connections
  add column if not exists user_access_token text,
  add column if not exists meta_user_id text,
  add column if not exists meta_user_name text,
  add column if not exists business_id text,
  add column if not exists instagram_business_id text,
  add column if not exists instagram_username text,
  add column if not exists ad_account_id text,
  add column if not exists ad_account_name text,
  add column if not exists selected_explicitly boolean not null default false;

-- Preserve any already-working connection as explicitly selected.
update public.meta_oauth_connections
set selected_explicitly = true
where page_id is not null
  and access_token is not null
  and selected_explicitly = false;

create table if not exists public.meta_connected_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  connection_id uuid references public.meta_oauth_connections(id) on delete cascade,
  asset_type text not null check (asset_type in ('facebook_page', 'instagram_account', 'ad_account', 'business')),
  asset_id text not null,
  asset_name text,
  parent_asset_id text,
  access_token text,
  metadata jsonb not null default '{}'::jsonb,
  is_selected boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint meta_connected_assets_company_type_id_unique unique (company_id, asset_type, asset_id)
);

create index if not exists meta_connected_assets_company_idx
  on public.meta_connected_assets (company_id);
create index if not exists meta_connected_assets_connection_idx
  on public.meta_connected_assets (connection_id);
create index if not exists meta_connected_assets_selected_idx
  on public.meta_connected_assets (company_id, is_selected)
  where is_selected = true;

alter table public.meta_connected_assets enable row level security;
drop policy if exists "meta_connected_assets_server_only" on public.meta_connected_assets;
create policy "meta_connected_assets_server_only"
  on public.meta_connected_assets
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

create table if not exists public.whatsapp_business_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  meta_business_id text,
  waba_id text not null,
  phone_number_id text not null,
  display_phone_number text,
  verified_name text,
  access_token text not null,
  token_type text,
  scopes text,
  status text not null default 'connected',
  webhook_subscribed boolean not null default false,
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint whatsapp_business_connections_phone_unique unique (phone_number_id)
);

create index if not exists whatsapp_business_connections_company_idx
  on public.whatsapp_business_connections (company_id);
create index if not exists whatsapp_business_connections_waba_idx
  on public.whatsapp_business_connections (waba_id);

alter table public.whatsapp_business_connections enable row level security;
drop policy if exists "whatsapp_business_connections_server_only" on public.whatsapp_business_connections;
create policy "whatsapp_business_connections_server_only"
  on public.whatsapp_business_connections
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
