-- =====================================================
-- SF Growth AI
-- Migration: 008 Samuel Execution Memory
-- Description: Camada de persistência write-only que registra toda
-- execução do Samuel Runtime (Sprint 72). Não referencia companies/
-- organizations por FK: organizationId/companyId no Samuel Runtime são
-- strings livres (ex.: "default-org"), não UUIDs garantidos — uma FK
-- quebraria inserts hoje e acoplaria esta tabela ao modelo multi-tenant,
-- o que está fora do escopo desta sprint.
-- =====================================================

create extension if not exists "pgcrypto";

create table if not exists public.samuel_execution_memory (

    id uuid primary key default gen_random_uuid(),

    organization_id text not null,

    company_id text not null,

    user_id uuid
    references auth.users(id)
    on delete set null,

    provider text,

    model text,

    operation text,

    context jsonb,

    memories_used jsonb,

    decision jsonb,

    plan jsonb,

    tools_executed jsonb,

    final_response text,

    input_tokens integer,

    output_tokens integer,

    estimated_cost numeric,

    execution_time_ms integer not null default 0,

    status text not null default 'success'
    check (status in ('success', 'error')),

    error text,

    created_at timestamptz not null default timezone('utc', now())

);

-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_samuel_execution_memory_org
on public.samuel_execution_memory(organization_id);

create index if not exists idx_samuel_execution_memory_company
on public.samuel_execution_memory(company_id);

create index if not exists idx_samuel_execution_memory_user
on public.samuel_execution_memory(user_id);

create index if not exists idx_samuel_execution_memory_created_at
on public.samuel_execution_memory(created_at desc);

create index if not exists idx_samuel_execution_memory_status
on public.samuel_execution_memory(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
-- Intencionalmente NÃO habilitada nesta sprint: a rota do Samuel
-- (/api/samuel/runtime) ainda não exige sessão autenticada, então uma
-- policy baseada em auth.uid()/current_company() bloquearia silenciosamente
-- todos os inserts. Ativar RLS aqui é um follow-up explícito para quando o
-- Samuel Runtime tiver autenticação de usuário integrada.
