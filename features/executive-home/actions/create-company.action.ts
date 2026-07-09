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
  created_at: string;
  updated_at: string;
};

export type CompanyBrainStatus = "inactive" | "active";

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
  const { data, error } = await supabase
    .from("portfolio_companies")
    .insert({
      name: input.companyName.trim(),
      industry: input.segment.trim(),
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

  revalidatePath("/");
  revalidatePath("/empresas");
  return data as PortfolioCompanyRecord;
}
