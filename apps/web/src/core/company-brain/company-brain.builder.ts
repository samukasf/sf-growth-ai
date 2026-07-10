import type { DiscoveryResult } from "../discovery/discovery.types";
import type {
  CompanyBrain,
  CompanyBrainBuildInput,
  CompanyBrainTimelineEvent,
  StatusArea,
} from "./company-brain.types";
import { applyScores } from "./company-brain.score";

const INDUSTRY_AUDIENCE: Record<string, string[]> = {
  default: ["Pequenas e médias empresas", "Consumidores locais"],
  impressão: ["Empresas de marketing", "Varejo", "Eventos corporativos"],
  tecnologia: ["Startups", "Empresas de médio porte", "Times de produto"],
  serviços: ["Profissionais autônomos", "Comércio local", "Indústria"],
};

function resolveTargetAudience(industry: string): string[] {
  const key = Object.keys(INDUSTRY_AUDIENCE).find((k) =>
    industry.toLowerCase().includes(k),
  );
  return INDUSTRY_AUDIENCE[key ?? "default"];
}

function buildMission(discovery: DiscoveryResult): string {
  const offering =
    discovery.services.length > 0
      ? discovery.services.slice(0, 2).join(" e ")
      : "soluções de qualidade";
  return `Oferecer ${offering} para clientes em ${discovery.location || "mercado local"}.`;
}

function buildVision(discovery: DiscoveryResult): string {
  return `Ser referência em ${discovery.industry} na região de ${discovery.location || "atuação"}.`;
}

function buildValues(discovery: DiscoveryResult): string[] {
  const values = ["Qualidade", "Compromisso com o cliente", "Melhoria contínua"];
  if (discovery.website) values.push("Presença digital");
  if (discovery.strengths.some((s) => s.title.toLowerCase().includes("equipe"))) {
    values.push("Excelência operacional");
  }
  return values;
}

function buildStatusArea(
  label: string,
  score: number,
  summary: string,
  indicators: string[],
): StatusArea {
  return { label, score, summary, indicators };
}

function buildMarketingStatus(discovery: DiscoveryResult): StatusArea {
  const hasSocial =
    Boolean(discovery.socialNetworks.instagram) ||
    Boolean(discovery.socialNetworks.facebook) ||
    Boolean(discovery.socialNetworks.linkedin);
  const score = (discovery.website ? 40 : 0) + (hasSocial ? 35 : 0) + (discovery.competitors.length > 0 ? 25 : 10);

  return buildStatusArea(
    "Marketing",
    Math.min(100, score),
    hasSocial
      ? "Presença digital parcial com redes sociais mapeadas."
      : "Presença digital limitada — ampliar canais de marketing.",
    [
      discovery.website ? "Website identificado" : "Website ausente",
      hasSocial ? "Redes sociais mapeadas" : "Redes sociais não informadas",
    ],
  );
}

function buildFinancialStatus(discovery: DiscoveryResult): StatusArea {
  const score = Math.min(100, 35 + discovery.confidence * 0.4);
  return buildStatusArea(
    "Financeiro",
    Math.round(score),
    "Estimativa baseada em sinais de discovery — dados financeiros reais pendentes.",
    ["Confiança do discovery aplicada", "Dados financeiros formais não coletados"],
  );
}

function buildOperationalStatus(discovery: DiscoveryResult): StatusArea {
  const score = Math.min(100, 30 + discovery.services.length * 12 + discovery.products.length * 8);
  return buildStatusArea(
    "Operacional",
    Math.round(score),
    `${discovery.services.length} serviços operacionais mapeados.`,
    discovery.services.slice(0, 3).map((s) => `Serviço: ${s}`),
  );
}

function buildDigitalPresence(discovery: DiscoveryResult): StatusArea {
  const channels = [
    discovery.website ? "Website" : null,
    discovery.socialNetworks.instagram ? "Instagram" : null,
    discovery.socialNetworks.facebook ? "Facebook" : null,
    discovery.socialNetworks.linkedin ? "LinkedIn" : null,
  ].filter(Boolean) as string[];

  const score = Math.min(100, channels.length * 25);
  return buildStatusArea(
    "Presença Digital",
    score,
    channels.length > 0
      ? `Canais digitais ativos: ${channels.join(", ")}.`
      : "Nenhum canal digital confirmado.",
    channels.length > 0 ? channels : ["Canal digital não identificado"],
  );
}

function buildTimeline(discovery: DiscoveryResult, brainId: string): CompanyBrainTimelineEvent[] {
  const now = new Date().toISOString();
  return [
    {
      id: `tl-discovery-${discovery.id}`,
      type: "discovery",
      title: "Discovery concluído",
      description: `Coleta inicial para ${discovery.company} com confiança de ${discovery.confidence}%.`,
      occurredAt: discovery.generatedAt,
    },
    {
      id: `tl-build-${brainId}`,
      type: "build",
      title: "Company Brain construído",
      description: "Estrutura de conhecimento organizacional gerada a partir do Discovery.",
      occurredAt: now,
    },
  ];
}

function buildRecommendations(discovery: DiscoveryResult): string[] {
  const recommendations = [...discovery.nextSteps];

  for (const missing of discovery.missingInformation) {
    recommendations.push(`Completar informação ausente: ${missing}`);
  }

  if (discovery.weaknesses.length > 0) {
    recommendations.push(`Endereçar fraqueza prioritária: ${discovery.weaknesses[0].title}`);
  }

  return [...new Set(recommendations)].slice(0, 8);
}

export function buildCompanyBrainFromDiscovery(input: CompanyBrainBuildInput): CompanyBrain {
  const { discoveryResult } = input;
  const tenantId = input.tenantId ?? "tenant-demo";
  const companyId = input.companyId ?? "company-demo";
  const brainId = discoveryResult.companyBrainId || `brain-${Date.now()}`;
  const now = new Date().toISOString();

  const brain: CompanyBrain = {
    id: brainId,
    tenantId,
    companyId,
    discoveryId: discoveryResult.id,
    profile: {
      companyName: discoveryResult.company,
      website: discoveryResult.website,
      industry: discoveryResult.industry,
      location: discoveryResult.location,
      socialNetworks: discoveryResult.socialNetworks,
    },
    mission: buildMission(discoveryResult),
    vision: buildVision(discoveryResult),
    values: buildValues(discoveryResult),
    products: discoveryResult.products,
    services: discoveryResult.services,
    targetAudience: resolveTargetAudience(discoveryResult.industry),
    competitors: discoveryResult.competitors,
    swot: {
      strengths: discoveryResult.strengths,
      weaknesses: discoveryResult.weaknesses,
      opportunities: discoveryResult.opportunities,
      risks: discoveryResult.risks,
    },
    marketingStatus: buildMarketingStatus(discoveryResult),
    financialStatus: buildFinancialStatus(discoveryResult),
    operationalStatus: buildOperationalStatus(discoveryResult),
    digitalPresence: buildDigitalPresence(discoveryResult),
    businessGoals: discoveryResult.nextSteps.slice(0, 5),
    openRisks: discoveryResult.risks.map((r) => r.title),
    growthOpportunities: discoveryResult.opportunities.map((o) => o.title),
    timeline: buildTimeline(discoveryResult, brainId),
    knowledgeScore: 0,
    completenessScore: 0,
    confidenceScore: discoveryResult.confidence,
    executiveSummary: discoveryResult.executiveSummary,
    recommendations: buildRecommendations(discoveryResult),
    createdAt: now,
    updatedAt: now,
  };

  return applyScores(brain);
}
