-- Samuel Desktop Agent: server-only device pairing, command queue and local evidence ledger.

create table if not exists public.samuel_desktop_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  device_name text not null,
  platform text not null default 'windows',
  status text not null default 'pending' check (status in ('pending','paired','paused','revoked')),
  token_hash text not null unique,
  command_secret text not null,
  pairing_code_hash text,
  pairing_expires_at timestamptz,
  capabilities jsonb not null default '[]'::jsonb,
  last_seen_at timestamptz,
  paired_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists samuel_desktop_devices_user_idx
  on public.samuel_desktop_devices (user_id, status, created_at desc);
create index if not exists samuel_desktop_devices_pair_idx
  on public.samuel_desktop_devices (pairing_code_hash)
  where pairing_code_hash is not null;

alter table public.samuel_desktop_devices enable row level security;

create table if not exists public.samuel_desktop_commands (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.samuel_desktop_devices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  action text not null,
  args jsonb not null default '{}'::jsonb,
  risk text not null default 'read' check (risk in ('read','draft','mutate','sensitive')),
  status text not null default 'queued' check (status in ('queued','running','verified','failed','cancelled')),
  approval_reference text,
  result jsonb,
  evidence jsonb,
  error_message text,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists samuel_desktop_commands_queue_idx
  on public.samuel_desktop_commands (device_id, status, created_at);
create index if not exists samuel_desktop_commands_user_idx
  on public.samuel_desktop_commands (user_id, created_at desc);

alter table public.samuel_desktop_commands enable row level security;

create table if not exists public.samuel_desktop_events (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.samuel_desktop_devices(id) on delete cascade,
  command_id uuid references public.samuel_desktop_commands(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists samuel_desktop_events_device_idx
  on public.samuel_desktop_events (device_id, created_at desc);
create index if not exists samuel_desktop_events_command_idx
  on public.samuel_desktop_events (command_id, created_at);

alter table public.samuel_desktop_events enable row level security;

comment on table public.samuel_desktop_devices is
  'Server-only Samuel Desktop paired devices. RLS intentionally has no client policies.';
comment on table public.samuel_desktop_commands is
  'Server-only Samuel Desktop command queue and verified result ledger. RLS intentionally has no client policies.';
comment on table public.samuel_desktop_events is
  'Append-only server-side Samuel Desktop execution events. RLS intentionally has no client policies.';
