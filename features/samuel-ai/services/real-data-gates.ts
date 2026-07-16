import type { CrmExecutiveInput } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutiveInput } from "@/features/finance/services/finance-executive.service";
import type { HrExecutiveInput } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutiveInput } from "@/features/legal/services/legal-executive.service";
import type { MarketingExecutiveInput } from "@/features/marketing/services/marketing-executive.service";
import type { OperationsExecutiveInput } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutiveInput } from "@/features/sales/services/sales-executive.service";

function hasItems(value: unknown[] | undefined): boolean {
  return (value?.length ?? 0) > 0;
}

export function hasCrmSourceData(input: CrmExecutiveInput): boolean {
  return hasItems(input.contacts) || hasItems(input.leads) || hasItems(input.deals);
}

export function hasMarketingSourceData(input: MarketingExecutiveInput): boolean {
  return hasItems(input.campaigns) || input.marketingScore != null;
}

export function hasSalesSourceData(input: SalesExecutiveInput): boolean {
  return hasItems(input.deals) || hasItems(input.leads) || input.salesScore != null;
}

export function hasFinanceSourceData(input: FinanceExecutiveInput): boolean {
  return (
    hasItems(input.revenues) ||
    hasItems(input.expenses) ||
    hasItems(input.invoices) ||
    hasItems(input.bankAccounts) ||
    hasItems(input.recurringPayments) ||
    input.financeScore != null
  );
}

export function hasOperationsSourceData(input: OperationsExecutiveInput): boolean {
  return hasItems(input.tasks) || input.operationsScore != null;
}

export function hasHrSourceData(input: HrExecutiveInput): boolean {
  return (
    hasItems(input.members) ||
    hasItems(input.profiles) ||
    hasItems(input.insights) ||
    input.employeeCount != null ||
    input.hrScore != null
  );
}

export function hasLegalSourceData(input: LegalExecutiveInput): boolean {
  return (
    hasItems(input.insights) ||
    hasItems(input.contracts) ||
    (input.legalTwin != null && Object.keys(input.legalTwin).length > 0) ||
    input.legalScore != null
  );
}
