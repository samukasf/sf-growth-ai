-- =====================================================
-- SF GROWTH AI
-- CRM MODULE
-- =====================================================

-- =====================================================
-- CONTACTS
-- =====================================================

create table if not exists public.contacts (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    first_name text not null,

    last_name text,

    email text,

    phone text,

    company text,

    job_title text,

    status text default 'lead',

    tags jsonb default '[]'::jsonb,

    notes text,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_contacts_company
on public.contacts(company_id);

create index if not exists idx_contacts_email
on public.contacts(email);

-- =====================================================
-- LEADS
-- =====================================================

create table if not exists public.leads (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    contact_id uuid
    references public.contacts(id)
    on delete set null,

    source text,

    stage text default 'new',

    score integer default 0,

    value numeric default 0,

    assigned_to uuid
    references auth.users(id),

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_leads_company
on public.leads(company_id);

create index if not exists idx_leads_stage
on public.leads(stage);

-- =====================================================
-- DEALS
-- =====================================================

create table if not exists public.deals (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    lead_id uuid
    references public.leads(id)
    on delete set null,

    title text not null,

    stage text default 'new',

    amount numeric default 0,

    probability integer default 0,

    expected_close_date date,

    assigned_to uuid
    references auth.users(id),

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_deals_company
on public.deals(company_id);

create index if not exists idx_deals_stage
on public.deals(stage);

-- =====================================================
-- ACTIVITIES
-- =====================================================

create table if not exists public.activities (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    contact_id uuid
    references public.contacts(id)
    on delete set null,

    lead_id uuid
    references public.leads(id)
    on delete set null,

    deal_id uuid
    references public.deals(id)
    on delete set null,

    activity_type text not null,

    subject text not null,

    description text,

    due_date timestamptz,

    completed boolean default false,

    assigned_to uuid
    references auth.users(id),

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_activities_company
on public.activities(company_id);

create index if not exists idx_activities_completed
on public.activities(completed);

create index if not exists idx_activities_due
on public.activities(due_date);