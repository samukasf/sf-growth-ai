import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAuthServerSupabase } from "@/lib/supabase/auth-server";
import { createServerSupabaseAdmin } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RequestAuthorization =
  | { ok: true; user: User }
  | { ok: false; response: Response };

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createAuthServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Autenticação obrigatória.");
  return user;
}

export async function userCanAccessCompany(userId: string, companyId: string) {
  if (!UUID_PATTERN.test(companyId)) return false;

  const { data, error } = await createServerSupabaseAdmin()
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function requireCompanyAccess(userId: string, companyId: string) {
  if (!(await userCanAccessCompany(userId, companyId))) {
    throw new Error("Acesso negado à empresa.");
  }
}

export async function authorizeAuthenticatedRequest(): Promise<RequestAuthorization> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Autenticação obrigatória.", code: "AUTH_REQUIRED" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      ),
    };
  }

  return { ok: true, user };
}

export async function authorizeCompanyRequest(
  companyId: string,
  options: { allowWorkspaceFallback?: boolean } = {},
): Promise<RequestAuthorization> {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth;

  if (options.allowWorkspaceFallback && companyId === "default-company") {
    return auth;
  }

  if (!(await userCanAccessCompany(auth.user.id, companyId))) {
    return {
      ok: false,
      response: Response.json(
        { error: "Acesso negado à empresa.", code: "COMPANY_ACCESS_DENIED" },
        { status: 403, headers: { "Cache-Control": "private, no-store" } },
      ),
    };
  }

  return auth;
}
