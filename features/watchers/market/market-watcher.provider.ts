import type {
  MarketAlert,
  MarketOpportunity,
  MarketSignal,
  MarketThreat,
  MarketTrend,
  CompetitiveMovement,
  MarketRecommendation,
  MarketWatcherInput,
  MarketSeverity,
} from "./market-watcher.types";

const NOW = new Date().toISOString();

function signal(
  type: MarketSignal["type"],
  title: string,
  description: string,
  severity: MarketSeverity,
  confidence: number,
  metric?: string,
  value?: number,
  threshold?: number,
): MarketSignal {
  return {
    id: `market-signal-${type}-${title.slice(0, 20).replace(/\s/g, "-").toLowerCase()}`,
    type,
    title,
    description,
    severity,
    confidence,
    source: "market-mock-provider",
    detectedAt: NOW,
    metric,
    value,
    threshold,
  };
}

export type MarketWatcherProviderData = {
  signals: MarketSignal[];
  trends: MarketTrend[];
  newCompetitors: CompetitiveMovement[];
  competitiveMovements: CompetitiveMovement[];
  opportunities: MarketOpportunity[];
  threats: MarketThreat[];
  alerts: MarketAlert[];
  recommendations: MarketRecommendation[];
};

export function fetchMarketWatcherMockData(
  input: MarketWatcherInput = {},
): MarketWatcherProviderData {
  const company = input.companyName ?? "Empresa";
  const industry = input.industry ?? "B2B SaaS / Growth";

  const signals: MarketSignal[] = [
    signal(
      "new_competitor",
      "Novo concorrente: GrowthPilot AI",
      "Startup Series B entrou no segmento de inteligência executiva com pricing agressivo.",
      "High",
      82,
      "new_competitors_count",
      2,
      1,
    ),
    signal(
      "price_change",
      "Queda de preço no tier Enterprise",
      "Concorrente líder reduziu preço do plano enterprise em 18% no mercado brasileiro.",
      "High",
      78,
      "competitor_price_change_percent",
      -18,
      -10,
    ),
    signal(
      "new_product",
      "Lançamento de copiloto executivo",
      "Player global lançou módulo de CEO digital integrado a CRM e ads.",
      "Medium",
      74,
    ),
    signal(
      "market_trend",
      "Adoção acelerada de AI executiva",
      `Demanda por plataformas de decisão assistida cresceu 34% no setor ${industry}.`,
      "High",
      85,
      "market_growth_percent",
      34,
      20,
    ),
    signal(
      "consumer_behavior",
      "Mudança no comportamento B2B",
      "Compradores passam a exigir ROI comprovado em até 60 dias no ciclo de vendas.",
      "Medium",
      71,
    ),
    signal(
      "growth_opportunity",
      "Expansão LATAM em ascensão",
      "Demanda por soluções de growth em México e Colômbia cresce acima da média regional.",
      "High",
      80,
    ),
    signal(
      "competitive_threat",
      "Ameaça de consolidação no setor",
      "M&A entre players médios pode reduzir diferenciação de nicho em 12 meses.",
      "Critical",
      88,
    ),
    signal(
      "sector_movement",
      "Movimento relevante do setor",
      "Três scale-ups anunciaram parcerias com consultorias globais para distribuição.",
      "Medium",
      69,
    ),
    signal(
      "regulatory_change",
      "Nova regulamentação de dados",
      "Atualização LGPD para IA exige revisão de políticas de treinamento de modelos.",
      "High",
      76,
    ),
    signal(
      "new_technology",
      "Tecnologia emergente: agentes autônomos",
      "Adoção de agentes multi-step em GTM pode redefinir custo de aquisição.",
      "Medium",
      73,
    ),
  ];

  const trends: MarketTrend[] = [
    {
      id: "trend-ai-executive",
      title: "AI Executiva em alta",
      description: "Investimento em copilotos de decisão cresce 34% YoY no segmento.",
      direction: "up",
      severity: "High",
      confidence: 85,
      source: "market-mock-provider",
    },
    {
      id: "trend-plg-b2b",
      title: "Product-Led Growth B2B",
      description: "Modelos freemium com upgrade executivo ganham tração em PMEs.",
      direction: "up",
      severity: "Medium",
      confidence: 72,
      source: "market-mock-provider",
    },
    {
      id: "trend-consolidation",
      title: "Consolidação de mercado",
      description: "Número de aquisições no setor subiu 22% no último trimestre.",
      direction: "up",
      severity: "High",
      confidence: 79,
      source: "market-mock-provider",
    },
  ];

  const newCompetitors: CompetitiveMovement[] = [
    {
      id: "comp-growthpilot",
      competitor: "GrowthPilot AI",
      movement: "Entrada no mercado",
      description: "Funding Series B de US$ 28M · foco em PMEs brasileiras.",
      severity: "High",
      confidence: 82,
      detectedAt: NOW,
    },
    {
      id: "comp-scaleiq",
      competitor: "ScaleIQ",
      movement: "Expansão regional",
      description: "Abertura de escritório em São Paulo com equipe comercial local.",
      severity: "Medium",
      confidence: 70,
      detectedAt: NOW,
    },
  ];

  const competitiveMovements: CompetitiveMovement[] = [
    ...newCompetitors,
    {
      id: "comp-leader-price",
      competitor: "MarketLeader Pro",
      movement: "Redução de preço",
      description: "Plano Enterprise com desconto de 18% para contratos anuais.",
      severity: "High",
      confidence: 78,
      detectedAt: NOW,
    },
    {
      id: "comp-global-product",
      competitor: "GlobalOps Suite",
      movement: "Novo produto",
      description: "Lançamento de módulo CEO Digital com integração nativa a Meta e GA4.",
      severity: "Medium",
      confidence: 74,
      detectedAt: NOW,
    },
  ];

  const opportunities: MarketOpportunity[] = [
    {
      id: "opp-latam",
      title: "Expansão LATAM",
      description: "Demanda crescente por growth intelligence no México e Colômbia.",
      severity: "High",
      confidence: 80,
      growthPotential: "+25% TAM estimado em 18 meses",
      source: "market-mock-provider",
    },
    {
      id: "opp-ai-agents",
      title: "Agentes autônomos em GTM",
      description: "Early adopters reportam redução de 30% no CAC com agentes executivos.",
      severity: "Medium",
      confidence: 73,
      growthPotential: "Diferenciação por automação end-to-end",
      source: "market-mock-provider",
    },
    {
      id: "opp-enterprise",
      title: "Demanda Enterprise por ROI",
      description: "Grandes contas buscam dashboards executivos unificados com compliance.",
      severity: "High",
      confidence: 77,
      growthPotential: "Ticket médio 2.4x vs PME",
      source: "market-mock-provider",
    },
  ];

  const threats: MarketThreat[] = [
    {
      id: "threat-ma",
      title: "Consolidação competitiva",
      description: "M&A entre players médios pode comprimir margens e aumentar CAC.",
      severity: "Critical",
      confidence: 88,
      impact: "Pressão de preço e perda de share em 12-18 meses",
      source: "market-mock-provider",
    },
    {
      id: "threat-price-war",
      title: "Guerra de preços no Enterprise",
      description: "Líder de mercado reduziu preços — risco de erosão de margem.",
      severity: "High",
      confidence: 78,
      impact: "Renovações e novos deals podem exigir desconto",
      source: "market-mock-provider",
    },
    {
      id: "threat-regulatory",
      title: "Regulamentação LGPD + IA",
      description: "Novas exigências de governança de dados para modelos de IA.",
      severity: "High",
      confidence: 76,
      impact: "Custo de compliance e time-to-market",
      source: "market-mock-provider",
    },
  ];

  const recommendations: MarketRecommendation[] = [
    {
      id: "rec-differentiation",
      title: "Reforçar diferenciação vs GrowthPilot",
      description: `Posicionar ${company} como plataforma CEO Digital completa, não apenas analytics.`,
      priority: "High",
      responsibleArea: "Strategy",
    },
    {
      id: "rec-latam",
      title: "Avaliar expansão LATAM",
      description: "Mapear parceiros locais no México e Colômbia para validação de mercado.",
      priority: "Medium",
      responsibleArea: "Strategy",
    },
    {
      id: "rec-compliance",
      title: "Atualizar política LGPD para IA",
      description: "Revisar termos de uso e governança de dados antes de Q3.",
      priority: "High",
      responsibleArea: "Legal",
    },
    {
      id: "rec-pricing",
      title: "Revisar estratégia de pricing",
      description: "Analisar elasticidade de preço frente à redução do concorrente líder.",
      priority: "Critical",
      responsibleArea: "Finance",
    },
  ];

  const alerts: MarketAlert[] = [
    {
      id: "alert-ma-threat",
      title: "Ameaça crítica: consolidação do setor",
      description: threats[0].description,
      severity: "Critical",
      source: "market-mock-provider",
      expectedImpact: threats[0].impact,
      recommendation: recommendations[3],
      responsibleArea: "Strategy",
      confidence: 88,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-new-competitor",
      title: "Novo concorrente identificado: GrowthPilot AI",
      description: newCompetitors[0].description,
      severity: "High",
      source: "market-mock-provider",
      expectedImpact: "Pressão competitiva em PMEs e mid-market.",
      recommendation: recommendations[0],
      responsibleArea: "Strategy",
      confidence: 82,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-price-drop",
      title: "Mudança de preço competitiva",
      description: competitiveMovements[2].description,
      severity: "High",
      source: "market-mock-provider",
      expectedImpact: "Risco de perda de deals em negociação.",
      recommendation: recommendations[3],
      responsibleArea: "Finance",
      confidence: 78,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-regulatory",
      title: "Mudança regulatória LGPD + IA",
      description: signals.find((s) => s.type === "regulatory_change")?.description ?? "",
      severity: "High",
      source: "market-mock-provider",
      expectedImpact: "Compliance obrigatório para features de IA generativa.",
      recommendation: recommendations[2],
      responsibleArea: "Legal",
      confidence: 76,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-latam-opp",
      title: "Oportunidade: expansão LATAM",
      description: opportunities[0].description,
      severity: "Medium",
      source: "market-mock-provider",
      expectedImpact: opportunities[0].growthPotential,
      recommendation: recommendations[1],
      responsibleArea: "Strategy",
      confidence: 80,
      status: "active",
      createdAt: NOW,
    },
  ];

  return {
    signals,
    trends,
    newCompetitors,
    competitiveMovements,
    opportunities,
    threats,
    alerts,
    recommendations,
  };
}
