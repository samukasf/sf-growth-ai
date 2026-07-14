-- =====================================================
-- SF Growth AI
-- Migration: 009 Google OAuth Connections
-- Description: Persistência das credenciais OAuth do Google (Gmail),
-- uma por empresa (Sprint 86 — Google OAuth & Gmail API real).
--
-- company_id é `text` (não FK para public.companies) pelo mesmo motivo já
-- documentado na migration 008: o companyId circulando no restante do
-- sistema (Samuel Runtime, Tool Orchestrator) é uma string livre, não um
-- UUID garantido. Quem grava/lê nesta tabela valida o formato UUID antes
-- de persistir/consultar (mesmo padrão de `supabase-query.tool.ts`).
--
-- Segurança: esta tabela guarda segredos de longa duração (refresh_token)
-- que dão acesso à caixa de e-mail real da empresa. RLS é habilitado e
-- PROPOSITALMENTE não recebe nenhuma policy para anon/authenticated — só
-- é acessível via Service Role Key (que ignora RLS), usada exclusivamente
-- por `lib/supabase/service-client.ts` (server-only, nunca importado por
-- código client-side).
-- =====================================================

create extension if not exists "pgcrypto";

create table if not exists public.google_oauth_connections (

    id uuid primary key default gen_random_uuid(),

    company_id text not null,

    google_email text,

    scope text not null,

    access_token text,

    access_token_expires_at timestamptz,

    refresh_token text not null,

    connected_by uuid
    references auth.users(id)
    on delete set null,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

-- Uma conexão Gmail ativa por empresa nesta Sprint.
create unique index if not exists idx_google_oauth_connections_company
on public.google_oauth_connections(company_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
-- RLS habilitado sem nenhuma policy: nega acesso por padrão para os roles
-- `anon` e `authenticated`. Apenas a Service Role Key (usada só no servidor,
-- nunca exposta ao browser) pode ler/escrever nesta tabela.

alter table public.google_oauth_connections
enable row level security;
