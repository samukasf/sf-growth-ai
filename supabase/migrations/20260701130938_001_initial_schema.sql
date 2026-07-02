-- =====================================================
-- SF Growth AI
-- Migration: 001 Foundation
-- Description: Foundation Layer
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- COMPANIES
-- =====================================================

create table if not exists public.companies (

    id uuid primary key default gen_random_uuid(),

    name text NOT NULL,

slug text NOT NULL UNIQUE,
industry text,

website text,

instagram text,

city text,

country text,

company_size text,

business_stage text,

annual_revenue numeric,

employees integer,

logo_url text,

description text,
    created_at timestamptz not null DEFAULT timezone('utc', now()),

    updated_at timestamptz not null DEFAULT timezone('utc', now())

);

-- =====================================================
-- COMPANY MEMBERS
-- =====================================================

create table if not exists public.company_members (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null references public.companies(id) on delete cascade,

    user_id uuid not null
references auth.users(id)
on delete cascade,

     role text NOT NULL DEFAULT 'owner',
CHECK (
    role IN (
        'owner',
        'admin',
        'manager',
        'member'
    )
),

    created_at timestamptz not null DEFAULT timezone('utc', now())

);
ALTER TABLE public.company_members
ADD CONSTRAINT unique_company_member
UNIQUE (company_id, user_id);
-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_company_members_company
on public.company_members(company_id);

create index if not exists idx_company_members_user
on public.company_members(user_id);


-- =====================================================
-- EXECUTIVE BRAINS
-- =====================================================

create table if not exists public.executive_brains (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    executive_name text not null,

    personality jsonb not null default '{}'::jsonb,

    memory jsonb not null default '{}'::jsonb,

    reasoning jsonb not null default '{}'::jsonb,

    goals jsonb not null default '[]'::jsonb,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create unique index if not exists idx_executive_company_name
on public.executive_brains(company_id, executive_name);

-- =====================================================
-- BUSINESS TWINS
-- =====================================================

create table if not exists public.business_twins (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    profile jsonb not null default '{}'::jsonb,

    strategy jsonb not null default '{}'::jsonb,

    marketing jsonb not null default '{}'::jsonb,

    sales jsonb not null default '{}'::jsonb,

    finance jsonb not null default '{}'::jsonb,

    operations jsonb not null default '{}'::jsonb,

    hr jsonb not null default '{}'::jsonb,

    legal jsonb not null default '{}'::jsonb,

    ai_memory jsonb not null default '{}'::jsonb,

    growth_score numeric default 0,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create unique index if not exists idx_business_twins_company
on public.business_twins(company_id);

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