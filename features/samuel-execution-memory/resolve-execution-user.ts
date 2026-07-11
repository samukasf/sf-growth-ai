import { supabase } from "@/lib/supabase/client";

/**
 * Resolução do `userId` registrado em cada execução.
 *
 * Prioridade (nesta ordem, sem excepção):
 *   1. Sessão autenticada real — valida o Bearer token (Supabase Auth) do
 *      header `Authorization` da requisição, quando presente.
 *   2. `fallbackUserId` (ex.: `body.userId`) — aceito SOMENTE fora de
 *      produção, para desenvolvimento/testes manuais. Nunca é tratado como
 *      fonte oficial.
 *   3. `null` — quando nenhuma das duas opções acima resolve um usuário.
 *
 * Isso não introduz nenhum sistema de autenticação novo: apenas lê uma
 * sessão que já exista (via Supabase Auth), sem alterar o modelo
 * multi-tenant (organização/empresa continuam sendo a unidade de decisão).
 */
export type ResolveExecutionUserInput = {
  authorizationHeader?: string | null;
  fallbackUserId?: string;
};

function isNonProductionEnv(): boolean {
  return process.env.NODE_ENV !== "production";
}

function extractBearerToken(authorizationHeader?: string | null): string | undefined {
  if (!authorizationHeader) return undefined;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

export async function resolveExecutionUserId(
  input: ResolveExecutionUserInput,
): Promise<string | null> {
  const token = extractBearerToken(input.authorizationHeader);

  if (token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        return data.user.id;
      }
    } catch (error) {
      console.warn(
        "[samuel-execution-memory] Falha ao validar sessão autenticada — seguindo sem userId.",
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (isNonProductionEnv() && input.fallbackUserId) {
    return input.fallbackUserId;
  }

  return null;
}
