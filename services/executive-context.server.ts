import "server-only";

import { createAuthenticatedDataClient } from "@/lib/supabase/data-client";

import {
  buildExecutiveSummary,
  type BusinessProfileRecord,
  type CompanyRecord,
  type ExecutiveContext,
} from "./executive-context.service";
import {
  getCompanyMemory,
  getCompanyById,
  getFirstCompany,
  resolveActiveCompany,
} from "./executive-memory.server";

export { getCompanyById, getFirstCompany, resolveActiveCompany };

async function getCompany(companyId: string): Promise<CompanyRecord> {
  const supabase = await createAuthenticatedDataClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, industry, city, country, website, annual_revenue, description, business_stage")
    .eq("id", companyId)
    .single();
  if (error) throw error;
  return data as CompanyRecord;
}

async function getBusinessProfile(
  companyId: string,
): Promise<BusinessProfileRecord | null> {
  const supabase = await createAuthenticatedDataClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("id, company_id, segment:industry, positioning:business_model, differentiators:differentials, objectives:goals, mission, vision, value_proposition:services")
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) throw error;
  return (data as BusinessProfileRecord | null) ?? null;
}

export async function buildExecutiveContext(
  companyId: string,
): Promise<ExecutiveContext> {
  const [company, businessProfile, memories] = await Promise.all([
    getCompany(companyId),
    getBusinessProfile(companyId),
    getCompanyMemory(companyId),
  ]);
  return {
    company,
    businessProfile,
    memories,
    summary: buildExecutiveSummary(company, businessProfile, memories),
  };
}
