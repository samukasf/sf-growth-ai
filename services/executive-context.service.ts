import { supabase } from "@/lib/supabase/client";

import {
  getCompanyMemory,
  type CompanyMemoryRecord,
} from "./executive-memory.service";

export { getFirstCompany } from "./executive-memory.service";

export type CompanyRecord = {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  business_stage: string | null;
  annual_revenue: number | null;
};

export type BusinessProfileRecord = {
  id: string;
  company_id: string;
  segment: string | null;
  positioning: string | null;
  differentiators: string | string[] | null;
  objectives: string | string[] | null;
  mission: string | null;
  vision: string | null;
  value_proposition: string | null;
};

export type ExecutiveContext = {
  company: CompanyRecord;
  businessProfile: BusinessProfileRecord | null;
  memories: CompanyMemoryRecord[];
  summary: string;
};

function formatTextValue(value: string | string[] | null | undefined) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }
  return value;
}

function formatMemoryContent(content: CompanyMemoryRecord["content"]) {
  if (typeof content === "string") return content;
  return JSON.stringify(content);
}

function buildExecutiveSummary(
  company: CompanyRecord,
  businessProfile: BusinessProfileRecord | null,
  memories: CompanyMemoryRecord[],
) {
  const lines: string[] = [];
  const segment = businessProfile?.segment ?? company.industry;

  lines.push(`Empresa:\n${company.name}`);

  if (segment) {
    lines.push(`\nSegmento:\n${segment}`);
  }

  if (businessProfile?.positioning) {
    lines.push(`\nPosicionamento:\n${businessProfile.positioning}`);
  }

  const differentiators = formatTextValue(businessProfile?.differentiators);
  if (differentiators) {
    lines.push(`\nDiferenciais:\n${differentiators}`);
  }

  const objectives = formatTextValue(businessProfile?.objectives);
  if (objectives) {
    lines.push(`\nObjetivos:\n${objectives}`);
  }

  if (businessProfile?.mission) {
    lines.push(`\nMissão:\n${businessProfile.mission}`);
  }

  if (businessProfile?.vision) {
    lines.push(`\nVisão:\n${businessProfile.vision}`);
  }

  if (businessProfile?.value_proposition) {
    lines.push(`\nProposta de valor:\n${businessProfile.value_proposition}`);
  }

  if (company.description) {
    lines.push(`\nDescrição:\n${company.description}`);
  }

  if (memories.length > 0) {
    lines.push("\nMemórias:");
    for (const memory of memories) {
      lines.push(
        `- [${memory.category}] ${memory.title}: ${formatMemoryContent(memory.content)}`,
      );
    }
  }

  return lines.join("\n");
}

async function getCompany(companyId: string): Promise<CompanyRecord> {
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, industry, city, country, website, annual_revenue",
    )
    .eq("id", companyId)
    .single();

  if (error) throw error;

  return {
    ...(data as Omit<CompanyRecord, "description" | "business_stage">),
    description: null,
    business_stage: null,
  };
}

async function getBusinessProfile(
  companyId: string,
): Promise<BusinessProfileRecord | null> {
  const { data, error } = await supabase
    .from("business_profiles")
    .select(
      "id, company_id, segment:industry, positioning:business_model, differentiators:differentials, objectives:goals, mission, vision, value_proposition:services",
    )
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

export function enrichPromptWithExecutiveContext(
  userQuery: string,
  context: ExecutiveContext,
) {
  return [
    "=== EXECUTIVE CONTEXT ===",
    context.summary,
    "",
    "=== DIRETRIZ DO EXECUTIVO ===",
    userQuery,
  ].join("\n");
}
