create extension if not exists vector;

create extension if not exists pgcrypto;

-- =====================================================
-- GROWTH AI
-- =====================================================

create table if not exists public.growth_reports (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    report_date date not null,

    health_score numeric default 0,

    revenue_score numeric default 0,

    marketing_score numeric default 0,

    sales_score numeric default 0,

    finance_score numeric default 0,

    operations_score numeric default 0,

    ai_analysis jsonb default '{}'::jsonb,

    recommendations jsonb default '[]'::jsonb,

    created_at timestamptz not null
    default timezone('utc', now())

);

create unique index if not exists idx_growth_reports_company_date
on public.growth_reports(company_id, report_date);
-- =====================================================
-- AI INSIGHTS
-- =====================================================

create table if not exists public.ai_insights (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    executive_brain_id uuid
    references public.executive_brains(id)
    on delete set null,

    category text not null,

    priority text default 'medium',

    title text not null,

    description text,

    recommendation text,

    expected_impact text,

    status text default 'pending',

    metadata jsonb default '{}'::jsonb,

    created_at timestamptz not null
    default timezone('utc', now()),

    resolved_at timestamptz

);

create index if not exists idx_ai_insights_company
on public.ai_insights(company_id);

create index if not exists idx_ai_insights_priority
on public.ai_insights(priority);

create index if not exists idx_ai_insights_status
on public.ai_insights(status);
-- =====================================================
-- AI MEMORY
-- =====================================================

create table if not exists public.ai_memory (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    executive_brain_id uuid
    references public.executive_brains(id)
    on delete cascade,

    memory_type text not null,

    title text,

    content jsonb not null default '{}'::jsonb,

    embedding vector(1536),

    importance integer default 1,

    created_at timestamptz not null
    default timezone('utc', now()),

    last_accessed_at timestamptz,

    access_count integer default 0

);

create index if not exists idx_ai_memory_company
on public.ai_memory(company_id);

create index if not exists idx_ai_memory_type
on public.ai_memory(memory_type);

create index if not exists idx_ai_memory_importance
on public.ai_memory(importance);
-- =====================================================
-- AI TASKS
-- =====================================================

create table if not exists public.ai_tasks (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    executive_brain_id uuid
    references public.executive_brains(id)
    on delete set null,

    insight_id uuid
    references public.ai_insights(id)
    on delete set null,

    assigned_to uuid
    references auth.users(id)
    on delete set null,

    title text not null,

    description text,

    priority text default 'medium',

    status text default 'pending',

    due_date timestamptz,

    completed_at timestamptz,

    metadata jsonb default '{}'::jsonb,

    created_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_ai_tasks_company
on public.ai_tasks(company_id);

create index if not exists idx_ai_tasks_status
on public.ai_tasks(status);

create index if not exists idx_ai_tasks_priority
on public.ai_tasks(priority);

create index if not exists idx_ai_tasks_due
on public.ai_tasks(due_date);