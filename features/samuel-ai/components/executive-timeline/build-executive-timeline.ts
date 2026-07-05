import type { ExecutiveContext } from "@/services/executive-context.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";

import type { ExecutiveBrainStatus } from "../../executive-brain/types";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveIntelligence } from "../../services/executive-intelligence.service";
import type { ExecutiveRecommendation } from "../../services/executive-recommendation.service";
import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import type { OrchestratorPhase, OrchestratorSnapshot } from "../../services/executive-orchestrator.types";

import type {
  ExecutiveTimelineState,
  ExecutiveTimelineStep,
  ExecutiveTimelineStepId,
  TimelineStepStatus,
} from "./executive-timeline.types";

const STEP_DEFINITIONS: Array<{
  id: ExecutiveTimelineStepId;
  title: string;
  responsible: string;
}> = [
  { id: "question-received", title: "Pergunta recebida", responsible: "Samuel AI™" },
  { id: "context-loaded", title: "Contexto carregado", responsible: "Executive Context" },
  { id: "memory-consulted", title: "Memória consultada", responsible: "Executive Memory" },
  { id: "executives-summoned", title: "Executivos convocados", responsible: "Samuel AI™ Orchestrator" },
  { id: "marketing-analyzing", title: "Marketing analisando", responsible: "Marketing Executive" },
  { id: "finance-analyzing", title: "Finance analisando", responsible: "Finance Executive" },
  { id: "sales-analyzing", title: "Sales analisando", responsible: "Sales Executive" },
  { id: "operations-analyzing", title: "Operations analisando", responsible: "Operations Executive" },
  { id: "watchers-consulted", title: "Watchers consultados", responsible: "Executive Watchers" },
  { id: "executive-reasoning", title: "Executive Reasoning", responsible: "Samuel AI™" },
  { id: "executive-consensus", title: "Executive Consensus", responsible: "Conselho Executivo" },
  { id: "strategic-plan", title: "Plano Estratégico", responsible: "Strategy Engine" },
  { id: "recommendations", title: "Recomendações", responsible: "Recommendation Engine" },
  { id: "ceo-response", title: "CEO Response", responsible: "CEO Digital" },
];

const PHASE_ACTIVE_STEP: Record<OrchestratorPhase, number> = {
  idle: -1,
  building_context: 2,
  selecting_executives: 3,
  running_analysis: 8,
  building_consensus: 10,
  building_action_plan: 11,
  complete: 13,
};

export type BuildExecutiveTimelineInput = {
  brainStatus: ExecutiveBrainStatus;
  isProcessing: boolean;
  orchestratorSnapshot?: OrchestratorSnapshot | null;
  pendingQuestion?: string | null;
  executiveConversation?: ExecutiveConversation | null;
  executiveContext?: ExecutiveContext | null;
  executiveIntelligence?: ExecutiveIntelligence | null;
  executiveStrategy?: ExecutiveStrategy | null;
  executiveRecommendation?: ExecutiveRecommendation | null;
  executiveCeo?: ExecutiveCEO | null;
  marketingExecutive?: MarketingExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  salesExecutive?: SalesExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  watcherExecutive?: WatcherExecutive | null;
  marketWatcher?: MarketWatcherResult | null;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
  now?: number;
};

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function resolveActiveStepIndex(input: BuildExecutiveTimelineInput): number {
  const {
    brainStatus,
    isProcessing,
    orchestratorSnapshot,
    pendingQuestion,
    executiveConversation,
    analysisStartedAt,
    now = Date.now(),
  } = input;

  if (!isProcessing && brainStatus === "ready") {
    return STEP_DEFINITIONS.length;
  }

  const phase = orchestratorSnapshot?.phase ?? (isProcessing ? "building_context" : "idle");

  if (phase === "running_analysis" && isProcessing && analysisStartedAt) {
    const elapsed = now - analysisStartedAt;
    const analysisStartMs = 450 * 2;
    const subElapsed = Math.max(0, elapsed - analysisStartMs);
    const subStep = Math.min(4, Math.floor(subElapsed / 320));
    return 4 + subStep;
  }

  if (phase === "idle") {
    if (pendingQuestion || executiveConversation) return 0;
    if (input.executiveContext) return 2;
    return -1;
  }

  return PHASE_ACTIVE_STEP[phase];
}

function stepStatus(
  stepIndex: number,
  activeIndex: number,
  isProcessing: boolean,
  brainStatus: ExecutiveBrainStatus,
  unavailable: boolean,
): TimelineStepStatus {
  if (unavailable && activeIndex >= stepIndex && stepIndex >= 4 && stepIndex <= 8) {
    return "Warning";
  }

  if (activeIndex < 0) {
    if (stepIndex <= 2 && brainStatus !== "idle") return "Completed";
    return "Waiting";
  }

  if (stepIndex < activeIndex) return "Completed";
  if (stepIndex === activeIndex) {
    return isProcessing || brainStatus === "building" ? "Running" : "Completed";
  }
  return "Waiting";
}

function buildDescription(
  id: ExecutiveTimelineStepId,
  input: BuildExecutiveTimelineInput,
): string {
  const snapshot = input.orchestratorSnapshot;

  switch (id) {
    case "question-received":
      return (
        input.pendingQuestion ??
        input.executiveConversation?.request.question ??
        snapshot?.userQuery ??
        "Aguardando diretriz do usuário."
      );
    case "context-loaded":
      return input.executiveContext
        ? `Contexto de ${input.executiveContext.company.name} carregado com ${input.executiveContext.memories.length} memória(s).`
        : "Carregando contexto empresarial.";
    case "memory-consulted":
      return input.executiveContext?.memories.length
        ? `${input.executiveContext.memories.length} registro(s) de memória consultados.`
        : "Consultando memória executiva.";
    case "executives-summoned":
      return snapshot?.consultedExecutives.length
        ? `${snapshot.consultedExecutives.length} executivo(s) convocado(s): ${snapshot.consultedExecutives.map((e) => e.name).join(", ")}.`
        : "Selecionando executivos relevantes.";
    case "marketing-analyzing":
      return input.marketingExecutive
        ? `Saúde ${input.marketingExecutive.marketingHealthScore}/100 · Conversão ${input.marketingExecutive.conversionScore}/100.`
        : "Módulo Marketing indisponível.";
    case "finance-analyzing":
      return input.financeExecutive
        ? `Saúde ${input.financeExecutive.financeHealthScore}/100 · Margem ${input.financeExecutive.profitMargin}%.`
        : "Módulo Finance indisponível.";
    case "sales-analyzing":
      return input.salesExecutive
        ? `Saúde ${input.salesExecutive.salesHealthScore}/100 · Win rate ${input.salesExecutive.winRate}%.`
        : "Módulo Sales indisponível.";
    case "operations-analyzing":
      return input.operationsExecutive
        ? `Saúde ${input.operationsExecutive.operationsHealthScore}/100 · Produtividade ${input.operationsExecutive.productivityScore}/100.`
        : "Módulo Operations indisponível.";
    case "watchers-consulted":
      return [
        input.watcherExecutive
          ? `${input.watcherExecutive.summary.totalAlerts} alerta(s) de watcher`
          : null,
        input.marketWatcher
          ? `${input.marketWatcher.alerts.length} alerta(s) de mercado`
          : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Consultando watchers executivos.";
    case "executive-reasoning":
      return snapshot?.analysis?.reasoning.currentFocus ?? "Processando raciocínio executivo.";
    case "executive-consensus":
      return snapshot?.consensus ?? "Formando consenso entre executivos.";
    case "strategic-plan":
      return input.executiveStrategy?.executiveStrategy ?? "Construindo plano estratégico.";
    case "recommendations":
      return input.executiveRecommendation?.executiveRecommendationSummary ??
        `${input.executiveRecommendation?.executiveRecommendations.length ?? 0} recomendação(ões) geradas.`;
    case "ceo-response":
      return input.executiveCeo?.ceoMessage ?? input.executiveConversation?.executiveSummary ??
        "Preparando resposta do CEO Digital.";
    default:
      return "";
  }
}

function buildConfidence(
  id: ExecutiveTimelineStepId,
  input: BuildExecutiveTimelineInput,
): number | null {
  const snapshot = input.orchestratorSnapshot;

  switch (id) {
    case "question-received":
      return input.pendingQuestion || input.executiveConversation ? 100 : null;
    case "context-loaded":
      return input.executiveIntelligence ? 78 : input.executiveContext ? 70 : null;
    case "memory-consulted":
      return input.executiveContext?.memories.length
        ? Math.min(95, 55 + input.executiveContext.memories.length * 4)
        : null;
    case "executives-summoned":
      return snapshot?.consultedExecutives.length
        ? Math.min(92, 60 + snapshot.consultedExecutives.length * 8)
        : null;
    case "marketing-analyzing":
      return input.marketingExecutive?.marketingHealthScore ?? null;
    case "finance-analyzing":
      return input.financeExecutive?.financeHealthScore ?? null;
    case "sales-analyzing":
      return input.salesExecutive?.salesHealthScore ?? null;
    case "operations-analyzing":
      return input.operationsExecutive?.operationsHealthScore ?? null;
    case "watchers-consulted": {
      const scores = [
        input.watcherExecutive?.summary.averageConfidence,
        input.marketWatcher?.averageConfidence,
      ].filter((v): v is number => typeof v === "number" && v > 0);
      return scores.length > 0
        ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
        : null;
    }
    case "executive-reasoning":
      return snapshot?.confidence?.score ?? input.executiveConversation?.confidenceScore ?? null;
    case "executive-consensus":
      return snapshot?.confidence?.score ?? null;
    case "strategic-plan":
      return input.executiveStrategy?.confidenceScore ?? null;
    case "recommendations":
      return input.executiveRecommendation?.confidenceLevel ?? null;
    case "ceo-response":
      return input.executiveCeo?.executiveScore ?? input.executiveConversation?.confidenceScore ?? null;
    default:
      return null;
  }
}

function isModuleUnavailable(
  id: ExecutiveTimelineStepId,
  input: BuildExecutiveTimelineInput,
): boolean {
  switch (id) {
    case "marketing-analyzing":
      return !input.marketingExecutive;
    case "finance-analyzing":
      return !input.financeExecutive;
    case "sales-analyzing":
      return !input.salesExecutive;
    case "operations-analyzing":
      return !input.operationsExecutive;
    case "watchers-consulted":
      return !input.watcherExecutive && !input.marketWatcher;
    default:
      return false;
  }
}

export function buildExecutiveTimeline(
  input: BuildExecutiveTimelineInput,
): ExecutiveTimelineState {
  const {
    isProcessing,
    brainStatus,
    analysisStartedAt,
    analysisCompletedAt,
    now = Date.now(),
  } = input;

  const activeIndex = resolveActiveStepIndex(input);
  const totalDurationMs =
    analysisStartedAt !== null && analysisStartedAt !== undefined
      ? (analysisCompletedAt ?? now) - analysisStartedAt
      : null;

  const perStepDuration =
    totalDurationMs && activeIndex > 0
      ? Math.round(totalDurationMs / Math.min(activeIndex, STEP_DEFINITIONS.length))
      : null;

  const steps: ExecutiveTimelineStep[] = STEP_DEFINITIONS.map((definition, index) => {
    const unavailable = isModuleUnavailable(definition.id, input);
    const status = stepStatus(index, activeIndex, isProcessing, brainStatus, unavailable);
    const stepStart =
      analysisStartedAt && perStepDuration ? analysisStartedAt + index * perStepDuration : null;

    return {
      id: definition.id,
      order: index + 1,
      title: definition.title,
      description: buildDescription(definition.id, input),
      status,
      timestamp:
        status === "Completed" || status === "Running"
          ? stepStart
            ? formatTime(stepStart)
            : formatTime(now)
          : null,
      durationMs:
        status === "Completed" && perStepDuration
          ? perStepDuration
          : status === "Running" && stepStart
            ? now - stepStart
            : null,
      confidence: buildConfidence(definition.id, input),
      responsible: definition.responsible,
      detail: unavailable ? "Módulo indisponível — usando fallback." : undefined,
    };
  });

  const completedCount = steps.filter((step) => step.status === "Completed").length;
  const progressPercent =
    activeIndex < 0
      ? input.executiveContext
        ? Math.round((3 / STEP_DEFINITIONS.length) * 100)
        : 0
      : Math.min(100, Math.round((completedCount / STEP_DEFINITIONS.length) * 100));

  const confidenceValues = steps
    .map((step) => step.confidence)
    .filter((value): value is number => typeof value === "number");

  return {
    steps,
    progressPercent: isProcessing
      ? Math.max(progressPercent, Math.round(((activeIndex + 1) / STEP_DEFINITIONS.length) * 100))
      : progressPercent,
    totalDurationMs,
    averageConfidence:
      confidenceValues.length > 0
        ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
        : null,
    isLive: isProcessing || brainStatus === "building",
  };
}
