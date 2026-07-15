begin;

create extension if not exists "pgcrypto" with schema extensions;

-- Samuel Runtime: histórico durável, acessado no servidor por sessão HttpOnly.
create table if not exists public.samuel_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  company_ref text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_hash text not null,
  title text not null default 'Nova conversa',
  status text not null default 'active' check (status in ('active', 'archived')),
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.samuel_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.samuel_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  status text not null default 'complete' check (status in ('streaming', 'complete', 'cancelled', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists samuel_conversations_session_company_idx
  on public.samuel_conversations (session_hash, company_ref, last_message_at desc);
create index if not exists samuel_conversations_user_idx
  on public.samuel_conversations (user_id, last_message_at desc) where user_id is not null;
create index if not exists samuel_messages_conversation_created_idx
  on public.samuel_messages (conversation_id, created_at asc);

alter table public.samuel_conversations enable row level security;
alter table public.samuel_messages enable row level security;

drop policy if exists "samuel_conversations_select_member" on public.samuel_conversations;
create policy "samuel_conversations_select_member"
  on public.samuel_conversations for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = (select auth.uid())
    )
  );

drop policy if exists "samuel_conversations_insert_member" on public.samuel_conversations;
create policy "samuel_conversations_insert_member"
  on public.samuel_conversations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      company_id is null
      or exists (
        select 1 from public.company_members member
        where member.company_id = samuel_conversations.company_id
          and member.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "samuel_conversations_update_member" on public.samuel_conversations;
create policy "samuel_conversations_update_member"
  on public.samuel_conversations for update to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = (select auth.uid())
    )
  );

drop policy if exists "samuel_messages_select_member" on public.samuel_messages;
create policy "samuel_messages_select_member"
  on public.samuel_messages for select to authenticated
  using (
    exists (
      select 1 from public.samuel_conversations conversation
      where conversation.id = samuel_messages.conversation_id
        and (
          conversation.user_id = (select auth.uid())
          or exists (
            select 1 from public.company_members member
            where member.company_id = conversation.company_id
              and member.user_id = (select auth.uid())
          )
        )
    )
  );

drop policy if exists "samuel_messages_insert_member" on public.samuel_messages;
create policy "samuel_messages_insert_member"
  on public.samuel_messages for insert to authenticated
  with check (
    exists (
      select 1 from public.samuel_conversations conversation
      where conversation.id = samuel_messages.conversation_id
        and (
          conversation.user_id = (select auth.uid())
          or exists (
            select 1 from public.company_members member
            where member.company_id = conversation.company_id
              and member.user_id = (select auth.uid())
          )
        )
    )
  );

create or replace function public.touch_samuel_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.samuel_conversations
  set last_message_at = new.created_at,
      updated_at = timezone('utc', now())
  where id = new.conversation_id;
  return new;
end;
$$;

revoke execute on function public.touch_samuel_conversation() from public, anon, authenticated;

drop trigger if exists on_samuel_message_created on public.samuel_messages;
create trigger on_samuel_message_created
after insert on public.samuel_messages
for each row execute procedure public.touch_samuel_conversation();

-- Executive Inbox: persistência privada, ligada à sessão server-side.
create table if not exists public.executive_inbox_actions (
  session_hash text not null,
  company_ref text not null,
  company_id uuid references public.companies(id) on delete cascade,
  id text not null,
  item_id text not null,
  item_title text not null,
  item_type text not null check (item_type in ('alert', 'recommendation', 'priority', 'watcher', 'action', 'decision', 'timeline', 'ceo')),
  action text not null check (action in ('approve', 'complete', 'dismiss', 'defer')),
  status text not null check (status in ('pending', 'urgent', 'resolved', 'archived', 'delegated', 'executing')),
  action_at timestamptz not null,
  origin text not null,
  area text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (session_hash, company_ref, id)
);

create index if not exists executive_inbox_actions_session_company_idx
  on public.executive_inbox_actions (session_hash, company_ref, action_at asc);

alter table public.executive_inbox_actions enable row level security;
revoke all on table public.executive_inbox_actions from anon, authenticated;

-- Endurecimento das funções existentes sinalizadas pelo Security Advisor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles(id)
  values(new.id)
  on conflict do nothing;
  return new;
end;
$$;

create or replace function public.current_company()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select company_id
  from public.user_profiles
  where id = (select auth.uid())
  limit 1;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view own company" on public.companies;
create policy "Users can view own company"
  on public.companies for select to authenticated
  using (id = (select public.current_company()));

drop policy if exists "Admins update own company" on public.companies;
create policy "Admins update own company"
  on public.companies for update to authenticated
  using (id = (select public.current_company()))
  with check (id = (select public.current_company()));

grant select, insert, update, delete on public.samuel_conversations to service_role;
grant select, insert, update, delete on public.samuel_messages to service_role;
grant select, insert, update, delete on public.executive_inbox_actions to service_role;

commit;
