"use server";

import { redirect } from "next/navigation";

import { createAuthServerSupabase } from "@/lib/supabase/auth-server";
import { createServerSupabaseAdmin } from "@/lib/supabase/server";

export type OnboardingFormState = {
  error?: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function completeOnboardingAction(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!companyName || !industry) {
    return { error: "Nome da empresa e segmento são obrigatórios." };
  }

  try {
    const auth = await createAuthServerSupabase();
    let userId: string | null = null;

    const existing = await auth.auth.getUser();
    if (existing.data.user) {
      userId = existing.data.user.id;
    } else if (email && password) {
      if (password.length < 8) {
        return { error: "A senha deve ter pelo menos 8 caracteres." };
      }
      const { data, error } = await auth.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || undefined } },
      });
      if (error) return { error: error.message };
      userId = data.user?.id ?? null;
    }

    const admin = createServerSupabaseAdmin();
    const baseSlug = slugify(companyName) || `empresa-${Date.now()}`;
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: company, error: companyError } = await admin
      .from("companies")
      .insert({
        name: companyName,
        slug,
        industry,
        website: website || null,
        city: city || null,
        country: country || null,
        description: `Empresa onboarded via SF Growth AI — ${industry}`,
      })
      .select("id")
      .single();

    if (companyError || !company) {
      return { error: companyError?.message ?? "Falha ao criar empresa." };
    }

    await admin.from("portfolio_companies").insert({
      name: companyName,
      industry,
      website: website || null,
      city: city || null,
      country: country || null,
      email: email || null,
      responsible_name: fullName || null,
    });

    await admin.from("business_profiles").upsert(
      {
        company_id: company.id,
        industry,
        business_model: `Empresa de ${industry}`,
        goals: "Crescimento sustentável\nClareza executiva",
      },
      { onConflict: "company_id" },
    );

    if (userId) {
      await admin.from("company_members").upsert(
        {
          company_id: company.id,
          user_id: userId,
          role: "owner",
        },
        { onConflict: "company_id,user_id" },
      );

      await admin
        .from("user_profiles")
        .update({
          company_id: company.id,
          full_name: fullName || null,
          role: "owner",
        })
        .eq("id", userId);
    }

    redirect(`/samuel-ai?companyId=${company.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      error: error instanceof Error ? error.message : "Falha no onboarding.",
    };
  }
}
