-- Durable Executive Inbox actions, isolated by the server-managed workspace session.

create table if not exists public.executive_inbox_actions (
  session_hash text not null,
  company_ref text not null,
  company_id uuid references public.companies(id) on delete cascade,
  id text not null,
  item_id text not null,
  item_title text not null,
  item_type text not null
    check (item_type in ('alert', 'recommendation', 'priority', 'watcher', 'action', 'decision', 'timeline', 'ceo')),
  action text not null
    check (action in ('approve', 'complete', 'dismiss', 'defer')),
  status text not null
    check (status in ('pending', 'urgent', 'resolved', 'archived', 'delegated', 'executing')),
  action_at timestamptz not null,
  origin text not null,
  area text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (session_hash, company_ref, id)
);

create index if not exists executive_inbox_actions_session_company_idx
  on public.executive_inbox_actions (session_hash, company_ref, action_at asc);

alter table public.executive_inbox_actions enable row level security;

-- The browser never accesses this table directly. The service-role server route
-- binds every query to the hashed HttpOnly workspace session.
