import type { ExecutiveAction, ExecutiveActionItem } from "./executive-action.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type PriorityTask = ExecutiveActionItem & {
  priorityRank: number;
  impactScore: number;
  urgencyScore: number;
  roiScore: number;
  riskScore: number;
  dependencyScore: number;
  timeScore: number;
  priorityScore: number;
  isBlocked: boolean;
  dependencies: string[];
  estimatedDays: number;
};

export type CalendarEntry = {
  id: string;
  actionId: string;
  title: string;
  date: string;
  horizon: string;
  department: string;
  priorityScore: number;
};

export type AgendaItem = {
  id: string;
  actionId: string;
  title: string;
  day: string;
  slot: "morning" | "afternoon" | "week";
  department: string;
  priorityScore: number;
};

export type DependencyNode = {
  actionId: string;
  title: string;
  dependsOn: string[];
  blockedBy: string[];
};

export type BlockedAction = {
  actionId: string;
  title: string;
  reason: string;
  blockedBy: string[];
};

export type ExecutivePriority = {
  priorityQueue: PriorityTask[];
  criticalTasks: PriorityTask[];
  urgentTasks: PriorityTask[];
  importantTasks: PriorityTask[];
  lowPriorityTasks: PriorityTask[];
  executionCalendar: CalendarEntry[];
  executiveAgenda: AgendaItem[];
  top10Priorities: PriorityTask[];
  blockedActions: BlockedAction[];
  dependencyMap: DependencyNode[];
  riskLevel: RiskLevel;
  urgencyScore: number;
  impactScore: number;
  priorityScore: number;
  executivePrioritySummary: string;
};

export type ExecutivePriorityInput = {
  strategy?: ExecutiveStrategy | null;
  action?: ExecutiveAction | null;
  monitoring?: ExecutiveMonitoring | null;
  forecast?: ExecutiveForecast | null;
  decisions?: ExecutiveDecision[];
};

const IMPACT_SCORE = { high: 90, medium: 60, low: 30 } as const;

const HORIZON_URGENCY = {
  immediate: 100,
  short: 75,
  medium: 50,
  long: 25,
} as const;

const SOURCE_ORDER = ["strategy", "intelligence", "decision", "monitoring", "forecast", "default"];

function parseDeadlineDays(deadline: string): number {
  const match = deadline.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 30;
}

function parseRoiScore(roi: string): number {
  const numbers = roi.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return 50;
  const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  return Math.min(100, Math.round(avg * 3));
}

function computeImpactScore(action: ExecutiveActionItem, input: ExecutivePriorityInput): number {
  let score = IMPACT_SCORE[action.impact];

  if (input.strategy?.topPriorities.some((p) => action.title.includes(p.split(/[.—]/)[0]?.trim() ?? ""))) {
    score += 10;
  }

  if (input.action?.highImpactActions.some((a) => a.id === action.id)) {
    score += 5;
  }

  return Math.min(100, score);
}

function computeUrgencyScore(action: ExecutiveActionItem, input: ExecutivePriorityInput): number {
  let score = HORIZON_URGENCY[action.horizon];

  if (action.priority === "critical") score += 15;
  else if (action.priority === "high") score += 8;

  const hasCriticalAlert = input.monitoring?.alerts.some((a) => a.severity === "critical") ?? false;
  if (hasCriticalAlert && action.horizon === "immediate") score += 10;

  const days = parseDeadlineDays(action.deadline);
  if (days <= 7) score += 10;
  else if (days <= 14) score += 5;

  return Math.min(100, score);
}

function computeRiskScore(action: ExecutiveActionItem, input: ExecutivePriorityInput): number {
  let score = 30;

  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  score += Math.round(delayRisk * 0.4);

  if (input.monitoring?.alerts.some((a) => a.title === action.title || a.message.includes(action.title))) {
    score += 20;
  }

  if (action.priority === "critical") score += 15;

  const forecastRisk = input.forecast?.futureAlerts.length ?? 0;
  score += Math.min(15, forecastRisk * 3);

  return Math.min(100, score);
}

function computeTimeScore(action: ExecutiveActionItem): number {
  const days = parseDeadlineDays(action.deadline);
  if (days <= 7) return 95;
  if (days <= 14) return 85;
  if (days <= 30) return 70;
  if (days <= 90) return 50;
  return 30;
}

function inferDependencies(
  action: ExecutiveActionItem,
  allActions: ExecutiveActionItem[],
): string[] {
  const dependencies: string[] = [];

  const sourceIndex = SOURCE_ORDER.indexOf(action.source);
  if (sourceIndex > 0) {
    const prerequisite = allActions.find(
      (a) => SOURCE_ORDER.indexOf(a.source) < sourceIndex && a.department === action.department,
    );
    if (prerequisite) dependencies.push(prerequisite.id);
  }

  if (action.source === "decision" || action.source === "forecast") {
    const strategyAction = allActions.find((a) => a.source === "strategy");
    if (strategyAction && strategyAction.id !== action.id) {
      dependencies.push(strategyAction.id);
    }
  }

  if (action.horizon === "medium" || action.horizon === "long") {
    const shortAction = allActions.find(
      (a) => a.horizon === "immediate" && a.department === action.department,
    );
    if (shortAction && shortAction.id !== action.id) {
      dependencies.push(shortAction.id);
    }
  }

  return [...new Set(dependencies)];
}

function computeDependencyScore(
  dependencies: string[],
  blockedIds: Set<string>,
): number {
  if (dependencies.length === 0) return 90;
  const blockedCount = dependencies.filter((id) => blockedIds.has(id)).length;
  if (blockedCount > 0) return Math.max(10, 90 - blockedCount * 30);
  return 75;
}

function computePriorityScore(scores: {
  impactScore: number;
  roiScore: number;
  urgencyScore: number;
  dependencyScore: number;
  riskScore: number;
  timeScore: number;
}): number {
  const weighted =
    scores.impactScore * 0.25 +
    scores.roiScore * 0.2 +
    scores.urgencyScore * 0.25 +
    scores.dependencyScore * 0.1 +
    scores.riskScore * 0.1 +
    scores.timeScore * 0.1;

  return Math.round(Math.min(100, weighted));
}

function buildPriorityTasks(input: ExecutivePriorityInput): PriorityTask[] {
  const baseActions = input.action?.executionOrder ?? [];
  if (baseActions.length === 0) return [];

  const blockedMetricTitles = new Set(
    (input.monitoring?.metrics ?? [])
      .filter((m) => m.hasBlockedDependency)
      .map((m) => m.stepTitle),
  );

  const dependencyMap = baseActions.map((action) => ({
    action,
    dependencies: inferDependencies(action, baseActions),
  }));

  const blockedIds = new Set<string>();
  for (const { action } of dependencyMap) {
    const metricBlocked = [...blockedMetricTitles].some(
      (title) => action.title.includes(title) || action.description.includes(title),
    );
    if (metricBlocked) blockedIds.add(action.id);
  }

  const tasks: PriorityTask[] = dependencyMap.map(({ action, dependencies }) => {
    const impactScore = computeImpactScore(action, input);
    const urgencyScore = computeUrgencyScore(action, input);
    const roiScore = parseRoiScore(action.roi);
    const riskScore = computeRiskScore(action, input);
    const timeScore = computeTimeScore(action);
    const estimatedDays = parseDeadlineDays(action.deadline);
    const dependencyScore = computeDependencyScore(dependencies, blockedIds);
    const isBlocked =
      blockedIds.has(action.id) ||
      dependencies.some((id) => blockedIds.has(id));

    const priorityScore = computePriorityScore({
      impactScore,
      roiScore,
      urgencyScore,
      dependencyScore: isBlocked ? Math.min(dependencyScore, 30) : dependencyScore,
      riskScore,
      timeScore,
    });

    return {
      ...action,
      priorityRank: 0,
      impactScore,
      urgencyScore,
      roiScore,
      riskScore,
      dependencyScore,
      timeScore,
      priorityScore,
      isBlocked,
      dependencies,
      estimatedDays,
    };
  });

  return tasks
    .sort((a, b) => {
      if (a.isBlocked !== b.isBlocked) return a.isBlocked ? 1 : -1;
      return b.priorityScore - a.priorityScore;
    })
    .map((task, index) => ({ ...task, priorityRank: index + 1 }));
}

function buildDependencyMap(tasks: PriorityTask[]): DependencyNode[] {
  const titleById = new Map(tasks.map((t) => [t.id, t.title]));

  return tasks.map((task) => ({
    actionId: task.id,
    title: task.title,
    dependsOn: task.dependencies,
    blockedBy: task.dependencies
      .filter((id) => tasks.find((t) => t.id === id)?.isBlocked)
      .map((id) => titleById.get(id) ?? id),
  }));
}

function buildBlockedActions(tasks: PriorityTask[]): BlockedAction[] {
  return tasks
    .filter((task) => task.isBlocked)
    .map((task) => ({
      actionId: task.id,
      title: task.title,
      reason: task.dependencies.length > 0
        ? "Dependência não concluída ou bloqueio operacional detectado"
        : "Bloqueio operacional detectado no monitoramento",
      blockedBy: task.dependencies,
    }));
}

function buildExecutionCalendar(tasks: PriorityTask[]): CalendarEntry[] {
  const startDate = new Date();
  let dayOffset = 0;

  return tasks
    .filter((task) => !task.isBlocked)
    .slice(0, 14)
    .map((task, index) => {
      if (task.horizon === "immediate") dayOffset = index;
      else if (task.horizon === "short") dayOffset = index + 7;
      else if (task.horizon === "medium") dayOffset = index + 30;
      else dayOffset = index + 90;

      const date = new Date(startDate);
      date.setDate(date.getDate() + dayOffset);

      return {
        id: `cal-${index + 1}`,
        actionId: task.id,
        title: task.title,
        date: date.toISOString().split("T")[0] ?? "",
        horizon: task.horizon,
        department: task.department,
        priorityScore: task.priorityScore,
      };
    });
}

function buildExecutiveAgenda(tasks: PriorityTask[]): AgendaItem[] {
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  return tasks
    .filter((task) => !task.isBlocked)
    .slice(0, 10)
    .map((task, index) => ({
      id: `agenda-${index + 1}`,
      actionId: task.id,
      title: task.title,
      day: days[index % days.length] ?? "Segunda",
      slot: index % 3 === 0 ? "morning" : index % 3 === 1 ? "afternoon" : "week",
      department: task.department,
      priorityScore: task.priorityScore,
    }));
}

function computeGlobalRiskLevel(input: ExecutivePriorityInput, tasks: PriorityTask[]): RiskLevel {
  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  const criticalAlerts = input.monitoring?.alerts.filter((a) => a.severity === "critical").length ?? 0;
  const blockedCount = tasks.filter((t) => t.isBlocked).length;

  if (delayRisk >= 70 || criticalAlerts >= 2 || blockedCount >= 3) return "critical";
  if (delayRisk >= 45 || criticalAlerts >= 1 || blockedCount >= 1) return "high";
  if (delayRisk >= 25) return "medium";
  return "low";
}

function computeGlobalScores(tasks: PriorityTask[]): {
  urgencyScore: number;
  impactScore: number;
  priorityScore: number;
} {
  if (tasks.length === 0) {
    return { urgencyScore: 0, impactScore: 0, priorityScore: 0 };
  }

  const active = tasks.filter((t) => !t.isBlocked);
  const pool = active.length > 0 ? active : tasks;

  const avg = (key: keyof Pick<PriorityTask, "urgencyScore" | "impactScore" | "priorityScore">) =>
    Math.round(pool.reduce((sum, t) => sum + t[key], 0) / pool.length);

  return {
    urgencyScore: avg("urgencyScore"),
    impactScore: avg("impactScore"),
    priorityScore: avg("priorityScore"),
  };
}

function buildSummary(
  input: ExecutivePriorityInput,
  tasks: PriorityTask[],
  riskLevel: RiskLevel,
  globalPriorityScore: number,
): string {
  const criticalCount = tasks.filter((t) => t.priority === "critical").length;
  const urgentCount = tasks.filter((t) => t.urgencyScore >= 80).length;
  const blockedCount = tasks.filter((t) => t.isBlocked).length;
  const strategyScore = input.strategy?.executiveScore ?? 0;

  return `Fila de prioridade com ${tasks.length} ações ordenadas por impacto, ROI, urgência, dependências, risco e tempo. ${criticalCount} críticas · ${urgentCount} urgentes · ${blockedCount} bloqueadas. Risco ${riskLevel} · Priority Score ${globalPriorityScore}/100 · Estratégia ${strategyScore}/100.`;
}

export function buildExecutivePriority(
  input: ExecutivePriorityInput = {},
): ExecutivePriority | null {
  const hasData =
    input.strategy ||
    input.action ||
    input.monitoring ||
    input.forecast ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const priorityQueue = buildPriorityTasks(input);
  if (priorityQueue.length === 0) return null;

  const criticalTasks = priorityQueue.filter((t) => t.priority === "critical");
  const urgentTasks = priorityQueue.filter((t) => t.urgencyScore >= 80);
  const importantTasks = priorityQueue.filter(
    (t) => t.impactScore >= 70 && t.priority !== "low",
  );
  const lowPriorityTasks = priorityQueue.filter((t) => t.priority === "low" || t.priorityScore < 40);

  const blockedActions = buildBlockedActions(priorityQueue);
  const dependencyMap = buildDependencyMap(priorityQueue);
  const executionCalendar = buildExecutionCalendar(priorityQueue);
  const executiveAgenda = buildExecutiveAgenda(priorityQueue);
  const top10Priorities = priorityQueue.filter((t) => !t.isBlocked).slice(0, 10);

  const riskLevel = computeGlobalRiskLevel(input, priorityQueue);
  const globalScores = computeGlobalScores(priorityQueue);

  return {
    priorityQueue,
    criticalTasks,
    urgentTasks,
    importantTasks,
    lowPriorityTasks,
    executionCalendar,
    executiveAgenda,
    top10Priorities,
    blockedActions,
    dependencyMap,
    riskLevel,
    urgencyScore: globalScores.urgencyScore,
    impactScore: globalScores.impactScore,
    priorityScore: globalScores.priorityScore,
    executivePrioritySummary: buildSummary(
      input,
      priorityQueue,
      riskLevel,
      globalScores.priorityScore,
    ),
  };
}
