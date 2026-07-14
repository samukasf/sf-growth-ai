import { createClient } from "@supabase/supabase-js";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The UI has graceful empty states when Supabase is not configured. Creating the
 * SDK with `undefined` at module evaluation time prevented those states from ever
 * rendering (and broke `next build`). A local, non-routable fallback keeps the
 * client constructible while every real request still fails closed.
 */
export const isSupabaseConfigured = Boolean(
  configuredUrl && configuredAnonKey,
);

export const supabase = createClient(
  configuredUrl ?? "http://127.0.0.1:54321",
  configuredAnonKey ?? "sf-growth-ai-unconfigured-anon-key",
  {
    auth: {
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
    },
  },
);
