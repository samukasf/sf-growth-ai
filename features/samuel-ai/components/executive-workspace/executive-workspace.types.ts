import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import type { SeoWatcherResult } from "@/features/watchers/seo/seo-watcher.types";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";

import type {
  ExecutiveBrain,
  ExecutiveBrainStatus,
  ExecutiveBriefing,
  ExecutiveCouncil,
  ExecutiveStatus,
} from "../../executive-brain/types";
import type { ExecutiveAction } from "../../services/executive-action.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { ExecutivePriority } from "../../services/executive-priority.service";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveDecision } from "../../services/executive-decision.service";
import type { ExecutionPlan } from "../../services/executive-execution-planner.service";
import type { ExecutiveForecast } from "../../services/executive-forecast.service";
import type { ExecutiveIntelligence } from "../../services/executive-intelligence.service";
import type { ExecutiveLearning } from "../../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../../services/executive-monitoring.service";
import type { ExecutiveRecommendation } from "../../services/executive-recommendation.service";
import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import type { OrchestratorSnapshot } from "../../services/executive-orchestrator.types";

export type ExecutiveWorkspaceData = {
  brain: ExecutiveBrain;
  brainStatus: ExecutiveBrainStatus;
  executiveStatus: ExecutiveStatus;
  council: ExecutiveCouncil;
  hasActiveAnalysis: boolean;
  briefing: ExecutiveBriefing;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  isProcessing?: boolean;
  executiveContext?: CompanyExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveDecisions?: ExecutiveDecision[];
  executiveAction?: ExecutiveAction | null;
  executivePriority?: ExecutivePriority | null;
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
};

export type ExecutiveWorkspaceHandlers = {
  onSendMessage: (content: string) => Promise<string>;
  onFirstMessage: () => void;
  isProcessing: boolean;
};
