"use client";

import { useCallback, useState } from "react";

import type { PipelineStep } from "@/apps/web/src/core/orchestrator";
import {
  sendSamuelChatMessage,
} from "../chat/samuel-chat.client";
import type {
  SamuelChatCompanyContext,
  SamuelChatRuntimeSummary,
  SamuelChatSendOptions,
  SamuelChatSendResult,
  SamuelChatStreamEvent,
} from "../chat/samuel-chat.types";
import {
  buildExecutiveBriefing,
} from "../executive-brain";
import type {
  ExecutiveBrain,
  ExecutiveBrainStatus,
  ExecutiveBriefing,
  ExecutiveCouncil,
} from "../executive-brain/types";
import type { ExecutiveConversation } from "../services/executive-conversation-orchestrator.service";
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
import { ExecutiveWorkspace } from "./executive-workspace";

function phaseForStep(step: PipelineStep): OrchestratorPhase {
  switch (step.name) {
    case "load_memory":
    case "load_context":
    case "load_company_brain":
      return "building_context";
    case "load_executive_council":
      return "selecting_executives";
    case "merge_context":
    case "build_runtime":
      return "running_analysis";
    case "prepare_response":
      return "building_consensus";
  }
}

function runtimeContext(
  query: string,
  executiveContext: CompanyExecutiveContext | null,
  growthScore: number,
): ExecutiveBrain["context"] {
  const company = executiveContext?.company;
  const profile = executiveContext?.businessProfile;
  const fields = [
    ["Segmento", profile?.segment ?? company?.industry],
    ["Posicionamento", profile?.positioning],
    ["Objetivos", Array.isArray(profile?.objectives)
      ? profile.objectives.join(" · ")
      : profile?.objectives],
    ["Proposta de valor", profile?.value_proposition],
  ]
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value], index) => ({ id: `runtime-field-${index}`, label, value }));

  return {
    companyId: company?.id ?? "default-company",
    companyName: company?.name ?? "Empresa",
    segment: profile?.segment ?? company?.industry ?? "Não informado",
    location: [company?.city, company?.country].filter(Boolean).join(", ") || "Não informado",
    growthScore,
    detectedObjective: query,
    fields,
  };
}

function buildRuntimeBrain(
  query: string,
  executiveContext: CompanyExecutiveContext | null,
  runtime?: SamuelChatRuntimeSummary,
  growthScore = 0,
): ExecutiveBrain {
  const steps = runtime?.pipeline ?? [];
  return {
    id: `runtime-${crypto.randomUUID()}`,
    builtAt: new Date().toISOString(),
    userQuery: query,
    context: runtimeContext(query, executiveContext, growthScore),
    memory: {
      recentDecisions: [],
      previousRecommendations: [],
      results: [],
      learnings: [],
      relevantPatterns: [],
    },
    reasoning: {
      steps: steps.map((step, index) => ({
        id: `runtime-step-${step.name}`,
        order: index + 1,
        title: step.name.replaceAll("_", " "),
        description: `${step.status} · ${step.durationMs} ms`,
        status: step.status === "failed" ? "pending" : "completed",
      })),
      currentFocus: runtime?.nextStep ?? "A consolidar contexto empresarial",
      consultations: [],
      executiveConsensus: runtime?.recommendation ?? null,
    },
    actionPlan: {
      summary: runtime?.nextStep ?? "O Samuel Runtime está a processar a diretriz.",
      actions: [],
    },
  };
}

function buildRuntimeSnapshot(
  query: string,
  brain: ExecutiveBrain,
  phase: OrchestratorPhase,
  runtime?: SamuelChatRuntimeSummary,
): OrchestratorSnapshot {
  const confidence = runtime
    ? Math.max(0, Math.min(100, Math.round(runtime.confidence * (runtime.confidence <= 1 ? 100 : 1))))
    : null;

  return {
    phase,
    userQuery: query,
    context: brain.context,
    consultedExecutives: [],
    analysis: runtime ? { steps: [], reasoning: brain.reasoning } : null,
    consensus: runtime?.recommendation ?? null,
    actionPlan: runtime ? brain.actionPlan : null,
    confidence: confidence === null
      ? null
      : {
          score: confidence,
          level: confidence >= 80 ? "high" : confidence >= 55 ? "medium" : "low",
          rationale: "Confiança calculada pelo pipeline do Samuel Runtime.",
        },
    memory: brain.memory,
  };
}

function numberEntries(entries: Array<[string, number | null | undefined]>) {
  return Object.fromEntries(
    entries.filter((entry): entry is [string, number] => Number.isFinite(entry[1])),
  );
}

function buildRuntimeCouncil(input: {
  marketing: boolean;
  sales: boolean;
  finance: boolean;
  operations: boolean;
  hr: boolean;
  legal: boolean;
  lastAnalysis: string;
}): ExecutiveCouncil {
  const modules = [
    ["cmo", "CMO", "Marketing", input.marketing],
    ["cso", "CSO", "Vendas", input.sales],
    ["cfo", "CFO", "Finanças", input.finance],
    ["coo", "COO", "Operações", input.operations],
    ["chro", "CHRO", "Pessoas", input.hr],
    ["clo", "CLO", "Legal", input.legal],
  ] as const;

  return {
    members: [
      {
        id: "samuel-runtime",
        role: "Samuel Runtime",
        title: "Pipeline executivo",
        status: "online",
        lastConsulted: input.lastAnalysis,
        availability: "available",
      },
      ...modules
        .filter((module) => module[3])
        .map(([id, role, title]) => ({
          id,
          role,
          title,
          status: "online" as const,
          lastConsulted: input.lastAnalysis,
          availability: "available" as const,
        })),
    ],
  };
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
  const [executiveBrain, setExecutiveBrain] = useState<ExecutiveBrain>(() =>
    buildRuntimeBrain(
      "Aguardando diretriz executiva",
      executiveContext,
      undefined,
      executiveCeo?.growthScore ?? 0,
    ),
  );
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

  const lastAnalysis = analysisCompletedAt
    ? new Date(analysisCompletedAt).toISOString()
    : new Date().toISOString();
  const runtimeCouncil = buildRuntimeCouncil({
    marketing: Boolean(marketingExecutive),
    sales: Boolean(salesExecutive),
    finance: Boolean(financeExecutive),
    operations: Boolean(operationsExecutive),
    hr: Boolean(hrExecutive),
    legal: Boolean(legalExecutive),
    lastAnalysis,
  });

  const handleSendMessage = useCallback(
    async (
      content: string,
      options: SamuelChatSendOptions,
    ): Promise<SamuelChatSendResult> => {
      setIsProcessing(true);
      setBrainStatus("building");
      setHasActiveAnalysis(true);
      setPendingQuestion(content);
      setExecutiveConversation(null);
      setAnalysisStartedAt(Date.now());
      setAnalysisCompletedAt(null);

      const companyContext: SamuelChatCompanyContext = {
        executiveContext,
        executiveSummary: executiveCeo?.executiveSummary,
        executiveRecommendation: executiveCeo?.executiveRecommendation,
        topPriorities: executiveCeo?.topPriorities,
        nextActions: executiveCeo?.nextActions,
        health: numberEntries([
          ["overall", executiveCeo?.companyHealth.score],
          ["marketing", marketingExecutive?.marketingHealthScore],
          ["sales", salesExecutive?.salesHealthScore],
          ["finance", financeExecutive?.financeHealthScore],
          ["operations", operationsExecutive?.operationsHealthScore],
          ["hr", hrExecutive?.hrHealthScore],
          ["legal", legalExecutive?.legalHealthScore],
        ]),
        growthScore: executiveCeo?.growthScore,
        riskScore: executiveCeo?.riskScore,
      };
      const growthScore = executiveCeo?.growthScore ?? 0;
      const initialBrain = buildRuntimeBrain(
        content,
        executiveContext,
        undefined,
        growthScore,
      );
      setExecutiveBrain(initialBrain);
      setOrchestratorSnapshot(
        buildRuntimeSnapshot(content, initialBrain, "building_context"),
      );

      const onEvent = (event: SamuelChatStreamEvent) => {
        options.onEvent?.(event);

        if (event.type === "step") {
          const phase = phaseForStep(event.step);
          setOrchestratorSnapshot((current) => ({
            ...(current ?? buildRuntimeSnapshot(content, initialBrain, phase)),
            phase,
          }));
        }

        if (event.type === "provider") {
          setOrchestratorSnapshot((current) => ({
            ...(current ?? buildRuntimeSnapshot(content, initialBrain, "building_action_plan")),
            phase: "building_action_plan",
          }));
        }

        if (event.type === "complete") {
          const brain = buildRuntimeBrain(
            content,
            executiveContext,
            event.runtime,
            growthScore,
          );
          setExecutiveBrain(brain);
          setOrchestratorSnapshot(
            buildRuntimeSnapshot(content, brain, "complete", event.runtime),
          );
        }
      };

      try {
        const result = await sendSamuelChatMessage(
          {
            query: content,
            companyId: executiveContext?.company.id ?? "default-company",
            companyContext,
          },
          { ...options, onEvent },
        );

        setPendingQuestion(null);
        setAnalysisCompletedAt(Date.now());
        setBrainStatus("ready");
        return result;
      } catch (error) {
        setAnalysisCompletedAt(Date.now());
        setBrainStatus("idle");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [
      executiveContext,
      executiveCeo,
      marketingExecutive,
      salesExecutive,
      financeExecutive,
      operationsExecutive,
      hrExecutive,
      legalExecutive,
    ],
  );

  return (
    <ExecutiveWorkspace
      brain={executiveBrain}
      brainStatus={brainStatus}
      executiveStatus={{
        online: true,
        monitoringCompany: Boolean(executiveMonitoring || watcherExecutive),
        businessTwinSynced: Boolean(executiveContext),
        marketMonitored: Boolean(marketWatcher || seoWatcher),
        lastAnalysis,
        autonomyLevel: "Supervisionado",
        analysisConfidence: orchestratorSnapshot?.confidence?.score ?? 0,
        nextUpdate: analysisCompletedAt
          ? new Date(analysisCompletedAt + 45 * 60_000).toISOString()
          : lastAnalysis,
      }}
      council={runtimeCouncil}
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
