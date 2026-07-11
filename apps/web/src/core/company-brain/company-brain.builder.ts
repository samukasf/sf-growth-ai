import type {
  CompanyBrain,
  DiscoveryResult,
  StatusSection,
  SwotAnalysis,
  TimelineEntry,
} from "./company-brain.types";
import { applyScores } from "./company-brain.score";

function sectionData(discovery: DiscoveryResult, key: string): Record<string, unknown> {
  return discovery.profile.sections.find((section) => section.key === key)?.data ?? {};
}

function sectionConfidence(discovery: DiscoveryResult, key: string): number {
  return discovery.profile.sections.find((section) => section.key === key)?.confidence ?? 0;
}

function readString(data: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function readStringList(data: Record<string, unknown>, keys: string[]): string[] {
  const values: string[] = [];

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      values.push(value.trim());
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim()) {
          values.push(item.trim());
        }
      }
    }
  }

  return [...new Set(values)];
}

function buildStatusSection(
  summary: string,
  score: number,
  highlights: string[],
): StatusSection {
  return {
    summary,
    score: Math.max(0, Math.min(100, Math.round(score))),
    highlights,
  };
}

function buildSwot(discovery: DiscoveryResult): SwotAnalysis {
  const strengths = discovery.profile.sections
    .filter((section) => section.confidence >= 70)
    .map((section) => `${section.label}: dados consolidados com ${section.confidence}% de confiança`);

  const weaknesses = discovery.report.gaps
    .filter((gap) => gap.severity === "critical" || gap.severity === "high")
    .map((gap) => gap.title);

  const opportunities = discovery.report.opportunities.map((item) => item.title);
  const threats = discovery.report.gaps
    .filter((gap) => gap.severity === "medium" || gap.severity === "low")
    .map((gap) => gap.title);

  return {
    strengths: strengths.length > 0 ? strengths : ["Base de conhecimento inicial estruturada"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Lacunas críticas ainda não mapeadas"],
    opportunities:
      opportunities.length > 0 ? opportunities : ["Completar discovery para identificar oportunidades"],
    threats: threats.length > 0 ? threats : ["Incertezas operacionais por dados incompletos"],
  };
}

function buildTimeline(discovery: DiscoveryResult): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      id: `tl-${discovery.session.id}-created`,
      date: discovery.session.startedAt,
      label: "Discovery iniciado",
      description: `Sessão ${discovery.session.id} criada para ${discovery.session.companyName}.`,
      source: "discovery",
    },
    {
      id: `tl-${discovery.session.id}-completed`,
      date: discovery.report.generatedAt,
      label: "Discovery concluído",
      description: discovery.report.summary,
      source: "discovery",
    },
  ];

  for (const gap of discovery.report.gaps.slice(0, 3)) {
    entries.push({
      id: `tl-gap-${gap.id}`,
      date: gap.detectedAt,
      label: `Lacuna: ${gap.title}`,
      description: gap.recommendation,
      source: "discovery",
    });
  }

  for (const opportunity of discovery.report.opportunities.slice(0, 3)) {
    entries.push({
      id: `tl-opp-${opportunity.id}`,
      date: opportunity.detectedAt,
      label: `Oportunidade: ${opportunity.title}`,
      description: opportunity.description,
      source: "discovery",
    });
  }

  entries.push({
    id: `tl-brain-${discovery.session.id}`,
    date: new Date().toISOString(),
    label: "Company Brain construído",
    description: "Conhecimento estruturado gerado a partir do Discovery.",
    source: "brain",
  });

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function buildCompanyBrain(discovery: DiscoveryResult): CompanyBrain {
  const identity = sectionData(discovery, "identity");
  const productsSection = sectionData(discovery, "products");
  const customers = sectionData(discovery, "customers");
  const operations = sectionData(discovery, "operations");
  const finance = sectionData(discovery, "finance");
  const commercial = sectionData(discovery, "commercial");
  const technology = sectionData(discovery, "technology");

  const now = new Date().toISOString();
  const brainId = `cbrain-${discovery.session.companyId}-${Date.now()}`;

  const draft: CompanyBrain = {
    id: brainId,
    organizationId: discovery.session.organizationId,
    companyId: discovery.session.companyId,
    companyName: discovery.session.companyName,
    discoverySessionId: discovery.session.id,
    builtAt: now,
    updatedAt: now,
    companyProfile: {
      id: discovery.profile.id,
      name: discovery.profile.name,
      industry: discovery.profile.industry,
      description: discovery.profile.description,
      completenessScore: discovery.profile.completenessScore,
    },
    mission: readString(identity, ["mission", "identity.mission"], discovery.profile.description ?? ""),
    vision: readString(identity, ["vision", "identity.vision"], `Crescer de forma sustentável em ${discovery.profile.industry ?? "seu mercado"}`),
    values: readStringList(identity, ["values", "identity.values"]),
    products: readStringList(productsSection, ["products", "product_list", "offerings"]),
    services: readStringList(commercial, ["services", "service_list"]),
    targetAudience: readStringList(customers, ["target_audience", "segments", "personas", "customers"]),
    competitors: readStringList(commercial, ["competitors", "competition"]),
    swot: buildSwot(discovery),
    marketingStatus: buildStatusSection(
      readString(commercial, ["marketing_summary"], "Status comercial derivado do discovery."),
      sectionConfidence(discovery, "commercial") || discovery.report.score.overallScore,
      readStringList(commercial, ["channels", "campaigns", "marketing_highlights"]),
    ),
    financialStatus: buildStatusSection(
      readString(finance, ["financial_summary"], "Status financeiro derivado do discovery."),
      sectionConfidence(discovery, "finance") || discovery.report.score.overallScore,
      readStringList(finance, ["revenue_streams", "cost_drivers", "financial_highlights"]),
    ),
    operationalStatus: buildStatusSection(
      readString(operations, ["operations_summary"], "Status operacional derivado do discovery."),
      sectionConfidence(discovery, "operations") || discovery.report.score.overallScore,
      readStringList(operations, ["processes", "capacity", "operational_highlights"]),
    ),
    digitalPresence: buildStatusSection(
      readString(technology, ["digital_summary"], "Presença digital derivada do discovery."),
      sectionConfidence(discovery, "technology") || discovery.report.score.overallScore,
      readStringList(technology, ["platforms", "tools", "digital_channels"]),
    ),
    businessGoals: readStringList(identity, ["goals", "business_goals"]).concat(
      discovery.report.nextSteps.slice(0, 3),
    ),
    openRisks: discovery.report.gaps.map((gap) => `${gap.title}: ${gap.impact}`),
    growthOpportunities: discovery.report.opportunities.map(
      (item) => `${item.title} (${item.priority}) — ${item.estimatedImpact}`,
    ),
    timeline: buildTimeline(discovery),
    knowledgeScore: 0,
    completenessScore: 0,
    confidenceScore: 0,
  };

  return applyScores(draft, discovery);
}

export function updateCompanyBrainFromDiscovery(
  existing: CompanyBrain,
  discovery: DiscoveryResult,
): CompanyBrain {
  const rebuilt = buildCompanyBrain(discovery);
  return applyScores(
    {
      ...rebuilt,
      id: existing.id,
      builtAt: existing.builtAt,
      updatedAt: new Date().toISOString(),
    },
    discovery,
  );
}
