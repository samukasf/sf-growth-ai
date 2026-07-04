import type {
  ExecutionPlan,
  ExecutionStep,
  ExecutionStepStatus,
} from "./executive-execution-planner.service";

export type KPIStatus = "on_track" | "at_risk" | "critical" | "achieved";

export type KPITrend = "up" | "down" | "stable";

export type ExecutiveKPI = {
  id: string;
  name: string;
  currentValue: string;
  target: string;
  percentage: number;
  status: KPIStatus;
  trend: KPITrend;
};

export type AlertType =
  | "critical_deadline"
  | "high_risk"
  | "blocked_dependency"
  | "kpi_below_target"
  | "execution_stopped";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type ExecutiveAlert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  planId?: string;
};

export type ExecutionMetric = {
  id: string;
  planId: string;
  planTitle: string;
  stepId: string;
  stepTitle: string;
  phaseTitle: string;
  status: ExecutionStepStatus;
  deadline: string;
  department: string;
  responsible: string;
  isOverdue: boolean;
  hasBlockedDependency: boolean;
};

export type ExecutiveProgress = {
  overall: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalTasks: number;
  activePlans: number;
  notStartedPlans: number;
  completedPlans: number;
  delayRisk: number;
};

export type MonitoringTimelineItem = {
  id: string;
  planId: string;
  planTitle: string;
  label: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "at_risk";
};

export type ExecutiveMonitoring = {
  progress: ExecutiveProgress;
  kpis: ExecutiveKPI[];
  alerts: ExecutiveAlert[];
  bottlenecks: string[];
  metrics: ExecutionMetric[];
  timeline: MonitoringTimelineItem[];
  indicators: string[];
};

function parseDeadlineDays(deadline: string) {
  const match = deadline.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 30;
}

function collectSteps(plans: ExecutionPlan[]) {
  return plans.flatMap((plan) =>
    plan.phases.flatMap((phase) =>
      phase.steps.map((step) => ({
        plan,
        phase,
        step,
      })),
    ),
  );
}

function isStepBlocked(step: ExecutionStep, completedStepTitles: Set<string>) {
  if (step.dependencies.length === 0) return false;
  return step.dependencies.some((dependency) => !completedStepTitles.has(dependency));
}

function getKpiStatus(percentage: number): KPIStatus {
  if (percentage >= 100) return "achieved";
  if (percentage >= 70) return "on_track";
  if (percentage >= 40) return "at_risk";
  return "critical";
}

function getKpiTrend(percentage: number): KPITrend {
  if (percentage >= 70) return "up";
  if (percentage >= 30) return "stable";
  return "down";
}

function buildMetrics(plans: ExecutionPlan[]): ExecutionMetric[] {
  const completedStepTitles = new Set(
    collectSteps(plans)
      .filter(({ step }) => step.status === "completed")
      .map(({ step }) => step.title),
  );

  return collectSteps(plans).map(({ plan, phase, step }) => {
    const blocked = isStepBlocked(step, completedStepTitles);
    const overdue =
      step.status !== "completed" &&
      plan.status === "Not Started" &&
      parseDeadlineDays(step.deadline) <= 7;

    return {
      id: `metric-${step.id}`,
      planId: plan.id,
      planTitle: plan.title,
      stepId: step.id,
      stepTitle: step.title,
      phaseTitle: phase.title,
      status: step.status,
      deadline: step.deadline,
      department: step.department,
      responsible: step.responsible,
      isOverdue: overdue,
      hasBlockedDependency: blocked,
    };
  });
}

function buildProgress(
  plans: ExecutionPlan[],
  metrics: ExecutionMetric[],
): ExecutiveProgress {
  const totalTasks = metrics.length;
  const completedTasks = metrics.filter((metric) => metric.status === "completed").length;
  const inProgressTasks = metrics.filter(
    (metric) => metric.status === "in_progress",
  ).length;
  const pendingTasks = metrics.filter((metric) => metric.status === "pending").length;
  const overdueTasks = metrics.filter((metric) => metric.isOverdue).length;
  const activePlans = plans.filter((plan) => plan.status === "In Progress").length;
  const notStartedPlans = plans.filter((plan) => plan.status === "Not Started").length;
  const completedPlans = plans.filter((plan) => plan.status === "Completed").length;

  const planProgress =
    plans.length > 0
      ? Math.round(
          plans.reduce((sum, plan) => sum + plan.progress, 0) / plans.length,
        )
      : 0;

  const taskProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overall = Math.round(planProgress * 0.4 + taskProgress * 0.6);

  const blockedCount = metrics.filter((metric) => metric.hasBlockedDependency).length;
  const stoppedFactor = notStartedPlans === plans.length && plans.length > 0 ? 35 : 0;
  const overdueFactor = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 30) : 0;
  const blockedFactor =
    totalTasks > 0 ? Math.round((blockedCount / totalTasks) * 25) : 0;
  const pendingFactor =
    totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 10) : 0;

  const delayRisk = Math.min(
    100,
    stoppedFactor + overdueFactor + blockedFactor + pendingFactor,
  );

  return {
    overall,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    totalTasks,
    activePlans,
    notStartedPlans,
    completedPlans,
    delayRisk,
  };
}

function buildKpis(
  plans: ExecutionPlan[],
  progress: ExecutiveProgress,
): ExecutiveKPI[] {
  const kpis: ExecutiveKPI[] = [
    {
      id: "kpi-overall-progress",
      name: "Progresso Geral",
      currentValue: `${progress.overall}%`,
      target: "100%",
      percentage: progress.overall,
      status: getKpiStatus(progress.overall),
      trend: getKpiTrend(progress.overall),
    },
    {
      id: "kpi-task-completion",
      name: "Conclusão de Etapas",
      currentValue: `${progress.completedTasks}/${progress.totalTasks}`,
      target: `${progress.totalTasks}/${progress.totalTasks}`,
      percentage:
        progress.totalTasks > 0
          ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
          : 0,
      status: getKpiStatus(
        progress.totalTasks > 0
          ? (progress.completedTasks / progress.totalTasks) * 100
          : 0,
      ),
      trend: getKpiTrend(
        progress.totalTasks > 0
          ? (progress.completedTasks / progress.totalTasks) * 100
          : 0,
      ),
    },
    {
      id: "kpi-active-plans",
      name: "Planos Ativos",
      currentValue: `${progress.activePlans}`,
      target: `${plans.length}`,
      percentage:
        plans.length > 0
          ? Math.round((progress.activePlans / plans.length) * 100)
          : 0,
      status: getKpiStatus(
        plans.length > 0 ? (progress.activePlans / plans.length) * 100 : 0,
      ),
      trend:
        progress.activePlans > 0 ? "up" : progress.notStartedPlans > 0 ? "down" : "stable",
    },
    {
      id: "kpi-delay-risk",
      name: "Risco de Atraso",
      currentValue: `${progress.delayRisk}%`,
      target: "≤ 25%",
      percentage: Math.max(0, 100 - progress.delayRisk),
      status:
        progress.delayRisk >= 70
          ? "critical"
          : progress.delayRisk >= 40
            ? "at_risk"
            : "on_track",
      trend: progress.delayRisk >= 50 ? "down" : "stable",
    },
  ];

  for (const plan of plans.slice(0, 4)) {
    const indicator = plan.successIndicators[0];
    if (!indicator) continue;

    const completion = plan.progress;
    kpis.push({
      id: `kpi-plan-${plan.id}`,
      name: indicator.length > 42 ? `${indicator.slice(0, 42)}…` : indicator,
      currentValue: `${completion}%`,
      target: "100%",
      percentage: completion,
      status: getKpiStatus(completion),
      trend: getKpiTrend(completion),
    });
  }

  return kpis;
}

function buildAlerts(
  plans: ExecutionPlan[],
  metrics: ExecutionMetric[],
  kpis: ExecutiveKPI[],
): ExecutiveAlert[] {
  const alerts: ExecutiveAlert[] = [];
  let alertIndex = 0;

  if (plans.length > 0 && plans.every((plan) => plan.status === "Not Started")) {
    alerts.push({
      id: `alert-${alertIndex++}`,
      type: "execution_stopped",
      title: "Execução parada",
      message:
        "Nenhum plano de execução foi iniciado. Kickoff executivo necessário para destravar a operação.",
      severity: "critical",
    });
  }

  for (const plan of plans) {
    const deadlineDays = parseDeadlineDays(plan.deadline);

    if (plan.status !== "Completed" && deadlineDays <= 14) {
      alerts.push({
        id: `alert-${alertIndex++}`,
        type: "critical_deadline",
        title: "Prazo crítico",
        message: `${plan.title} possui prazo de ${plan.deadline} e ainda não atingiu execução plena.`,
        severity: deadlineDays <= 7 ? "critical" : "high",
        planId: plan.id,
      });
    }

    if (plan.risks.length >= 2 && plan.progress < 30) {
      alerts.push({
        id: `alert-${alertIndex++}`,
        type: "high_risk",
        title: "Alto risco",
        message: `${plan.title} concentra ${plan.risks.length} riscos mapeados com progresso em ${plan.progress}%.`,
        severity: "high",
        planId: plan.id,
      });
    }
  }

  const blockedMetrics = metrics.filter((metric) => metric.hasBlockedDependency);
  for (const metric of blockedMetrics.slice(0, 3)) {
    alerts.push({
      id: `alert-${alertIndex++}`,
      type: "blocked_dependency",
      title: "Dependência bloqueada",
      message: `A etapa "${metric.stepTitle}" aguarda conclusão de dependências anteriores.`,
      severity: "medium",
      planId: metric.planId,
    });
  }

  for (const kpi of kpis) {
    if (kpi.percentage < 40 && kpi.id !== "kpi-delay-risk") {
      alerts.push({
        id: `alert-${alertIndex++}`,
        type: "kpi_below_target",
        title: "KPI abaixo da meta",
        message: `${kpi.name} está em ${kpi.currentValue} com meta ${kpi.target}.`,
        severity: kpi.percentage < 20 ? "high" : "medium",
      });
    }
  }

  return alerts;
}

function buildBottlenecks(
  plans: ExecutionPlan[],
  metrics: ExecutionMetric[],
  progress: ExecutiveProgress,
): string[] {
  const bottlenecks: string[] = [];

  if (progress.notStartedPlans === plans.length && plans.length > 0) {
    bottlenecks.push("Kickoff executivo pendente — todos os planos aguardam início.");
  }

  const departmentLoad = metrics.reduce<Record<string, number>>((acc, metric) => {
    if (metric.status !== "completed") {
      acc[metric.department] = (acc[metric.department] ?? 0) + 1;
    }
    return acc;
  }, {});

  const overloadedDepartment = Object.entries(departmentLoad).sort(
    (a, b) => b[1] - a[1],
  )[0];

  if (overloadedDepartment && overloadedDepartment[1] >= 4) {
    bottlenecks.push(
      `Concentração operacional em ${overloadedDepartment[0]} com ${overloadedDepartment[1]} etapas pendentes.`,
    );
  }

  const blockedCount = metrics.filter((metric) => metric.hasBlockedDependency).length;
  if (blockedCount > 0) {
    bottlenecks.push(
      `${blockedCount} etapa(s) bloqueada(s) por dependências não concluídas.`,
    );
  }

  if (progress.overdueTasks > 0) {
    bottlenecks.push(
      `${progress.overdueTasks} etapa(s) com risco imediato de atraso.`,
    );
  }

  const longPendingPlans = plans.filter(
    (plan) => plan.status === "Not Started" && parseDeadlineDays(plan.deadline) <= 21,
  );

  if (longPendingPlans.length > 0) {
    bottlenecks.push(
      `${longPendingPlans.length} plano(s) com prazo curto e execução ainda não iniciada.`,
    );
  }

  return [...new Set(bottlenecks)];
}

function buildTimeline(plans: ExecutionPlan[]): MonitoringTimelineItem[] {
  return plans.flatMap((plan) =>
    plan.phases.flatMap((phase) => [
      {
        id: `${plan.id}-${phase.id}-phase`,
        planId: plan.id,
        planTitle: plan.title,
        label: `Fase ${phase.order}: ${phase.title}`,
        deadline: phase.deadline,
        status:
          plan.progress === 0
            ? ("at_risk" as const)
            : plan.progress >= 100
              ? ("completed" as const)
              : plan.status === "In Progress"
                ? ("in_progress" as const)
                : ("pending" as const),
      },
      ...phase.milestones.map((milestone) => ({
        id: milestone.id,
        planId: plan.id,
        planTitle: plan.title,
        label: `Marco: ${milestone.title}`,
        deadline: milestone.deadline,
        status:
          plan.progress >= 100
            ? ("completed" as const)
            : plan.progress > 0
              ? ("in_progress" as const)
              : ("pending" as const),
      })),
    ]),
  );
}

function buildIndicators(
  progress: ExecutiveProgress,
  alerts: ExecutiveAlert[],
  bottlenecks: string[],
): string[] {
  const indicators = [
    `Progresso consolidado em ${progress.overall}%`,
    `${progress.completedTasks} de ${progress.totalTasks} etapas concluídas`,
    `${progress.pendingTasks} etapas pendentes`,
    `Risco de atraso calculado em ${progress.delayRisk}%`,
  ];

  if (alerts.length > 0) {
    indicators.push(`${alerts.length} alerta(s) ativo(s) requerendo atenção executiva`);
  }

  if (bottlenecks.length > 0) {
    indicators.push(`${bottlenecks.length} gargalo(s) identificado(s) na operação`);
  }

  return indicators;
}

export function buildExecutiveMonitoring(
  executionPlans: ExecutionPlan[],
): ExecutiveMonitoring {
  const metrics = buildMetrics(executionPlans);
  const progress = buildProgress(executionPlans, metrics);
  const kpis = buildKpis(executionPlans, progress);
  const alerts = buildAlerts(executionPlans, metrics, kpis);
  const bottlenecks = buildBottlenecks(executionPlans, metrics, progress);
  const timeline = buildTimeline(executionPlans);
  const indicators = buildIndicators(progress, alerts, bottlenecks);

  return {
    progress,
    kpis,
    alerts,
    bottlenecks,
    metrics,
    timeline,
    indicators,
  };
}
