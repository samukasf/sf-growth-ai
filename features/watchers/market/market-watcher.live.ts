import type { CompanyMemoryRecord } from "@/services/executive-memory.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";

import type { MarketWatcherProviderData } from "./market-watcher.provider";
import type {
  MarketAlert,
  MarketOpportunity,
  MarketRecommendation,
  MarketSeverity,
  MarketSignal,
  MarketThreat,
  MarketTrend,
  MarketWatcherInput,
  CompetitiveMovement,
} from "./market-watcher.types";

export type MarketWatcherLiveInput = MarketWatcherInput & {
  memories?: CompanyMemoryRecord[];
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
};

type NewsArticle = {
  title?: string;
  description?: string;
  source?: { name?: string };
  publishedAt?: string;
  url?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function severityFromText(text: string): MarketSeverity {
  if (/crític|falência|processo|multa|recall/i.test(text)) return "Critical";
  if (/ameaça|risco|queda|crise|concorr/i.test(text)) return "High";
  if (/oportun|cresc|expans|parceria/i.test(text)) return "Medium";
  return "Medium";
}

function recommendationFor(
  id: string,
  title: string,
  description: string,
  priority: MarketSeverity,
): MarketRecommendation {
  return {
    id,
    title,
    description,
    priority,
    responsibleArea: "Strategy",
  };
}

async function fetchNewsApiArticles(
  companyName: string,
  industry?: string | null,
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY ?? process.env.MARKET_NEWS_API_KEY;
  if (!apiKey) return [];

  const query = [companyName, industry].filter(Boolean).join(" OR ");
  const params = new URLSearchParams({
    q: query.slice(0, 180),
    language: "pt",
    sortBy: "publishedAt",
    pageSize: "8",
    apiKey,
  });

  try {
    const response = await fetch(`https://newsapi.org/v2/everything?${params}`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { articles?: NewsArticle[] };
    return payload.articles ?? [];
  } catch {
    return [];
  }
}

function memoriesToSignals(memories: CompanyMemoryRecord[]): MarketSignal[] {
  return memories
    .filter((memory) =>
      /market|competitor|threat|opportunity|tendência|mercado|concorr/i.test(
        `${memory.category} ${memory.title}`,
      ),
    )
    .slice(0, 8)
    .map((memory, index) => {
      const text = `${memory.title} ${memory.content}`;
      const severity = severityFromText(text);
      return {
        id: `memory-signal-${memory.id || index}`,
        type: /oportun/i.test(text)
          ? ("growth_opportunity" as const)
          : /ameaça|risco|threat/i.test(text)
            ? ("competitive_threat" as const)
            : /concorr/i.test(text)
              ? ("new_competitor" as const)
              : ("market_trend" as const),
        title: memory.title,
        description: String(memory.content).slice(0, 280),
        severity,
        confidence: Math.min(95, 55 + Number(memory.importance || 5) * 4),
        source: memory.source ? `company-memory:${memory.source}` : "company-memory",
        detectedAt: nowIso(),
      };
    });
}

function intelligenceToSignals(
  intelligence: ExecutiveIntelligence | null | undefined,
): MarketSignal[] {
  if (!intelligence) return [];

  const fromRisks = intelligence.risks.slice(0, 3).map((risk, index) => ({
    id: `intel-risk-${index}`,
    type: "competitive_threat" as const,
    title: risk.split(/[:.—]/)[0]?.trim() || `Risco de mercado ${index + 1}`,
    description: risk,
    severity: severityFromText(risk),
    confidence: 72,
    source: "executive-intelligence",
    detectedAt: nowIso(),
  }));

  const fromOpportunities = intelligence.opportunities.slice(0, 3).map((item, index) => ({
    id: `intel-opp-${index}`,
    type: "growth_opportunity" as const,
    title: item.split(/[:.—]/)[0]?.trim() || `Oportunidade ${index + 1}`,
    description: item,
    severity: "High" as const,
    confidence: 70,
    source: "executive-intelligence",
    detectedAt: nowIso(),
  }));

  return [...fromRisks, ...fromOpportunities];
}

function competitorToMovements(
  competitor: ExecutiveCompetitor | null | undefined,
): CompetitiveMovement[] {
  if (!competitor) return [];

  return competitor.competitors.slice(0, 5).map((profile, index) => ({
    id: `comp-move-${profile.id || index}`,
    competitor: profile.name,
    movement: profile.positioning,
    description: `${profile.segment} · ${profile.digitalPresence}`,
    severity: "High" as const,
    confidence: 75,
    detectedAt: nowIso(),
  }));
}

function articlesToSignals(articles: NewsArticle[]): MarketSignal[] {
  return articles.slice(0, 6).map((article, index) => {
    const title = article.title?.trim() || `Notícia de mercado ${index + 1}`;
    const description =
      article.description?.trim() ||
      article.title?.trim() ||
      "Sinal de mercado proveniente de fonte jornalística.";
    return {
      id: `news-signal-${index}`,
      type: "sector_movement" as const,
      title,
      description,
      severity: severityFromText(`${title} ${description}`),
      confidence: 68,
      source: article.source?.name
        ? `newsapi:${article.source.name}`
        : "newsapi",
      detectedAt: article.publishedAt || nowIso(),
    };
  });
}

function buildDerivedPayload(
  input: MarketWatcherLiveInput,
  signals: MarketSignal[],
  movements: CompetitiveMovement[],
): MarketWatcherProviderData | null {
  if (signals.length === 0 && movements.length === 0) {
    return null;
  }

  const company = input.companyName ?? "Empresa";
  const trends: MarketTrend[] = signals
    .filter((signal) => signal.type === "market_trend" || signal.type === "sector_movement")
    .slice(0, 4)
    .map((signal) => ({
      id: `trend-${signal.id}`,
      title: signal.title,
      description: signal.description,
      direction: /queda|crise|risco/i.test(signal.description) ? "down" : "up",
      severity: signal.severity,
      confidence: signal.confidence,
      source: signal.source,
    }));

  const opportunities: MarketOpportunity[] = signals
    .filter((signal) => signal.type === "growth_opportunity")
    .slice(0, 4)
    .map((signal) => ({
      id: `opp-${signal.id}`,
      title: signal.title,
      description: signal.description,
      severity: signal.severity,
      confidence: signal.confidence,
      growthPotential: "Potencial de crescimento identificado no contexto empresarial",
      source: signal.source,
    }));

  const threats: MarketThreat[] = signals
    .filter(
      (signal) =>
        signal.type === "competitive_threat" ||
        signal.severity === "Critical" ||
        signal.severity === "High",
    )
    .slice(0, 4)
    .map((signal) => ({
      id: `threat-${signal.id}`,
      title: signal.title,
      description: signal.description,
      severity: signal.severity,
      confidence: signal.confidence,
      impact: "Requer acompanhamento executivo nas próximas decisões de mercado",
      source: signal.source,
    }));

  const newCompetitors = movements.slice(0, 3);
  const recommendations: MarketRecommendation[] = [
    ...threats.slice(0, 2).map((threat, index) =>
      recommendationFor(
        `rec-threat-${index}`,
        `Mitigar: ${threat.title}`,
        threat.description,
        threat.severity,
      ),
    ),
    ...opportunities.slice(0, 2).map((opportunity, index) =>
      recommendationFor(
        `rec-opp-${index}`,
        `Capturar: ${opportunity.title}`,
        opportunity.description,
        opportunity.severity,
      ),
    ),
  ];

  if (recommendations.length === 0) {
    recommendations.push(
      recommendationFor(
        "rec-default",
        `Monitorar mercado de ${company}`,
        "Manter cadência de inteligência competitiva com base nas fontes conectadas.",
        "Medium",
      ),
    );
  }

  const alerts: MarketAlert[] = [...threats, ...opportunities].slice(0, 6).map((item, index) => ({
    id: `alert-${item.id}`,
    title: item.title,
    description: item.description,
    severity: item.severity,
    source: item.source,
    expectedImpact: "impact" in item ? item.impact : item.growthPotential,
    recommendation: recommendations[Math.min(index, recommendations.length - 1)],
    responsibleArea: "Strategy",
    confidence: item.confidence,
    status: "active",
    createdAt: nowIso(),
  }));

  return {
    signals,
    trends,
    newCompetitors,
    competitiveMovements: movements,
    opportunities,
    threats,
    alerts,
    recommendations,
  };
}

/**
 * Live Market Watcher: NewsAPI (quando configurada) + memórias/intelligence/competitor reais.
 * Nunca devolve o dataset mock de demonstração.
 */
export async function fetchMarketWatcherLiveData(
  input: MarketWatcherLiveInput = {},
): Promise<MarketWatcherProviderData | null> {
  const companyName = input.companyName ?? "Empresa";
  const articles = await fetchNewsApiArticles(companyName, input.industry);

  const signals = [
    ...articlesToSignals(articles),
    ...memoriesToSignals(input.memories ?? []),
    ...intelligenceToSignals(input.intelligence),
  ];

  const movements = competitorToMovements(input.competitor);
  return buildDerivedPayload(input, signals, movements);
}

export function isMarketNewsConfigured(): boolean {
  return Boolean(process.env.NEWS_API_KEY || process.env.MARKET_NEWS_API_KEY);
}
