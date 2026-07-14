-- Epic 1 — Samuel AI real conversations and durable messages

create extension if not exists "pgcrypto";

create table if not exists public.samuel_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  company_ref text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_hash text not null,
  title text not null default 'Nova conversa',
  status text not null default 'active'
    check (status in ('active', 'archived')),
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.samuel_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.samuel_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  status text not null default 'complete'
    check (status in ('streaming', 'complete', 'cancelled', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists samuel_conversations_session_company_idx
  on public.samuel_conversations (session_hash, company_ref, last_message_at desc);

create index if not exists samuel_conversations_user_idx
  on public.samuel_conversations (user_id, last_message_at desc)
  where user_id is not null;

create index if not exists samuel_messages_conversation_created_idx
  on public.samuel_messages (conversation_id, created_at asc);

alter table public.samuel_conversations enable row level security;
alter table public.samuel_messages enable row level security;

create policy "samuel_conversations_select_member"
  on public.samuel_conversations
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = auth.uid()
    )
  );

create policy "samuel_conversations_insert_member"
  on public.samuel_conversations
  for insert
  with check (
    user_id = auth.uid()
    and (
      company_id is null
      or exists (
        select 1
        from public.company_members member
        where member.company_id = samuel_conversations.company_id
          and member.user_id = auth.uid()
      )
    )
  );

create policy "samuel_conversations_update_member"
  on public.samuel_conversations
  for update
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.company_members member
      where member.company_id = samuel_conversations.company_id
        and member.user_id = auth.uid()
    )
  );

create policy "samuel_messages_select_member"
  on public.samuel_messages
  for select
  using (
    exists (
      select 1
      from public.samuel_conversations conversation
      where conversation.id = samuel_messages.conversation_id
        and (
          conversation.user_id = auth.uid()
          or exists (
            select 1
            from public.company_members member
            where member.company_id = conversation.company_id
              and member.user_id = auth.uid()
          )
        )
    )
  );

create policy "samuel_messages_insert_member"
  on public.samuel_messages
  for insert
  with check (
    exists (
      select 1
      from public.samuel_conversations conversation
      where conversation.id = samuel_messages.conversation_id
        and (
          conversation.user_id = auth.uid()
          or exists (
            select 1
            from public.company_members member
            where member.company_id = conversation.company_id
              and member.user_id = auth.uid()
          )
        )
    )
  );

create or replace function public.touch_samuel_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.samuel_conversations
  set last_message_at = new.created_at,
      updated_at = timezone('utc', now())
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_samuel_message_created on public.samuel_messages;
create trigger on_samuel_message_created
after insert on public.samuel_messages
for each row execute procedure public.touch_samuel_conversation();
