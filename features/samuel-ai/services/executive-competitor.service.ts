export type CompetitorThreatLevel = "critical" | "high" | "medium" | "low";

export type CompetitorImpactLevel = "high" | "medium" | "low";

export type CompetitorProfile = {
  id: string;
  name: string;
  segment: string;
  positioning: string;
  marketShare: string;
  website: string | null;
  pricing: string;
  digitalPresence: string;
  reputation: string;
  acquisitionChannels: string[];
  marketingFocus: string;
  differentiators: string[];
};

export type CompetitorStrength = {
  id: string;
  competitorId: string;
  competitorName: string;
  title: string;
  description: string;
  impact: CompetitorImpactLevel;
};

export type CompetitorWeakness = {
  id: string;
  competitorId: string;
  competitorName: string;
  title: string;
  description: string;
  exploitability: CompetitorImpactLevel;
};

export type CompetitorOpportunity = {
  id: string;
  title: string;
  description: string;
  competitorId?: string;
  horizon: "30d" | "90d" | "180d";
  impact: CompetitorImpactLevel;
};

export type CompetitorThreat = {
  id: string;
  title: string;
  description: string;
  competitorId?: string;
  severity: CompetitorThreatLevel;
  category: "pricing" | "marketing" | "digital" | "reputation" | "market_share";
};

export type CompetitiveGap = {
  id: string;
  area: string;
  companyPosition: string;
  competitorBenchmark: string;
  gap: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type CompetitiveAdvantage = {
  id: string;
  title: string;
  description: string;
  durability: "high" | "medium" | "low";
  defensibility: string;
};

export type CompetitorStrategy = {
  id: string;
  competitorId: string;
  competitorName: string;
  strategy: string;
  channels: string[];
  focus: string;
};

export type MarketShareEstimate = {
  companyShare: string;
  competitorAverage: string;
  marketLeader: string;
  leaderShare: string;
  totalAddressableShare: string;
  byCompetitor: Array<{ name: string; share: string }>;
};

export type PriceRange = {
  id: string;
  competitorId: string;
  competitorName: string;
  tier: string;
  range: string;
  model: string;
};

export type CompetitiveSwot = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type StrategicRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  horizon: string;
};

export type ExecutiveCompetitor = {
  competitors: CompetitorProfile[];
  marketShare: MarketShareEstimate;
  strengths: CompetitorStrength[];
  weaknesses: CompetitorWeakness[];
  strategies: CompetitorStrategy[];
  priceRanges: PriceRange[];
  differentiators: Array<{ competitorId: string; competitorName: string; items: string[] }>;
  opportunities: CompetitorOpportunity[];
  threats: CompetitorThreat[];
  gaps: CompetitiveGap[];
  advantages: CompetitiveAdvantage[];
  competitiveSwot: CompetitiveSwot;
  strategicRecommendations: StrategicRecommendation[];
  summary: string;
  analyzedAt: string;
};

const MOCK_COMPETITORS: CompetitorProfile[] = [
  {
    id: "comp-1",
    name: "GrowthOps AI",
    segment: "Tecnologia · IA Executiva",
    positioning: "Automação operacional para PMEs",
    marketShare: "18%",
    website: "https://growthops.ai",
    pricing: "R$ 890/mês — plano Growth",
    digitalPresence: "Alta — blog, LinkedIn, webinars semanais",
    reputation: "4,6/5 — forte em cases de operação",
    acquisitionChannels: ["LinkedIn Ads", "SEO", "Parcerias B2B"],
    marketingFocus: "Eficiência operacional e redução de custos",
    differentiators: ["Integração ERP", "Playbooks operacionais", "ROI em 60 dias"],
  },
  {
    id: "comp-2",
    name: "Strategix",
    segment: "Tecnologia · Consultoria Estratégica",
    positioning: "Consultoria estratégica assistida por IA",
    marketShare: "12%",
    website: "https://strategix.io",
    pricing: "R$ 1.490/mês — plano Executive",
    digitalPresence: "Média-alta — conteúdo premium e eventos",
    reputation: "4,4/5 — referência em estratégia corporativa",
    acquisitionChannels: ["Eventos", "Indicação", "Outbound enterprise"],
    marketingFocus: "Planejamento estratégico e governança",
    differentiators: ["Frameworks proprietários", "Advisory C-level", "Benchmark setorial"],
  },
  {
    id: "comp-3",
    name: "MarketPulse",
    segment: "Tecnologia · Inteligência de Mercado",
    positioning: "Inteligência competitiva em tempo real",
    marketShare: "9%",
    website: "https://marketpulse.com",
    pricing: "R$ 650/mês — plano Pro",
    digitalPresence: "Alta — presença agressiva em mídias sociais",
    reputation: "4,2/5 — conhecido por alertas de mercado",
    acquisitionChannels: ["Google Ads", "Instagram", "Freemium"],
    marketingFocus: "Monitoramento de concorrentes e tendências",
    differentiators: ["Alertas em tempo real", "Scraping de preços", "Dashboard competitivo"],
  },
];

const MOCK_STRENGTHS: CompetitorStrength[] = [
  {
    id: "cstr-1",
    competitorId: "comp-1",
    competitorName: "GrowthOps AI",
    title: "Velocidade de implementação",
    description: "Onboarding em 7 dias com templates prontos para PMEs.",
    impact: "high",
  },
  {
    id: "cstr-2",
    competitorId: "comp-2",
    competitorName: "Strategix",
    title: "Autoridade executiva",
    description: "Marca consolidada junto a diretores e conselhos consultivos.",
    impact: "high",
  },
  {
    id: "cstr-3",
    competitorId: "comp-3",
    competitorName: "MarketPulse",
    title: "Cobertura de monitoramento",
    description: "Rastreamento contínuo de preços, anúncios e menções online.",
    impact: "medium",
  },
];

const MOCK_WEAKNESSES: CompetitorWeakness[] = [
  {
    id: "cweak-1",
    competitorId: "comp-1",
    competitorName: "GrowthOps AI",
    title: "Pouca profundidade estratégica",
    description: "Foco operacional limita recomendações de longo prazo.",
    exploitability: "high",
  },
  {
    id: "cweak-2",
    competitorId: "comp-2",
    competitorName: "Strategix",
    title: "Ciclo de entrega lento",
    description: "Projetos estratégicos levam 60–90 dias para primeiro valor.",
    exploitability: "medium",
  },
  {
    id: "cweak-3",
    competitorId: "comp-3",
    competitorName: "MarketPulse",
    title: "Baixa execução integrada",
    description: "Entrega insights, mas não conecta decisão à execução.",
    exploitability: "high",
  },
];

const MOCK_OPPORTUNITIES: CompetitorOpportunity[] = [
  {
    id: "copp-1",
    title: "Posicionar Executive Brain™",
    description:
      "Diferenciar com cérebro executivo completo — contexto, decisão, execução e aprendizado.",
    horizon: "90d",
    impact: "high",
  },
  {
    id: "copp-2",
    title: "Capturar concorrentes sem execução",
    description:
      "Empresas frustradas com ferramentas que só monitoram, sem plano de ação.",
    competitorId: "comp-3",
    horizon: "30d",
    impact: "high",
  },
  {
    id: "copp-3",
    title: "Pacote mid-market",
    description:
      "Oferta entre GrowthOps e Strategix com IA executiva e preço competitivo.",
    horizon: "180d",
    impact: "medium",
  },
];

const MOCK_THREATS: CompetitorThreat[] = [
  {
    id: "cthr-1",
    title: "Guerra de preços no segmento PME",
    description: "GrowthOps AI pode reduzir preço para bloquear entrada no mid-market.",
    competitorId: "comp-1",
    severity: "high",
    category: "pricing",
  },
  {
    id: "cthr-2",
    title: "Domínio de conteúdo executivo",
    description: "Strategix intensifica webinars e whitepapers para C-level.",
    competitorId: "comp-2",
    severity: "medium",
    category: "marketing",
  },
  {
    id: "cthr-3",
    title: "Feature parity em monitoramento",
    description: "MarketPulse pode adicionar módulo de recomendações com IA.",
    competitorId: "comp-3",
    severity: "medium",
    category: "digital",
  },
  {
    id: "cthr-4",
    title: "Pressão em reputação digital",
    description: "Concorrentes com mais reviews podem influenciar decisão de compra.",
    severity: "low",
    category: "reputation",
  },
];

const MOCK_GAPS: CompetitiveGap[] = [
  {
    id: "cgap-1",
    area: "Presença digital",
    companyPosition: "Website em construção, SEO inicial",
    competitorBenchmark: "GrowthOps e MarketPulse com tráfego orgânico consolidado",
    gap: "Autoridade digital 40% abaixo da média do setor",
    priority: "high",
  },
  {
    id: "cgap-2",
    area: "Participação de mercado",
    companyPosition: "Entrada recente — share estimado em 2%",
    competitorBenchmark: "Líderes com 12–18% no segmento",
    gap: "Baixa visibilidade em categorias de busca competitivas",
    priority: "critical",
  },
  {
    id: "cgap-3",
    area: "Canais de aquisição",
    companyPosition: "Indicação e outbound manual",
    competitorBenchmark: "Mix diversificado: ads, SEO, eventos, freemium",
    gap: "Dependência de canal único aumenta CAC",
    priority: "high",
  },
  {
    id: "cgap-4",
    area: "Reputação online",
    companyPosition: "Poucas avaliações públicas",
    competitorBenchmark: "Média de 4,4/5 com 120+ reviews",
    gap: "Prova social insuficiente para fechamento enterprise",
    priority: "medium",
  },
];

const MOCK_ADVANTAGES: CompetitiveAdvantage[] = [
  {
    id: "cadv-1",
    title: "Executive Command Center unificado",
    description:
      "Único player com pipeline completo: contexto → inteligência → decisão → execução → aprendizado → forecast → estratégia.",
    durability: "high",
    defensibility: "Arquitetura integrada difícil de replicar rapidamente",
  },
  {
    id: "cadv-2",
    title: "Memória executiva persistente",
    description: "Aprendizado contínuo com memórias estratégicas acumuladas por empresa.",
    durability: "high",
    defensibility: "Efeito de rede interno — quanto mais usa, mais preciso fica",
  },
  {
    id: "cadv-3",
    title: "Velocidade decisória",
    description: "Decisões e planos gerados em minutos, não em semanas de consultoria.",
    durability: "medium",
    defensibility: "Vantagem de tempo-to-value mensurável",
  },
];

const MOCK_STRATEGIES: CompetitorStrategy[] = [
  {
    id: "cstrat-1",
    competitorId: "comp-1",
    competitorName: "GrowthOps AI",
    strategy: "Land-and-expand em PMEs com ROI rápido",
    channels: ["LinkedIn Ads", "SEO", "Parcerias B2B"],
    focus: "Redução de custos operacionais",
  },
  {
    id: "cstrat-2",
    competitorId: "comp-2",
    competitorName: "Strategix",
    strategy: "Consultoria premium com frameworks proprietários",
    channels: ["Eventos", "Indicação", "Outbound enterprise"],
    focus: "Governança e planejamento C-level",
  },
  {
    id: "cstrat-3",
    competitorId: "comp-3",
    competitorName: "MarketPulse",
    strategy: "Freemium + upsell para inteligência competitiva",
    channels: ["Google Ads", "Instagram", "Freemium"],
    focus: "Alertas e monitoramento em tempo real",
  },
];

const MOCK_PRICE_RANGES: PriceRange[] = [
  {
    id: "price-1",
    competitorId: "comp-1",
    competitorName: "GrowthOps AI",
    tier: "Growth",
    range: "R$ 690 – R$ 890/mês",
    model: "SaaS mensal por usuário",
  },
  {
    id: "price-2",
    competitorId: "comp-2",
    competitorName: "Strategix",
    tier: "Executive",
    range: "R$ 1.290 – R$ 1.890/mês",
    model: "Assinatura + advisory",
  },
  {
    id: "price-3",
    competitorId: "comp-3",
    competitorName: "MarketPulse",
    tier: "Pro",
    range: "R$ 490 – R$ 650/mês",
    model: "Freemium + plano Pro",
  },
];

const MOCK_COMPETITIVE_SWOT: CompetitiveSwot = {
  strengths: [
    "Executive Command Center com pipeline completo de decisão",
    "Memória executiva persistente por empresa",
    "Velocidade de análise e plano de execução integrado",
  ],
  weaknesses: [
    "Baixa participação de mercado (2% estimado)",
    "Presença digital ainda em construção",
    "Pouca prova social pública vs. concorrentes",
  ],
  opportunities: [
    "Concorrentes sem camada de execução integrada",
    "Demanda por IA executiva no mid-market brasileiro",
    "Gap de preço entre GrowthOps e Strategix",
  ],
  threats: [
    "Guerra de preços no segmento PME",
    "Feature parity em monitoramento competitivo",
    "Concorrentes com maior autoridade de marca",
  ],
};

const MOCK_RECOMMENDATIONS: StrategicRecommendation[] = [
  {
    id: "rec-1",
    title: "Posicionar diferencial de execução",
    description:
      "Comunicar que SF Growth AI vai além de insights — entrega decisão, plano e monitoramento.",
    priority: "critical",
    horizon: "30 dias",
  },
  {
    id: "rec-2",
    title: "Atacar fraqueza de MarketPulse",
    description:
      "Campanha direcionada a empresas frustradas com ferramentas que só monitoram.",
    priority: "high",
    horizon: "60 dias",
  },
  {
    id: "rec-3",
    title: "Pacote mid-market competitivo",
    description:
      "Precificar entre R$ 790–990/mês com trial executivo de 14 dias.",
    priority: "high",
    horizon: "90 dias",
  },
  {
    id: "rec-4",
    title: "Fortalecer prova social",
    description:
      "Publicar cases e reviews para fechar gap de reputação vs. concorrentes.",
    priority: "medium",
    horizon: "120 dias",
  },
];

export function buildExecutiveCompetitor(): ExecutiveCompetitor {
  const marketShare: MarketShareEstimate = {
    companyShare: "2%",
    competitorAverage: "13%",
    marketLeader: "GrowthOps AI",
    leaderShare: "18%",
    totalAddressableShare: "100% — IA Executiva B2B Brasil",
    byCompetitor: MOCK_COMPETITORS.map((c) => ({
      name: c.name,
      share: c.marketShare,
    })),
  };

  const differentiators = MOCK_COMPETITORS.map((c) => ({
    competitorId: c.id,
    competitorName: c.name,
    items: c.differentiators,
  }));

  return {
    competitors: MOCK_COMPETITORS,
    marketShare,
    strengths: MOCK_STRENGTHS,
    weaknesses: MOCK_WEAKNESSES,
    strategies: MOCK_STRATEGIES,
    priceRanges: MOCK_PRICE_RANGES,
    differentiators,
    opportunities: MOCK_OPPORTUNITIES,
    threats: MOCK_THREATS,
    gaps: MOCK_GAPS,
    advantages: MOCK_ADVANTAGES,
    competitiveSwot: MOCK_COMPETITIVE_SWOT,
    strategicRecommendations: MOCK_RECOMMENDATIONS,
    summary:
      "Três concorrentes diretos dominam participação com focos distintos: operação (GrowthOps AI), estratégia (Strategix) e monitoramento (MarketPulse). SF Growth AI possui vantagem estrutural no Executive Command Center e memória executiva, com gaps críticos em presença digital, share de mercado e canais de aquisição.",
    analyzedAt: new Date().toISOString(),
  };
}
