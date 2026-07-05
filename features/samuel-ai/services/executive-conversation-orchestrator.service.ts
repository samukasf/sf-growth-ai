import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";

import type { ExecutiveCEO } from "./executive-ceo.service";
import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";
import type { ExecutiveContext } from "@/services/executive-context.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import {
  buildExecutiveReasoning,
  type ExecutiveReasoning,
} from "./executive-reasoning.service";

export type ConversationIntent =
  | "marketing"
  | "finance"
  | "sales"
  | "operations"
  | "hr"
  | "legal"
  | "strategy"
  | "competition"
  | "google-business"
  | "google-analytics"
  | "meta"
  | "linkedin"
  | "crm"
  | "general";

export type ExecutiveModuleId =
  | "ceo"
  | "crm"
  | "marketing"
  | "sales"
  | "finance"
  | "operations"
  | "hr"
  | "legal"
  | "strategy"
  | "competitor"
  | "google-business"
  | "google-analytics"
  | "meta"
  | "linkedin";

export type ExecutiveConversationContext = {
  companyName?: string;
  executiveContext?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  forecast?: ExecutiveForecast | null;
  executiveCeo?: ExecutiveCEO | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  strategy?: ExecutiveStrategy | null;
  competitor?: ExecutiveCompetitor | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
  googleAnalyticsExecutive?: GoogleAnalyticsExecutive | null;
  metaExecutive?: MetaExecutive | null;
  linkedInExecutive?: LinkedInExecutive | null;
};

export type ExecutiveRequest = {
  question: string;
  context?: ExecutiveConversationContext;
};

export type ExecutiveParticipant = {
  id: ExecutiveModuleId;
  name: string;
  role: string;
  domain: string;
  reason: string;
  consulted: boolean;
  healthScore: number | null;
  summary: string | null;
};

export type ExecutiveResponse = {
  participantId: ExecutiveModuleId;
  participantName: string;
  intent: ConversationIntent;
  insight: string;
  healthScore: number | null;
  recommendations: string[];
  confidenceContribution: number;
};

export type ExecutiveConsensus = {
  alignment: "strong" | "moderate" | "divergent";
  sharedThemes: string[];
  primaryRecommendation: string;
  supportingPoints: string[];
  dissentingNotes: string[];
  narrative: string;
};

export type ExecutiveConversation = {
  request: ExecutiveRequest;
  detectedIntents: ConversationIntent[];
  primaryIntent: ConversationIntent;
  participatingExecutives: ExecutiveParticipant[];
  responses: ExecutiveResponse[];
  executiveReasoning: ExecutiveReasoning | null;
  executiveConsensus: ExecutiveConsensus;
  confidenceScore: number;
  executiveSummary: string;
  processedAt: string;
};

type IntentPattern = {
  intent: ConversationIntent;
  keywords: string[];
  weight: number;
};

type ModuleConsultation = {
  summary: string;
  healthScore: number | null;
  recommendations: string[];
};

const MODULE_METADATA: Record<
  ExecutiveModuleId,
  { name: string; role: string; domain: string }
> = {
  ceo: {
    name: "CEO Digital",
    role: "Chief Executive Officer",
    domain: "Estratégia Corporativa",
  },
  crm: {
    name: "CRM Executive",
    role: "Customer Relationship",
    domain: "Relacionamento e Pipeline",
  },
  marketing: {
    name: "Marketing Executive",
    role: "Chief Marketing Officer",
    domain: "Marketing e Aquisição",
  },
  sales: {
    name: "Sales Executive",
    role: "Chief Revenue Officer",
    domain: "Vendas e Receita",
  },
  finance: {
    name: "Finance Executive",
    role: "Chief Financial Officer",
    domain: "Financeiro e Caixa",
  },
  operations: {
    name: "Operations Executive",
    role: "Chief Operating Officer",
    domain: "Operações e Eficiência",
  },
  hr: {
    name: "HR Executive",
    role: "Chief People Officer",
    domain: "Recursos Humanos",
  },
  legal: {
    name: "Legal Executive",
    role: "General Counsel",
    domain: "Jurídico e Compliance",
  },
  strategy: {
    name: "Strategy Engine",
    role: "Chief Strategy Officer",
    domain: "Estratégia e Crescimento",
  },
  competitor: {
    name: "Competitor Intelligence",
    role: "Market Intelligence",
    domain: "Concorrência e Mercado",
  },
  "google-business": {
    name: "Google Business Executive",
    role: "Local Presence Lead",
    domain: "Google Business Profile",
  },
  "google-analytics": {
    name: "Google Analytics Executive",
    role: "Web Intelligence Lead",
    domain: "Google Analytics 4",
  },
  meta: {
    name: "Meta Executive",
    role: "Social Ads Lead",
    domain: "Meta · Facebook · Instagram",
  },
  linkedin: {
    name: "LinkedIn Executive",
    role: "B2B Social Lead",
    domain: "LinkedIn e Advocacy",
  },
};

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: "linkedin",
    keywords: ["linkedin", "b2b", "advocacy", "employee advocacy", "página da empresa"],
    weight: 3,
  },
  {
    intent: "meta",
    keywords: ["meta", "facebook", "instagram", "ads meta", "reels", "stories"],
    weight: 3,
  },
  {
    intent: "google-analytics",
    keywords: [
      "google analytics",
      "analytics",
      "ga4",
      "tráfego web",
      "trafego web",
      "sessões",
      "sessoes",
      "conversões web",
      "pageviews",
    ],
    weight: 3,
  },
  {
    intent: "google-business",
    keywords: [
      "google business",
      "google meu negócio",
      "gmb",
      "perfil google",
      "avaliações google",
      "reviews google",
    ],
    weight: 3,
  },
  {
    intent: "competition",
    keywords: [
      "concorrência",
      "concorrente",
      "concorrentes",
      "competidor",
      "mercado",
      "market share",
    ],
    weight: 2,
  },
  {
    intent: "strategy",
    keywords: [
      "estratégia",
      "estrategia",
      "strategy",
      "visão",
      "posicionamento",
      "diferenciação",
      "crescimento",
      "growth",
    ],
    weight: 2,
  },
  {
    intent: "legal",
    keywords: [
      "jurídico",
      "juridico",
      "legal",
      "compliance",
      "contrato",
      "lgpd",
      "regulatório",
    ],
    weight: 2,
  },
  {
    intent: "hr",
    keywords: [
      "rh",
      "recursos humanos",
      "equipe",
      "talento",
      "contratação",
      "engagement",
      "colaborador",
      "turnover",
    ],
    weight: 2,
  },
  {
    intent: "operations",
    keywords: [
      "operação",
      "operações",
      "operacao",
      "processo",
      "eficiência",
      "entrega",
      "logística",
      "sla",
    ],
    weight: 2,
  },
  {
    intent: "finance",
    keywords: [
      "financeiro",
      "finance",
      "caixa",
      "fluxo",
      "custo",
      "orçamento",
      "margem",
      "lucro",
      "despesa",
    ],
    weight: 2,
  },
  {
    intent: "sales",
    keywords: [
      "venda",
      "vendas",
      "pipeline",
      "funil",
      "conversão",
      "deal",
      "faturamento",
      "receita",
      "comercial",
    ],
    weight: 2,
  },
  {
    intent: "marketing",
    keywords: [
      "marketing",
      "marca",
      "campanha",
      "tráfego",
      "trafego",
      "seo",
      "conteúdo",
      "anúncio",
      "ads",
      "mídia",
    ],
    weight: 2,
  },
  {
    intent: "crm",
    keywords: ["crm", "lead", "leads", "contato", "cliente", "retenção"],
    weight: 2,
  },
];

const INTENT_MODULE_MAP: Record<ConversationIntent, ExecutiveModuleId[]> = {
  marketing: ["marketing", "google-analytics", "meta", "google-business", "linkedin", "strategy"],
  finance: ["finance", "sales", "operations", "ceo"],
  sales: ["sales", "crm", "finance", "marketing"],
  operations: ["operations", "hr", "finance"],
  hr: ["hr", "operations"],
  legal: ["legal", "finance", "operations"],
  strategy: ["strategy", "ceo", "competitor", "marketing"],
  competition: ["competitor", "marketing", "strategy", "sales"],
  "google-business": ["google-business", "marketing"],
  "google-analytics": ["google-analytics", "marketing", "strategy"],
  meta: ["meta", "marketing"],
  linkedin: ["linkedin", "marketing", "sales"],
  crm: ["crm", "sales", "marketing"],
  general: ["ceo", "strategy", "crm", "marketing", "sales", "finance"],
};

const MODULE_SELECTION_REASONS: Record<ExecutiveModuleId, string> = {
  ceo: "Sintetizar visão corporativa e prioridades executivas",
  crm: "Avaliar saúde do relacionamento e pipeline comercial",
  marketing: "Analisar canais, campanhas e posicionamento de marca",
  sales: "Validar performance de vendas e conversão",
  finance: "Verificar viabilidade financeira e alocação de recursos",
  operations: "Confirmar capacidade operacional e eficiência",
  hr: "Avaliar engajamento e capacidade da equipe",
  legal: "Verificar riscos regulatórios e compliance",
  strategy: "Contextualizar direção estratégica e crescimento",
  competitor: "Mapear pressão competitiva e oportunidades de mercado",
  "google-business": "Avaliar presença local e reputação no Google",
  "google-analytics": "Analisar tráfego web, conversões e comportamento GA4",
  meta: "Analisar performance em Meta Ads e redes sociais",
  linkedin: "Avaliar autoridade B2B e geração de leads no LinkedIn",
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function detectConversationIntents(question: string): ConversationIntent[] {
  const normalized = normalizeText(question);
  const scores = new Map<ConversationIntent, number>();

  for (const pattern of INTENT_PATTERNS) {
    const matches = pattern.keywords.filter((keyword) =>
      normalized.includes(normalizeText(keyword)),
    ).length;

    if (matches > 0) {
      scores.set(
        pattern.intent,
        (scores.get(pattern.intent) ?? 0) + matches * pattern.weight,
      );
    }
  }

  if (scores.size === 0) {
    return ["general"];
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([intent]) => intent);
}

export function selectExecutiveModules(
  intents: ConversationIntent[],
): ExecutiveModuleId[] {
  const primary = intents[0] ?? "general";
  const selected = new Set<ExecutiveModuleId>();

  for (const intent of intents) {
    for (const moduleId of INTENT_MODULE_MAP[intent]) {
      selected.add(moduleId);
    }
  }

  for (const moduleId of INTENT_MODULE_MAP[primary]) {
    selected.add(moduleId);
  }

  const order: ExecutiveModuleId[] = [
    "ceo",
    "strategy",
    "crm",
    "marketing",
    "sales",
    "finance",
    "operations",
    "hr",
    "legal",
    "competitor",
    "google-business",
    "google-analytics",
    "meta",
    "linkedin",
  ];

  return order.filter((moduleId) => selected.has(moduleId));
}

function topRecommendationTitles(
  items: Array<{ title: string; priority?: string }>,
  limit = 2,
): string[] {
  return items
    .sort((a, b) => {
      const priorityWeight = (priority?: string) => {
        switch (priority) {
          case "critical":
            return 4;
          case "high":
            return 3;
          case "medium":
            return 2;
          case "low":
            return 1;
          default:
            return 0;
        }
      };

      return priorityWeight(b.priority) - priorityWeight(a.priority);
    })
    .slice(0, limit)
    .map((item) => item.title);
}

function consultExecutiveModule(
  moduleId: ExecutiveModuleId,
  context: ExecutiveConversationContext,
): ModuleConsultation | null {
  switch (moduleId) {
    case "ceo": {
      const data = context.executiveCeo;
      if (!data) return null;
      return {
        summary: data.executiveSummary,
        healthScore: data.companyHealth.score,
        recommendations: data.topPriorities.slice(0, 2),
      };
    }
    case "crm": {
      const data = context.crmExecutive;
      if (!data) return null;
      return {
        summary: data.crmExecutiveSummary,
        healthScore: data.crmHealthScore,
        recommendations: topRecommendationTitles(data.crmRecommendations),
      };
    }
    case "marketing": {
      const data = context.marketingExecutive;
      if (!data) return null;
      return {
        summary: data.marketingExecutiveSummary,
        healthScore: data.marketingHealthScore,
        recommendations: topRecommendationTitles(data.marketingRecommendations),
      };
    }
    case "sales": {
      const data = context.salesExecutive;
      if (!data) return null;
      return {
        summary: data.salesExecutiveSummary,
        healthScore: data.salesHealthScore,
        recommendations: topRecommendationTitles(data.salesRecommendations),
      };
    }
    case "finance": {
      const data = context.financeExecutive;
      if (!data) return null;
      return {
        summary: data.financeExecutiveSummary,
        healthScore: data.financeHealthScore,
        recommendations: topRecommendationTitles(data.financialRecommendations),
      };
    }
    case "operations": {
      const data = context.operationsExecutive;
      if (!data) return null;
      return {
        summary: data.operationsExecutiveSummary,
        healthScore: data.operationsHealthScore,
        recommendations: topRecommendationTitles(data.operationalRecommendations),
      };
    }
    case "hr": {
      const data = context.hrExecutive;
      if (!data) return null;
      return {
        summary: data.hrExecutiveSummary,
        healthScore: data.hrHealthScore,
        recommendations: topRecommendationTitles(data.hrRecommendations),
      };
    }
    case "legal": {
      const data = context.legalExecutive;
      if (!data) return null;
      return {
        summary: data.legalExecutiveSummary,
        healthScore: data.legalHealthScore,
        recommendations: topRecommendationTitles(data.legalRecommendations),
      };
    }
    case "strategy": {
      const data = context.strategy;
      if (!data) return null;
      return {
        summary: data.executiveStrategy,
        healthScore: data.executiveScore,
        recommendations: data.topPriorities.slice(0, 2),
      };
    }
    case "competitor": {
      const data = context.competitor;
      if (!data) return null;
      return {
        summary: data.executiveSummary,
        healthScore: null,
        recommendations: topRecommendationTitles(data.recommendations),
      };
    }
    case "google-business": {
      const data = context.googleBusinessExecutive;
      if (!data) return null;
      return {
        summary: data.googleBusinessExecutiveSummary,
        healthScore: data.googleBusinessHealthScore,
        recommendations: topRecommendationTitles(data.googleBusinessRecommendations),
      };
    }
    case "google-analytics": {
      const data = context.googleAnalyticsExecutive;
      if (!data) return null;
      return {
        summary: data.googleAnalyticsExecutiveSummary,
        healthScore: data.googleAnalyticsHealthScore,
        recommendations: topRecommendationTitles(data.googleAnalyticsRecommendations),
      };
    }
    case "meta": {
      const data = context.metaExecutive;
      if (!data) return null;
      return {
        summary: data.metaExecutiveSummary,
        healthScore: data.metaHealthScore,
        recommendations: topRecommendationTitles(data.metaRecommendations),
      };
    }
    case "linkedin": {
      const data = context.linkedInExecutive;
      if (!data) return null;
      return {
        summary: data.linkedInExecutiveSummary,
        healthScore: data.linkedInHealthScore,
        recommendations: topRecommendationTitles(data.linkedInRecommendations),
      };
    }
    default:
      return null;
  }
}

function buildParticipants(
  moduleIds: ExecutiveModuleId[],
  context: ExecutiveConversationContext,
): ExecutiveParticipant[] {
  return moduleIds.map((moduleId) => {
    const meta = MODULE_METADATA[moduleId];
    const consultation = consultExecutiveModule(moduleId, context);

    return {
      id: moduleId,
      name: meta.name,
      role: meta.role,
      domain: meta.domain,
      reason: MODULE_SELECTION_REASONS[moduleId],
      consulted: consultation !== null,
      healthScore: consultation?.healthScore ?? null,
      summary: consultation?.summary ?? null,
    };
  });
}

function rehydrateResponses(
  moduleIds: ExecutiveModuleId[],
  context: ExecutiveConversationContext,
  primaryIntent: ConversationIntent,
): ExecutiveResponse[] {
  return moduleIds
    .map((moduleId) => {
      const consultation = consultExecutiveModule(moduleId, context);
      if (!consultation) return null;

      const meta = MODULE_METADATA[moduleId];
      const healthScore = consultation.healthScore;
      const confidenceContribution =
        healthScore !== null ? clampScore(healthScore * 0.85 + 15) : 55;

      return {
        participantId: moduleId,
        participantName: meta.name,
        intent: primaryIntent,
        insight: consultation.summary,
        healthScore,
        recommendations: consultation.recommendations,
        confidenceContribution,
      };
    })
    .filter((response): response is ExecutiveResponse => response !== null);
}

function extractSharedThemes(responses: ExecutiveResponse[]): string[] {
  const themeKeywords = [
    "crescimento",
    "risco",
    "oportunidade",
    "conversão",
    "engajamento",
    "receita",
    "compliance",
    "eficiência",
    "marca",
    "pipeline",
  ];

  const normalizedInsights = responses
    .map((response) => normalizeText(response.insight))
    .join(" ");

  return themeKeywords.filter((theme) => normalizedInsights.includes(theme));
}

function buildExecutiveConsensus(
  responses: ExecutiveResponse[],
  primaryIntent: ConversationIntent,
  companyName?: string,
  reasoning?: ExecutiveReasoning | null,
): ExecutiveConsensus {
  const company = companyName ?? "empresa";
  const healthScores = responses
    .map((response) => response.healthScore)
    .filter((score): score is number => score !== null);

  const averageHealth =
    healthScores.length > 0
      ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
      : 50;

  const reasoningBoost = reasoning ? reasoning.confidenceScore * 0.15 : 0;
  const blendedHealth = averageHealth * 0.7 + reasoningBoost;

  const alignment: ExecutiveConsensus["alignment"] =
    blendedHealth >= 70 ? "strong" : blendedHealth >= 50 ? "moderate" : "divergent";

  const allRecommendations = responses.flatMap((response) => response.recommendations);
  const reasoningConclusion = reasoning?.conclusions[0];
  const primaryRecommendation =
    reasoningConclusion?.title ??
    allRecommendations[0] ??
    `Priorizar ações de ${primaryIntent} com maior impacto imediato na ${company}.`;

  const supportingPoints = [
    ...(reasoningConclusion?.positiveImpacts.slice(0, 2).map(
      (impact) => `Raciocínio: ${impact}`,
    ) ?? []),
    ...responses
      .slice(0, 2)
      .map((response) => `${response.participantName}: ${response.insight.split(".")[0]}.`),
  ].slice(0, 4);

  const dissentingNotes = [
    ...(reasoning?.risks.slice(0, 2).map(
      (risk) => `Risco: ${risk.title} — ${risk.mitigation}`,
    ) ?? []),
    ...(alignment === "divergent"
      ? responses
          .filter((response) => (response.healthScore ?? 100) < 50)
          .map(
            (response) =>
              `${response.participantName} sinaliza atenção (score ${response.healthScore}/100).`,
          )
      : []),
  ];

  const sharedThemes = [
    ...extractSharedThemes(responses),
    ...(reasoning?.hypotheses
      .filter((hypothesis) => hypothesis.status === "validated")
      .map((hypothesis) => hypothesis.statement.split(" ")[0].toLowerCase()) ?? []),
  ].filter((theme, index, array) => array.indexOf(theme) === index);

  const themesLabel =
    sharedThemes.length > 0 ? sharedThemes.join(", ") : "execução integrada";

  const narrative = reasoning
    ? `${reasoning.reasoningSummary} Consenso ${alignment === "strong" ? "forte" : alignment === "moderate" ? "moderado" : "divergente"} entre ${responses.length} executivo(s) sobre ${primaryIntent}. Recomendação central: ${primaryRecommendation}.`
    : `Consenso ${alignment === "strong" ? "forte" : alignment === "moderate" ? "moderado" : "divergente"} entre ${responses.length} executivo(s) consultado(s) sobre ${primaryIntent}. Temas convergentes: ${themesLabel}. Recomendação central: ${primaryRecommendation}`;

  return {
    alignment,
    sharedThemes,
    primaryRecommendation,
    supportingPoints,
    dissentingNotes,
    narrative,
  };
}

function calculateConfidenceScore(
  responses: ExecutiveResponse[],
  reasoning?: ExecutiveReasoning | null,
): number {
  if (responses.length === 0) return 0;

  const weighted =
    responses.reduce((sum, response) => sum + response.confidenceContribution, 0) /
    responses.length;

  const coverageBonus = Math.min(12, responses.length * 2);
  const moduleScore = clampScore(weighted + coverageBonus);

  if (!reasoning) return moduleScore;

  return clampScore(moduleScore * 0.55 + reasoning.confidenceScore * 0.45);
}

function buildConversationSummary(
  question: string,
  primaryIntent: ConversationIntent,
  consensus: ExecutiveConsensus,
  confidenceScore: number,
  participants: ExecutiveParticipant[],
  companyName?: string,
  reasoning?: ExecutiveReasoning | null,
): string {
  const company = companyName ?? "empresa";
  const consulted = participants.filter((participant) => participant.consulted);
  const participantNames = consulted.map((participant) => participant.name).join(", ");
  const reasoningNote = reasoning
    ? ` Raciocínio: ${reasoning.hypotheses.length} hipótese(s), ${reasoning.conclusions.length} conclusão(ões).`
    : "";

  return `Pergunta: "${question.trim()}". Intenção principal: ${primaryIntent}. ${company} — ${consulted.length} módulo(s) consultado(s) (${participantNames}). Confiança ${confidenceScore}/100.${reasoningNote} ${consensus.narrative}`;
}

export function buildExecutiveConversation(
  request: ExecutiveRequest,
): ExecutiveConversation | null {
  const question = request.question?.trim();
  if (!question) return null;

  const context = request.context ?? {};
  const detectedIntents = detectConversationIntents(question);
  const primaryIntent = detectedIntents[0] ?? "general";
  const selectedModules = selectExecutiveModules(detectedIntents);
  const participatingExecutives = buildParticipants(selectedModules, context);
  const responses = rehydrateResponses(selectedModules, context, primaryIntent);

  if (responses.length === 0) {
    return null;
  }

  const executiveReasoning = buildExecutiveReasoning({
    question,
    primaryIntent,
    context: context.executiveContext,
    intelligence: context.intelligence,
    decisions: context.decisions,
    forecast: context.forecast,
    competitor: context.competitor,
    strategy: context.strategy,
    moduleInsights: responses.map((response) => ({
      participantId: response.participantId,
      participantName: response.participantName,
      insight: response.insight,
      healthScore: response.healthScore,
      recommendations: response.recommendations,
    })),
  });

  const executiveConsensus = buildExecutiveConsensus(
    responses,
    primaryIntent,
    context.companyName,
    executiveReasoning,
  );
  const confidenceScore = calculateConfidenceScore(responses, executiveReasoning);
  const executiveSummary = buildConversationSummary(
    question,
    primaryIntent,
    executiveConsensus,
    confidenceScore,
    participatingExecutives,
    context.companyName,
    executiveReasoning,
  );

  return {
    request,
    detectedIntents,
    primaryIntent,
    participatingExecutives,
    responses,
    executiveReasoning,
    executiveConsensus,
    confidenceScore,
    executiveSummary,
    processedAt: new Date().toISOString(),
  };
}
