import {
  SoftwareOpportunity,
  type InnovationOpportunity,
  type SoftwareCategory,
  type SoftwareOpportunityAnalyzer,
} from "../../domain";

const SOFTWARE_PATTERNS: Array<{
  keywords: string[];
  category: SoftwareCategory;
  title: string;
  buildDays: number;
}> = [
  {
    keywords: ["agendamento", "scheduling", "agenda"],
    category: "scheduling",
    title: "Sistema de agendamento",
    buildDays: 21,
  },
  {
    keywords: ["delivery", "entrega"],
    category: "delivery",
    title: "Plataforma de delivery",
    buildDays: 30,
  },
  {
    keywords: ["crm", "cliente", "customer"],
    category: "crm",
    title: "CRM interno",
    buildDays: 25,
  },
  {
    keywords: ["dashboard", "painel", "indicador", "kpi"],
    category: "dashboard",
    title: "Dashboard executivo",
    buildDays: 14,
  },
  {
    keywords: ["whatsapp", "atendimento", "suporte"],
    category: "whatsapp_support",
    title: "Atendimento via WhatsApp",
    buildDays: 18,
  },
  {
    keywords: ["landing", "site", "página"],
    category: "landing_page",
    title: "Landing page comercial",
    buildDays: 10,
  },
  {
    keywords: ["integração", "integration", "api"],
    category: "integration",
    title: "Integração entre sistemas",
    buildDays: 20,
  },
];

export class DefaultSoftwareOpportunityAnalyzer implements SoftwareOpportunityAnalyzer {
  analyze(opportunity: InnovationOpportunity): SoftwareOpportunity[] {
    const text = `${opportunity.problemDetected} ${opportunity.description} ${opportunity.tags.join(" ")}`.toLowerCase();

    if (opportunity.opportunityType !== "software" && !text.includes("sistema")) {
      const matched = SOFTWARE_PATTERNS.filter((pattern) =>
        pattern.keywords.some((keyword) => text.includes(keyword)),
      );
      if (matched.length === 0) return [];
    }

    const patterns =
      SOFTWARE_PATTERNS.filter((pattern) =>
        pattern.keywords.some((keyword) => text.includes(keyword)),
      ) || [];

    const selected =
      patterns.length > 0
        ? patterns
        : opportunity.opportunityType === "software"
          ? [
              {
                keywords: ["internal"],
                category: "internal_tool" as SoftwareCategory,
                title: "Ferramenta interna",
                buildDays: 15,
              },
            ]
          : [];

    return selected.map((pattern) =>
      SoftwareOpportunity.create({
        companyId: opportunity.companyId,
        opportunityId: opportunity.id,
        category: pattern.category,
        title: pattern.title,
        description: `Oportunidade de software para resolver: ${opportunity.problemDetected}`,
        businessJustification: `Impacto esperado de ${opportunity.expectedImpact} com ROI estimado.`,
        complexity: Math.min(100, pattern.buildDays * 2),
        estimatedBuildDays: pattern.buildDays,
      }),
    );
  }
}
