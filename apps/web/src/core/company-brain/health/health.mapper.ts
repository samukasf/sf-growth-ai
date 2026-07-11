import type { CompanyBrain, DiscoveryResult } from "../company-brain.types";
import type { KnowledgeGraph } from "../knowledge/knowledge.types";
import type { TimelineEvent } from "../timeline/timeline.types";
import type {
  HealthCalculationContext,
  HealthDimension,
  HealthEvidence,
  HealthRecommendation,
} from "./health.types";

function evidenceId(source: string, label: string) {
  return `hev-${source}-${label.toLowerCase().replace(/\s+/g, "-").slice(0, 32)}`;
}

export function mapDiscoveryEvidence(discovery: DiscoveryResult): HealthEvidence[] {
  return [
    {
      id: evidenceId("discovery", "profile-completeness"),
      source: "discovery",
      label: "Completude do perfil",
      detail: `Perfil ${discovery.profile.completenessScore}% completo.`,
      weight: 0.9,
    },
    {
      id: evidenceId("discovery", "overall-score"),
      source: "discovery",
      label: "Score do discovery",
      detail: `Score geral: ${discovery.report.score.overallScore}/100.`,
      weight: 1,
    },
    ...discovery.report.gaps.slice(0, 2).map((gap) => ({
      id: evidenceId("discovery", gap.title),
      source: "discovery" as const,
      label: gap.title,
      detail: gap.recommendation,
      weight: gap.severity === "critical" ? 1 : 0.7,
    })),
  ];
}

export function mapBrainEvidence(brain: CompanyBrain, dimension: HealthDimension): HealthEvidence[] {
  const evidence: HealthEvidence[] = [
    {
      id: evidenceId("company-brain", `${dimension}-knowledge`),
      source: "company-brain",
      label: "Knowledge Score",
      detail: `Knowledge Score: ${brain.knowledgeScore}/100.`,
      weight: 0.8,
    },
  ];

  if (dimension === "marketing") {
    evidence.push({
      id: evidenceId("company-brain", "marketing-status"),
      source: "company-brain",
      label: "Status de marketing",
      detail: brain.marketingStatus.summary,
      weight: 1,
    });
  }

  if (dimension === "financial") {
    evidence.push({
      id: evidenceId("company-brain", "financial-status"),
      source: "company-brain",
      label: "Status financeiro",
      detail: brain.financialStatus.summary,
      weight: 1,
    });
  }

  if (dimension === "operations") {
    evidence.push({
      id: evidenceId("company-brain", "operations-status"),
      source: "company-brain",
      label: "Status operacional",
      detail: brain.operationalStatus.summary,
      weight: 1,
    });
  }

  if (dimension === "digital_presence" || dimension === "technology") {
    evidence.push({
      id: evidenceId("company-brain", "digital-presence"),
      source: "company-brain",
      label: "Presença digital",
      detail: brain.digitalPresence.summary,
      weight: 1,
    });
  }

  if (dimension === "brand") {
    evidence.push({
      id: evidenceId("company-brain", "mission"),
      source: "company-brain",
      label: "Missão",
      detail: brain.mission,
      weight: 0.9,
    });
  }

  if (dimension === "sales") {
    evidence.push({
      id: evidenceId("company-brain", "products"),
      source: "company-brain",
      label: "Portfólio comercial",
      detail: `${brain.products.length} produto(s) e ${brain.services.length} serviço(s) mapeados.`,
      weight: 0.85,
    });
  }

  if (dimension === "customer_experience") {
    evidence.push({
      id: evidenceId("company-brain", "audience"),
      source: "company-brain",
      label: "Público-alvo",
      detail: brain.targetAudience.join(", ") || "Público-alvo não mapeado.",
      weight: 0.9,
    });
  }

  return evidence.filter((item) => item.detail.trim().length > 0);
}

export function mapTimelineEvidence(events: TimelineEvent[]): HealthEvidence[] {
  return events.slice(0, 3).map((event) => ({
    id: evidenceId("timeline", event.title),
    source: "timeline",
    label: event.title,
    detail: event.description,
    weight: event.importance === "critical" ? 1 : event.importance === "high" ? 0.8 : 0.6,
  }));
}

export function mapKnowledgeEvidence(graph: KnowledgeGraph): HealthEvidence[] {
  return [
    {
      id: evidenceId("knowledge-graph", "nodes"),
      source: "knowledge-graph",
      label: "Entidades mapeadas",
      detail: `${graph.nodes.length} entidades no grafo de conhecimento.`,
      weight: 0.8,
    },
    {
      id: evidenceId("knowledge-graph", "relations"),
      source: "knowledge-graph",
      label: "Relações mapeadas",
      detail: `${graph.relations.length} relações conectando o conhecimento empresarial.`,
      weight: 0.8,
    },
  ];
}

export function buildHealthContextFromIntegrations(input: {
  brain: CompanyBrain;
  discovery?: DiscoveryResult;
  timelineEvents?: TimelineEvent[];
  knowledgeGraph?: KnowledgeGraph;
}): HealthCalculationContext {
  return {
    brain: input.brain,
    discovery: input.discovery,
    timelineEventCount: input.timelineEvents?.length ?? 0,
    timelineHighlights: input.timelineEvents?.slice(0, 3).map((event) => event.title),
    knowledgeNodeCount: input.knowledgeGraph?.nodes.length ?? 0,
    knowledgeRelationCount: input.knowledgeGraph?.relations.length ?? 0,
    knowledgeHighlights: input.knowledgeGraph?.nodes.slice(0, 3).map((node) => node.name),
  };
}

export function mapRecommendationsForDimension(
  dimension: HealthDimension,
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];

  if (dimension === "financial" && brain.openRisks.length > 0) {
    recommendations.push({
      id: `hr-${dimension}-risk`,
      dimension,
      priority: "high",
      title: "Endereçar risco financeiro",
      description: brain.openRisks[0] ?? "Consolidar dados financeiros.",
    });
  }

  if (dimension === "marketing" && brain.growthOpportunities.length > 0) {
    recommendations.push({
      id: `hr-${dimension}-growth`,
      dimension,
      priority: "medium",
      title: "Explorar oportunidade de marketing",
      description: brain.growthOpportunities[0] ?? "Revisar canais de aquisição.",
    });
  }

  if (discovery && dimension === "operations") {
    const step = discovery.report.nextSteps[0];
    if (step) {
      recommendations.push({
        id: `hr-${dimension}-next-step`,
        dimension,
        priority: "medium",
        title: "Executar próximo passo operacional",
        description: step,
      });
    }
  }

  return recommendations;
}
