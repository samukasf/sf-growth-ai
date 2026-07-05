import { cn } from "@/utils/cn";

import type {
  ExecutiveBrain,
  ExecutiveBrainStatus,
  ExecutiveCouncil,
  ExecutiveStatus,
} from "../../executive-brain/types";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import { MetaExecutiveSummarySection } from "@/features/meta/components/meta-executive-summary-section";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import { LinkedInExecutiveSummarySection } from "@/features/linkedin/components/linkedin-executive-summary-section";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import { GoogleBusinessExecutiveSummarySection } from "@/features/google-business/components/google-business-executive-summary-section";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import { GoogleAnalyticsExecutiveSummarySection } from "@/features/google-analytics/components/google-analytics-executive-summary-section";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import { SearchConsoleExecutiveSummarySection } from "@/features/search-console/components/search-console-executive-summary-section";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import { LegalExecutiveSummarySection } from "@/features/legal/components/legal-executive-summary-section";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import { HrExecutiveSummarySection } from "@/features/hr/components/hr-executive-summary-section";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import { OperationsExecutiveSummarySection } from "@/features/operations/components/operations-executive-summary-section";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import { FinanceExecutiveSummarySection } from "@/features/finance/components/finance-executive-summary-section";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import { SalesExecutiveSummarySection } from "@/features/sales/components/sales-executive-summary-section";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import { MarketingExecutiveSummarySection } from "@/features/marketing/components/marketing-executive-summary-section";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import { CrmExecutiveSummarySection } from "@/features/crm/components/crm-executive-summary-section";
import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import type { ExecutiveRecommendation } from "../../services/executive-recommendation.service";
import type { ExecutiveForecast } from "../../services/executive-forecast.service";
import type { ExecutiveLearning } from "../../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../../services/executive-monitoring.service";
import type { ExecutionPlan } from "../../services/executive-execution-planner.service";
import type { ExecutiveDecision } from "../../services/executive-decision.service";
import type { ExecutiveIntelligence } from "../../services/executive-intelligence.service";
import { ExecutiveWatchersSection } from "@/features/watchers/components/executive-watchers-section";
import { MarketWatcherSection } from "@/features/watchers/market/components/market-watcher-section";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import { SeoWatcherSection } from "@/features/watchers/seo/components/seo-watcher-section";
import type { SeoWatcherResult } from "@/features/watchers/seo/seo-watcher.types";
import { ExecutiveAlertCenter } from "@/features/watchers/components/executive-alert-center";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { ExecutiveInboxActionRecord } from "@/features/executive-inbox/executive-inbox.types";
import { ExecutiveLiveBoard } from "../executive-live-board";
import { ExecutiveTimeline } from "../executive-timeline";
import { CommandPanel } from "../shared/command-panel";
import { SectionHeader } from "../section-header";
import { ExecutiveActionPlanSection } from "./executive-action-plan-section";
import { ExecutiveContextSection } from "./executive-context-section";
import { ExecutiveCeoSection } from "./executive-ceo-section";
import { ExecutiveDecisionsSection } from "./executive-decisions-section";
import { ExecutiveExecutionPlanSection } from "./executive-execution-plan-section";
import { ExecutiveStrategySection } from "./executive-strategy-section";
import { ExecutiveForecastSection } from "./executive-forecast-section";
import { ExecutiveLearningSection } from "./executive-learning-section";
import { ExecutiveIntelligenceSection } from "./executive-intelligence-section";
import { ExecutiveMonitoringSection } from "./executive-monitoring-section";
import { ExecutiveMemorySection } from "./executive-memory-section";
import { ExecutiveConversationSection } from "./executive-conversation-section";
import { ExecutiveOrchestratorSection } from "./executive-orchestrator-section";
import { ExecutiveReasoningSection } from "./executive-reasoning-section";
import { ExecutiveCouncilSection } from "./executive-council-section";
import { ExecutiveStatusSection } from "./executive-status-section";

type ExecutiveDashboardProps = {
  brain: ExecutiveBrain;
  status: ExecutiveBrainStatus;
  executiveStatus: ExecutiveStatus;
  council: ExecutiveCouncil;
  hasActiveAnalysis: boolean;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  isProcessing?: boolean;
  executiveContext?: CompanyExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  executiveMonitoring?: ExecutiveMonitoring | null;
  executiveLearning?: ExecutiveLearning | null;
  executiveForecast?: ExecutiveForecast | null;
  executiveStrategy?: ExecutiveStrategy | null;
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
  seoWatcher?: SeoWatcherResult | null;
  executiveConversation?: ExecutiveConversation | null;
  pendingQuestion?: string | null;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
  inboxActions?: ExecutiveInboxActionRecord[];
  /** Oculta painéis já promovidos na área principal do Dashboard. */
  hidePromotedPanels?: boolean;
};

const STATUS_LABELS: Record<ExecutiveBrainStatus, string> = {
  idle: "Aguardando diretriz",
  building: "Análise em curso",
  ready: "Análise concluída",
};

export function ExecutiveDashboard({
  brain,
  status,
  executiveStatus,
  council,
  hasActiveAnalysis,
  orchestratorSnapshot = null,
  isProcessing = false,
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
  executiveLearning = null,
  executiveForecast = null,
  executiveStrategy = null,
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
  seoWatcher = null,
  executiveConversation = null,
  pendingQuestion = null,
  analysisStartedAt = null,
  analysisCompletedAt = null,
  inboxActions = [],
  hidePromotedPanels = false,
}: ExecutiveDashboardProps) {
  const statusWithTimestamp: ExecutiveStatus = {
    ...executiveStatus,
    lastAnalysis:
      status === "ready" ? brain.builtAt : executiveStatus.lastAnalysis,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          headingLevel="h2"
          title="Command Center"
          description="Painéis operacionais do Executive Brain™"
        />
        <BrainStatusBadge status={status} />
      </div>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveLiveBoard
          brainStatus={status}
          isProcessing={isProcessing}
          orchestratorPhase={orchestratorSnapshot?.phase ?? null}
          executiveCeo={executiveCeo}
          executiveMonitoring={executiveMonitoring}
          executiveForecast={executiveForecast}
          executiveStrategy={executiveStrategy}
          executiveRecommendation={executiveRecommendation}
          executiveConversation={executiveConversation}
          analysisStartedAt={analysisStartedAt}
          analysisCompletedAt={analysisCompletedAt}
          inboxActions={inboxActions}
          moduleAvailability={{
            marketing: Boolean(marketingExecutive),
            finance: Boolean(financeExecutive),
            sales: Boolean(salesExecutive),
            operations: Boolean(operationsExecutive),
            hr: Boolean(hrExecutive),
            legal: Boolean(legalExecutive),
            "google-business": Boolean(googleBusinessExecutive),
            "google-analytics": Boolean(googleAnalyticsExecutive),
            "search-console": Boolean(searchConsoleExecutive),
            meta: Boolean(metaExecutive),
            linkedin: Boolean(linkedInExecutive),
          }}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveAlertCenter
          watcherExecutive={watcherExecutive}
          marketWatcher={marketWatcher}
          seoWatcher={seoWatcher}
          googleBusinessExecutive={googleBusinessExecutive}
          metaExecutive={metaExecutive}
          crmExecutive={crmExecutive}
          marketingExecutive={marketingExecutive}
          financeExecutive={financeExecutive}
          salesExecutive={salesExecutive}
          operationsExecutive={operationsExecutive}
          hrExecutive={hrExecutive}
          legalExecutive={legalExecutive}
          executiveMonitoring={executiveMonitoring}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent={isProcessing}>
        <ExecutiveTimeline
          brainStatus={status}
          isProcessing={isProcessing}
          orchestratorSnapshot={orchestratorSnapshot}
          pendingQuestion={pendingQuestion}
          executiveConversation={executiveConversation}
          executiveContext={executiveContext}
          executiveIntelligence={executiveIntelligence}
          executiveStrategy={executiveStrategy}
          executiveRecommendation={executiveRecommendation}
          executiveCeo={executiveCeo}
          marketingExecutive={marketingExecutive}
          financeExecutive={financeExecutive}
          salesExecutive={salesExecutive}
          operationsExecutive={operationsExecutive}
          watcherExecutive={watcherExecutive}
          marketWatcher={marketWatcher}
          analysisStartedAt={analysisStartedAt}
          analysisCompletedAt={analysisCompletedAt}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveStatusSection
          status={statusWithTimestamp}
          brainStatusLabel={STATUS_LABELS[status]}
        />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveCouncilSection council={council} />
      </CommandPanel>

      {(hasActiveAnalysis || isProcessing) && (
        <CommandPanel className="p-4 sm:p-5" accent={status === "building"}>
          <ExecutiveOrchestratorSection
            snapshot={orchestratorSnapshot}
            isProcessing={isProcessing}
          />
        </CommandPanel>
      )}

      {(executiveConversation || pendingQuestion || isProcessing) && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveConversationSection
            conversation={executiveConversation}
            isProcessing={isProcessing}
            pendingQuestion={pendingQuestion}
            companyName={executiveContext?.company.name}
          />
        </CommandPanel>
      )}

      {hasActiveAnalysis && !isProcessing && status === "ready" && (
        <CommandPanel className="p-4 sm:p-5">
          <ExecutiveReasoningSection
            reasoning={brain.reasoning}
            showFullAnalysis
          />
        </CommandPanel>
      )}

      {!hidePromotedPanels && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveCeoSection ceo={executiveCeo} />
        </CommandPanel>
      )}

      <CommandPanel className="p-4 sm:p-5" accent>
        <CrmExecutiveSummarySection crm={crmExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <MarketingExecutiveSummarySection marketing={marketingExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <GoogleAnalyticsExecutiveSummarySection googleAnalytics={googleAnalyticsExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <SearchConsoleExecutiveSummarySection searchConsole={searchConsoleExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <SalesExecutiveSummarySection sales={salesExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <FinanceExecutiveSummarySection finance={financeExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <OperationsExecutiveSummarySection operations={operationsExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <HrExecutiveSummarySection hr={hrExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <LegalExecutiveSummarySection legal={legalExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <GoogleBusinessExecutiveSummarySection googleBusiness={googleBusinessExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <MetaExecutiveSummarySection meta={metaExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <LinkedInExecutiveSummarySection linkedin={linkedInExecutive} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveDecisionsSection decisions={executiveDecisions} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveExecutionPlanSection plans={executionPlans} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveMonitoringSection monitoring={executiveMonitoring} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <ExecutiveWatchersSection watchers={watcherExecutive ?? null} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <MarketWatcherSection marketWatcher={marketWatcher ?? null} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5" accent>
        <SeoWatcherSection seoWatcher={seoWatcher ?? null} />
      </CommandPanel>

      {!hidePromotedPanels && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveLearningSection learning={executiveLearning} />
        </CommandPanel>
      )}

      {!hidePromotedPanels && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveForecastSection forecast={executiveForecast} />
        </CommandPanel>
      )}

      {!hidePromotedPanels && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveStrategySection strategy={executiveStrategy} />
        </CommandPanel>
      )}

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveIntelligenceSection intelligence={executiveIntelligence} />
      </CommandPanel>

      <CommandPanel className="p-4 sm:p-5">
        <ExecutiveMemorySection memories={executiveContext?.memories ?? []} />
      </CommandPanel>

      {!hidePromotedPanels && (
        <CommandPanel className="p-4 sm:p-5">
          <ExecutiveContextSection
            context={brain.context}
            executiveContext={executiveContext}
          />
        </CommandPanel>
      )}

      {hasActiveAnalysis && status === "ready" && (
        <CommandPanel className="p-4 sm:p-5" accent>
          <ExecutiveActionPlanSection actionPlan={brain.actionPlan} />
        </CommandPanel>
      )}
    </div>
  );
}

function BrainStatusBadge({ status }: { status: ExecutiveBrainStatus }) {
  const styles: Record<ExecutiveBrainStatus, string> = {
    idle: "bg-zinc-500/10 text-muted ring-zinc-500/20",
    building: "bg-accent/10 text-accent ring-accent/20",
    ready: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  };

  const dots: Record<ExecutiveBrainStatus, string> = {
    idle: "bg-zinc-500",
    building: "bg-accent animate-pulse",
    ready: "bg-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
        styles[status],
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
