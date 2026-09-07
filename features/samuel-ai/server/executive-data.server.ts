import "server-only";

import type {
  CrmContactRecord,
  CrmDealRecord,
  CrmExecutiveInput,
  CrmLeadRecord,
} from "@/features/crm/services/crm-executive.service";
import type {
  FinanceBankAccountRecord,
  FinanceExecutiveInput,
  FinanceExpenseRecord,
  FinanceInvoiceRecord,
  FinanceRecurringRecord,
  FinanceRevenueRecord,
} from "@/features/finance/services/finance-executive.service";
import type {
  HrExecutiveInput,
  HrInsightRecord,
  HrMemberRecord,
  HrProfileRecord,
} from "@/features/hr/services/hr-executive.service";
import type {
  LegalContractRecord,
  LegalExecutiveInput,
  LegalInsightRecord,
  LegalTwinData,
} from "@/features/legal/services/legal-executive.service";
import type {
  MarketingCampaignRecord,
  MarketingExecutiveInput,
} from "@/features/marketing/services/marketing-executive.service";
import type {
  OperationsExecutiveInput,
  OperationsTaskRecord,
} from "@/features/operations/services/operations-executive.service";
import type {
  SalesDealRecord,
  SalesExecutiveInput,
  SalesLeadRecord,
} from "@/features/sales/services/sales-executive.service";
import { createAuthenticatedDataClient } from "@/lib/supabase/data-client";

export async function fetchCrmExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<CrmExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [contacts, leads, deals] = await Promise.all([
    supabase.from("contacts").select("id, company_id, first_name, last_name, email, status, updated_at").eq("company_id", companyId),
    supabase.from("leads").select("id, company_id, contact_id, source, stage, score, value, updated_at").eq("company_id", companyId),
    supabase.from("deals").select("id, company_id, lead_id, title, stage, amount, probability, expected_close_date, updated_at").eq("company_id", companyId),
  ]);
  if (contacts.error) throw contacts.error;
  if (leads.error) throw leads.error;
  if (deals.error) throw deals.error;
  return {
    contacts: (contacts.data ?? []) as CrmContactRecord[],
    leads: (leads.data ?? []) as CrmLeadRecord[],
    deals: (deals.data ?? []) as CrmDealRecord[],
    companyName,
  };
}

export async function fetchFinanceExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<FinanceExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [revenues, expenses, invoices, bankAccounts, recurring, growth] = await Promise.all([
    supabase.from("revenues").select("id, company_id, amount, received_date, source").eq("company_id", companyId),
    supabase.from("expenses").select("id, company_id, amount, expense_date, payment_status, category").eq("company_id", companyId),
    supabase.from("invoices").select("id, company_id, status, total, due_date").eq("company_id", companyId),
    supabase.from("bank_accounts").select("id, company_id, balance").eq("company_id", companyId),
    supabase.from("recurring_payments").select("id, company_id, amount, frequency, active").eq("company_id", companyId),
    supabase.from("growth_reports").select("finance_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  for (const result of [revenues, expenses, invoices, bankAccounts, recurring, growth]) {
    if (result.error) throw result.error;
  }
  return {
    revenues: (revenues.data ?? []) as FinanceRevenueRecord[],
    expenses: (expenses.data ?? []) as FinanceExpenseRecord[],
    invoices: (invoices.data ?? []) as FinanceInvoiceRecord[],
    bankAccounts: (bankAccounts.data ?? []) as FinanceBankAccountRecord[],
    recurringPayments: (recurring.data ?? []) as FinanceRecurringRecord[],
    financeScore: growth.data?.finance_score ? Number(growth.data.finance_score) : null,
    companyName,
  };
}

export async function fetchHrExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<HrExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [members, profiles, company, insights, growth] = await Promise.all([
    supabase.from("company_members").select("id, company_id, user_id, role").eq("company_id", companyId),
    supabase.from("user_profiles").select("id, company_id, full_name, role, active").eq("company_id", companyId),
    supabase.from("companies").select("employees").eq("id", companyId).maybeSingle(),
    supabase.from("ai_insights").select("id, company_id, category, priority, title, description, recommendation, status").eq("company_id", companyId).in("category", ["hr", "hiring", "people", "training", "leadership", "recruitment"]),
    supabase.from("growth_reports").select("health_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  for (const result of [members, profiles, company, insights, growth]) {
    if (result.error) throw result.error;
  }
  return {
    members: (members.data ?? []) as HrMemberRecord[],
    profiles: (profiles.data ?? []) as HrProfileRecord[],
    insights: (insights.data ?? []) as HrInsightRecord[],
    employeeCount: company.data?.employees ? Number(company.data.employees) : null,
    hrScore: growth.data?.health_score ? Number(growth.data.health_score) : null,
    companyName,
  };
}

export async function fetchLegalExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<LegalExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [insights, contracts, twin, growth] = await Promise.all([
    supabase.from("ai_insights").select("id, company_id, category, priority, title, description, recommendation, status").eq("company_id", companyId).in("category", ["legal", "compliance", "lgpd", "gdpr", "contract", "regulatory", "policy", "privacy", "data"]),
    supabase.from("invoices").select("id, company_id, status, total, due_date, invoice_number").eq("company_id", companyId),
    supabase.from("business_twins").select("legal").eq("company_id", companyId).maybeSingle(),
    supabase.from("growth_reports").select("health_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  for (const result of [insights, contracts, twin, growth]) {
    if (result.error) throw result.error;
  }
  return {
    insights: (insights.data ?? []) as LegalInsightRecord[],
    contracts: (contracts.data ?? []) as LegalContractRecord[],
    legalTwin: (twin.data?.legal as LegalTwinData | null) ?? null,
    legalScore: growth.data?.health_score ? Number(growth.data.health_score) : null,
    companyName,
  };
}

export async function fetchMarketingExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<MarketingExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [campaigns, growth] = await Promise.all([
    supabase.from("marketing_campaigns").select("id, company_id, name, platform, objective, status, budget, spent, revenue_generated, roi").eq("company_id", companyId),
    supabase.from("growth_reports").select("marketing_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (campaigns.error) throw campaigns.error;
  if (growth.error) throw growth.error;
  return {
    campaigns: (campaigns.data ?? []) as MarketingCampaignRecord[],
    marketingScore: growth.data?.marketing_score ? Number(growth.data.marketing_score) : null,
    companyName,
  };
}

export async function fetchOperationsExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<OperationsExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [tasks, growth] = await Promise.all([
    supabase.from("ai_tasks").select("id, company_id, title, status, priority, due_date, completed_at").eq("company_id", companyId),
    supabase.from("growth_reports").select("operations_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (tasks.error) throw tasks.error;
  if (growth.error) throw growth.error;
  return {
    tasks: (tasks.data ?? []) as OperationsTaskRecord[],
    operationsScore: growth.data?.operations_score ? Number(growth.data.operations_score) : null,
    companyName,
  };
}

export async function fetchSalesExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<SalesExecutiveInput> {
  const supabase = await createAuthenticatedDataClient();
  const [deals, leads, growth] = await Promise.all([
    supabase.from("deals").select("id, company_id, title, stage, amount, probability, expected_close_date, created_at, updated_at").eq("company_id", companyId),
    supabase.from("leads").select("id, company_id, contact_id, stage, score, value, updated_at").eq("company_id", companyId),
    supabase.from("growth_reports").select("sales_score").eq("company_id", companyId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (deals.error) throw deals.error;
  if (leads.error) throw leads.error;
  if (growth.error) throw growth.error;
  return {
    deals: (deals.data ?? []) as SalesDealRecord[],
    leads: (leads.data ?? []) as SalesLeadRecord[],
    salesScore: growth.data?.sales_score ? Number(growth.data.sales_score) : null,
    companyName,
  };
}
