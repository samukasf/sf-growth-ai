-- Operational tables referenced by Samuel AI context (may already exist remotely).

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  industry text,
  business_model text,
  differentials text,
  goals text,
  mission text,
  vision text,
  services text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_profiles_company_unique unique (company_id)
);

create index if not exists business_profiles_company_idx
  on public.business_profiles (company_id);

create table if not exists public.company_memory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null default 'general',
  title text not null,
  content text not null default '',
  importance numeric not null default 5,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists company_memory_company_idx
  on public.company_memory (company_id);

create index if not exists company_memory_category_idx
  on public.company_memory (company_id, category);

alter table public.business_profiles enable row level security;
alter table public.company_memory enable row level security;

create policy "business_profiles_select_members"
  on public.business_profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = business_profiles.company_id
        and cm.user_id = auth.uid()
    )
  );

create policy "company_memory_select_members"
  on public.company_memory
  for select
  to authenticated
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = company_memory.company_id
        and cm.user_id = auth.uid()
    )
  );
