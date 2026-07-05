import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { ExecutiveContext } from "@/services/executive-context.service";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutionPlan } from "../services/executive-execution-planner.service";
import type { ExecutiveForecast } from "../services/executive-forecast.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
import type { ExecutiveLearning } from "../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";
import type { ExecutiveAction } from "../services/executive-action.service";
import type { ExecutiveCEO } from "../services/executive-ceo.service";
import type { ExecutiveCompetitor } from "../services/executive-competitor.service";
import type { ExecutivePriority } from "../services/executive-priority.service";
import type { ExecutiveRecommendation } from "../services/executive-recommendation.service";
import type { ExecutiveStrategy } from "../services/executive-strategy.service";

import { buildExecutiveCompetitor } from "../services/executive-competitor.service";

import { SamuelAiShell } from "./samuel-ai-shell";

type SamuelAiPageProps = {
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  executiveMonitoring?: ExecutiveMonitoring | null;
  executiveLearning?: ExecutiveLearning | null;
  executiveForecast?: ExecutiveForecast | null;
  executiveStrategy?: ExecutiveStrategy | null;
  executiveCompetitor?: ExecutiveCompetitor | null;
  executiveAction?: ExecutiveAction | null;
  executivePriority?: ExecutivePriority | null;
  executiveRecommendation?: ExecutiveRecommendation | null;
  executiveCeo?: ExecutiveCEO | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
  googleAnalyticsExecutive?: GoogleAnalyticsExecutive | null;
  searchConsoleExecutive?: SearchConsoleExecutive | null;
  metaExecutive?: MetaExecutive | null;
  linkedInExecutive?: LinkedInExecutive | null;
  watcherExecutive?: WatcherExecutive | null;
  marketWatcher?: MarketWatcherResult | null;
};

export function SamuelAiPage({
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
  executiveLearning = null,
  executiveForecast = null,
  executiveStrategy = null,
  executiveCompetitor = null,
  executiveRecommendation = null,
  executiveCeo = null,
  crmExecutive = null,
  marketingExecutive = null,
  salesExecutive = null,
  financeExecutive = null,
  operationsExecutive = null,
  hrExecutive = null,
  legalExecutive = null,
  googleBusinessExecutive = null,
  googleAnalyticsExecutive = null,
  searchConsoleExecutive = null,
  metaExecutive = null,
  linkedInExecutive = null,
  watcherExecutive = null,
  marketWatcher = null,
}: SamuelAiPageProps) {
  const competitorIntelligence = executiveCompetitor ?? buildExecutiveCompetitor();

  return (
    <SamuelAiShell
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
      executiveLearning={executiveLearning}
      executiveForecast={executiveForecast}
      executiveStrategy={executiveStrategy}
      executiveCompetitor={competitorIntelligence}
      executiveRecommendation={executiveRecommendation}
      executiveCeo={executiveCeo}
      crmExecutive={crmExecutive}
      marketingExecutive={marketingExecutive}
      salesExecutive={salesExecutive}
      financeExecutive={financeExecutive}
      operationsExecutive={operationsExecutive}
      hrExecutive={hrExecutive}
      legalExecutive={legalExecutive}
      googleBusinessExecutive={googleBusinessExecutive}
      googleAnalyticsExecutive={googleAnalyticsExecutive}
      searchConsoleExecutive={searchConsoleExecutive}
      metaExecutive={metaExecutive}
      linkedInExecutive={linkedInExecutive}
      watcherExecutive={watcherExecutive}
      marketWatcher={marketWatcher}
    />
  );
}
