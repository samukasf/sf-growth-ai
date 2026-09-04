import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase/server";

export async function requireRevenueCompanyAccess(request: Request, companyId: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) throw new RevenueAuthError("Authentication required", 401);

  const auth = createServerSupabase();
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) throw new RevenueAuthError("Invalid authentication", 401);

  const admin = createServerSupabaseAdmin();
  const { data: membership, error: membershipError } = await admin
    .from("company_members")
    .select("company_id,user_id")
    .eq("company_id", companyId)
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) throw new RevenueAuthError("Company access denied", 403);
  return { userId: data.user.id, companyId };
}

export class RevenueAuthError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
