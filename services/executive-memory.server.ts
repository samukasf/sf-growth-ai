import "server-only";

import { createAuthenticatedDataClient } from "@/lib/supabase/data-client";

import type { CompanyMemoryRecord } from "./executive-memory.service";

export async function getFirstCompany() {
  const supabase = await createAuthenticatedDataClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCompanyById(companyId: string) {
  const supabase = await createAuthenticatedDataClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function resolveActiveCompany(companyId?: string | null) {
  if (companyId) {
    const company = await getCompanyById(companyId);
    if (company) return company;
  }
  return getFirstCompany();
}

export async function getCompanyMemory(
  companyId: string,
): Promise<CompanyMemoryRecord[]> {
  const supabase = await createAuthenticatedDataClient();
  const { data, error } = await supabase
    .from("company_memory")
    .select("id, company_id, category, title, content, importance, source")
    .eq("company_id", companyId)
    .order("importance", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CompanyMemoryRecord[];
}
