import "server-only";

/**
 * Returns a Supabase client bound to the authenticated server request.
 * The dynamic import keeps pure calculation modules testable outside Next.js.
 */
export async function createAuthenticatedDataClient() {
  const { createAuthServerSupabase } = await import("./auth-server");
  return createAuthServerSupabase();
}
