import type { ExecutiveAction } from "./executive-action.service";
import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";
import type { ExecutivePriority } from "./executive-priority.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export type RecommendationRisk = "critical" | "high" | "medium" | "low";

export type ExecutiveRecommendationItem = {
  id: string;
  title: string;
  description: string;
  reason: string;
  expectedImpact: string;
  priority: RecommendationPriority;
  estimatedROI: string;
  risk: RecommendationRisk;
  recommendedDeadline: string;
  responsibleDepartment: string;
  category: string;
};

export type ExecutiveRecommendation = {
  executiveRecommendations: ExecutiveRecommendationItem[];
  recommendedActions: ExecutiveRecommendationItem[];
  recommendedInvestments: ExecutiveRecommendationItem[];
  recommendedSavings: ExecutiveRecommendationItem[];
  recommendedCampaigns: ExecutiveRecommendationItem[];
  recommendedHiring: ExecutiveRecommendationItem[];
  recommendedAutomation: ExecutiveRecommendationItem[];
  recommendedProducts: ExecutiveRecommendationItem[];
  recommendedMarkets: ExecutiveRecommendationItem[];
  recommendedRisks: ExecutiveRecommendationItem[];
  recommendedKPIs: ExecutiveRecommendationItem[];
  expectedROI: string;
  confidenceLevel: number;
  executiveRecommendationSummary: string;
};

export type ExecutiveRecommendationInput = {
  intelligence?: ExecutiveIntelligence | null;
  strategy?: ExecutiveStrategy | null;
  action?: ExecutiveAction | null;
  priority?: ExecutivePriority | null;
  forecast?: ExecutiveForecast | null;
  monitoring?: ExecutiveMonitoring | null;
  competitor?: ExecutiveCompetitor | null;
  learning?: ExecutiveLearning | null;
};

const PRIORITY_WEIGHT: Record<RecommendationPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function item(
  id: string,
  title: string,
  description: string,
  reason: string,
  expectedImpact: string,
  priority: RecommendationPriority,
  estimatedROI: string,
  risk: RecommendationRisk,
  recommendedDeadline: string,
  responsibleDepartment: string,
  category: string,
): ExecutiveRecommendationItem {
  return {
    id,
    title,
    description,
    reason,
    expectedImpact,
    priority,
    estimatedROI,
    risk,
    recommendedDeadline,
    responsibleDepartment,
    category,
  };
}

function sortByPriority(items: ExecutiveRecommendationItem[]): ExecutiveRecommendationItem[] {
  return [...items].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  );
}

function dedupe(items: ExecutiveRecommendationItem[]): ExecutiveRecommendationItem[] {
  const seen = new Set<string>();
  return items.filter((rec) => {
    const key = rec.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildFromIntelligence(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];
  let index = 0;

  for (const opportunity of input.intelligence?.opportunities.slice(0, 3) ?? []) {
    recs.push(
      item(
        `rec-int-opp-${index++}`,
        opportunity.split(/[.—]/)[0]?.trim() ?? "Capturar oportunidade",
        opportunity,
        "Identificado pela inteligência executiva como oportunidade de mercado",
        "Aceleração de receita e posicionamento competitivo",
        "high",
        "15–25% em 90 dias",
        "medium",
        "90 dias",
        "Comercial",
        "action",
      ),
    );
  }

  for (const priority of input.intelligence?.priorities.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-int-pri-${index++}`,
        priority.split(/[.—]/)[0]?.trim() ?? "Prioridade estratégica",
        priority,
        "Prioridade detectada no diagnóstico executivo",
        "Foco executivo alinhado ao crescimento",
        "critical",
        "20–30% em eficiência decisória",
        "low",
        "30 dias",
        "Estratégia",
        "action",
      ),
    );
  }

  for (const risk of input.intelligence?.risks.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-int-risk-${index++}`,
        `Mitigar: ${risk.split(/[.—]/)[0]?.trim() ?? "Risco estratégico"}`,
        risk,
        "Risco identificado pela inteligência executiva",
        "Redução de exposição e proteção de margem",
        "high",
        "Evitar perda de 10–20% em eficiência",
        "high",
        "14 dias",
        "Operações",
        "risk",
      ),
    );
  }

  return recs;
}

function buildFromStrategy(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];
  let index = 0;

  for (const priority of input.strategy?.topPriorities.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-str-pri-${index++}`,
        priority.split(/[.—]/)[0]?.trim() ?? "Prioridade estratégica",
        priority,
        "Derivado do motor de estratégia executiva",
        "Consolidação da direção estratégica",
        "critical",
        "18–28% em alinhamento organizacional",
        "medium",
        "60 dias",
        "Estratégia",
        "action",
      ),
    );
  }

  for (const goal of input.strategy?.commercialStrategy.focus.slice(0, 1) ?? []) {
    recs.push(
      item(
        `rec-str-inv-${index++}`,
        "Investir em aceleração comercial",
        goal,
        "Meta definida na estratégia comercial integrada",
        "Expansão de receita e pipeline",
        "high",
        "12–22% em conversão",
        "medium",
        "90 dias",
        "Comercial",
        "investment",
      ),
    );
  }

  for (const action of input.strategy?.productStrategy.actions.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-str-prod-${index++}`,
        action.split(/[.—]/)[0]?.trim() ?? "Evoluir produto",
        action,
        "Ação prioritária do plano de produto",
        "Diferenciação e retenção de clientes",
        "high",
        "15–25% em NPS e retenção",
        "medium",
        "120 dias",
        "Produto",
        "product",
      ),
    );
  }

  for (const focus of input.strategy?.expansionStrategy.focus.slice(0, 1) ?? []) {
    recs.push(
      item(
        `rec-str-mkt-${index++}`,
        "Explorar novo mercado",
        focus,
        "Oportunidade mapeada no plano de expansão",
        "Novas fontes de receita",
        "medium",
        "20–35% em 365 dias",
        "high",
        "180 dias",
        "Expansão",
        "market",
      ),
    );
  }

  return recs;
}

function buildFromAction(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];

  for (const action of input.action?.quickWins.slice(0, 3) ?? []) {
    recs.push(
      item(
        `rec-act-qw-${action.id}`,
        action.title,
        action.description,
        "Quick win identificado pelo motor de ações executivas",
        "Resultado rápido com baixo esforço",
        action.priority,
        action.roi,
        "low",
        action.deadline,
        action.department,
        "action",
      ),
    );
  }

  for (const action of input.action?.criticalActions.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-act-crit-${action.id}`,
        action.title,
        action.description,
        "Ação crítica priorizada para execução imediata",
        "Desbloqueio de valor estratégico",
        "critical",
        action.roi,
        "high",
        action.deadline,
        action.department,
        "action",
      ),
    );
  }

  for (const action of input.action?.automatedActions.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-act-auto-${action.id}`,
        `Automatizar: ${action.title}`,
        action.description,
        "Candidata a automação pelo perfil operacional",
        "Ganho de eficiência e redução de custo operacional",
        "medium",
        "8–15% em produtividade",
        "low",
        "45 dias",
        action.department,
        "automation",
      ),
    );
  }

  return recs;
}

function buildFromPriority(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  return (input.priority?.top10Priorities.slice(0, 5) ?? []).map((task) =>
    item(
      `rec-pri-${task.id}`,
      task.title,
      task.description,
      `Prioridade #${task.priorityRank} na fila executiva (score ${task.priorityScore})`,
      `Impacto ${task.impact} · Urgência ${task.urgencyScore}/100`,
      task.priority,
      task.roi,
      task.riskScore >= 70 ? "high" : task.riskScore >= 45 ? "medium" : "low",
      `${task.estimatedDays} dias`,
      task.department,
      "action",
    ),
  );
}

function buildFromForecast(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];

  for (const rec of input.forecast?.recommendations.slice(0, 3) ?? []) {
    const category =
      rec.title.toLowerCase().includes("marketing") ||
      rec.title.toLowerCase().includes("campanha")
        ? "campaign"
        : rec.title.toLowerCase().includes("invest")
          ? "investment"
          : "action";

    recs.push(
      item(
        `rec-fc-${rec.id}`,
        rec.title,
        rec.description,
        "Recomendação derivada do forecast executivo",
        `Horizonte ${rec.horizon} · Cenário esperado`,
        rec.priority,
        "ROI alinhado ao cenário esperado",
        rec.priority === "critical" ? "high" : "medium",
        rec.horizon,
        "Financeiro",
        category,
      ),
    );
  }

  const expected = input.forecast?.scenarios.find((s) => s.type === "expected");
  if (expected) {
    recs.push(
      item(
        "rec-fc-invest",
        "Investir no cenário esperado de crescimento",
        `Receita projetada: ${expected.projectedRevenue} · ROI: ${expected.roi}`,
        "Cenário esperado com maior probabilidade de sucesso",
        `Crescimento ${input.forecast?.expectedGrowth ?? "+10%"}`,
        "high",
        expected.roi,
        "medium",
        "90 dias",
        "Financeiro",
        "investment",
      ),
    );
  }

  return recs;
}

function buildFromMonitoring(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];
  let index = 0;

  for (const alert of input.monitoring?.alerts.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-mon-alert-${index++}`,
        alert.title,
        alert.message,
        "Alerta ativo no monitoramento executivo",
        "Prevenção de atrasos e perda de performance",
        alert.severity === "critical" ? "critical" : "high",
        "Evitar 10–18% de perda operacional",
        alert.severity === "critical" ? "critical" : "high",
        "7 dias",
        "Operações",
        alert.severity === "critical" ? "risk" : "action",
      ),
    );
  }

  for (const bottleneck of input.monitoring?.bottlenecks.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-mon-save-${index++}`,
        `Eliminar gargalo: ${bottleneck.split(/[.—]/)[0]?.trim() ?? "Operacional"}`,
        bottleneck,
        "Gargalo detectado no monitoramento de execução",
        "Economia operacional e ganho de velocidade",
        "high",
        "10–20% em eficiência",
        "medium",
        "21 dias",
        "Operações",
        "saving",
      ),
    );
  }

  for (const kpi of input.monitoring?.kpis.filter((k) => k.status === "at_risk" || k.status === "critical").slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-mon-kpi-${index++}`,
        `Recuperar KPI: ${kpi.name}`,
        `Atual: ${kpi.currentValue} · Meta: ${kpi.target} (${kpi.percentage}%)`,
        "KPI abaixo do target no painel de monitoramento",
        "Normalização de indicadores críticos",
        kpi.status === "critical" ? "critical" : "high",
        "8–15% em performance operacional",
        kpi.status === "critical" ? "high" : "medium",
        "30 dias",
        "Operações",
        "kpi",
      ),
    );
  }

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 50) {
    recs.push(
      item(
        "rec-mon-hire",
        "Reforçar capacidade operacional",
        `Risco de atraso em ${input.monitoring?.progress.delayRisk}% — considerar reforço de equipe`,
        "Alto risco de atraso detectado no progresso executivo",
        "Recuperação de prazos e entregas",
        "high",
        "12–18% em produtividade",
        "medium",
        "45 dias",
        "RH",
        "hiring",
      ),
    );
  }

  return recs;
}

function buildFromCompetitor(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];
  let index = 0;

  for (const rec of input.competitor?.recommendations.slice(0, 3) ?? []) {
    recs.push(
      item(
        `rec-comp-${rec.id}`,
        rec.title,
        rec.description,
        "Recomendação da inteligência competitiva",
        "Vantagem competitiva e participação de mercado",
        rec.priority,
        "15–25% em posicionamento",
        rec.priority === "critical" ? "high" : "medium",
        "90 dias",
        "Marketing",
        "campaign",
      ),
    );
  }

  for (const gap of input.competitor?.marketGaps.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-comp-gap-${index++}`,
        `Explorar gap: ${gap.area}`,
        gap.gap,
        `Benchmark competitivo: ${gap.competitorBenchmark}`,
        "Diferenciação e captura de demanda não atendida",
        gap.priority,
        "18–30% em oportunidade de mercado",
        "medium",
        "120 dias",
        "Produto",
        gap.area.toLowerCase().includes("mercado") ? "market" : "product",
      ),
    );
  }

  for (const threat of input.competitor?.threats.filter((t) => t.severity === "critical" || t.severity === "high").slice(0, 1) ?? []) {
    recs.push(
      item(
        `rec-comp-threat-${index++}`,
        `Conter ameaça: ${threat.title}`,
        threat.description,
        "Ameaça competitiva identificada",
        "Proteção de market share e margem",
        threat.severity === "critical" ? "critical" : "high",
        "Evitar perda de 8–15% em receita",
        threat.severity,
        "30 dias",
        "Estratégia",
        "risk",
      ),
    );
  }

  return recs;
}

function buildFromLearning(input: ExecutiveRecommendationInput): ExecutiveRecommendationItem[] {
  const recs: ExecutiveRecommendationItem[] = [];
  let index = 0;

  for (const rec of input.learning?.permanentRecommendations.slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-learn-perm-${index++}`,
        rec.split(/[.—]/)[0]?.trim() ?? "Recomendação permanente",
        rec,
        "Institucionalizada pelo motor de aprendizado executivo",
        "Consistência decisória e evolução estratégica",
        "high",
        "10–20% em maturidade executiva",
        "low",
        "60 dias",
        "Estratégia",
        "action",
      ),
    );
  }

  for (const rule of input.learning?.rules.filter((r) => r.priority === "critical" || r.priority === "high").slice(0, 2) ?? []) {
    recs.push(
      item(
        `rec-learn-rule-${index++}`,
        rule.title,
        rule.rule,
        rule.rationale,
        "Redução de erros recorrentes e melhoria contínua",
        rule.priority,
        "8–15% em eficiência",
        "low",
        "30 dias",
        "Operações",
        "automation",
      ),
    );
  }

  for (const pattern of input.learning?.patterns.filter((p) => p.type === "waste" || p.type === "bottleneck").slice(0, 1) ?? []) {
    recs.push(
      item(
        `rec-learn-save-${index++}`,
        `Reduzir ${pattern.type === "waste" ? "desperdício" : "gargalo"}: ${pattern.title}`,
        pattern.description,
        `Padrão detectado ${pattern.frequency}x no histórico executivo`,
        "Economia de recursos e tempo",
        "high",
        "12–20% em eficiência",
        "low",
        "45 dias",
        "Operações",
        "saving",
      ),
    );
  }

  return recs;
}

function filterByCategory(
  items: ExecutiveRecommendationItem[],
  categories: string[],
): ExecutiveRecommendationItem[] {
  return sortByPriority(items.filter((rec) => categories.includes(rec.category)));
}

function computeExpectedROI(input: ExecutiveRecommendationInput): string {
  return (
    input.action?.estimatedROI.overall ??
    input.forecast?.scenarios.find((s) => s.type === "expected")?.roi ??
    "ROI consolidado estimado em 15–25% no horizonte de 90 dias"
  );
}

function computeConfidenceLevel(input: ExecutiveRecommendationInput): number {
  const scores = [
    input.strategy?.confidenceScore,
    input.forecast?.confidence.overall,
    input.learning?.evolutionScore,
    input.priority?.priorityScore,
  ].filter((s): s is number => typeof s === "number");

  if (scores.length === 0) return 50;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function buildSummary(
  items: ExecutiveRecommendationItem[],
  confidenceLevel: number,
  expectedROI: string,
): string {
  const critical = items.filter((r) => r.priority === "critical").length;
  const high = items.filter((r) => r.priority === "high").length;

  return `Motor de recomendações gerou ${items.length} orientações para o CEO (${critical} críticas · ${high} altas). Confidence Level ${confidenceLevel}/100 · ROI esperado: ${expectedROI}. Foco: converter análises executivas em decisões concretas de ação, investimento, economia e mitigação de risco.`;
}

export function buildExecutiveRecommendation(
  input: ExecutiveRecommendationInput = {},
): ExecutiveRecommendation | null {
  const hasData =
    input.intelligence ||
    input.strategy ||
    input.action ||
    input.priority ||
    input.forecast ||
    input.monitoring ||
    input.competitor ||
    input.learning;

  if (!hasData) return null;

  const allItems = dedupe(
    sortByPriority([
      ...buildFromIntelligence(input),
      ...buildFromStrategy(input),
      ...buildFromAction(input),
      ...buildFromPriority(input),
      ...buildFromForecast(input),
      ...buildFromMonitoring(input),
      ...buildFromCompetitor(input),
      ...buildFromLearning(input),
    ]),
  );

  if (allItems.length === 0) return null;

  const expectedROI = computeExpectedROI(input);
  const confidenceLevel = computeConfidenceLevel(input);

  return {
    executiveRecommendations: allItems,
    recommendedActions: filterByCategory(allItems, ["action"]),
    recommendedInvestments: filterByCategory(allItems, ["investment"]),
    recommendedSavings: filterByCategory(allItems, ["saving"]),
    recommendedCampaigns: filterByCategory(allItems, ["campaign"]),
    recommendedHiring: filterByCategory(allItems, ["hiring"]),
    recommendedAutomation: filterByCategory(allItems, ["automation"]),
    recommendedProducts: filterByCategory(allItems, ["product"]),
    recommendedMarkets: filterByCategory(allItems, ["market"]),
    recommendedRisks: filterByCategory(allItems, ["risk"]),
    recommendedKPIs: filterByCategory(allItems, ["kpi"]),
    expectedROI,
    confidenceLevel,
    executiveRecommendationSummary: buildSummary(allItems, confidenceLevel, expectedROI),
  };
}
