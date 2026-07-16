"use server";

import { redirect } from "next/navigation";

import { createAuthServerSupabase } from "@/lib/supabase/auth-server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function signInWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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

  redirect("/");
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

  try {
    const supabase = await createAuthServerSupabase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || undefined },
      },
    });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Falha ao criar conta.",
    };
  }

  redirect("/onboarding");
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createAuthServerSupabase();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  redirect("/login");
}
