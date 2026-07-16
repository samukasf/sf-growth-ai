import { supabase } from "@/lib/supabase/client";

import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveLearning } from "@/features/samuel-ai/services/executive-learning.service";
import type { ExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
import type { ExecutivePriority } from "@/features/samuel-ai/services/executive-priority.service";
import type { ExecutiveRecommendation } from "@/features/samuel-ai/services/executive-recommendation.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type HrMemberRecord = {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
};

export type HrProfileRecord = {
  id: string;
  company_id: string | null;
  full_name: string | null;
  role: string | null;
  active: boolean | null;
};

export type HrInsightRecord = {
  id: string;
  company_id: string;
  category: string;
  priority: string | null;
  title: string;
  description: string | null;
  recommendation: string | null;
  status: string | null;
};

export type HrInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type HrNeedItem = {
  id: string;
  title: string;
  description: string;
  priority: string;
};

export type HrRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type HrExecutive = {
  hrHealthScore: number;
  teamSize: number;
  productivityScore: number;
  engagementScore: number;
  hiringNeeds: HrNeedItem[];
  talentGaps: HrNeedItem[];
  retentionRisks: HrInsightItem[];
  trainingNeeds: HrNeedItem[];
  leadershipRisks: HrInsightItem[];
  workloadRisks: HrInsightItem[];
  hrOpportunities: HrInsightItem[];
  hrRecommendations: HrRecommendation[];
  hrExecutiveSummary: string;
};

export type HrExecutiveInput = {
  members?: HrMemberRecord[];
  profiles?: HrProfileRecord[];
  insights?: HrInsightRecord[];
  employeeCount?: number | null;
  hrScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  learning?: ExecutiveLearning | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  monitoring?: ExecutiveMonitoring | null;
  action?: ExecutiveAction | null;
  priority?: ExecutivePriority | null;
  recommendation?: ExecutiveRecommendation | null;
  operationsExecutive?: OperationsExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
};

const MOCK_MEMBERS: HrMemberRecord[] = [
  { id: "m-1", company_id: "mock", user_id: "u-1", role: "owner" },
  { id: "m-2", company_id: "mock", user_id: "u-2", role: "manager" },
  { id: "m-3", company_id: "mock", user_id: "u-3", role: "member" },
  { id: "m-4", company_id: "mock", user_id: "u-4", role: "member" },
  { id: "m-5", company_id: "mock", user_id: "u-5", role: "member" },
];

const MOCK_PROFILES: HrProfileRecord[] = [
  { id: "u-1", company_id: "mock", full_name: "Ana Costa", role: "CEO", active: true },
  { id: "u-2", company_id: "mock", full_name: "Bruno Lima", role: "Head of Sales", active: true },
  { id: "u-3", company_id: "mock", full_name: "Carla Mendes", role: "Marketing Lead", active: true },
  { id: "u-4", company_id: "mock", full_name: "Diego Souza", role: "Operations", active: true },
  { id: "u-5", company_id: "mock", full_name: "Elena Ribeiro", role: "Customer Success", active: false },
];

const MOCK_INSIGHTS: HrInsightRecord[] = [
  {
    id: "ins-1",
    company_id: "mock",
    category: "hiring",
    priority: "high",
    title: "Contratar SDR",
    description: "Pipeline comercial exige reforço na prospecção.",
    recommendation: "Abrir vaga para SDR com foco B2B.",
    status: "pending",
  },
  {
    id: "ins-2",
    company_id: "mock",
    category: "training",
    priority: "medium",
    title: "Capacitação em CRM",
    description: "Equipe comercial precisa padronizar uso do CRM.",
    recommendation: "Workshop de 4h sobre pipeline e follow-up.",
    status: "pending",
  },
  {
    id: "ins-3",
    company_id: "mock",
    category: "hr",
    priority: "critical",
    title: "Risco de turnover — CS",
    description: "Colaborador inativo no perfil de Customer Success.",
    recommendation: "1:1 de retenção e plano de desenvolvimento.",
    status: "pending",
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toSeverity(priority: string | null): HrInsightItem["severity"] {
  const p = (priority ?? "medium").toLowerCase();
  if (p === "critical") return "critical";
  if (p === "high") return "high";
  if (p === "low") return "low";
  return "medium";
}

function resolveInput(input: HrExecutiveInput) {
  return {
    members: input.members === undefined ? MOCK_MEMBERS : input.members,
    profiles: input.profiles === undefined ? MOCK_PROFILES : input.profiles,
    insights: input.insights === undefined ? MOCK_INSIGHTS : input.insights,
    employeeCount: input.employeeCount ?? null,
    companyName: input.companyName ?? "Empresa",
  };
}

function calculateTeamSize(
  members: HrMemberRecord[],
  profiles: HrProfileRecord[],
  employeeCount: number | null,
): number {
  const activeProfiles = profiles.filter((p) => p.active !== false).length;
  if (activeProfiles > 0) return activeProfiles;
  if (members.length > 0) return members.length;
  if (employeeCount && employeeCount > 0) return employeeCount;
  return profiles.length;
}

function calculateProductivityScore(input: HrExecutiveInput): number {
  let score = 55;

  score += Math.min(20, (input.operationsExecutive?.productivityScore ?? 50) * 0.2);
  score += Math.min(15, (input.monitoring?.progress.overall ?? 50) * 0.15);

  const onTrack =
    input.monitoring?.kpis.filter((k) => k.status === "on_track" || k.status === "achieved")
      .length ?? 0;
  score += Math.min(10, onTrack * 3);

  const overdue = input.monitoring?.progress.overdueTasks ?? 0;
  score -= Math.min(15, overdue * 4);

  return clampScore(score);
}

function calculateEngagementScore(
  profiles: HrProfileRecord[],
  members: HrMemberRecord[],
): number {
  const total = profiles.length || members.length || 1;
  const active = profiles.filter((p) => p.active !== false).length;
  const activeRatio = (active / total) * 100;

  let score = 50 + activeRatio * 0.35;

  const managers = members.filter((m) =>
    ["owner", "admin", "manager"].includes(m.role.toLowerCase()),
  ).length;
  if (managers >= 1 && managers / total <= 0.4) score += 10;
  if (activeRatio < 80) score -= 15;

  return clampScore(score);
}

function buildHiringNeeds(
  insights: HrInsightRecord[],
  input: HrExecutiveInput,
): HrNeedItem[] {
  const items: HrNeedItem[] = [];
  let index = 0;

  for (const insight of insights.filter((i) =>
    ["hiring", "recruitment", "people"].includes(i.category.toLowerCase()),
  )) {
    items.push({
      id: `hire-${index++}`,
      title: insight.title,
      description: insight.description ?? insight.recommendation ?? "",
      priority: insight.priority ?? "medium",
    });
  }

  for (const rec of input.recommendation?.recommendedHiring.slice(0, 2) ?? []) {
    items.push({
      id: `hire-${index++}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
    });
  }

  if ((input.salesExecutive?.openOpportunities.length ?? 0) >= 3) {
    items.push({
      id: `hire-${index++}`,
      title: "Reforço comercial",
      description: "Pipeline ativo indica necessidade de capacidade na equipe de vendas.",
      priority: "high",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "hire-default",
      title: "Monitorar capacidade da equipa",
      description: "Revisar headcount trimestralmente com base no pipeline e entregas.",
      priority: "medium",
    });
  }

  return items.slice(0, 5);
}

function buildTalentGaps(
  insights: HrInsightRecord[],
  input: HrExecutiveInput,
): HrNeedItem[] {
  const items: HrNeedItem[] = [];
  let index = 0;

  for (const weakness of input.intelligence?.weaknesses.slice(0, 2) ?? []) {
    items.push({
      id: `gap-${index++}`,
      title: weakness.split(/[.—]/)[0]?.trim() ?? weakness.slice(0, 60),
      description: weakness,
      priority: "high",
    });
  }

  for (const insight of insights.filter((i) => i.category.toLowerCase() === "hr")) {
    items.push({
      id: `gap-${index++}`,
      title: insight.title,
      description: insight.description ?? "",
      priority: insight.priority ?? "medium",
    });
  }

  if ((input.operationsExecutive?.processGaps.length ?? 0) > 0) {
    const gap = input.operationsExecutive!.processGaps[0]!;
    items.push({
      id: `gap-${index++}`,
      title: gap.title,
      description: `${gap.area}: ${gap.impact}`,
      priority: "medium",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "gap-default",
      title: "Competências digitais",
      description: "Mapear skills críticas vs. capacidade atual da equipa.",
      priority: "medium",
    });
  }

  return items.slice(0, 5);
}

function buildRetentionRisks(
  profiles: HrProfileRecord[],
  insights: HrInsightRecord[],
): HrInsightItem[] {
  const risks: HrInsightItem[] = [];
  let index = 0;

  const inactive = profiles.filter((p) => p.active === false);
  for (const profile of inactive.slice(0, 2)) {
    risks.push({
      id: `ret-${index++}`,
      title: `Colaborador inativo: ${profile.full_name ?? "Sem nome"}`,
      description: `Perfil ${profile.role ?? "sem cargo"} marcado como inativo — risco de turnover ou desalinhamento.`,
      severity: "high",
    });
  }

  for (const insight of insights.filter((i) =>
    i.title.toLowerCase().includes("turnover") ||
    i.title.toLowerCase().includes("retenção") ||
    i.title.toLowerCase().includes("retention"),
  )) {
    risks.push({
      id: `ret-${index++}`,
      title: insight.title,
      description: insight.description ?? insight.recommendation ?? "",
      severity: toSeverity(insight.priority),
    });
  }

  return risks.slice(0, 5);
}

function buildTrainingNeeds(
  insights: HrInsightRecord[],
  input: HrExecutiveInput,
): HrNeedItem[] {
  const items: HrNeedItem[] = [];
  let index = 0;

  for (const insight of insights.filter((i) =>
    ["training", "learning", "development"].includes(i.category.toLowerCase()),
  )) {
    items.push({
      id: `train-${index++}`,
      title: insight.title,
      description: insight.description ?? insight.recommendation ?? "",
      priority: insight.priority ?? "medium",
    });
  }

  if ((input.learning?.evolutionScore ?? 0) < 60) {
    items.push({
      id: `train-${index++}`,
      title: "Programa de evolução contínua",
      description: "Learning score abaixo do ideal — investir em upskilling da equipa.",
      priority: "high",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "train-default",
      title: "Formação executiva trimestral",
      description: "Sessões de alinhamento estratégico e ferramentas para toda a equipa.",
      priority: "medium",
    });
  }

  return items.slice(0, 5);
}

function buildLeadershipRisks(
  members: HrMemberRecord[],
  insights: HrInsightRecord[],
): HrInsightItem[] {
  const risks: HrInsightItem[] = [];
  let index = 0;

  const leaders = members.filter((m) =>
    ["owner", "admin", "manager"].includes(m.role.toLowerCase()),
  );

  if (leaders.length === 0) {
    risks.push({
      id: `lead-${index++}`,
      title: "Liderança não definida",
      description: "Nenhum gestor identificado na estrutura — risco de decisões descentralizadas.",
      severity: "critical",
    });
  }

  if (leaders.length === 1 && members.length > 5) {
    risks.push({
      id: `lead-${index++}`,
      title: "Concentração de liderança",
      description: "Um único líder para equipa grande — gargalo decisório.",
      severity: "high",
    });
  }

  for (const insight of insights.filter((i) => i.category.toLowerCase() === "leadership")) {
    risks.push({
      id: `lead-${index++}`,
      title: insight.title,
      description: insight.description ?? "",
      severity: toSeverity(insight.priority),
    });
  }

  return risks.slice(0, 4);
}

function buildWorkloadRisks(input: HrExecutiveInput): HrInsightItem[] {
  const risks: HrInsightItem[] = [];
  let index = 0;

  const utilization = input.operationsExecutive?.resourceUtilization ?? "";
  if (utilization.includes("atrasada") || (input.operationsExecutive?.bottlenecks.length ?? 0) >= 2) {
    risks.push({
      id: `wl-${index++}`,
      title: "Sobrecarga operacional",
      description: utilization || "Gargalos operacionais indicam pressão sobre a equipa.",
      severity: "high",
    });
  }

  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  if (delayRisk >= 50) {
    risks.push({
      id: `wl-${index++}`,
      title: "Pressão por prazos",
      description: `Risco de atraso em ${delayRisk}% — revisar distribuição de carga.`,
      severity: delayRisk >= 70 ? "critical" : "high",
    });
  }

  const blocked = input.priority?.blockedActions.length ?? 0;
  if (blocked >= 2) {
    risks.push({
      id: `wl-${index++}`,
      title: "Ações bloqueadas",
      description: `${blocked} ação(ões) bloqueada(s) — frustração e retrabalho na equipa.`,
      severity: "medium",
    });
  }

  return risks.slice(0, 4);
}

function buildHrOpportunities(input: HrExecutiveInput): HrInsightItem[] {
  const opportunities: HrInsightItem[] = [];
  let index = 0;

  if ((input.learning?.evolutionScore ?? 0) >= 70) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Cultura de aprendizagem",
      description: "Learning score elevado — escalar mentoria interna.",
      severity: "high",
    });
  }

  for (const opp of input.intelligence?.opportunities.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: opp.split(/[.—]/)[0]?.trim() ?? opp.slice(0, 60),
      description: opp,
      severity: "medium",
    });
  }

  if ((input.operationsExecutive?.automationOpportunities.length ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Automação alivia carga humana",
      description: "Oportunidades de automação reduzem tarefas repetitivas da equipa.",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildHrRecommendations(
  retentionRisks: HrInsightItem[],
  leadershipRisks: HrInsightItem[],
  workloadRisks: HrInsightItem[],
  input: HrExecutiveInput,
): HrRecommendation[] {
  const recs: HrRecommendation[] = [];
  let index = 0;

  for (const risk of [...retentionRisks, ...leadershipRisks, ...workloadRisks]
    .filter((r) => r.severity === "critical" || r.severity === "high")
    .slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const rec of input.recommendation?.recommendedHiring.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority === "critical" ? "critical" : "high",
    });
  }

  for (const action of input.strategy?.operationalStrategy.actions.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: action.split(/[.—]/)[0]?.trim() ?? "Ação de equipa",
      description: action,
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter ritmo de people management",
      description: "Continuar 1:1s, revisão de capacidade e plano de desenvolvimento trimestral.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  teamSize: number,
  engagementScore: number,
  hiringCount: number,
): string {
  return `${companyName} — RH executivo com saúde ${healthScore}/100. Equipa de ${teamSize} · Engagement ${engagementScore}/100 · ${hiringCount} necessidade(s) de contratação. Inteligência de pessoas integrada ao CEO Digital Samuel AI™.`;
}

export function buildHrExecutive(input: HrExecutiveInput = {}): HrExecutive {
  const { members, profiles, insights, employeeCount, companyName } = resolveInput(input);

  const teamSize = calculateTeamSize(members, profiles, employeeCount);
  const productivityScore = calculateProductivityScore(input);
  const engagementScore = calculateEngagementScore(profiles, members);

  const hiringNeeds = buildHiringNeeds(insights, input);
  const talentGaps = buildTalentGaps(insights, input);
  const retentionRisks = buildRetentionRisks(profiles, insights);
  const trainingNeeds = buildTrainingNeeds(insights, input);
  const leadershipRisks = buildLeadershipRisks(members, insights);
  const workloadRisks = buildWorkloadRisks(input);
  const hrOpportunities = buildHrOpportunities(input);
  const hrRecommendations = buildHrRecommendations(
    retentionRisks,
    leadershipRisks,
    workloadRisks,
    input,
  );

  const hrHealthScore = clampScore(
    (productivityScore +
      engagementScore +
      (input.hrScore ?? 0) +
      Math.max(0, 100 - retentionRisks.length * 12) +
      Math.max(0, 100 - leadershipRisks.filter((r) => r.severity === "critical").length * 20)) /
      5,
  );

  return {
    hrHealthScore,
    teamSize,
    productivityScore,
    engagementScore,
    hiringNeeds,
    talentGaps,
    retentionRisks,
    trainingNeeds,
    leadershipRisks,
    workloadRisks,
    hrOpportunities,
    hrRecommendations,
    hrExecutiveSummary: buildSummary(
      companyName,
      hrHealthScore,
      teamSize,
      engagementScore,
      hiringNeeds.length,
    ),
  };
}

export async function fetchHrExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<HrExecutiveInput> {
  const [membersResult, profilesResult, companyResult, insightsResult, growthResult] =
    await Promise.all([
      supabase
        .from("company_members")
        .select("id, company_id, user_id, role")
        .eq("company_id", companyId),
      supabase
        .from("user_profiles")
        .select("id, company_id, full_name, role, active")
        .eq("company_id", companyId),
      supabase
        .from("companies")
        .select("employees")
        .eq("id", companyId)
        .maybeSingle(),
      supabase
        .from("ai_insights")
        .select(
          "id, company_id, category, priority, title, description, recommendation, status",
        )
        .eq("company_id", companyId)
        .in("category", ["hr", "hiring", "people", "training", "leadership", "recruitment"]),
      supabase
        .from("growth_reports")
        .select("health_score")
        .eq("company_id", companyId)
        .order("report_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (membersResult.error) throw membersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (companyResult.error) throw companyResult.error;
  if (insightsResult.error) throw insightsResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    members: (membersResult.data ?? []) as HrMemberRecord[],
    profiles: (profilesResult.data ?? []) as HrProfileRecord[],
    insights: (insightsResult.data ?? []) as HrInsightRecord[],
    employeeCount: companyResult.data?.employees
      ? Number(companyResult.data.employees)
      : null,
    hrScore: growthResult.data?.health_score
      ? Number(growthResult.data.health_score)
      : null,
    companyName,
  };
}

export async function buildHrExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<
    HrExecutiveInput,
    "members" | "profiles" | "insights" | "employeeCount" | "hrScore" | "companyName"
  > = {},
): Promise<HrExecutive> {
  const base = await fetchHrExecutiveInput(companyId, companyName);
  return buildHrExecutive({ ...base, ...engines });
}
