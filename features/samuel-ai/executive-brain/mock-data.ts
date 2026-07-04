import { getTimeGreeting } from "./briefing-utils";
import type {
  ExecutiveBrain,
  ExecutiveBriefing,
  ExecutiveCouncil,
  ExecutiveStatus,
} from "./types";

const BASE_COMPANY = {
  companyId: "company-cafe-aroma",
  companyName: "Café Aroma",
  segment: "Alimentação & Bebidas",
  location: "São Paulo, SP",
  growthScore: 642,
} as const;

export const MOCK_EXECUTIVE_BRIEFING: ExecutiveBriefing = {
  greeting: getTimeGreeting(),
  companyName: BASE_COMPANY.companyName,
  last24hSummary:
    "Receita operacional abaixo da meta em 12%. Tráfego orgânico em queda contínua. Campanhas pausadas desde maio. Três concorrentes locais expandiram presença digital.",
  metrics: {
    revenue: {
      label: "Receita",
      value: "R$ 48.200",
      trend: "down",
      change: "−12%",
    },
    growth: {
      label: "Crescimento",
      value: "−12%",
      trend: "down",
      change: "vs. mês anterior",
    },
    leads: {
      label: "Leads",
      value: "186",
      trend: "down",
      change: "−9%",
    },
    conversions: {
      label: "Conversões",
      value: "1,2%",
      trend: "down",
      change: "−0,4pp",
    },
  },
  campaigns: "Todas pausadas desde 18/05. Última campanha: retargeting local (ROI 3,8x).",
  competitors:
    "3 concorrentes no raio de 2 km intensificaram Google Business Profile e delivery.",
  market:
    "Setor de cafeterias em SP com demanda estável (+2%). Consumo presencial recuperando gradualmente.",
  dayPriority: "Reverter queda de receita com ações de alto ROI em 30 dias",
  currentRisk: "Perda de share local para concorrentes com presença digital superior",
  opportunities: [
    "340 clientes inativos elegíveis para reativação",
    "Google Business Profile subotimizado — potencial +25% visitas",
    "Ticket médio estável permite upsell via combos sazonais",
  ],
  nextRecommendation:
    "Executar otimização imediata do Google Business Profile e campanha de reativação de clientes inativos.",
};

export const MOCK_EXECUTIVE_STATUS: ExecutiveStatus = {
  online: true,
  monitoringCompany: true,
  businessTwinSynced: true,
  marketMonitored: true,
  lastAnalysis: new Date(Date.now() - 12 * 60_000).toISOString(),
  autonomyLevel: "Supervisionado",
  analysisConfidence: 87,
  nextUpdate: new Date(Date.now() + 45 * 60_000).toISOString(),
};

export const MOCK_EXECUTIVE_COUNCIL: ExecutiveCouncil = {
  members: [
    {
      id: "cfo",
      role: "CFO",
      title: "Diretor Financeiro",
      status: "online",
      lastConsulted: new Date(Date.now() - 8 * 60_000).toISOString(),
      availability: "available",
    },
    {
      id: "cmo",
      role: "CMO",
      title: "Diretor de Marketing",
      status: "consulting",
      lastConsulted: new Date(Date.now() - 2 * 60_000).toISOString(),
      availability: "busy",
    },
    {
      id: "coo",
      role: "COO",
      title: "Diretor de Operações",
      status: "online",
      lastConsulted: new Date(Date.now() - 25 * 60_000).toISOString(),
      availability: "available",
    },
    {
      id: "sales",
      role: "CSO",
      title: "Diretor Comercial",
      status: "standby",
      lastConsulted: new Date(Date.now() - 60 * 60_000).toISOString(),
      availability: "available",
    },
    {
      id: "twin",
      role: "Business Twin™",
      title: "Gêmeo Digital",
      status: "online",
      lastConsulted: new Date(Date.now() - 1 * 60_000).toISOString(),
      availability: "available",
    },
    {
      id: "market",
      role: "Mercado",
      title: "Research Engine™",
      status: "online",
      lastConsulted: new Date(Date.now() - 15 * 60_000).toISOString(),
      availability: "available",
    },
    {
      id: "strategy",
      role: "IA Estratégica",
      title: "Decision Engine™",
      status: "online",
      lastConsulted: new Date(Date.now() - 5 * 60_000).toISOString(),
      availability: "available",
    },
  ],
};

const DEFAULT_CONSULTATIONS = [
  { id: "c-crm", label: "CRM", status: "completed" as const },
  { id: "c-fin", label: "Financeiro", status: "completed" as const },
  { id: "c-mkt", label: "Marketing", status: "completed" as const },
  { id: "c-twin", label: "Business Twin", status: "completed" as const },
  { id: "c-mkt-ext", label: "Mercado", status: "in_progress" as const },
  { id: "c-comp", label: "Concorrentes", status: "pending" as const },
  { id: "c-hist", label: "Histórico", status: "pending" as const },
];

export const DEFAULT_EXECUTIVE_BRAIN: ExecutiveBrain = {
  id: "brain-default",
  builtAt: "2026-07-04T09:01:00Z",
  userQuery:
    "Quero entender por que minhas vendas caíram no último mês e o que posso fazer para reverter.",
  context: {
    ...BASE_COMPANY,
    detectedObjective: "Diagnosticar queda de vendas e definir plano de reversão",
    fields: [
      { id: "f-1", label: "Faturamento mensal", value: "R$ 48.200 (−12%)" },
      { id: "f-2", label: "Ticket médio", value: "R$ 34,50" },
      { id: "f-3", label: "Clientes ativos", value: "1.240" },
      { id: "f-4", label: "Canal principal", value: "Presencial (68%)" },
      { id: "f-5", label: "Marketing Score", value: "58% — abaixo da meta" },
      { id: "f-6", label: "Conversão do site", value: "1,2%" },
    ],
  },
  memory: {
    recentDecisions: [
      {
        id: "mem-d1",
        title: "Campanha de verão pausada",
        summary:
          "Anúncios pagos interrompidos em maio para redução de custos fixos operacionais.",
        date: "2026-05-18T14:00:00Z",
      },
      {
        id: "mem-d2",
        title: "Foco em retenção presencial",
        summary:
          "Priorização de experiência in-store sobre investimento digital no Q2.",
        date: "2026-06-01T09:00:00Z",
      },
    ],
    previousRecommendations: [
      {
        id: "mem-r1",
        title: "Otimizar Google Business Profile",
        summary:
          "Recomendação emitida em abril. Execução parcial — 40% dos itens pendentes.",
        date: "2026-04-10T11:00:00Z",
        outcome: "Impacto parcial: +8% visitas orgânicas",
      },
      {
        id: "mem-r2",
        title: "Campanha de reativação Q1",
        summary:
          "Segmentação de 280 clientes inativos com cupom de retorno de 15%.",
        date: "2026-03-15T10:00:00Z",
        outcome: "ROI 4,2x — 11% de reativação",
      },
    ],
    results: [
      {
        id: "mem-res1",
        title: "Campanha de reativação Q1",
        summary: "280 clientes contactados, 31 reativados.",
        date: "2026-04-01T00:00:00Z",
        outcome: "Receita incremental: R$ 4.200",
      },
      {
        id: "mem-res2",
        title: "Otimização parcial GBP",
        summary: "Atualização de horários e 3 fotos novas publicadas.",
        date: "2026-04-20T00:00:00Z",
        outcome: "+8% visitas orgânicas em 30 dias",
      },
    ],
    learnings: [
      {
        id: "mem-l1",
        title: "ROI rápido é critério decisório",
        summary:
          "Decisões com retorno mensurável em até 30 dias têm 3x mais aderência.",
        date: "2026-06-02T10:30:00Z",
      },
      {
        id: "mem-l2",
        title: "Tráfego precede receita",
        summary:
          "Quedas de tráfego orgânico precedem redução de vendas em 2–3 semanas.",
        date: "2026-06-15T14:00:00Z",
      },
    ],
    relevantPatterns: [
      "Quedas de tráfego orgânico precedem redução de vendas em 2–3 semanas",
      "Cliente responde a recomendações com métricas claras de impacto",
      "Google Business Profile gerou +22% de visitas em execuções anteriores",
    ],
  },
  reasoning: {
    currentFocus: "Correlacionar queda de vendas com canais de aquisição",
    consultations: DEFAULT_CONSULTATIONS,
    executiveConsensus: null,
    steps: [
      {
        id: "r-1",
        order: 1,
        title: "Entender o objetivo real",
        description: "Diagnosticar causa raiz da queda de vendas, não apenas sintomas",
        status: "completed",
      },
      {
        id: "r-2",
        order: 2,
        title: "Buscar memória interna",
        description: "Consultar Business Twin™, DNA e decisões anteriores",
        status: "completed",
        specialist: "Business Twin™",
      },
      {
        id: "r-3",
        order: 3,
        title: "Analisar canais de receita",
        description: "Comparar performance presencial vs. digital no último mês",
        status: "completed",
        specialist: "CFO",
      },
      {
        id: "r-4",
        order: 4,
        title: "Pesquisar mercado externo",
        description: "Verificar movimentação de concorrentes e tendências do setor",
        status: "in_progress",
        specialist: "CMO",
      },
      {
        id: "r-5",
        order: 5,
        title: "Consultar Executive Council",
        description: "Cruzar perspectivas de marketing, finanças e operações",
        status: "pending",
        specialist: "Executive Council",
      },
      {
        id: "r-6",
        order: 6,
        title: "Construir plano de ação",
        description: "Priorizar ações por impacto esperado e viabilidade",
        status: "pending",
        specialist: "Decision Engine™",
      },
    ],
  },
  actionPlan: {
    summary:
      "A queda de vendas está correlacionada à redução de tráfego orgânico (−18%) e à pausa de campanhas pagas. Priorizar ações de baixo custo com retorno em 30 dias.",
    actions: [
      {
        id: "act-1",
        priority: "critical",
        title: "Otimizar Google Business Profile",
        description:
          "Atualizar fotos, horários, cardápio e responder avaliações pendentes.",
        expectedImpact: "high",
        impactDescription: "+15–25% de visitas orgânicas em 30 dias",
        nextStep: "Auditar perfil atual e publicar 5 fotos novas esta semana",
        timeframe: "7 dias",
      },
      {
        id: "act-2",
        priority: "high",
        title: "Campanha de reativação de clientes",
        description:
          "Enviar oferta personalizada para 340 clientes inativos há mais de 60 dias.",
        expectedImpact: "high",
        impactDescription: "Recuperar 8–12% dos clientes inativos",
        nextStep: "Segmentar lista e criar mensagem com cupom de retorno",
        timeframe: "14 dias",
      },
      {
        id: "act-3",
        priority: "medium",
        title: "Melhorar conversão do site",
        description:
          "Adicionar CTA de pedido online e otimizar página de cardápio para mobile.",
        expectedImpact: "medium",
        impactDescription: "Elevar conversão de 1,2% para 2,0%",
        nextStep: "Revisar jornada mobile e testar botão fixo de pedido",
        timeframe: "21 dias",
      },
    ],
  },
};

export { BASE_COMPANY };
