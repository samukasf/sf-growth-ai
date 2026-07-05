export type CompetitorProfile = {
  id: string;
  name: string;
  segment: string;
  positioning: string;
  website: string | null;
  digitalPresence: string;
  reputation: string;
  acquisitionChannels: string[];
  marketingFocus: string;
};

export type CompetitorStrength = {
  id: string;
  competitorId: string;
  competitorName: string;
  title: string;
  description: string;
};

export type CompetitorWeakness = {
  id: string;
  competitorId: string;
  competitorName: string;
  title: string;
  description: string;
};

export type CompetitorOpportunity = {
  id: string;
  title: string;
  description: string;
  horizon: "30d" | "90d" | "180d";
};

export type CompetitorThreat = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type MarketShare = {
  companyShare: string;
  marketLeader: string;
  leaderShare: string;
  competitorAverage: string;
  byCompetitor: Array<{ name: string; share: string }>;
};

export type PricePosition = {
  companyPosition: string;
  marketRange: string;
  competitorPricing: Array<{
    competitorId: string;
    competitorName: string;
    tier: string;
    range: string;
  }>;
  recommendation: string;
};

export type CompetitorDifferentiator = {
  competitorId: string;
  competitorName: string;
  items: string[];
};

export type MarketGap = {
  id: string;
  area: string;
  companyPosition: string;
  competitorBenchmark: string;
  gap: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type CompetitorRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type ExecutiveCompetitor = {
  competitors: CompetitorProfile[];
  strengths: CompetitorStrength[];
  weaknesses: CompetitorWeakness[];
  opportunities: CompetitorOpportunity[];
  threats: CompetitorThreat[];
  marketShare: MarketShare;
  pricePosition: PricePosition;
  differentiators: CompetitorDifferentiator[];
  marketGaps: MarketGap[];
  recommendations: CompetitorRecommendation[];
  executiveSummary: string;
};

const MOCK_COMPETITORS: CompetitorProfile[] = [
  {
    id: "comp-1",
    name: "GrowthOps AI",
    segment: "Tecnologia · IA Executiva",
    positioning: "Automação operacional para PMEs",
    website: "https://growthops.ai",
    digitalPresence: "Alta — blog, LinkedIn, webinars semanais",
    reputation: "4,6/5 — forte em cases de operação",
    acquisitionChannels: ["LinkedIn Ads", "SEO", "Parcerias B2B"],
    marketingFocus: "Eficiência operacional e redução de custos",
  },
  {
    id: "comp-2",
    name: "Strategix",
    segment: "Tecnologia · Consultoria Estratégica",
    positioning: "Consultoria estratégica assistida por IA",
    website: "https://strategix.io",
    digitalPresence: "Média-alta — conteúdo premium e eventos",
    reputation: "4,4/5 — referência em estratégia corporativa",
    acquisitionChannels: ["Eventos", "Indicação", "Outbound enterprise"],
    marketingFocus: "Planejamento estratégico e governança",
  },
  {
    id: "comp-3",
    name: "MarketPulse",
    segment: "Tecnologia · Inteligência de Mercado",
    positioning: "Inteligência competitiva em tempo real",
    website: "https://marketpulse.com",
    digitalPresence: "Alta — presença agressiva em mídias sociais",
    reputation: "4,2/5 — conhecido por alertas de mercado",
    acquisitionChannels: ["Google Ads", "Instagram", "Freemium"],
    marketingFocus: "Monitoramento de concorrentes e tendências",
  },
];

export function buildExecutiveCompetitor(): ExecutiveCompetitor {
  return {
    competitors: MOCK_COMPETITORS,
    strengths: [
      {
        id: "cstr-1",
        competitorId: "comp-1",
        competitorName: "GrowthOps AI",
        title: "Velocidade de implementação",
        description: "Onboarding em 7 dias com templates prontos para PMEs.",
      },
      {
        id: "cstr-2",
        competitorId: "comp-2",
        competitorName: "Strategix",
        title: "Autoridade executiva",
        description: "Marca consolidada junto a diretores e conselhos consultivos.",
      },
      {
        id: "cstr-3",
        competitorId: "comp-3",
        competitorName: "MarketPulse",
        title: "Cobertura de monitoramento",
        description: "Rastreamento contínuo de preços, anúncios e menções online.",
      },
    ],
    weaknesses: [
      {
        id: "cweak-1",
        competitorId: "comp-1",
        competitorName: "GrowthOps AI",
        title: "Pouca profundidade estratégica",
        description: "Foco operacional limita recomendações de longo prazo.",
      },
      {
        id: "cweak-2",
        competitorId: "comp-2",
        competitorName: "Strategix",
        title: "Ciclo de entrega lento",
        description: "Projetos levam 60–90 dias para primeiro valor.",
      },
      {
        id: "cweak-3",
        competitorId: "comp-3",
        competitorName: "MarketPulse",
        title: "Baixa execução integrada",
        description: "Entrega insights, mas não conecta decisão à execução.",
      },
    ],
    opportunities: [
      {
        id: "copp-1",
        title: "Posicionar Executive Brain™",
        description:
          "Diferenciar com cérebro executivo completo — contexto, decisão, execução e aprendizado.",
        horizon: "90d",
      },
      {
        id: "copp-2",
        title: "Capturar mercado sem execução",
        description:
          "Empresas frustradas com ferramentas que só monitoram concorrentes.",
        horizon: "30d",
      },
      {
        id: "copp-3",
        title: "Pacote mid-market",
        description: "Oferta entre GrowthOps e Strategix com IA executiva integrada.",
        horizon: "180d",
      },
    ],
    threats: [
      {
        id: "cthr-1",
        title: "Guerra de preços no segmento PME",
        description: "GrowthOps AI pode reduzir preço para bloquear entrada no mid-market.",
        severity: "high",
      },
      {
        id: "cthr-2",
        title: "Domínio de conteúdo executivo",
        description: "Strategix intensifica webinars e whitepapers para C-level.",
        severity: "medium",
      },
      {
        id: "cthr-3",
        title: "Feature parity em monitoramento",
        description: "MarketPulse pode adicionar módulo de recomendações com IA.",
        severity: "medium",
      },
    ],
    marketShare: {
      companyShare: "2%",
      marketLeader: "GrowthOps AI",
      leaderShare: "18%",
      competitorAverage: "13%",
      byCompetitor: [
        { name: "GrowthOps AI", share: "18%" },
        { name: "Strategix", share: "12%" },
        { name: "MarketPulse", share: "9%" },
      ],
    },
    pricePosition: {
      companyPosition: "R$ 790–990/mês — posicionamento mid-market",
      marketRange: "R$ 490 – R$ 1.890/mês",
      competitorPricing: [
        {
          competitorId: "comp-1",
          competitorName: "GrowthOps AI",
          tier: "Growth",
          range: "R$ 690 – R$ 890/mês",
        },
        {
          competitorId: "comp-2",
          competitorName: "Strategix",
          tier: "Executive",
          range: "R$ 1.290 – R$ 1.890/mês",
        },
        {
          competitorId: "comp-3",
          competitorName: "MarketPulse",
          tier: "Pro",
          range: "R$ 490 – R$ 650/mês",
        },
      ],
      recommendation:
        "Manter preço entre GrowthOps e Strategix com trial executivo de 14 dias.",
    },
    differentiators: MOCK_COMPETITORS.map((competitor) => ({
      competitorId: competitor.id,
      competitorName: competitor.name,
      items:
        competitor.id === "comp-1"
          ? ["Integração ERP", "Playbooks operacionais", "ROI em 60 dias"]
          : competitor.id === "comp-2"
            ? ["Frameworks proprietários", "Advisory C-level", "Benchmark setorial"]
            : ["Alertas em tempo real", "Scraping de preços", "Dashboard competitivo"],
    })),
    marketGaps: [
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
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Posicionar diferencial de execução",
        description:
          "Comunicar que SF Growth AI entrega decisão, plano e monitoramento — não apenas insights.",
        priority: "critical",
      },
      {
        id: "rec-2",
        title: "Atacar fraqueza de MarketPulse",
        description:
          "Campanha para empresas frustradas com ferramentas que só monitoram.",
        priority: "high",
      },
      {
        id: "rec-3",
        title: "Fortalecer prova social",
        description: "Publicar cases e reviews para fechar gap de reputação.",
        priority: "medium",
      },
    ],
    executiveSummary:
      "Três concorrentes dominam o segmento de IA executiva B2B: GrowthOps AI (18% share, operação), Strategix (12%, consultoria) e MarketPulse (9%, monitoramento). SF Growth AI possui vantagem no pipeline integrado de decisão e execução, com gaps críticos em share de mercado, presença digital e canais de aquisição.",
  };
}
