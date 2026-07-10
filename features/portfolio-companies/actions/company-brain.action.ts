"use server";

import { revalidatePath } from "next/cache";

import { buildCompanyBrain } from "@/apps/web/src/core/company-brain";
import { getCompanyBrainRepository } from "@/apps/web/src/core/company-brain/company-brain.repository";
import { summarizeCompanyBrain } from "@/apps/web/src/core/company-brain/company-brain.summary";
import type { CompanyBrainBuildResponse } from "@/apps/web/src/core/company-brain/company-brain.types";
import { validateCompanyBrain } from "@/apps/web/src/core/company-brain/company-brain.validator";
import { runDiscovery } from "@/apps/web/src/core/discovery";
import { createServerSupabase } from "@/lib/supabase/server";

import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

export type CompanyBrainStatus = "inactive" | "active";

const DEFAULT_TENANT_ID = "tenant-demo";

export type CompanyBrainViewData = {
  company: PortfolioCompanyRecord;
  buildResponse: CompanyBrainBuildResponse | null;
};

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
  revalidatePath(`/company/${companyId}/brain`);

  return data as PortfolioCompanyRecord;
}

export async function getCompanyBrainViewAction(
  companyId: string,
): Promise<CompanyBrainViewData | null> {
  const company = await getPortfolioCompanyAction(companyId);
  if (!company) return null;

  const brain = await getCompanyBrainRepository().findByCompany(DEFAULT_TENANT_ID, companyId);
  if (!brain) {
    return { company, buildResponse: null };
  }

  return {
    company,
    buildResponse: {
      companyBrain: brain,
      summary: summarizeCompanyBrain(brain),
      validation: validateCompanyBrain(brain),
    },
  };
}

export async function runCompanyDiscoveryAction(
  companyId: string,
): Promise<CompanyBrainBuildResponse> {
  const company = await getPortfolioCompanyAction(companyId);
  if (!company) {
    throw new Error("Empresa não encontrada.");
  }

  const discoveryResult = await runDiscovery({
    companyName: company.name,
    website: company.website ?? undefined,
    instagram: company.instagram ?? undefined,
    facebook: company.facebook ?? undefined,
    city: company.city ?? undefined,
    tenantId: DEFAULT_TENANT_ID,
    companyId: company.id,
  });

  const response = await buildCompanyBrain({
    discoveryResult,
    tenantId: DEFAULT_TENANT_ID,
    companyId: company.id,
  });

  revalidatePath(`/company/${companyId}/brain`);
  revalidatePath(`/empresas/${companyId}`);

  return response;
}
