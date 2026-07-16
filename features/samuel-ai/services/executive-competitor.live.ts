import type { CompanyMemoryRecord } from "@/services/executive-memory.service";
import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type {
  CompetitorProfile,
  CompetitorRecommendation,
  ExecutiveCompetitor,
} from "./executive-competitor.service";

export type CompetitorLiveInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  memories?: CompanyMemoryRecord[];
};

function competitorMemories(memories: CompanyMemoryRecord[]): CompanyMemoryRecord[] {
  return memories.filter((memory) =>
    /competitor|concorr|rival|benchmark/i.test(`${memory.category} ${memory.title}`),
  );
}

function profilesFromMemories(memories: CompanyMemoryRecord[]): CompetitorProfile[] {
  return competitorMemories(memories).slice(0, 5).map((memory, index) => ({
    id: memory.id || `comp-live-${index}`,
    name: memory.title.replace(/^\[.*?\]\s*/, "").slice(0, 80),
    segment: memory.category || "Mercado",
    positioning: String(memory.content).slice(0, 160),
    website: null,
    digitalPresence: "Solicitado via memória empresarial",
    reputation: "Em avaliação",
    acquisitionChannels: [...memory.source ? [memory.source] : ["company-memory"]],
    marketingFocus: String(memory.content).slice(0, 120),
  }));
}

function profilesFromIntelligence(
  intelligence: ExecutiveIntelligence,
  companyName: string,
  industry: string,
): CompetitorProfile[] {
  const competitiveLines = [
    ...intelligence.risks,
    ...intelligence.opportunities,
    ...intelligence.priorities,
  ].filter((line) => /concorr|compet|mercado|benchmark|share/i.test(line));

  return competitiveLines.slice(0, 3).map((line, index) => ({
    id: `comp-intel-${index}`,
    name: line.split(/[:.—]/)[0]?.trim() || `Sinal competitivo ${index + 1}`,
    segment: industry,
    positioning: line,
    website: null,
    digitalPresence: `Derivado do contexto de ${companyName}`,
    reputation: "Sinal interno",
    acquisitionChannels: ["executive-intelligence"],
    marketingFocus: line.slice(0, 120),
  }));
}

/**
 * Constrói inteligência competitiva apenas a partir de contexto real.
 * Retorna null quando não há evidência suficiente — nunca usa o dataset mock.
 */
export function buildExecutiveCompetitorFromContext(
  input: CompetitorLiveInput = {},
): ExecutiveCompetitor | null {
  const companyName = input.context?.company.name ?? "Empresa";
  const industry =
    input.context?.businessProfile?.segment ?? input.context?.company.industry ?? "Mercado";
  const memories = input.memories ?? input.context?.memories ?? [];

  const competitors = [
    ...profilesFromMemories(memories),
    ...(input.intelligence
      ? profilesFromIntelligence(input.intelligence, companyName, industry)
      : []),
  ];

  // Deduplicate by name
  const unique = competitors.filter(
    (profile, index, list) =>
      list.findIndex((item) => item.name.toLowerCase() === profile.name.toLowerCase()) === index,
  );

  if (unique.length === 0) {
    return null;
  }

  const threats = (input.intelligence?.risks ?? [])
    .filter((risk) => /concorr|mercado|preço|share/i.test(risk))
    .slice(0, 4)
    .map((risk, index) => ({
      id: `cthr-live-${index}`,
      title: risk.split(/[:.—]/)[0]?.trim() || `Ameaça ${index + 1}`,
      description: risk,
      severity: /crític|urgente/i.test(risk)
        ? ("critical" as const)
        : ("high" as const),
    }));

  const opportunities = (input.intelligence?.opportunities ?? [])
    .slice(0, 4)
    .map((item, index) => ({
      id: `copp-live-${index}`,
      title: item.split(/[:.—]/)[0]?.trim() || `Oportunidade ${index + 1}`,
      description: item,
      horizon: "90d" as const,
    }));

  const recommendations: CompetitorRecommendation[] = [
    ...threats.slice(0, 2).map((threat, index) => ({
      id: `crec-live-${index}`,
      title: `Mitigar: ${threat.title}`,
      description: threat.description,
      priority: threat.severity === "critical" ? ("critical" as const) : ("high" as const),
    })),
    ...opportunities.slice(0, 2).map((opportunity, index) => ({
      id: `crec-opp-${index}`,
      title: `Capturar: ${opportunity.title}`,
      description: opportunity.description,
      priority: "medium" as const,
    })),
  ];

  return {
    competitors: unique,
    strengths: unique.slice(0, 3).map((competitor, index) => ({
      id: `cstr-live-${index}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      title: "Presença competitiva observada",
      description: competitor.positioning,
    })),
    weaknesses: unique.slice(0, 3).map((competitor, index) => ({
      id: `cweak-live-${index}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      title: "Lacuna a explorar",
      description: `Avaliar diferenciação de ${companyName} frente a ${competitor.name} em ${industry}.`,
    })),
    opportunities:
      opportunities.length > 0
        ? opportunities
        : [
            {
              id: "copp-default",
              title: "Aprofundar inteligência competitiva",
              description: `Enriquecer memórias de concorrentes de ${companyName} para análise mais precisa.`,
              horizon: "30d",
            },
          ],
    threats:
      threats.length > 0
        ? threats
        : [
            {
              id: "cthr-default",
              title: "Cobertura competitiva parcial",
              description: "Sinais limitados — conectar fontes de mercado para monitoramento contínuo.",
              severity: "medium",
            },
          ],
    marketShare: {
      companyShare: "n/d",
      marketLeader: unique[0]?.name ?? "n/d",
      leaderShare: "n/d",
      competitorAverage: "n/d",
      byCompetitor: unique.map((competitor) => ({ name: competitor.name, share: "n/d" })),
    },
    pricePosition: {
      companyPosition: "Em análise com dados reais da empresa",
      marketRange: "Depende de fontes de pricing conectadas",
      competitorPricing: unique.slice(0, 3).map((competitor) => ({
        competitorId: competitor.id,
        competitorName: competitor.name,
        tier: "Observado",
        range: "n/d",
      })),
      recommendation: "Validar pricing com pesquisa de mercado e propostas reais.",
    },
    differentiators: unique.map((competitor) => ({
      competitorId: competitor.id,
      competitorName: competitor.name,
      items: [competitor.positioning, competitor.marketingFocus].filter(Boolean),
    })),
    marketGaps: [
      {
        id: "cgap-live-1",
        area: industry,
        companyPosition: companyName,
        competitorBenchmark: unique.map((item) => item.name).join(", "),
        gap: "Gap competitivo derivado do contexto empresarial atual",
        priority: "high",
      },
    ],
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            {
              id: "crec-default",
              title: "Manter monitoramento competitivo",
              description: `Atualizar memórias de concorrentes de ${companyName} semanalmente.`,
              priority: "medium",
            },
          ],
    executiveSummary: `${companyName} — inteligência competitiva com ${unique.length} sinal(is) reais de contexto/memória. Sem dataset de demonstração.`,
  };
}
