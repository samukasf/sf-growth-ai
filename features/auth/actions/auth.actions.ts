"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAuthServerSupabase } from "@/lib/supabase/auth-server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const PRODUCTION_ORIGIN = "https://sf-growth-ai.vercel.app";

function normalizeOrigin(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) throw new Error("Origem da aplicação indisponível.");
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

async function requestOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (configuredOrigin) return normalizeOrigin(configuredOrigin);

  if (process.env.VERCEL_ENV === "production") return PRODUCTION_ORIGIN;

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionUrl) return normalizeOrigin(vercelProductionUrl);

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  if (!host) throw new Error("Origem da aplicação indisponível.");

  if (process.env.VERCEL && /^localhost(?::\d+)?$/i.test(host)) {
    return PRODUCTION_ORIGIN;
  }

  return `${protocol}://${host}`;
}

function safeNextPath(value: FormDataEntryValue | null, fallback = "/") {
  const next = String(value ?? "").trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signInWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  try {
    const supabase = await createAuthServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Falha ao autenticar.",
    };
  }

  redirect(next);
}

export async function signUpWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  let hasSession = false;
  try {
    const supabase = await createAuthServerSupabase();
    const origin = await requestOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || undefined },
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    hasSession = Boolean(data.session);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Falha ao criar conta.",
    };
  }

  if (hasSession) redirect("/onboarding");
  return {
    success: "Conta criada. Confirme o e-mail recebido para continuar a configuração.",
  };
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe o e-mail da conta." };

  try {
    const supabase = await createAuthServerSupabase();
    const origin = await requestOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    });
    if (error) return { error: error.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Falha ao solicitar redefinição.",
    };
  }

  return {
    success: "Se o e-mail estiver cadastrado, o link de redefinição foi enviado.",
  };
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirmation) return { error: "As senhas não coincidem." };

  try {
    const supabase = await createAuthServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "O link expirou. Solicite uma nova redefinição." };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Falha ao atualizar a senha.",
    };
  }

  redirect("/samuel-ai");
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createAuthServerSupabase();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  const cookieStore = await cookies();
  cookieStore.delete("sf_growth_ai_chat_session");
  redirect("/login");
}
