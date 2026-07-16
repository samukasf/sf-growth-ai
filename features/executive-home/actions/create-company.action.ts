"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";

export type CreateCompanyInput = {
  companyName: string;
  segment: string;
  responsibleName: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  city: string;
  country: string;
  employeeCount: string;
  mainObjective: string;
  notes: string;
};

export type PortfolioCompanyRecord = {
  id: string;
  name: string;
  industry: string;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  country: string | null;
  employee_count: string | null;
  main_objective: string | null;
  notes: string | null;
  brain_status: CompanyBrainStatus;
  brain_activated_at: string | null;
  first_conversation_status: FirstConversationStatus;
  first_conversation_answers: Record<string, string> | null;
  first_conversation_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyBrainStatus = "inactive" | "active";

export type FirstConversationStatus = "pending" | "deferred" | "completed";

export async function listPortfolioCompaniesAction(): Promise<PortfolioCompanyRecord[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("portfolio_companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PortfolioCompanyRecord[];
}

export async function createPortfolioCompanyAction(
  input: CreateCompanyInput,
): Promise<PortfolioCompanyRecord> {
  if (!input.companyName.trim()) {
    throw new Error("Nome da empresa é obrigatório.");
  }
  if (!input.segment.trim()) {
    throw new Error("Segmento é obrigatório.");
  }

  const supabase = createServerSupabase();
  const companyName = input.companyName.trim();
  const industry = input.segment.trim();

  const { data, error } = await supabase
    .from("portfolio_companies")
    .insert({
      name: companyName,
      industry,
      responsible_name: input.responsibleName.trim() || null,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      website: input.website.trim() || null,
      instagram: input.instagram.trim() || null,
      facebook: input.facebook.trim() || null,
      city: input.city.trim() || null,
      country: input.country.trim() || null,
      employee_count: input.employeeCount.trim() || null,
      main_objective: input.mainObjective.trim() || null,
      notes: input.notes.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Mirror into operational `companies` so Samuel AI / integrations resolve the same firm.
  try {
    const slugBase = companyName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
    const slug = `${slugBase || "empresa"}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: operational } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        slug,
        industry,
        website: input.website.trim() || null,
        instagram: input.instagram.trim() || null,
        city: input.city.trim() || null,
        country: input.country.trim() || null,
        description: input.notes.trim() || input.mainObjective.trim() || null,
      })
      .select("id")
      .single();

    if (operational?.id) {
      await supabase.from("business_profiles").upsert(
        {
          company_id: operational.id,
          industry,
          business_model: input.mainObjective.trim() || `Empresa de ${industry}`,
          goals: input.mainObjective.trim() || "Crescimento",
        },
        { onConflict: "company_id" },
      );
    }
  } catch {
    // Portfolio creation remains valid even if operational mirror fails.
  }

  revalidatePath("/");
  revalidatePath("/empresas");
  revalidatePath("/samuel-ai");
  return data as PortfolioCompanyRecord;
}
