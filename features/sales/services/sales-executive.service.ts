import { supabase } from "@/lib/supabase/client";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type SalesDealRecord = {
  id: string;
  company_id: string;
  title: string;
  stage: string | null;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesLeadRecord = {
  id: string;
  company_id: string;
  contact_id: string | null;
  stage: string | null;
  score: number | null;
  value: number | null;
  updated_at: string;
};

export type SalesDealInsight = {
  id: string;
  title: string;
  value: number;
  reason: string;
};

export type SalesInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type SalesRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type SalesExecutive = {
  salesHealthScore: number;
  salesPipelineScore: number;
  leadQualityScore: number;
  conversionScore: number;
  averageDealSize: number;
  salesCycleLength: string;
  winRate: number;
  lostRate: number;
  revenueForecast: string;
  openOpportunities: SalesDealInsight[];
  closedWon: number;
  closedLost: number;
  stalledDeals: SalesDealInsight[];
  highValueDeals: SalesDealInsight[];
  salesRisks: SalesInsightItem[];
  salesOpportunities: SalesInsightItem[];
  salesRecommendations: SalesRecommendation[];
  salesExecutiveSummary: string;
};

export type SalesExecutiveInput = {
  deals?: SalesDealRecord[];
  leads?: SalesLeadRecord[];
  salesScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
};

const STALLED_DAYS = 21;
const HIGH_VALUE_THRESHOLD = 25000;

const MOCK_DEALS: SalesDealRecord[] = [
  {
    id: "sl-1",
    company_id: "mock",
    title: "Enterprise — TechCorp",
    stage: "negotiation",
    amount: 85000,
    probability: 75,
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] ?? null,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sl-2",
    company_id: "mock",
    title: "Consultoria — Startup.io",
    stage: "proposal",
    amount: 32000,
    probability: 55,
    expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] ?? null,
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "sl-3",
    company_id: "mock",
    title: "Retainer Anual — Cliente A",
    stage: "won",
    amount: 62000,
    probability: 100,
    expected_close_date: null,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "sl-4",
    company_id: "mock",
    title: "Projeto Piloto — Beta Co",
    stage: "lost",
    amount: 18000,
    probability: 0,
    expected_close_date: null,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "sl-5",
    company_id: "mock",
    title: "Expansão — Enterprise Co",
    stage: "qualified",
    amount: 45000,
    probability: 40,
    expected_close_date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0] ?? null,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const MOCK_LEADS: SalesLeadRecord[] = [
  {
    id: "ld-s1",
    company_id: "mock",
    contact_id: null,
    stage: "qualified",
    score: 82,
    value: 40000,
    updated_at: new Date().toISOString(),
  },
  {
    id: "ld-s2",
    company_id: "mock",
    contact_id: null,
    stage: "new",
    score: 48,
    value: 12000,
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "ld-s3",
    company_id: "mock",
    contact_id: null,
    stage: "proposal",
    score: 71,
    value: 28000,
    updated_at: new Date().toISOString(),
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStage(stage: string | null): string {
  return (stage ?? "new").toLowerCase();
}

function isWonStage(stage: string): boolean {
  return stage.includes("won") || stage.includes("ganho");
}

function isLostStage(stage: string): boolean {
  return stage.includes("lost") || stage.includes("perdido");
}

function isOpenStage(stage: string): boolean {
  return !isWonStage(stage) && !isLostStage(stage);
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveInput(input: SalesExecutiveInput): Required<
  Pick<SalesExecutiveInput, "deals" | "leads" | "companyName">
> {
  const deals = input.deals ?? [];
  const leads = input.leads ?? [];

  if (deals.length === 0 && leads.length === 0) {
    return { deals: MOCK_DEALS, leads: MOCK_LEADS, companyName: input.companyName ?? "Empresa" };
  }

  return { deals, leads, companyName: input.companyName ?? "Empresa" };
}

function toDealInsight(deal: SalesDealRecord, reason: string): SalesDealInsight {
  return {
    id: deal.id,
    title: deal.title,
    value: Number(deal.amount ?? 0),
    reason,
  };
}

function buildStalledDeals(deals: SalesDealRecord[]): SalesDealInsight[] {
  return deals
    .filter((deal) => {
      const stage = normalizeStage(deal.stage);
      if (!isOpenStage(stage)) return false;
      return (
        daysSince(deal.updated_at) >= STALLED_DAYS ||
        (deal.expected_close_date !== null &&
          new Date(deal.expected_close_date).getTime() < Date.now())
      );
    })
    .map((deal) =>
      toDealInsight(
        deal,
        `Parado há ${daysSince(deal.updated_at)} dias · Prob. ${deal.probability ?? 0}%`,
      ),
    )
    .slice(0, 5);
}

function buildHighValueDeals(deals: SalesDealRecord[]): SalesDealInsight[] {
  return deals
    .filter(
      (deal) =>
        isOpenStage(normalizeStage(deal.stage)) &&
        Number(deal.amount ?? 0) >= HIGH_VALUE_THRESHOLD,
    )
    .map((deal) =>
      toDealInsight(deal, `Alto valor · Prob. ${deal.probability ?? 0}%`),
    )
    .slice(0, 5);
}

function buildOpenOpportunities(deals: SalesDealRecord[]): SalesDealInsight[] {
  return deals
    .filter((deal) => isOpenStage(normalizeStage(deal.stage)))
    .map((deal) =>
      toDealInsight(
        deal,
        `${normalizeStage(deal.stage)} · Prob. ${deal.probability ?? 0}%`,
      ),
    )
    .slice(0, 6);
}

function calculateWinLostRates(deals: SalesDealRecord[]): { winRate: number; lostRate: number } {
  const closed = deals.filter((d) => {
    const stage = normalizeStage(d.stage);
    return isWonStage(stage) || isLostStage(stage);
  });

  if (closed.length === 0) return { winRate: 0, lostRate: 0 };

  const won = closed.filter((d) => isWonStage(normalizeStage(d.stage))).length;
  const lost = closed.filter((d) => isLostStage(normalizeStage(d.stage))).length;

  return {
    winRate: clampScore(Math.round((won / closed.length) * 100)),
    lostRate: clampScore(Math.round((lost / closed.length) * 100)),
  };
}

function calculateAverageDealSize(deals: SalesDealRecord[]): number {
  const withAmount = deals.filter((d) => Number(d.amount ?? 0) > 0);
  if (withAmount.length === 0) return 0;
  return Math.round(
    withAmount.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) / withAmount.length,
  );
}

function calculateSalesCycleLength(deals: SalesDealRecord[]): string {
  const wonDeals = deals.filter((d) => isWonStage(normalizeStage(d.stage)));
  if (wonDeals.length === 0) return "45 dias (estimado)";

  const avgDays = Math.round(
    wonDeals.reduce((sum, d) => sum + daysSince(d.created_at), 0) / wonDeals.length,
  );

  return `${avgDays} dias`;
}

function calculatePipelineScore(openDeals: SalesDealRecord[]): number {
  if (openDeals.length === 0) return 30;

  const pipelineValue = openDeals.reduce((s, d) => s + Number(d.amount ?? 0), 0);
  const avgProbability =
    openDeals.reduce((s, d) => s + Number(d.probability ?? 0), 0) / openDeals.length;

  let score = 35;
  score += Math.min(25, openDeals.length * 5);
  score += Math.min(20, avgProbability * 0.2);
  score += pipelineValue > 50000 ? 15 : pipelineValue > 20000 ? 8 : 0;

  return clampScore(score);
}

function calculateLeadQualityScore(leads: SalesLeadRecord[]): number {
  if (leads.length === 0) return 45;

  const avgScore = leads.reduce((s, l) => s + Number(l.score ?? 0), 0) / leads.length;
  const qualified = leads.filter((l) => {
    const stage = normalizeStage(l.stage);
    return stage.includes("qualified") || stage.includes("proposal");
  }).length;

  return clampScore(avgScore * 0.6 + qualified * 8);
}

function buildSalesRisks(
  stalledDeals: SalesDealInsight[],
  lostRate: number,
  winRate: number,
  openCount: number,
): SalesInsightItem[] {
  const risks: SalesInsightItem[] = [];
  let index = 0;

  if (stalledDeals.length >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Negócios parados no pipeline",
      description: `${stalledDeals.length} oportunidade(s) sem movimentação recente.`,
      severity: "high",
    });
  }

  if (lostRate >= 40) {
    risks.push({
      id: `risk-${index++}`,
      title: "Taxa de perda elevada",
      description: `${lostRate}% dos negócios fechados foram perdidos.`,
      severity: lostRate >= 55 ? "critical" : "high",
    });
  }

  if (winRate < 30 && winRate > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Win rate abaixo do ideal",
      description: `Taxa de ganho em ${winRate}% — revisar qualificação e proposta de valor.`,
      severity: "medium",
    });
  }

  if (openCount === 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Pipeline vazio",
      description: "Nenhuma oportunidade aberta — risco imediato de receita.",
      severity: "critical",
    });
  }

  return risks;
}

function buildSalesOpportunities(
  highValueDeals: SalesDealInsight[],
  input: SalesExecutiveInput,
): SalesInsightItem[] {
  const opportunities: SalesInsightItem[] = [];
  let index = 0;

  for (const deal of highValueDeals.slice(0, 2)) {
    opportunities.push({
      id: `opp-${index++}`,
      title: `Fechar: ${deal.title}`,
      description: `${formatCurrency(deal.value)} — ${deal.reason}`,
      severity: "high",
    });
  }

  for (const opp of input.competitor?.opportunities.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: opp.title,
      description: opp.description,
      severity: "medium",
    });
  }

  if ((input.crmExecutive?.activeLeads ?? 0) >= 3) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Leads ativos para conversão",
      description: `${input.crmExecutive!.activeLeads} leads ativos no CRM prontos para avanço comercial.`,
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildSalesRecommendations(
  risks: SalesInsightItem[],
  stalledDeals: SalesDealInsight[],
  input: SalesExecutiveInput,
): SalesRecommendation[] {
  const recs: SalesRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const deal of stalledDeals.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Reativar: ${deal.title}`,
      description: deal.reason,
      priority: "high",
    });
  }

  for (const action of input.strategy?.commercialStrategy.actions.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: action.split(/[.—]/)[0]?.trim() ?? "Ação comercial",
      description: action,
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter ritmo comercial",
      description: "Continuar acompanhamento semanal de pipeline e forecast de receita.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildRevenueForecast(
  openDeals: SalesDealRecord[],
  input: SalesExecutiveInput,
): string {
  const weighted = openDeals.reduce(
    (sum, d) => sum + Number(d.amount ?? 0) * (Number(d.probability ?? 0) / 100),
    0,
  );

  if (weighted > 0) {
    return `${formatCurrency(weighted)} (pipeline ponderado)`;
  }

  return input.forecast?.predictions.revenue ?? "Receita a projetar com base no forecast executivo";
}

function buildSummary(
  companyName: string,
  healthScore: number,
  pipelineScore: number,
  winRate: number,
  openCount: number,
): string {
  return `${companyName} — Vendas executivas com saúde ${healthScore}/100. Pipeline ${pipelineScore}/100 · Win rate ${winRate}% · ${openCount} oportunidade(s) aberta(s). Inteligência comercial integrada ao CEO Digital Samuel AI™.`;
}

export function buildSalesExecutive(input: SalesExecutiveInput = {}): SalesExecutive {
  const { deals, leads, companyName } = resolveInput(input);

  const openDeals = deals.filter((d) => isOpenStage(normalizeStage(d.stage)));
  const closedWon = deals.filter((d) => isWonStage(normalizeStage(d.stage))).length;
  const closedLost = deals.filter((d) => isLostStage(normalizeStage(d.stage))).length;

  const { winRate, lostRate } = calculateWinLostRates(deals);
  const salesPipelineScore = calculatePipelineScore(openDeals);
  const leadQualityScore = calculateLeadQualityScore(leads);
  const conversionScore = clampScore(
    input.crmExecutive?.conversionRate ??
      input.marketingExecutive?.conversionScore ??
      (winRate || 50),
  );

  const averageDealSize = calculateAverageDealSize(deals);
  const salesCycleLength = calculateSalesCycleLength(deals);
  const revenueForecast = buildRevenueForecast(openDeals, input);

  const openOpportunities = buildOpenOpportunities(deals);
  const stalledDeals = buildStalledDeals(deals);
  const highValueDeals = buildHighValueDeals(deals);

  const salesRisks = buildSalesRisks(stalledDeals, lostRate, winRate, openDeals.length);
  const salesOpportunities = buildSalesOpportunities(highValueDeals, input);
  const salesRecommendations = buildSalesRecommendations(salesRisks, stalledDeals, input);

  const salesHealthScore = clampScore(
    (salesPipelineScore +
      leadQualityScore +
      conversionScore +
      winRate +
      (100 - lostRate)) /
      5,
  );

  return {
    salesHealthScore,
    salesPipelineScore,
    leadQualityScore,
    conversionScore,
    averageDealSize,
    salesCycleLength,
    winRate,
    lostRate,
    revenueForecast,
    openOpportunities,
    closedWon,
    closedLost,
    stalledDeals,
    highValueDeals,
    salesRisks,
    salesOpportunities,
    salesRecommendations,
    salesExecutiveSummary: buildSummary(
      companyName,
      salesHealthScore,
      salesPipelineScore,
      winRate,
      openDeals.length,
    ),
  };
}

export async function fetchSalesExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<SalesExecutiveInput> {
  const [dealsResult, leadsResult, growthResult] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, company_id, title, stage, amount, probability, expected_close_date, created_at, updated_at",
      )
      .eq("company_id", companyId),
    supabase
      .from("leads")
      .select("id, company_id, contact_id, stage, score, value, updated_at")
      .eq("company_id", companyId),
    supabase
      .from("growth_reports")
      .select("sales_score")
      .eq("company_id", companyId)
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (dealsResult.error) throw dealsResult.error;
  if (leadsResult.error) throw leadsResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    deals: (dealsResult.data ?? []) as SalesDealRecord[],
    leads: (leadsResult.data ?? []) as SalesLeadRecord[],
    salesScore: growthResult.data?.sales_score ? Number(growthResult.data.sales_score) : null,
    companyName,
  };
}

export async function buildSalesExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<SalesExecutiveInput, "deals" | "leads" | "salesScore" | "companyName"> = {},
): Promise<SalesExecutive> {
  const base = await fetchSalesExecutiveInput(companyId, companyName);
  return buildSalesExecutive({ ...base, ...engines });
}
