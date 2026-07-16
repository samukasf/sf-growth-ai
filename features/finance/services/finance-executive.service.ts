import { supabase } from "@/lib/supabase/client";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type FinanceRevenueRecord = {
  id: string;
  company_id: string;
  amount: number;
  received_date: string | null;
  source: string | null;
};

export type FinanceExpenseRecord = {
  id: string;
  company_id: string;
  amount: number;
  expense_date: string | null;
  payment_status: string | null;
  category: string | null;
};

export type FinanceInvoiceRecord = {
  id: string;
  company_id: string;
  status: string | null;
  total: number | null;
  due_date: string | null;
};

export type FinanceBankAccountRecord = {
  id: string;
  company_id: string;
  balance: number | null;
};

export type FinanceRecurringRecord = {
  id: string;
  company_id: string;
  amount: number;
  frequency: string;
  active: boolean | null;
};

export type FinanceInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type FinanceRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type FinanceExecutive = {
  financeHealthScore: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  profitMargin: number;
  cashFlowScore: number;
  burnRate: number;
  runway: string;
  accountsReceivable: number;
  accountsPayable: number;
  recurringRevenue: number;
  financialRisks: FinanceInsightItem[];
  financialOpportunities: FinanceInsightItem[];
  financialRecommendations: FinanceRecommendation[];
  financeExecutiveSummary: string;
};

export type FinanceExecutiveInput = {
  revenues?: FinanceRevenueRecord[];
  expenses?: FinanceExpenseRecord[];
  invoices?: FinanceInvoiceRecord[];
  bankAccounts?: FinanceBankAccountRecord[];
  recurringPayments?: FinanceRecurringRecord[];
  financeScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
};

const MOCK_REVENUES: FinanceRevenueRecord[] = [
  {
    id: "rev-1",
    company_id: "mock",
    amount: 42000,
    received_date: new Date().toISOString().split("T")[0] ?? null,
    source: "Retainer Enterprise",
  },
  {
    id: "rev-2",
    company_id: "mock",
    amount: 18500,
    received_date: new Date().toISOString().split("T")[0] ?? null,
    source: "Projeto Consultoria",
  },
  {
    id: "rev-3",
    company_id: "mock",
    amount: 12800,
    received_date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0] ?? null,
    source: "Licença SaaS",
  },
];

const MOCK_EXPENSES: FinanceExpenseRecord[] = [
  {
    id: "exp-1",
    company_id: "mock",
    amount: 22000,
    expense_date: new Date().toISOString().split("T")[0] ?? null,
    payment_status: "paid",
    category: "Folha",
  },
  {
    id: "exp-2",
    company_id: "mock",
    amount: 8400,
    expense_date: new Date().toISOString().split("T")[0] ?? null,
    payment_status: "paid",
    category: "Marketing",
  },
  {
    id: "exp-3",
    company_id: "mock",
    amount: 5600,
    expense_date: new Date().toISOString().split("T")[0] ?? null,
    payment_status: "pending",
    category: "Infraestrutura",
  },
  {
    id: "exp-4",
    company_id: "mock",
    amount: 3200,
    expense_date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0] ?? null,
    payment_status: "pending",
    category: "Fornecedores",
  },
];

const MOCK_INVOICES: FinanceInvoiceRecord[] = [
  {
    id: "inv-1",
    company_id: "mock",
    status: "sent",
    total: 35000,
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0] ?? null,
  },
  {
    id: "inv-2",
    company_id: "mock",
    status: "overdue",
    total: 12000,
    due_date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] ?? null,
  },
  {
    id: "inv-3",
    company_id: "mock",
    status: "paid",
    total: 28000,
    due_date: null,
  },
];

const MOCK_BANK_ACCOUNTS: FinanceBankAccountRecord[] = [
  { id: "bank-1", company_id: "mock", balance: 185000 },
  { id: "bank-2", company_id: "mock", balance: 42000 },
];

const MOCK_RECURRING: FinanceRecurringRecord[] = [
  {
    id: "rec-1",
    company_id: "mock",
    amount: 15000,
    frequency: "monthly",
    active: true,
  },
  {
    id: "rec-2",
    company_id: "mock",
    amount: 48000,
    frequency: "yearly",
    active: true,
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function isCurrentMonth(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isUnpaidInvoice(status: string | null): boolean {
  const normalized = (status ?? "").toLowerCase();
  return normalized !== "paid" && normalized !== "cancelled" && normalized !== "canceled";
}

function isPendingExpense(status: string | null): boolean {
  return (status ?? "").toLowerCase() === "pending";
}

function normalizeRecurringMonthly(amount: number, frequency: string): number {
  const freq = frequency.toLowerCase();
  if (freq === "yearly" || freq === "annual" || freq === "anual") return amount / 12;
  if (freq === "quarterly" || freq === "trimestral") return amount / 3;
  if (freq === "weekly" || freq === "semanal") return amount * 4.33;
  return amount;
}

function resolveInput(input: FinanceExecutiveInput) {
  return {
    revenues: input.revenues === undefined ? MOCK_REVENUES : input.revenues,
    expenses: input.expenses === undefined ? MOCK_EXPENSES : input.expenses,
    invoices: input.invoices === undefined ? MOCK_INVOICES : input.invoices,
    bankAccounts: input.bankAccounts === undefined ? MOCK_BANK_ACCOUNTS : input.bankAccounts,
    recurringPayments: input.recurringPayments === undefined
      ? MOCK_RECURRING
      : input.recurringPayments,
    companyName: input.companyName ?? "Empresa",
  };
}

function sumMonthlyAmounts(
  records: Array<{ amount: number; date: string | null }>,
): number {
  return records
    .filter((r) => isCurrentMonth(r.date))
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
}

function calculateMonthlyRevenue(revenues: FinanceRevenueRecord[]): number {
  const fromRecords = sumMonthlyAmounts(
    revenues.map((r) => ({ amount: r.amount, date: r.received_date })),
  );
  if (fromRecords > 0) return fromRecords;
  return revenues.reduce((sum, r) => sum + Number(r.amount ?? 0), 0) / Math.max(1, revenues.length);
}

function calculateMonthlyExpenses(expenses: FinanceExpenseRecord[]): number {
  const fromRecords = sumMonthlyAmounts(
    expenses.map((e) => ({ amount: e.amount, date: e.expense_date })),
  );
  if (fromRecords > 0) return fromRecords;
  return expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0) / Math.max(1, expenses.length);
}

function calculateAccountsReceivable(invoices: FinanceInvoiceRecord[]): number {
  return invoices
    .filter((i) => isUnpaidInvoice(i.status))
    .reduce((sum, i) => sum + Number(i.total ?? 0), 0);
}

function calculateAccountsPayable(expenses: FinanceExpenseRecord[]): number {
  return expenses
    .filter((e) => isPendingExpense(e.payment_status))
    .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
}

function calculateRecurringRevenue(recurring: FinanceRecurringRecord[]): number {
  return recurring
    .filter((r) => r.active !== false)
    .reduce((sum, r) => sum + normalizeRecurringMonthly(Number(r.amount ?? 0), r.frequency), 0);
}

function calculateCashBalance(accounts: FinanceBankAccountRecord[]): number {
  return accounts.reduce((sum, a) => sum + Number(a.balance ?? 0), 0);
}

function calculateBurnRate(monthlyRevenue: number, monthlyExpenses: number): number {
  const net = monthlyRevenue - monthlyExpenses;
  if (net >= 0) return Math.max(0, monthlyExpenses * 0.15);
  return Math.abs(net);
}

function calculateRunway(cashBalance: number, burnRate: number, monthlyProfit: number): string {
  if (monthlyProfit >= 0 && burnRate <= 0) return "Sustentável";
  if (burnRate <= 0) return "Indefinido";
  const months = cashBalance / burnRate;
  if (months >= 24) return `${Math.round(months)} meses — confortável`;
  if (months >= 12) return `${Math.round(months)} meses`;
  if (months >= 6) return `${Math.round(months)} meses — atenção`;
  return `${Math.max(1, Math.round(months))} meses — crítico`;
}

function calculateCashFlowScore(
  monthlyProfit: number,
  monthlyRevenue: number,
  accountsReceivable: number,
  accountsPayable: number,
  cashBalance: number,
): number {
  let score = 45;

  if (monthlyProfit > 0) score += 20;
  else score -= 15;

  if (monthlyRevenue > 0) {
    const margin = (monthlyProfit / monthlyRevenue) * 100;
    score += Math.min(15, margin * 0.5);
  }

  if (accountsReceivable > accountsPayable) score += 8;
  else score -= 8;

  if (cashBalance > monthlyExpensesBaseline(monthlyRevenue, accountsPayable)) score += 12;

  return clampScore(score);
}

function monthlyExpensesBaseline(monthlyRevenue: number, accountsPayable: number): number {
  return Math.max(monthlyRevenue * 0.5, accountsPayable * 2, 10000);
}

function calculateProfitMargin(monthlyProfit: number, monthlyRevenue: number): number {
  if (monthlyRevenue <= 0) return 0;
  return clampScore(Math.round((monthlyProfit / monthlyRevenue) * 100));
}

function buildFinancialRisks(
  monthlyProfit: number,
  profitMargin: number,
  accountsReceivable: number,
  accountsPayable: number,
  burnRate: number,
  cashBalance: number,
  invoices: FinanceInvoiceRecord[],
): FinanceInsightItem[] {
  const risks: FinanceInsightItem[] = [];
  let index = 0;

  if (monthlyProfit < 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Lucro mensal negativo",
      description: `Prejuízo de ${formatCurrency(Math.abs(monthlyProfit))} no período.`,
      severity: "critical",
    });
  }

  if (profitMargin < 15 && monthlyProfit >= 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Margem comprimida",
      description: `Margem em ${profitMargin}% — abaixo do ideal para escala.`,
      severity: profitMargin < 8 ? "high" : "medium",
    });
  }

  const overdue = invoices.filter((i) => (i.status ?? "").toLowerCase() === "overdue").length;
  if (overdue > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Faturas vencidas",
      description: `${overdue} fatura(s) em atraso — impacto no fluxo de caixa.`,
      severity: overdue >= 2 ? "critical" : "high",
    });
  }

  if (accountsPayable > accountsReceivable && accountsPayable > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Passivo acima do recebível",
      description: `Contas a pagar (${formatCurrency(accountsPayable)}) superam recebíveis (${formatCurrency(accountsReceivable)}).`,
      severity: "high",
    });
  }

  if (burnRate > 0 && cashBalance / burnRate < 6) {
    risks.push({
      id: `risk-${index++}`,
      title: "Runway curto",
      description: `Reserva cobre menos de 6 meses com burn rate de ${formatCurrency(burnRate)}/mês.`,
      severity: cashBalance / burnRate < 3 ? "critical" : "high",
    });
  }

  return risks;
}

function buildFinancialOpportunities(
  recurringRevenue: number,
  monthlyRevenue: number,
  input: FinanceExecutiveInput,
): FinanceInsightItem[] {
  const opportunities: FinanceInsightItem[] = [];
  let index = 0;

  if (recurringRevenue > 0 && recurringRevenue / Math.max(monthlyRevenue, 1) >= 0.3) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Base recorrente sólida",
      description: `${formatCurrency(recurringRevenue)}/mês em receita recorrente — potencial para upsell.`,
      severity: "high",
    });
  }

  if ((input.salesExecutive?.highValueDeals.length ?? 0) > 0) {
    const deal = input.salesExecutive!.highValueDeals[0]!;
    opportunities.push({
      id: `opp-${index++}`,
      title: "Receita de pipeline comercial",
      description: `${deal.title} — ${formatCurrency(deal.value)} prontos para faturamento.`,
      severity: "high",
    });
  }

  if ((input.crmExecutive?.pipelineValue ?? 0) > 50000) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Pipeline CRM conversível",
      description: `Pipeline de ${formatCurrency(input.crmExecutive!.pipelineValue)} pode acelerar receita.`,
      severity: "medium",
    });
  }

  for (const rec of input.forecast?.recommendations.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: rec.title,
      description: rec.description,
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildFinancialRecommendations(
  risks: FinanceInsightItem[],
  opportunities: FinanceInsightItem[],
  input: FinanceExecutiveInput,
): FinanceRecommendation[] {
  const recs: FinanceRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const action of input.strategy?.financialStrategy.actions.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: action.split(/[.—]/)[0]?.trim() ?? "Ação financeira",
      description: action,
      priority: "high",
    });
  }

  for (const opp of opportunities.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Capturar: ${opp.title}`,
      description: opp.description,
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter disciplina financeira",
      description: "Continuar monitoramento semanal de fluxo de caixa, recebíveis e burn rate.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  monthlyRevenue: number,
  profitMargin: number,
  runway: string,
): string {
  return `${companyName} — Financeiro executivo com saúde ${healthScore}/100. Receita ${formatCurrency(monthlyRevenue)}/mês · Margem ${profitMargin}% · Runway: ${runway}. Inteligência financeira integrada ao CEO Digital Samuel AI™.`;
}

export function buildFinanceExecutive(input: FinanceExecutiveInput = {}): FinanceExecutive {
  const { revenues, expenses, invoices, bankAccounts, recurringPayments, companyName } =
    resolveInput(input);

  const monthlyRevenue = calculateMonthlyRevenue(revenues);
  const monthlyExpenses = calculateMonthlyExpenses(expenses);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = calculateProfitMargin(monthlyProfit, monthlyRevenue);

  const accountsReceivable = calculateAccountsReceivable(invoices);
  const accountsPayable = calculateAccountsPayable(expenses);
  const recurringRevenue = calculateRecurringRevenue(recurringPayments);
  const cashBalance = calculateCashBalance(bankAccounts);
  const burnRate = calculateBurnRate(monthlyRevenue, monthlyExpenses);
  const runway = calculateRunway(cashBalance, burnRate, monthlyProfit);

  const cashFlowScore = calculateCashFlowScore(
    monthlyProfit,
    monthlyRevenue,
    accountsReceivable,
    accountsPayable,
    cashBalance,
  );

  const financialRisks = buildFinancialRisks(
    monthlyProfit,
    profitMargin,
    accountsReceivable,
    accountsPayable,
    burnRate,
    cashBalance,
    invoices,
  );
  const financialOpportunities = buildFinancialOpportunities(
    recurringRevenue,
    monthlyRevenue,
    input,
  );
  const financialRecommendations = buildFinancialRecommendations(
    financialRisks,
    financialOpportunities,
    input,
  );

  const financeHealthScore = clampScore(
    (cashFlowScore +
      profitMargin +
      (input.financeScore ?? 0) +
      (monthlyProfit >= 0 ? 20 : 0) +
      Math.min(15, (recurringRevenue / Math.max(monthlyRevenue, 1)) * 30)) /
      4,
  );

  return {
    financeHealthScore,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    profitMargin,
    cashFlowScore,
    burnRate,
    runway,
    accountsReceivable,
    accountsPayable,
    recurringRevenue,
    financialRisks,
    financialOpportunities,
    financialRecommendations,
    financeExecutiveSummary: buildSummary(
      companyName,
      financeHealthScore,
      monthlyRevenue,
      profitMargin,
      runway,
    ),
  };
}

export async function fetchFinanceExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<FinanceExecutiveInput> {
  const [revenuesResult, expensesResult, invoicesResult, bankResult, recurringResult, growthResult] =
    await Promise.all([
      supabase
        .from("revenues")
        .select("id, company_id, amount, received_date, source")
        .eq("company_id", companyId),
      supabase
        .from("expenses")
        .select("id, company_id, amount, expense_date, payment_status, category")
        .eq("company_id", companyId),
      supabase
        .from("invoices")
        .select("id, company_id, status, total, due_date")
        .eq("company_id", companyId),
      supabase
        .from("bank_accounts")
        .select("id, company_id, balance")
        .eq("company_id", companyId),
      supabase
        .from("recurring_payments")
        .select("id, company_id, amount, frequency, active")
        .eq("company_id", companyId),
      supabase
        .from("growth_reports")
        .select("finance_score")
        .eq("company_id", companyId)
        .order("report_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (revenuesResult.error) throw revenuesResult.error;
  if (expensesResult.error) throw expensesResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (bankResult.error) throw bankResult.error;
  if (recurringResult.error) throw recurringResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    revenues: (revenuesResult.data ?? []) as FinanceRevenueRecord[],
    expenses: (expensesResult.data ?? []) as FinanceExpenseRecord[],
    invoices: (invoicesResult.data ?? []) as FinanceInvoiceRecord[],
    bankAccounts: (bankResult.data ?? []) as FinanceBankAccountRecord[],
    recurringPayments: (recurringResult.data ?? []) as FinanceRecurringRecord[],
    financeScore: growthResult.data?.finance_score
      ? Number(growthResult.data.finance_score)
      : null,
    companyName,
  };
}

export async function buildFinanceExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<
    FinanceExecutiveInput,
    | "revenues"
    | "expenses"
    | "invoices"
    | "bankAccounts"
    | "recurringPayments"
    | "financeScore"
    | "companyName"
  > = {},
): Promise<FinanceExecutive> {
  const base = await fetchFinanceExecutiveInput(companyId, companyName);
  return buildFinanceExecutive({ ...base, ...engines });
}
