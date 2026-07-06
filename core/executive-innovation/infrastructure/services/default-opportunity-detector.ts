import { InnovationOpportunity, type OpportunityDetector, type OpportunityDetectionInput } from "../../domain";

const MANUAL_PROCESS_KEYWORDS = [
  "manual",
  "planilha",
  "spreadsheet",
  "excel",
  "repetitivo",
  "repetitive",
  "copiar",
  "copy",
  "colar",
  "paste",
  "digitar",
  "type",
];

const SOFTWARE_KEYWORDS: Record<string, { type: "software"; category: string; title: string }> = {
  agendamento: { type: "software", category: "scheduling", title: "Sistema de agendamento" },
  scheduling: { type: "software", category: "scheduling", title: "Scheduling system" },
  delivery: { type: "software", category: "delivery", title: "Sistema de delivery" },
  entrega: { type: "software", category: "delivery", title: "Sistema de entrega" },
  crm: { type: "software", category: "crm", title: "CRM interno" },
  dashboard: { type: "software", category: "dashboard", title: "Dashboard executivo" },
  whatsapp: { type: "software", category: "whatsapp_support", title: "Atendimento WhatsApp" },
  atendimento: { type: "software", category: "whatsapp_support", title: "Canal de atendimento digital" },
};

const COST_KEYWORDS = ["custo", "cost", "despesa", "expense", "redução", "reduction"];
const REVENUE_KEYWORDS = ["receita", "revenue", "venda", "sales", "faturamento"];
const PRODUCT_KEYWORDS = ["produto", "product", "novo produto", "new product"];
const SERVICE_KEYWORDS = ["serviço", "service", "novo serviço", "new service"];

function inferOpportunityType(problem: string, tags: string[]): InnovationOpportunity["opportunityType"] {
  const text = `${problem} ${tags.join(" ")}`.toLowerCase();

  if (MANUAL_PROCESS_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "automation";
  }
  if (Object.keys(SOFTWARE_KEYWORDS).some((keyword) => text.includes(keyword))) {
    return "software";
  }
  if (PRODUCT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "new_product";
  }
  if (SERVICE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "new_service";
  }
  if (COST_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "cost_reduction";
  }
  if (REVENUE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return "revenue_increase";
  }

  return "operational_improvement";
}

function inferArea(area: string): InnovationOpportunity["area"] {
  const normalized = area.toLowerCase();
  const areas: InnovationOpportunity["area"][] = [
    "operations",
    "sales",
    "marketing",
    "finance",
    "customer_service",
    "technology",
    "hr",
    "general",
  ];

  return areas.find((item) => normalized.includes(item)) ?? "general";
}

function buildRelatedIds(
  source: OpportunityDetectionInput["signals"][number]["source"],
  referenceId?: string,
): Pick<
  InnovationOpportunity,
  "relatedKnowledgeIds" | "relatedLearningIds" | "relatedExperienceIds" | "relatedWisdomIds"
> {
  const empty = {
    relatedKnowledgeIds: [] as string[],
    relatedLearningIds: [] as string[],
    relatedExperienceIds: [] as string[],
    relatedWisdomIds: [] as string[],
  };

  if (!referenceId) return empty;

  switch (source) {
    case "knowledge":
      return { ...empty, relatedKnowledgeIds: [referenceId] };
    case "learning":
      return { ...empty, relatedLearningIds: [referenceId] };
    case "experience":
      return { ...empty, relatedExperienceIds: [referenceId] };
    case "wisdom":
      return { ...empty, relatedWisdomIds: [referenceId] };
    default:
      return empty;
  }
}

export class DefaultOpportunityDetector implements OpportunityDetector {
  detect(input: OpportunityDetectionInput): InnovationOpportunity[] {
    return input.signals.map((signal) => {
      const opportunityType = inferOpportunityType(signal.problem, signal.tags ?? []);
      const related = buildRelatedIds(signal.source, signal.referenceId);
      const impactBase =
        opportunityType === "revenue_increase"
          ? 75
          : opportunityType === "cost_reduction"
            ? 65
            : opportunityType === "automation"
              ? 70
              : 55;

      return InnovationOpportunity.create({
        companyId: input.companyId,
        title: `Oportunidade: ${signal.problem.slice(0, 80)}`,
        description: `Oportunidade detectada a partir de sinal de ${signal.source} na área ${signal.area}.`,
        problemDetected: signal.problem,
        opportunityType,
        area: inferArea(signal.area),
        expectedImpact: impactBase,
        estimatedROI: 0,
        estimatedCost: opportunityType === "software" ? 15000 : 5000,
        estimatedTime: opportunityType === "software" ? 60 : 30,
        riskLevel: opportunityType === "new_product" ? "high" : "medium",
        confidence: signal.source === "manual" ? 60 : 70,
        requiredApproval: impactBase >= 65,
        status: "detected",
        recommendedNextStep:
          opportunityType === "automation"
            ? "Mapear processo manual e estimar automação"
            : opportunityType === "software"
              ? "Definir escopo de software interno"
              : "Validar hipótese com stakeholders",
        ...related,
        tags: [...(signal.tags ?? []), signal.source, opportunityType],
      });
    });
  }
}
