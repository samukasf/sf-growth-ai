"use client";

import { useCallback, useState } from "react";

import { buildExecutiveBrainFromSnapshot } from "../executive-brain/build-executive-brain";
import {
  buildExecutiveBriefing,
  DEFAULT_EXECUTIVE_BRAIN,
  MOCK_EXECUTIVE_COUNCIL,
  MOCK_EXECUTIVE_STATUS,
} from "../executive-brain";
import type { ExecutiveBrain, ExecutiveBrainStatus, ExecutiveBriefing } from "../executive-brain/types";
import {
  buildOrchestratorSnapshot,
  generateOrchestratorResponse,
  snapshotToBrain,
} from "../services/executive-orchestrator.service";
import {
  buildExecutiveConversation,
  type ExecutiveConversation,
  type ExecutiveConversationContext,
} from "../services/executive-conversation-orchestrator.service";
import { buildSamuelCeoResponse } from "../utils/build-samuel-ceo-response";
import type {
  OrchestratorPhase,
  OrchestratorSnapshot,
} from "../services/executive-orchestrator.types";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import type { SeoWatcherResult } from "@/features/watchers/seo/seo-watcher.types";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutionPlan } from "../services/executive-execution-planner.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
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
import type { ExecutiveAction } from "../services/executive-action.service";
import type { ExecutiveCEO } from "../services/executive-ceo.service";
import type { ExecutivePriority } from "../services/executive-priority.service";
import type { ExecutiveCompetitor } from "../services/executive-competitor.service";
import type { ExecutiveStrategy } from "../services/executive-strategy.service";
import type { ExecutiveRecommendation } from "../services/executive-recommendation.service";
import type { ExecutiveForecast } from "../services/executive-forecast.service";
import type { ExecutiveLearning } from "../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";
import { captureKnowledgeFromConversation } from "@/features/executive-knowledge";
import { syncConversationToExecutiveMemory } from "@/features/executive-memory-engine";
import { ExecutiveWorkspace } from "./executive-workspace";

const ORCHESTRATION_PHASES: OrchestratorPhase[] = [
  "building_context",
  "selecting_executives",
  "running_analysis",
  "building_consensus",
  "building_action_plan",
  "complete",
];

const PHASE_DELAY_MS = 450;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

type SamuelAiShellProps = {
  executiveBriefing?: ExecutiveBriefing;
  executiveContext?: CompanyExecutiveContext | null;
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
  seoWatcher?: SeoWatcherResult | null;
};

export function SamuelAiShell({
  executiveBriefing,
  executiveContext = null,
  executiveIntelligence = null,
  executiveDecisions = [],
  executionPlans = [],
  executiveMonitoring = null,
  executiveLearning = null,
  executiveForecast = null,
  executiveStrategy = null,
  executiveCompetitor = null,
  executiveAction = null,
  executivePriority = null,
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
}: SamuelAiShellProps) {
  const [executiveBrain, setExecutiveBrain] =
    useState<ExecutiveBrain>(DEFAULT_EXECUTIVE_BRAIN);
  const [brainStatus, setBrainStatus] = useState<ExecutiveBrainStatus>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasActiveAnalysis, setHasActiveAnalysis] = useState(false);
  const [orchestratorSnapshot, setOrchestratorSnapshot] =
    useState<OrchestratorSnapshot | null>(null);
  const [executiveConversation, setExecutiveConversation] =
    useState<ExecutiveConversation | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
  const [analysisCompletedAt, setAnalysisCompletedAt] = useState<number | null>(null);

  const briefing =
    executiveBriefing ??
    buildExecutiveBriefing({
      context: executiveContext,
      intelligence: executiveIntelligence,
      decisions: executiveDecisions,
      monitoring: executiveMonitoring,
      forecast: executiveForecast,
      learning: executiveLearning,
      strategy: executiveStrategy,
      priority: executivePriority,
      recommendation: executiveRecommendation,
      ceo: executiveCeo,
    });

  const handleFirstMessage = useCallback(() => {
    setHasActiveAnalysis(true);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      setIsProcessing(true);
      setBrainStatus("building");
      setHasActiveAnalysis(true);
      setPendingQuestion(content);
      setExecutiveConversation(null);
      setAnalysisStartedAt(Date.now());
      setAnalysisCompletedAt(null);

      const conversationContext: ExecutiveConversationContext = {
        companyName: executiveContext?.company.name,
        executiveContext,
        intelligence: executiveIntelligence,
        decisions: executiveDecisions,
        forecast: executiveForecast,
        executiveCeo,
        crmExecutive,
        marketingExecutive,
        salesExecutive,
        financeExecutive,
        operationsExecutive,
        hrExecutive,
        legalExecutive,
        strategy: executiveStrategy,
        competitor: executiveCompetitor,
        googleBusinessExecutive,
        googleAnalyticsExecutive,
        searchConsoleExecutive,
        metaExecutive,
        linkedInExecutive,
      };

      for (const phase of ORCHESTRATION_PHASES) {
        const snapshot = buildOrchestratorSnapshot(
          content,
          phase,
          executiveContext,
        );
        setOrchestratorSnapshot(snapshot);
        setExecutiveBrain(
          buildExecutiveBrainFromSnapshot(content, phase, executiveContext),
        );

        if (phase !== "complete") {
          await delay(PHASE_DELAY_MS);
        }
      }

      const finalSnapshot = buildOrchestratorSnapshot(
        content,
        "complete",
        executiveContext,
      );
      const brain = snapshotToBrain(finalSnapshot);

      const conversation = buildExecutiveConversation({
        question: content,
        context: conversationContext,
      });

      setOrchestratorSnapshot(finalSnapshot);
      setExecutiveBrain(brain);
      setExecutiveConversation(conversation);
      setPendingQuestion(null);
      setAnalysisCompletedAt(Date.now());
      setBrainStatus("ready");
      setIsProcessing(false);

      const companyId = executiveContext?.company.id ?? "default-company";
      void captureKnowledgeFromConversation(companyId, content, conversation);
      void syncConversationToExecutiveMemory(companyId, content, conversation);

      if (conversation) {
        return buildSamuelCeoResponse(
          conversation,
          executiveContext?.company.name,
        );
      }

      return generateOrchestratorResponse(brain, executiveContext);
    },
    [
      executiveContext,
      executiveIntelligence,
      executiveDecisions,
      executiveForecast,
      executiveCeo,
      crmExecutive,
      marketingExecutive,
      salesExecutive,
      financeExecutive,
      operationsExecutive,
      hrExecutive,
      legalExecutive,
      executiveStrategy,
      executiveCompetitor,
      googleBusinessExecutive,
      googleAnalyticsExecutive,
      searchConsoleExecutive,
      metaExecutive,
      linkedInExecutive,
    ],
  );

  return (
    <ExecutiveWorkspace
      brain={executiveBrain}
      brainStatus={brainStatus}
      executiveStatus={MOCK_EXECUTIVE_STATUS}
      council={MOCK_EXECUTIVE_COUNCIL}
      hasActiveAnalysis={hasActiveAnalysis}
      briefing={briefing}
      orchestratorSnapshot={orchestratorSnapshot}
      isProcessing={isProcessing}
      executiveContext={executiveContext}
      executiveIntelligence={executiveIntelligence}
      executiveDecisions={executiveDecisions}
      executiveAction={executiveAction}
      executivePriority={executivePriority}
      executionPlans={executionPlans}
      executiveMonitoring={executiveMonitoring}
      executiveLearning={executiveLearning}
      executiveForecast={executiveForecast}
      executiveStrategy={executiveStrategy}
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
      seoWatcher={seoWatcher}
      executiveConversation={executiveConversation}
      pendingQuestion={pendingQuestion}
      analysisStartedAt={analysisStartedAt}
      analysisCompletedAt={analysisCompletedAt}
      onSendMessage={handleSendMessage}
      onFirstMessage={handleFirstMessage}
    />
  );
}
