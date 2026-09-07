"use server";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/features/auth/server/authorization";
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

  if (!companyName || !industry) {
    return { error: "Nome da empresa e segmento são obrigatórios." };
  }
  if (companyName.length > 160 || industry.length > 160) {
    return { error: "Nome da empresa ou segmento excede o limite permitido." };
  }

  let createdCompanyId: string | null = null;
  try {
    const user = await requireAuthenticatedUser();
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
    createdCompanyId = company.id;

    const fullName = String(user.user_metadata.full_name ?? "").trim() || null;
    const operations = await Promise.all([
      admin.from("company_members").upsert(
        { company_id: company.id, user_id: user.id, role: "owner" },
        { onConflict: "company_id,user_id" },
      ),
      admin.from("portfolio_companies").insert({
        name: companyName,
        industry,
        website: website || null,
        city: city || null,
        country: country || null,
        email: user.email ?? null,
        responsible_name: fullName,
        operational_company_id: company.id,
      }),
      admin.from("business_profiles").upsert(
        {
          company_id: company.id,
          industry,
          business_model: `Empresa de ${industry}`,
          goals: "Crescimento sustentável\nClareza executiva",
        },
        { onConflict: "company_id" },
      ),
      admin.from("user_profiles").upsert(
        { id: user.id, company_id: company.id, full_name: fullName, role: "owner" },
        { onConflict: "id" },
      ),
    ]);

    const failed = operations.find((operation) => operation.error);
    if (failed?.error) {
      await admin.from("companies").delete().eq("id", company.id);
      createdCompanyId = null;
      return { error: failed.error.message };
    }

    redirect(`/samuel-ai?companyId=${company.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    if (createdCompanyId) {
      await createServerSupabaseAdmin().from("companies").delete().eq("id", createdCompanyId);
    }
    return {
      error: error instanceof Error ? error.message : "Falha no onboarding.",
    };
  }
}
