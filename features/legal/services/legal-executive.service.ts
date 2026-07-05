import { supabase } from "@/lib/supabase/client";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveAction } from "@/features/samuel-ai/services/executive-action.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveMonitoring } from "@/features/samuel-ai/services/executive-monitoring.service";
import type { ExecutivePriority } from "@/features/samuel-ai/services/executive-priority.service";
import type { ExecutiveRecommendation } from "@/features/samuel-ai/services/executive-recommendation.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type LegalInsightRecord = {
  id: string;
  company_id: string;
  category: string;
  priority: string | null;
  title: string;
  description: string | null;
  recommendation: string | null;
  status: string | null;
};

export type LegalContractRecord = {
  id: string;
  company_id: string;
  status: string | null;
  total: number | null;
  due_date: string | null;
  invoice_number: string | null;
};

export type LegalTwinData = Record<string, unknown>;

export type LegalInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type LegalGapItem = {
  id: string;
  title: string;
  area: string;
  impact: string;
};

export type LegalRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type LegalActionItem = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: string;
};

export type LegalExecutive = {
  legalHealthScore: number;
  complianceScore: number;
  contractRiskScore: number;
  dataProtectionScore: number;
  regulatoryRiskScore: number;
  lgpdGdprRisks: LegalInsightItem[];
  contractRisks: LegalInsightItem[];
  policyGaps: LegalGapItem[];
  legalOpportunities: LegalInsightItem[];
  legalRecommendations: LegalRecommendation[];
  urgentLegalActions: LegalActionItem[];
  legalExecutiveSummary: string;
};

export type LegalExecutiveInput = {
  insights?: LegalInsightRecord[];
  contracts?: LegalContractRecord[];
  legalTwin?: LegalTwinData | null;
  legalScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  monitoring?: ExecutiveMonitoring | null;
  action?: ExecutiveAction | null;
  priority?: ExecutivePriority | null;
  recommendation?: ExecutiveRecommendation | null;
  crmExecutive?: CrmExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  hrExecutive?: HrExecutive | null;
};

const MOCK_INSIGHTS: LegalInsightRecord[] = [
  {
    id: "leg-1",
    company_id: "mock",
    category: "lgpd",
    priority: "high",
    title: "Base legal de consentimento",
    description: "Formulários de captura sem registro explícito de consentimento LGPD.",
    recommendation: "Implementar checkbox com finalidade e registro de consentimento.",
    status: "pending",
  },
  {
    id: "leg-2",
    company_id: "mock",
    category: "contract",
    priority: "critical",
    title: "Contrato Enterprise sem revisão",
    description: "Deal de alto valor em negociação sem parecer jurídico.",
    recommendation: "Agendar revisão contratual antes do fechamento.",
    status: "pending",
  },
  {
    id: "leg-3",
    company_id: "mock",
    category: "compliance",
    priority: "medium",
    title: "Política de privacidade desatualizada",
    description: "Última revisão há mais de 12 meses.",
    recommendation: "Atualizar política alinhada à LGPD e GDPR.",
    status: "pending",
  },
  {
    id: "leg-4",
    company_id: "mock",
    category: "regulatory",
    priority: "high",
    title: "Retenção de dados de leads",
    description: "Contatos inativos sem política de retenção definida.",
    recommendation: "Definir ciclo de retenção e anonimização.",
    status: "pending",
  },
];

const MOCK_CONTRACTS: LegalContractRecord[] = [
  {
    id: "ctr-1",
    company_id: "mock",
    status: "overdue",
    total: 45000,
    due_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0] ?? null,
    invoice_number: "INV-2026-014",
  },
  {
    id: "ctr-2",
    company_id: "mock",
    status: "sent",
    total: 28000,
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] ?? null,
    invoice_number: "INV-2026-022",
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toSeverity(priority: string | null): LegalInsightItem["severity"] {
  const p = (priority ?? "medium").toLowerCase();
  if (p === "critical") return "critical";
  if (p === "high") return "high";
  if (p === "low") return "low";
  return "medium";
}

function isUnpaidContract(status: string | null): boolean {
  const s = (status ?? "").toLowerCase();
  return s !== "paid" && s !== "cancelled" && s !== "canceled";
}

function resolveInput(input: LegalExecutiveInput) {
  return {
    insights: input.insights?.length ? input.insights : MOCK_INSIGHTS,
    contracts: input.contracts?.length ? input.contracts : MOCK_CONTRACTS,
    legalTwin: input.legalTwin ?? null,
    companyName: input.companyName ?? "Empresa",
  };
}

function calculateComplianceScore(
  insights: LegalInsightRecord[],
  input: LegalExecutiveInput,
): number {
  let score = 65;

  const complianceIssues = insights.filter((i) =>
    ["compliance", "policy", "regulatory"].includes(i.category.toLowerCase()),
  ).length;
  score -= Math.min(25, complianceIssues * 6);

  const criticalAlerts =
    input.monitoring?.alerts.filter((a) => a.severity === "critical").length ?? 0;
  score -= Math.min(15, criticalAlerts * 5);

  if ((input.legalTwin?.complianceScore as number | undefined) != null) {
    score = clampScore(Number(input.legalTwin!.complianceScore));
  }

  return clampScore(score);
}

function calculateContractRiskScore(
  contracts: LegalContractRecord[],
  insights: LegalInsightRecord[],
  input: LegalExecutiveInput,
): number {
  let risk = 20;

  const overdue = contracts.filter((c) => (c.status ?? "").toLowerCase() === "overdue").length;
  risk += Math.min(30, overdue * 15);

  const openHighValue = contracts.filter(
    (c) => isUnpaidContract(c.status) && Number(c.total ?? 0) >= 25000,
  ).length;
  risk += Math.min(20, openHighValue * 8);

  if ((input.salesExecutive?.highValueDeals.length ?? 0) > 0) {
    risk += Math.min(15, input.salesExecutive!.highValueDeals.length * 5);
  }

  const contractInsights = insights.filter(
    (i) =>
      i.category.toLowerCase() === "contract" &&
      (i.priority === "critical" || i.priority === "high"),
  ).length;
  risk += Math.min(20, contractInsights * 8);

  return clampScore(risk);
}

function calculateDataProtectionScore(insights: LegalInsightRecord[]): number {
  let score = 70;

  const dataIssues = insights.filter((i) =>
    ["lgpd", "gdpr", "privacy", "data"].includes(i.category.toLowerCase()),
  );
  score -= Math.min(35, dataIssues.length * 10);
  score -= Math.min(
    20,
    dataIssues.filter((i) => i.priority === "critical").length * 12,
  );

  return clampScore(score);
}

function calculateRegulatoryRiskScore(
  insights: LegalInsightRecord[],
  input: LegalExecutiveInput,
): number {
  let risk = 15;

  const regulatory = insights.filter((i) =>
    ["regulatory", "compliance", "legal"].includes(i.category.toLowerCase()),
  );
  risk += Math.min(30, regulatory.length * 8);
  risk += Math.min(
    25,
    regulatory.filter((i) => i.priority === "critical").length * 12,
  );

  for (const riskItem of input.intelligence?.risks.slice(0, 2) ?? []) {
    if (/regulat|legal|compliance|lgpd|gdpr/i.test(riskItem)) {
      risk += 10;
    }
  }

  return clampScore(risk);
}

function buildLgpdGdprRisks(insights: LegalInsightRecord[]): LegalInsightItem[] {
  return insights
    .filter((i) => ["lgpd", "gdpr", "privacy", "data"].includes(i.category.toLowerCase()))
    .map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description ?? i.recommendation ?? "",
      severity: toSeverity(i.priority),
    }))
    .slice(0, 5);
}

function buildContractRisks(
  contracts: LegalContractRecord[],
  insights: LegalInsightRecord[],
  input: LegalExecutiveInput,
): LegalInsightItem[] {
  const risks: LegalInsightItem[] = [];
  let index = 0;

  for (const contract of contracts.filter(
    (c) => (c.status ?? "").toLowerCase() === "overdue",
  )) {
    risks.push({
      id: `ctr-${index++}`,
      title: `Fatura vencida: ${contract.invoice_number ?? contract.id}`,
      description: `Valor ${formatCurrency(Number(contract.total ?? 0))} — risco contratual e de recebimento.`,
      severity: "critical",
    });
  }

  for (const insight of insights.filter((i) => i.category.toLowerCase() === "contract")) {
    risks.push({
      id: `ctr-${index++}`,
      title: insight.title,
      description: insight.description ?? insight.recommendation ?? "",
      severity: toSeverity(insight.priority),
    });
  }

  for (const deal of input.salesExecutive?.highValueDeals.slice(0, 1) ?? []) {
    risks.push({
      id: `ctr-${index++}`,
      title: `Revisão contratual: ${deal.title}`,
      description: `${formatCurrency(deal.value)} — validar cláusulas antes do fechamento.`,
      severity: "high",
    });
  }

  return risks.slice(0, 5);
}

function buildPolicyGaps(
  insights: LegalInsightRecord[],
  input: LegalExecutiveInput,
): LegalGapItem[] {
  const gaps: LegalGapItem[] = [];
  let index = 0;

  for (const insight of insights.filter((i) =>
    ["policy", "compliance"].includes(i.category.toLowerCase()),
  )) {
    gaps.push({
      id: `gap-${index++}`,
      title: insight.title,
      area: "Política",
      impact: insight.description ?? insight.recommendation ?? "",
    });
  }

  for (const weakness of input.intelligence?.weaknesses.slice(0, 2) ?? []) {
    if (/política|compliance|document|legal|contrato/i.test(weakness)) {
      gaps.push({
        id: `gap-${index++}`,
        title: weakness.split(/[.—]/)[0]?.trim() ?? weakness.slice(0, 60),
        area: "Governança",
        impact: weakness,
      });
    }
  }

  if (gaps.length === 0) {
    gaps.push({
      id: "gap-default",
      title: "Manual de compliance",
      area: "Governança",
      impact: "Documentar políticas internas de privacidade, contratos e dados.",
    });
  }

  return gaps.slice(0, 5);
}

function buildLegalOpportunities(input: LegalExecutiveInput): LegalInsightItem[] {
  const opportunities: LegalInsightItem[] = [];
  let index = 0;

  if (calculateDataProtectionScore(input.insights ?? MOCK_INSIGHTS) >= 75) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Compliance como diferencial",
      description: "Base sólida de proteção de dados para posicionamento B2B enterprise.",
      severity: "high",
    });
  }

  for (const opp of input.competitor?.marketGaps.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: opp.area,
      description: `${opp.gap} — benchmark: ${opp.competitorBenchmark}`,
      severity: "medium",
    });
  }

  if ((input.financeExecutive?.recurringRevenue ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Padronizar contratos recorrentes",
      description: "Receita recorrente permite templates contratuais escaláveis.",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildUrgentLegalActions(
  insights: LegalInsightRecord[],
  contractRisks: LegalInsightItem[],
  input: LegalExecutiveInput,
): LegalActionItem[] {
  const actions: LegalActionItem[] = [];
  let index = 0;

  for (const insight of insights.filter(
    (i) => i.priority === "critical" || i.priority === "high",
  ).slice(0, 3)) {
    actions.push({
      id: `act-${index++}`,
      title: insight.title,
      description: insight.recommendation ?? insight.description ?? "",
      deadline: "7 dias",
      priority: insight.priority ?? "high",
    });
  }

  for (const risk of contractRisks.filter((r) => r.severity === "critical").slice(0, 2)) {
    actions.push({
      id: `act-${index++}`,
      title: risk.title,
      description: risk.description,
      deadline: "48 horas",
      priority: "critical",
    });
  }

  for (const task of input.priority?.criticalTasks.slice(0, 1) ?? []) {
    if (/legal|contrato|compliance|lgpd/i.test(task.title)) {
      actions.push({
        id: `act-${index++}`,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: "critical",
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      id: "act-default",
      title: "Auditoria jurídica trimestral",
      description: "Revisar contratos, políticas de privacidade e conformidade regulatória.",
      deadline: "30 dias",
      priority: "medium",
    });
  }

  return actions.slice(0, 5);
}

function buildLegalRecommendations(
  lgpdRisks: LegalInsightItem[],
  contractRisks: LegalInsightItem[],
  policyGaps: LegalGapItem[],
  input: LegalExecutiveInput,
): LegalRecommendation[] {
  const recs: LegalRecommendation[] = [];
  let index = 0;

  for (const risk of [...lgpdRisks, ...contractRisks]
    .filter((r) => r.severity === "critical" || r.severity === "high")
    .slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const gap of policyGaps.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Corrigir gap: ${gap.title}`,
      description: gap.impact,
      priority: "high",
    });
  }

  for (const rec of input.recommendation?.recommendedRisks.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: rec.title,
      description: rec.description,
      priority: rec.priority === "critical" ? "critical" : "high",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter governança jurídica",
      description: "Continuar monitoramento de contratos, LGPD/GDPR e políticas internas.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  complianceScore: number,
  contractRiskScore: number,
  urgentCount: number,
): string {
  return `${companyName} — Jurídico executivo com saúde ${healthScore}/100. Compliance ${complianceScore}/100 · Risco contratual ${contractRiskScore}/100 · ${urgentCount} ação(ões) urgente(s). Inteligência legal integrada ao CEO Digital Samuel AI™.`;
}

export function buildLegalExecutive(input: LegalExecutiveInput = {}): LegalExecutive {
  const { insights, contracts, companyName } = resolveInput(input);

  const complianceScore = calculateComplianceScore(insights, input);
  const contractRiskScore = calculateContractRiskScore(contracts, insights, input);
  const dataProtectionScore = calculateDataProtectionScore(insights);
  const regulatoryRiskScore = calculateRegulatoryRiskScore(insights, input);

  const lgpdGdprRisks = buildLgpdGdprRisks(insights);
  const contractRisks = buildContractRisks(contracts, insights, input);
  const policyGaps = buildPolicyGaps(insights, input);
  const legalOpportunities = buildLegalOpportunities(input);
  const urgentLegalActions = buildUrgentLegalActions(insights, contractRisks, input);
  const legalRecommendations = buildLegalRecommendations(
    lgpdGdprRisks,
    contractRisks,
    policyGaps,
    input,
  );

  const legalHealthScore = clampScore(
    (complianceScore +
      dataProtectionScore +
      (100 - contractRiskScore) +
      (100 - regulatoryRiskScore) +
      (input.legalScore ?? 0)) /
      5,
  );

  return {
    legalHealthScore,
    complianceScore,
    contractRiskScore,
    dataProtectionScore,
    regulatoryRiskScore,
    lgpdGdprRisks,
    contractRisks,
    policyGaps,
    legalOpportunities,
    legalRecommendations,
    urgentLegalActions,
    legalExecutiveSummary: buildSummary(
      companyName,
      legalHealthScore,
      complianceScore,
      contractRiskScore,
      urgentLegalActions.length,
    ),
  };
}

export async function fetchLegalExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<LegalExecutiveInput> {
  const [insightsResult, contractsResult, twinResult, growthResult] = await Promise.all([
    supabase
      .from("ai_insights")
      .select(
        "id, company_id, category, priority, title, description, recommendation, status",
      )
      .eq("company_id", companyId)
      .in("category", [
        "legal",
        "compliance",
        "lgpd",
        "gdpr",
        "contract",
        "regulatory",
        "policy",
        "privacy",
        "data",
      ]),
    supabase
      .from("invoices")
      .select("id, company_id, status, total, due_date, invoice_number")
      .eq("company_id", companyId),
    supabase
      .from("business_twins")
      .select("legal")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("growth_reports")
      .select("health_score")
      .eq("company_id", companyId)
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (insightsResult.error) throw insightsResult.error;
  if (contractsResult.error) throw contractsResult.error;
  if (twinResult.error) throw twinResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    insights: (insightsResult.data ?? []) as LegalInsightRecord[],
    contracts: (contractsResult.data ?? []) as LegalContractRecord[],
    legalTwin: (twinResult.data?.legal as LegalTwinData | null) ?? null,
    legalScore: growthResult.data?.health_score
      ? Number(growthResult.data.health_score)
      : null,
    companyName,
  };
}

export async function buildLegalExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<
    LegalExecutiveInput,
    "insights" | "contracts" | "legalTwin" | "legalScore" | "companyName"
  > = {},
): Promise<LegalExecutive> {
  const base = await fetchLegalExecutiveInput(companyId, companyName);
  return buildLegalExecutive({ ...base, ...engines });
}
