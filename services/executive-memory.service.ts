import { supabase } from "@/lib/supabase/client";

export type CompanyMemoryRecord = {
  id: string;
  company_id: string;
  category: string;
  title: string;
  content: string;
  importance: number | string;
  source: string | null;
};

export async function getFirstCompany() {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getCompanyMemory(
  companyId: string,
): Promise<CompanyMemoryRecord[]> {
  const { data, error } = await supabase
    .from("company_memory")
    .select("id, company_id, category, title, content, importance, source")
    .eq("company_id", companyId)
    .order("importance", { ascending: false });

  if (error) throw error;

  return (data ?? []) as CompanyMemoryRecord[];
}

export async function getMemoryByCategory(
  companyId: string,
  category: string
) {
  const { data, error } = await supabase
    .from("company_memory")
    .select("*")
    .eq("company_id", companyId)
    .eq("category", category);

  if (error) throw error;

  return data;
}

export async function addMemory(memory: any) {
  return supabase
    .from("company_memory")
    .insert(memory)
    .select()
    .single();
}