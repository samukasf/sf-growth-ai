import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase com Service Role Key (Sprint 86).
 *
 * ATENÇÃO — SERVER-ONLY: este client ignora Row Level Security. Ele existe
 * exclusivamente para acessar tabelas que guardam segredos (ex.:
 * `google_oauth_connections`) e que, por isso, não recebem nenhuma policy
 * de RLS para os roles `anon`/`authenticated`.
 *
 * NUNCA importe este arquivo em um Client Component (`"use client"`) nem em
 * qualquer código que rode no browser — a Service Role Key concede acesso
 * total ao banco, ignorando todas as regras de RLS do restante do projeto.
 * Use apenas em route handlers, server actions ou serviços chamados a
 * partir deles.
 */

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_URL) não configurada — " +
        "necessária para acessar tabelas server-only como google_oauth_connections.",
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

/** Uso exclusivo em testes: permite injetar/limpar o client cacheado. */
export function __resetSupabaseServiceClientForTests(): void {
  cachedClient = null;
}

