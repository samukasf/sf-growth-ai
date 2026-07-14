import { supabase } from "@/lib/supabase/client";
import { getCompanyMemory } from "@/services/executive-memory.service";

import { clampScore } from "../../shared";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";
import type { DataSourceAdapter } from "./aggregated-brain-data-sources";

/**
 * Sprint 84 — Company Brain Data Providers.
 *
 * Estes adapters substituem, para os domínios que já possuem uma tabela real
 * e estável no Supabase, os `createSimulatedAdapter` de
 * `default-data-source-adapters.ts`. Seguem exatamente o mesmo contrato
 * `DataSourceAdapter` — nenhuma interface nova foi criada.
 *
 * Política de resiliência (Opção A aprovada): quando o dado real não pode
 * ser obtido (companyId inválido, empresa não encontrada, erro de rede),
 * o adapter devolve `available: false` e nunca mistura o resultado com
 * dados simulados. A execução do Company Brain nunca é interrompida por
 * isso — o erro é absorvido aqui.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function unavailableContribution(source: string, reason: string): DataSourceContribution {
  return {
    source,
    available: false,
    recordCount: 0,
    summary: `Dados reais indisponíveis para "${source}": ${reason}.`,
    highlights: [],
    context: { reason },
    healthScore: 0,
  };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "erro desconhecido";
}

type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  website: string | null;
  business_stage: string | null;
  annual_revenue: number | null;
  employees: number | null;
  company_size: string | null;
};

export const SupabaseCompanyAdapter: DataSourceAdapter = {
  key: "company",
  async fetch(_organizationId, companyId): Promise<DataSourceContribution> {
    if (!isUuidLike(companyId)) {
      return unavailableContribution(
        "company",
        `companyId "${companyId}" não é um UUID válido de public.companies`,
      );
    }

    try {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, industry, city, country, description, website, business_stage, annual_revenue, employees, company_size",
        )
        .eq("id", companyId)
        .maybeSingle();

      if (error) return unavailableContribution("company", describeError(error));
      if (!data) return unavailableContribution("company", "empresa não encontrada em public.companies");

      const company = data as CompanyRow;

      const highlights = [
        company.industry ? `Setor: ${company.industry}` : null,
        company.business_stage ? `Estágio: ${company.business_stage}` : null,
        company.city || company.country
          ? `Localização: ${[company.city, company.country].filter(Boolean).join(", ")}`
          : null,
        company.employees ? `${company.employees} colaboradores` : null,
      ].filter((highlight): highlight is string => Boolean(highlight));

      const trackedFields = [
        company.industry,
        company.city,
        company.country,
        company.description,
        company.website,
        company.business_stage,
        company.annual_revenue,
        company.employees,
        company.company_size,
      ];
      const filledFieldCount = trackedFields.filter((field) => field !== null && field !== undefined && field !== "").length;

      return {
        source: "company",
        available: true,
        recordCount: 1,
        summary: `Perfil real de "${company.name}" carregado de public.companies.`,
        highlights:
          highlights.length > 0
            ? highlights
            : [`"${company.name}" ainda não possui atributos de perfil preenchidos`],
        context: {
          name: company.name,
          industry: company.industry ?? "",
          city: company.city ?? "",
          country: company.country ?? "",
          businessStage: company.business_stage ?? "",
        },
        healthScore: clampScore(40 + (filledFieldCount / trackedFields.length) * 55),
      };
    } catch (error) {
      return unavailableContribution("company", describeError(error));
    }
  },
};

export const SupabaseEnterpriseMemoryAdapter: DataSourceAdapter = {
  key: "enterprise_memory",
  async fetch(_organizationId, companyId): Promise<DataSourceContribution> {
    if (!isUuidLike(companyId)) {
      return unavailableContribution(
        "enterprise_memory",
        `companyId "${companyId}" não é um UUID válido de public.company_memory`,
      );
    }

    try {
      const memories = await getCompanyMemory(companyId);

      if (memories.length === 0) {
        return {
          source: "enterprise_memory",
          available: true,
          recordCount: 0,
          summary: "Nenhuma memória registrada ainda em public.company_memory.",
          highlights: [],
          context: { companyId },
          healthScore: 40,
        };
      }

      const categories = Array.from(new Set(memories.map((memory) => memory.category)));
      const highlights = memories
        .slice(0, 3)
        .map((memory) => `[${memory.category}] ${memory.title}`);

      return {
        source: "enterprise_memory",
        available: true,
        recordCount: memories.length,
        summary: `${memories.length} memória(s) reais recuperadas de public.company_memory.`,
        highlights,
        context: {
          categories: categories.join(", "),
          companyId,
        },
        healthScore: clampScore(50 + Math.min(memories.length, 10) * 5),
      };
    } catch (error) {
      return unavailableContribution("enterprise_memory", describeError(error));
    }
  },
};

const CRM_TABLES = ["contacts", "leads", "deals", "activities"] as const;

export const SupabaseCrmAdapter: DataSourceAdapter = {
  key: "crm",
  async fetch(_organizationId, companyId): Promise<DataSourceContribution> {
    if (!isUuidLike(companyId)) {
      return unavailableContribution("crm", `companyId "${companyId}" não é um UUID válido de public.crm`);
    }

    try {
      const results = await Promise.all(
        CRM_TABLES.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId);

          if (error) throw new Error(`${table}: ${describeError(error)}`);
          return { table, count: count ?? 0 };
        }),
      );

      const totalRecords = results.reduce((sum, item) => sum + item.count, 0);
      const highlights = results.map((item) => `${item.count} ${item.table}`);
      const context = results.reduce<Record<string, string>>((acc, item) => {
        acc[item.table] = String(item.count);
        return acc;
      }, {});

      return {
        source: "crm",
        available: true,
        recordCount: totalRecords,
        summary: `${totalRecords} registro(s) reais de CRM (contacts/leads/deals/activities).`,
        highlights,
        context,
        healthScore: clampScore(45 + Math.min(totalRecords, 50)),
      };
    } catch (error) {
      return unavailableContribution("crm", describeError(error));
    }
  },
};

export const SUPABASE_DATA_SOURCE_ADAPTERS: DataSourceAdapter[] = [
  SupabaseCompanyAdapter,
  SupabaseEnterpriseMemoryAdapter,
  SupabaseCrmAdapter,
];
