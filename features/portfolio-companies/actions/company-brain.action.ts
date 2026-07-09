"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";

import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

export type CompanyBrainStatus = "inactive" | "active";

export async function getPortfolioCompanyAction(
  companyId: string,
): Promise<PortfolioCompanyRecord | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("portfolio_companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as PortfolioCompanyRecord | null) ?? null;
}

export async function activateCompanyBrainAction(
  companyId: string,
): Promise<PortfolioCompanyRecord> {
  const supabase = createServerSupabase();
  const activatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("portfolio_companies")
    .update({
      brain_status: "active",
      brain_activated_at: activatedAt,
      updated_at: activatedAt,
    })
    .eq("id", companyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);

  return data as PortfolioCompanyRecord;
}
