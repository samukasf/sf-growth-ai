import "react-native-url-polyfill/auto";

import * as SecureStore from "expo-secure-store";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_SF_GROWTH_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "https://sf-growth-ai.vercel.app";

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let clientPromise: Promise<SupabaseClient> | null = null;

async function resolvePublicAuthConfig() {
  const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const configuredAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (configuredUrl && configuredAnonKey) {
    return { supabaseUrl: configuredUrl, supabaseAnonKey: configuredAnonKey };
  }

  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/mobile/auth-config`, {
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => null)) as
    | { supabaseUrl?: string; supabaseAnonKey?: string; error?: string }
    | null;

  if (!response.ok || !payload?.supabaseUrl || !payload.supabaseAnonKey) {
    throw new Error(payload?.error || "Não foi possível carregar a autenticação do Samuel Mobile.");
  }

  return {
    supabaseUrl: payload.supabaseUrl,
    supabaseAnonKey: payload.supabaseAnonKey,
  };
}

export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = resolvePublicAuthConfig().then(({ supabaseUrl, supabaseAnonKey }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
    );
  }
  return clientPromise;
}
