import { supabase } from "@/lib/supabase/client";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutionPlan } from "@/features/samuel-ai/services/executive-execution-planner.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
import type { ExecutivePriority } from "@/features/samuel-ai/services/executive-priority.service";
import type { ExecutiveRecommendation } from "@/features/samuel-ai/services/executive-recommendation.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type OperationsTaskRecord = {
  id: string;
  company_id: string;
  title: string;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  completed_at: string | null;
};

export type OperationsInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type OperationsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type OperationsGapItem = {
  id: string;
  title: string;
  area: string;
  impact: string;
};

export type AutomationOpportunity = {
  id: string;
  title: string;
  description: string;
  estimatedImpact: string;
};

export type OperationsExecutive = {
  operationsHealthScore: number;
  productivityScore: number;
  processEfficiencyScore: number;
  automationScore: number;
  deliveryScore: number;
  capacityScore: number;
  bottlenecks: OperationsInsightItem[];
  operationalRisks: OperationsInsightItem[];
  operationalOpportunities: OperationsInsightItem[];
  operationalRecommendations: OperationsRecommendation[];
  automationOpportunities: AutomationOpportunity[];
  resourceUtilization: string;
  processGaps: OperationsGapItem[];
  operationsExecutiveSummary: string;
};

export type OperationsExecutiveInput = {
  tasks?: OperationsTaskRecord[];
  operationsScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  monitoring?: ExecutiveMonitoring | null;
  action?: ExecutiveAction | null;
  priority?: ExecutivePriority | null;
  recommendation?: ExecutiveRecommendation | null;
  executionPlans?: ExecutionPlan[];
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
};

const MOCK_TASKS: OperationsTaskRecord[] = [
  {
    id: "task-1",
    company_id: "mock",
    title: "Onboarding cliente Enterprise",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: "task-2",
    company_id: "mock",
    title: "Revisão de SLA — suporte",
    status: "pending",
    priority: "critical",
    due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: "task-3",
    company_id: "mock",
    title: "Automatizar relatório semanal",
    status: "pending",
    priority: "medium",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: "task-4",
    company_id: "mock",
    title: "Entrega sprint Q2",
    status: "completed",
    priority: "high",
    due_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "task-5",
    company_id: "mock",
    title: "Mapeamento de processos CRM",
    status: "completed",
    priority: "medium",
    due_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "task-6",
    company_id: "mock",
    title: "Capacitação equipe comercial",
    status: "in_progress",
    priority: "medium",
    due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    completed_at: null,
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStatus(status: string | null): string {
  return (status ?? "pending").toLowerCase();
}

function isCompleted(status: string | null): boolean {
  const s = normalizeStatus(status);
  return s === "completed" || s === "done" || s === "closed";
}

function isOverdue(task: OperationsTaskRecord): boolean {
  if (isCompleted(task.status) || !task.due_date) return false;
  return new Date(task.due_date) < new Date();
}

function resolveInput(input: OperationsExecutiveInput) {
  return {
    tasks: input.tasks?.length ? input.tasks : MOCK_TASKS,
    companyName: input.companyName ?? "Empresa",
  };
}

function calculateProductivityScore(
  tasks: OperationsTaskRecord[],
  monitoring?: ExecutiveMonitoring | null,
): number {
  const completed = tasks.filter((t) => isCompleted(t.status)).length;
  const total = tasks.length;
  const taskRatio = total > 0 ? (completed / total) * 100 : 50;

  const progress = monitoring?.progress.overall ?? taskRatio;
  return clampScore(taskRatio * 0.4 + progress * 0.6);
}

function calculateProcessEfficiencyScore(
  monitoring?: ExecutiveMonitoring | null,
  executionPlans?: ExecutionPlan[],
): number {
  let score = 50;

  const delayRisk = monitoring?.progress.delayRisk ?? 30;
  score += Math.min(25, (100 - delayRisk) * 0.25);

  const onTrack =
    monitoring?.kpis.filter((k) => k.status === "on_track" || k.status === "achieved").length ?? 0;
  score += Math.min(15, onTrack * 5);

  const criticalKpis =
    monitoring?.kpis.filter((k) => k.status === "critical").length ?? 0;
  score -= Math.min(20, criticalKpis * 6);

  const avgPlanProgress =
    (executionPlans ?? []).length > 0
      ? (executionPlans ?? []).reduce((sum, p) => sum + p.progress, 0) /
        (executionPlans ?? []).length
      : 50;
  score += Math.min(15, avgPlanProgress * 0.15);

  return clampScore(score);
}

function calculateAutomationScore(input: OperationsExecutiveInput): number {
  const totalActions = input.action?.executionOrder.length ?? 0;
  const automated = input.action?.automatedActions.length ?? 0;
  const delegated = input.action?.delegatedActions.length ?? 0;

  let score = 35;
  if (totalActions > 0) {
    score += Math.min(35, ((automated + delegated * 0.5) / totalActions) * 100 * 0.35);
  }

  const automationRecs = input.recommendation?.recommendedAutomation.length ?? 0;
  score += Math.min(15, automationRecs * 5);

  if ((input.recommendation?.recommendedAutomation.length ?? 0) > 0) score += 10;

  return clampScore(score);
}

function calculateDeliveryScore(
  monitoring?: ExecutiveMonitoring | null,
  executionPlans?: ExecutionPlan[],
): number {
  const progress = monitoring?.progress ?? null;
  if (!progress && !(executionPlans?.length ?? 0)) return 55;

  let score = 40;
  score += Math.min(30, (progress?.overall ?? 50) * 0.3);
  score += Math.min(15, (progress?.completedPlans ?? 0) * 8);
  score -= Math.min(20, (progress?.overdueTasks ?? 0) * 4);

  const completedPlans = executionPlans?.filter((p) => p.status === "Completed").length ?? 0;
  score += Math.min(15, completedPlans * 7);

  return clampScore(score);
}

function calculateCapacityScore(
  tasks: OperationsTaskRecord[],
  monitoring?: ExecutiveMonitoring | null,
): number {
  const active = tasks.filter((t) => !isCompleted(t.status)).length;
  const overdue = tasks.filter(isOverdue).length;
  const total = tasks.length;

  let score = 70;
  const loadRatio = total > 0 ? active / total : 0.5;

  if (loadRatio > 0.8) score -= 15;
  else if (loadRatio > 0.6) score -= 8;
  else if (loadRatio < 0.3) score += 10;

  score -= Math.min(25, overdue * 8);

  const pending = monitoring?.progress.pendingTasks ?? 0;
  const inProgress = monitoring?.progress.inProgressTasks ?? 0;
  if (pending + inProgress > 15) score -= 10;

  return clampScore(score);
}

function buildResourceUtilization(
  tasks: OperationsTaskRecord[],
  monitoring?: ExecutiveMonitoring | null,
): string {
  const active = tasks.filter((t) => !isCompleted(t.status)).length;
  const overdue = tasks.filter(isOverdue).length;
  const total = tasks.length;
  const utilization = total > 0 ? clampScore(Math.round((active / total) * 100)) : 0;

  const monitorPending = monitoring?.progress.pendingTasks ?? 0;
  const monitorInProgress = monitoring?.progress.inProgressTasks ?? 0;

  if (monitorPending + monitorInProgress > 0) {
    return `${utilization}% — ${monitorInProgress} em execução · ${monitorPending} pendentes · ${overdue} atrasada(s)`;
  }

  return `${utilization}% — ${active} tarefa(s) ativa(s) · ${overdue} atrasada(s)`;
}

function buildBottlenecks(
  tasks: OperationsTaskRecord[],
  input: OperationsExecutiveInput,
): OperationsInsightItem[] {
  const items: OperationsInsightItem[] = [];
  let index = 0;

  for (const bottleneck of input.monitoring?.bottlenecks ?? []) {
    items.push({
      id: `bn-${index++}`,
      title: "Gargalo operacional",
      description: bottleneck,
      severity: "high",
    });
  }

  for (const task of tasks.filter(isOverdue).slice(0, 2)) {
    items.push({
      id: `bn-${index++}`,
      title: `Atraso: ${task.title}`,
      description: `Tarefa vencida com prioridade ${task.priority ?? "medium"}.`,
      severity: task.priority === "critical" ? "critical" : "high",
    });
  }

  for (const blocked of input.priority?.blockedActions.slice(0, 2) ?? []) {
    items.push({
      id: `bn-${index++}`,
      title: `Bloqueio: ${blocked.title}`,
      description: blocked.reason,
      severity: "high",
    });
  }

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 60) {
    items.push({
      id: `bn-${index++}`,
      title: "Risco de atraso elevado",
      description: `Delay risk em ${input.monitoring!.progress.delayRisk}% — replanejar capacidade.`,
      severity: "critical",
    });
  }

  return items.slice(0, 6);
}

function buildOperationalRisks(
  tasks: OperationsTaskRecord[],
  input: OperationsExecutiveInput,
): OperationsInsightItem[] {
  const risks: OperationsInsightItem[] = [];
  let index = 0;

  const overdue = tasks.filter(isOverdue).length;
  if (overdue >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Acúmulo de tarefas atrasadas",
      description: `${overdue} tarefa(s) fora do prazo — impacto na entrega.`,
      severity: overdue >= 4 ? "critical" : "high",
    });
  }

  for (const alert of input.monitoring?.alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high",
  ).slice(0, 2) ?? []) {
    risks.push({
      id: `risk-${index++}`,
      title: alert.title,
      description: alert.message,
      severity: alert.severity === "critical" ? "critical" : "high",
    });
  }

  if ((input.executionPlans?.filter((p) => p.status === "On Hold").length ?? 0) > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Planos em pausa",
      description: "Execução interrompida — revisar dependências e recursos.",
      severity: "high",
    });
  }

  for (const weakness of input.intelligence?.weaknesses.slice(0, 1) ?? []) {
    risks.push({
      id: `risk-${index++}`,
      title: weakness.title,
      description: weakness.description,
      severity: "medium",
    });
  }

  return risks;
}

function buildOperationalOpportunities(input: OperationsExecutiveInput): OperationsInsightItem[] {
  const opportunities: OperationsInsightItem[] = [];
  let index = 0;

  for (const win of input.action?.quickWins.slice(0, 2) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: win.title,
      description: win.description,
      severity: "high",
    });
  }

  if ((input.monitoring?.progress.completedPlans ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Planos concluídos — escalar modelo",
      description: `${input.monitoring!.progress.completedPlans} plano(s) finalizado(s) — replicar playbook operacional.`,
      severity: "medium",
    });
  }

  for (const opp of input.intelligence?.opportunities.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: opp.title,
      description: opp.description,
      severity: "medium",
    });
  }

  if ((input.salesExecutive?.openOpportunities.length ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Capacidade para demanda comercial",
      description: "Pipeline ativo exige alinhamento operacional para entrega.",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildAutomationOpportunities(input: OperationsExecutiveInput): AutomationOpportunity[] {
  const items: AutomationOpportunity[] = [];
  let index = 0;

  for (const action of input.action?.executionOrder.filter(
    (a) => a.automationLevel === "manual",
  ).slice(0, 3) ?? []) {
    items.push({
      id: `auto-${index++}`,
      title: action.title,
      description: action.description,
      estimatedImpact: action.roi,
    });
  }

  for (const rec of input.recommendation?.recommendedAutomation.slice(0, 2) ?? []) {
    items.push({
      id: `auto-${index++}`,
      title: rec.title,
      description: rec.description,
      estimatedImpact: rec.estimatedROI,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "auto-default",
      title: "Automatizar relatórios operacionais",
      description: "Consolidar KPIs de execução em dashboard semanal automatizado.",
      estimatedImpact: "Alto — redução de 6h/semana",
    });
  }

  return items.slice(0, 5);
}

function buildProcessGaps(input: OperationsExecutiveInput): OperationsGapItem[] {
  const gaps: OperationsGapItem[] = [];
  let index = 0;

  for (const weakness of input.intelligence?.weaknesses.slice(0, 2) ?? []) {
    gaps.push({
      id: `gap-${index++}`,
      title: weakness.title,
      area: "Inteligência",
      impact: weakness.description,
    });
  }

  for (const kpi of input.monitoring?.kpis.filter((k) => k.status === "critical").slice(0, 2) ?? []) {
    gaps.push({
      id: `gap-${index++}`,
      title: kpi.name,
      area: "KPI",
      impact: `Atual ${kpi.currentValue} vs meta ${kpi.target} (${kpi.percentage}%)`,
    });
  }

  for (const plan of (input.executionPlans ?? []).filter((p) => p.progress < 30).slice(0, 1)) {
    gaps.push({
      id: `gap-${index++}`,
      title: plan.title,
      area: "Execução",
      impact: `Progresso em ${plan.progress}% — ${plan.risks[0] ?? "Risco operacional"}`,
    });
  }

  if (gaps.length === 0) {
    gaps.push({
      id: "gap-default",
      title: "Padronização de processos",
      area: "Operações",
      impact: "Documentar playbooks para reduzir dependência de conhecimento tácito.",
    });
  }

  return gaps.slice(0, 5);
}

function buildOperationalRecommendations(
  risks: OperationsInsightItem[],
  bottlenecks: OperationsInsightItem[],
  input: OperationsExecutiveInput,
): OperationsRecommendation[] {
  const recs: OperationsRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const bn of bottlenecks.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Desbloquear: ${bn.title}`,
      description: bn.description,
      priority: bn.severity === "critical" ? "critical" : "high",
    });
  }

  for (const action of input.strategy?.operationalStrategy.actions.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: action.split(/[.—]/)[0]?.trim() ?? "Ação operacional",
      description: action,
      priority: "high",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter cadência operacional",
      description: "Continuar monitoramento semanal de gargalos, capacidade e entregas.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  productivityScore: number,
  deliveryScore: number,
  bottleneckCount: number,
): string {
  return `${companyName} — Operações executivas com saúde ${healthScore}/100. Produtividade ${productivityScore}/100 · Entrega ${deliveryScore}/100 · ${bottleneckCount} gargalo(s). Inteligência operacional integrada ao CEO Digital Samuel AI™.`;
}

export function buildOperationsExecutive(
  input: OperationsExecutiveInput = {},
): OperationsExecutive {
  const { tasks, companyName } = resolveInput(input);

  const productivityScore = calculateProductivityScore(tasks, input.monitoring);
  const processEfficiencyScore = calculateProcessEfficiencyScore(
    input.monitoring,
    input.executionPlans,
  );
  const automationScore = calculateAutomationScore(input);
  const deliveryScore = calculateDeliveryScore(input.monitoring, input.executionPlans);
  const capacityScore = calculateCapacityScore(tasks, input.monitoring);

  const bottlenecks = buildBottlenecks(tasks, input);
  const operationalRisks = buildOperationalRisks(tasks, input);
  const operationalOpportunities = buildOperationalOpportunities(input);
  const automationOpportunities = buildAutomationOpportunities(input);
  const processGaps = buildProcessGaps(input);
  const operationalRecommendations = buildOperationalRecommendations(
    operationalRisks,
    bottlenecks,
    input,
  );

  const resourceUtilization = buildResourceUtilization(tasks, input.monitoring);

  const operationsHealthScore = clampScore(
    (productivityScore +
      processEfficiencyScore +
      automationScore +
      deliveryScore +
      capacityScore +
      (input.operationsScore ?? 0)) /
      6,
  );

  return {
    operationsHealthScore,
    productivityScore,
    processEfficiencyScore,
    automationScore,
    deliveryScore,
    capacityScore,
    bottlenecks,
    operationalRisks,
    operationalOpportunities,
    operationalRecommendations,
    automationOpportunities,
    resourceUtilization,
    processGaps,
    operationsExecutiveSummary: buildSummary(
      companyName,
      operationsHealthScore,
      productivityScore,
      deliveryScore,
      bottlenecks.length,
    ),
  };
}

export async function fetchOperationsExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<OperationsExecutiveInput> {
  const [tasksResult, growthResult] = await Promise.all([
    supabase
      .from("ai_tasks")
      .select("id, company_id, title, status, priority, due_date, completed_at")
      .eq("company_id", companyId),
    supabase
      .from("growth_reports")
      .select("operations_score")
      .eq("company_id", companyId)
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    tasks: (tasksResult.data ?? []) as OperationsTaskRecord[],
    operationsScore: growthResult.data?.operations_score
      ? Number(growthResult.data.operations_score)
      : null,
    companyName,
  };
}

export async function buildOperationsExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<
    OperationsExecutiveInput,
    "tasks" | "operationsScore" | "companyName"
  > = {},
): Promise<OperationsExecutive> {
  const base = await fetchOperationsExecutiveInput(companyId, companyName);
  return buildOperationsExecutive({ ...base, ...engines });
}
