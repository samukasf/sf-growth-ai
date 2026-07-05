import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";

export type ActionHorizon = "immediate" | "short" | "medium" | "long";

export type ActionPriority = "critical" | "high" | "medium" | "low";

export type ActionImpact = "high" | "medium" | "low";

export type AutomationLevel = "manual" | "delegated" | "automated";

export type ExecutiveActionItem = {
  id: string;
  title: string;
  description: string;
  horizon: ActionHorizon;
  priority: ActionPriority;
  impact: ActionImpact;
  department: string;
  deadline: string;
  roi: string;
  automationLevel: AutomationLevel;
  order: number;
  source: string;
};

export type ResponsibleArea = {
  id: string;
  name: string;
  actionsCount: number;
  focus: string;
};

export type ExpectedResult = {
  id: string;
  actionId: string;
  title: string;
  metric: string;
  horizon: string;
};

export type EstimatedROI = {
  overall: string;
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
  confidence: number;
};

export type ExecutiveAction = {
  immediateActions: ExecutiveActionItem[];
  shortTermActions: ExecutiveActionItem[];
  mediumTermActions: ExecutiveActionItem[];
  longTermActions: ExecutiveActionItem[];
  quickWins: ExecutiveActionItem[];
  highImpactActions: ExecutiveActionItem[];
  criticalActions: ExecutiveActionItem[];
  delegatedActions: ExecutiveActionItem[];
  automatedActions: ExecutiveActionItem[];
  estimatedROI: EstimatedROI;
  executionOrder: ExecutiveActionItem[];
  responsibleAreas: ResponsibleArea[];
  expectedResults: ExpectedResult[];
  executionSummary: string;
};

export type ExecutiveActionInput = {
  strategy?: ExecutiveStrategy | null;
  decisions?: ExecutiveDecision[];
  monitoring?: ExecutiveMonitoring | null;
  forecast?: ExecutiveForecast | null;
  intelligence?: ExecutiveIntelligence | null;
};

const PRIORITY_WEIGHT: Record<ActionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function mapDecisionPriority(priority: ExecutiveDecision["priority"]): ActionPriority {
  switch (priority) {
    case "Critical":
      return "critical";
    case "High":
      return "high";
    case "Medium":
      return "medium";
    default:
      return "low";
  }
}

function mapDecisionImpact(
  difficulty: ExecutiveDecision["difficulty"],
  priority: ExecutiveDecision["priority"],
): ActionImpact {
  if (priority === "Critical" || priority === "High") return "high";
  if (difficulty === "Baixa") return "high";
  if (difficulty === "Média") return "medium";
  return "low";
}

function inferAutomationLevel(
  title: string,
  department: string,
): AutomationLevel {
  const text = `${title} ${department}`.toLowerCase();

  if (
    text.includes("monitor") ||
    text.includes("alerta") ||
    text.includes("kpi") ||
    text.includes("relatório") ||
    text.includes("relatorio") ||
    text.includes("automa")
  ) {
    return "automated";
  }

  if (
    text.includes("delegar") ||
    text.includes("equipe") ||
    text.includes("departamento") ||
    department !== "Estratégia"
  ) {
    return "delegated";
  }

  return "manual";
}

function inferHorizon(deadline: string): ActionHorizon {
  const days = Number.parseInt(deadline, 10);

  if (Number.isNaN(days) || days <= 7) return "immediate";
  if (days <= 30) return "short";
  if (days <= 90) return "medium";
  return "long";
}

function actionFromDecision(
  decision: ExecutiveDecision,
  order: number,
  source: string,
): ExecutiveActionItem {
  const priority = mapDecisionPriority(decision.priority);
  const impact = mapDecisionImpact(decision.difficulty, decision.priority);

  return {
    id: `action-decision-${decision.id}`,
    title: decision.title,
    description: decision.description,
    horizon: inferHorizon(decision.deadline),
    priority,
    impact,
    department: decision.department,
    deadline: decision.deadline,
    roi: decision.estimatedROI,
    automationLevel: inferAutomationLevel(decision.title, decision.department),
    order,
    source,
  };
}

function actionFromText(
  id: string,
  title: string,
  description: string,
  horizon: ActionHorizon,
  priority: ActionPriority,
  impact: ActionImpact,
  department: string,
  deadline: string,
  roi: string,
  order: number,
  source: string,
): ExecutiveActionItem {
  return {
    id,
    title,
    description,
    horizon,
    priority,
    impact,
    department,
    deadline,
    roi,
    automationLevel: inferAutomationLevel(title, department),
    order,
    source,
  };
}

function collectBaseActions(input: ExecutiveActionInput): ExecutiveActionItem[] {
  const actions: ExecutiveActionItem[] = [];
  let order = 1;

  for (const decision of input.decisions ?? []) {
    actions.push(actionFromDecision(decision, order++, "decision"));
  }

  for (const alert of input.monitoring?.alerts.slice(0, 3) ?? []) {
    actions.push(
      actionFromText(
        `action-alert-${alert.id}`,
        alert.title,
        alert.message,
        "immediate",
        alert.severity === "critical" ? "critical" : "high",
        "high",
        "Operações",
        "7 dias",
        "Redução imediata de risco operacional",
        order++,
        "monitoring",
      ),
    );
  }

  for (const bottleneck of input.monitoring?.bottlenecks.slice(0, 2) ?? []) {
    actions.push(
      actionFromText(
        `action-bottleneck-${order}`,
        bottleneck.split(/[.—]/)[0]?.trim() ?? "Desbloquear gargalo",
        bottleneck,
        "immediate",
        "high",
        "high",
        "Operações",
        "14 dias",
        "10–18% em eficiência operacional",
        order++,
        "monitoring",
      ),
    );
  }

  for (const action of input.strategy?.growthPlan30d.actions.slice(0, 3) ?? []) {
    actions.push(
      actionFromText(
        `action-strategy-30-${order}`,
        action.split(/[.—]/)[0]?.trim() ?? action,
        action,
        "immediate",
        "high",
        "medium",
        "Estratégia",
        "30 dias",
        "8–15% em execução inicial",
        order++,
        "strategy",
      ),
    );
  }

  for (const action of input.strategy?.growthPlan90d.actions.slice(0, 3) ?? []) {
    actions.push(
      actionFromText(
        `action-strategy-90-${order}`,
        action.split(/[.—]/)[0]?.trim() ?? action,
        action,
        "short",
        "high",
        "high",
        "Comercial",
        "90 dias",
        "12–22% em conversão",
        order++,
        "strategy",
      ),
    );
  }

  for (const action of input.strategy?.growthPlan365d.actions.slice(0, 2) ?? []) {
    actions.push(
      actionFromText(
        `action-strategy-365-${order}`,
        action.split(/[.—]/)[0]?.trim() ?? action,
        action,
        "long",
        "medium",
        "high",
        "Expansão",
        "365 dias",
        "20–35% em crescimento anual",
        order++,
        "strategy",
      ),
    );
  }

  for (const rec of input.forecast?.recommendations.slice(0, 2) ?? []) {
    actions.push(
      actionFromText(
        `action-forecast-${rec.id}`,
        rec.title,
        rec.description,
        rec.horizon.includes("30")
          ? "short"
          : rec.horizon.includes("90")
            ? "medium"
            : "long",
        rec.priority === "critical" ? "critical" : rec.priority,
        rec.priority === "critical" || rec.priority === "high" ? "high" : "medium",
        "Financeiro",
        rec.horizon,
        "ROI alinhado ao cenário esperado",
        order++,
        "forecast",
      ),
    );
  }

  for (const priority of input.intelligence?.priorities.slice(0, 2) ?? []) {
    actions.push(
      actionFromText(
        `action-intelligence-${order}`,
        priority.split(/[.—]/)[0]?.trim() ?? priority,
        priority,
        "short",
        "high",
        "high",
        "Estratégia",
        "30 dias",
        "15–25% em foco executivo",
        order++,
        "intelligence",
      ),
    );
  }

  if (actions.length === 0) {
    actions.push(
      actionFromText(
        "action-default",
        "Ativar ciclo de ações executivas",
        "Consolidar estratégia, decisões e monitoramento em plano de ação prático.",
        "immediate",
        "high",
        "medium",
        "Estratégia",
        "7 dias",
        "Base para execução estruturada",
        1,
        "default",
      ),
    );
  }

  return actions;
}

function sortByExecutionPriority(actions: ExecutiveActionItem[]): ExecutiveActionItem[] {
  return [...actions].sort((a, b) => {
    const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const impactWeight = { high: 0, medium: 1, low: 2 };
    const impactDiff = impactWeight[a.impact] - impactWeight[b.impact];
    if (impactDiff !== 0) return impactDiff;

    return a.order - b.order;
  });
}

function isQuickWin(action: ExecutiveActionItem): boolean {
  return (
    action.impact === "high" &&
    (action.horizon === "immediate" || action.horizon === "short") &&
    action.priority !== "low"
  );
}

function buildEstimatedROI(input: ExecutiveActionInput): EstimatedROI {
  const decisionRois = (input.decisions ?? []).map((d) => d.estimatedROI);
  const forecastGrowth = input.forecast?.expectedGrowth ?? "+10%";
  const confidence = input.forecast?.confidence.overall ?? input.strategy?.confidenceScore ?? 50;

  return {
    overall:
      decisionRois[0] ??
      `ROI consolidado estimado com crescimento ${forecastGrowth}`,
    shortTerm: decisionRois.find((r) => r.includes("30") || r.includes("60")) ?? "8–18% em 30–60 dias",
    mediumTerm: decisionRois.find((r) => r.includes("90")) ?? "12–25% em 90 dias",
    longTerm: `20–35% em 365 dias · Crescimento ${forecastGrowth}`,
    confidence: Math.round(confidence),
  };
}

function buildResponsibleAreas(actions: ExecutiveActionItem[]): ResponsibleArea[] {
  const map = new Map<string, { count: number; focus: string }>();

  for (const action of actions) {
    const current = map.get(action.department) ?? { count: 0, focus: action.title };
    map.set(action.department, {
      count: current.count + 1,
      focus: current.count === 0 ? action.title : current.focus,
    });
  }

  return [...map.entries()]
    .map(([name, data], index) => ({
      id: `area-${index + 1}`,
      name,
      actionsCount: data.count,
      focus: data.focus,
    }))
    .sort((a, b) => b.actionsCount - a.actionsCount);
}

function buildExpectedResults(actions: ExecutiveActionItem[]): ExpectedResult[] {
  return actions.slice(0, 8).map((action, index) => ({
    id: `result-${index + 1}`,
    actionId: action.id,
    title: action.title,
    metric:
      action.horizon === "immediate"
        ? "Conclusão em até 7 dias"
        : action.horizon === "short"
          ? "Resultado em 30 dias"
          : action.horizon === "medium"
            ? "Resultado em 90 dias"
            : "Resultado em 365 dias",
    horizon: action.deadline,
  }));
}

function buildExecutionSummary(
  input: ExecutiveActionInput,
  actions: ExecutiveActionItem[],
  criticalCount: number,
): string {
  const score = input.strategy?.executiveScore ?? 0;
  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  const activePlans = input.monitoring?.progress.activePlans ?? 0;

  return `Motor de ação executiva gerou ${actions.length} ações práticas (${criticalCount} críticas), ordenadas por impacto e prazo. Score estratégico ${score}/100 · Risco de atraso ${delayRisk}% · ${activePlans} plano(s) ativo(s). Foco: converter estratégia em execução imediata com quick wins e delegação por área.`;
}

export function buildExecutiveAction(
  input: ExecutiveActionInput = {},
): ExecutiveAction | null {
  const hasData =
    input.strategy ||
    input.intelligence ||
    input.monitoring ||
    input.forecast ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const baseActions = collectBaseActions(input);
  const executionOrder = sortByExecutionPriority(baseActions).map((action, index) => ({
    ...action,
    order: index + 1,
  }));

  const immediateActions = executionOrder.filter((a) => a.horizon === "immediate");
  const shortTermActions = executionOrder.filter((a) => a.horizon === "short");
  const mediumTermActions = executionOrder.filter((a) => a.horizon === "medium");
  const longTermActions = executionOrder.filter((a) => a.horizon === "long");
  const quickWins = executionOrder.filter(isQuickWin);
  const highImpactActions = executionOrder.filter((a) => a.impact === "high");
  const criticalActions = executionOrder.filter((a) => a.priority === "critical");
  const delegatedActions = executionOrder.filter((a) => a.automationLevel === "delegated");
  const automatedActions = executionOrder.filter((a) => a.automationLevel === "automated");

  return {
    immediateActions,
    shortTermActions,
    mediumTermActions,
    longTermActions,
    quickWins,
    highImpactActions,
    criticalActions,
    delegatedActions,
    automatedActions,
    estimatedROI: buildEstimatedROI(input),
    executionOrder,
    responsibleAreas: buildResponsibleAreas(executionOrder),
    expectedResults: buildExpectedResults(executionOrder),
    executionSummary: buildExecutionSummary(input, executionOrder, criticalActions.length),
  };
}
