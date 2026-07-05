"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

import { INBOX_ACTION_LABELS } from "@/features/executive-inbox";
import type { ExecutiveInboxActionRecord } from "@/features/executive-inbox/executive-inbox.types";

import type { ExecutiveBrainStatus } from "../../executive-brain/types";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import type { ExecutiveForecast } from "../../services/executive-forecast.service";
import type { ExecutiveMonitoring } from "../../services/executive-monitoring.service";
import type { ExecutiveRecommendation } from "../../services/executive-recommendation.service";
import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import type { OrchestratorPhase } from "../../services/executive-orchestrator.types";
import { SectionHeader } from "../section-header";
import { StatusBadge } from "../shared/status-badge";

export type LiveBoardStatus = "online" | "analyzing" | "ready";

export type LiveBoardModuleId =
  | "marketing"
  | "finance"
  | "sales"
  | "operations"
  | "hr"
  | "legal"
  | "google-business"
  | "google-analytics"
  | "search-console"
  | "meta"
  | "linkedin";

export type ExecutiveLiveBoardProps = {
  brainStatus: ExecutiveBrainStatus;
  isProcessing?: boolean;
  orchestratorPhase?: OrchestratorPhase | null;
  executiveCeo?: ExecutiveCEO | null;
  executiveMonitoring?: ExecutiveMonitoring | null;
  executiveForecast?: ExecutiveForecast | null;
  executiveStrategy?: ExecutiveStrategy | null;
  executiveRecommendation?: ExecutiveRecommendation | null;
  executiveConversation?: ExecutiveConversation | null;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
  inboxActions?: ExecutiveInboxActionRecord[];
  moduleAvailability?: Partial<Record<LiveBoardModuleId, boolean>>;
};

type TimelineStepId =
  | "context"
  | "analysis"
  | "reasoning"
  | "consensus"
  | "recommendation"
  | "final-response";

const MODULE_LABELS: Record<LiveBoardModuleId, string> = {
  marketing: "Marketing",
  finance: "Finance",
  sales: "Sales",
  operations: "Operations",
  hr: "HR",
  legal: "Legal",
  "google-business": "Google Business",
  "google-analytics": "Google Analytics",
  "search-console": "Search Console",
  meta: "Meta",
  linkedin: "LinkedIn",
};

const MODULE_ORDER: LiveBoardModuleId[] = [
  "marketing",
  "finance",
  "sales",
  "operations",
  "hr",
  "legal",
  "google-business",
  "google-analytics",
  "search-console",
  "meta",
  "linkedin",
];

const PHASE_ORDER: OrchestratorPhase[] = [
  "building_context",
  "selecting_executives",
  "running_analysis",
  "building_consensus",
  "building_action_plan",
  "complete",
];

const TIMELINE_STEPS: Array<{ id: TimelineStepId; label: string }> = [
  { id: "context", label: "Context" },
  { id: "analysis", label: "Analysis" },
  { id: "reasoning", label: "Reasoning" },
  { id: "consensus", label: "Consensus" },
  { id: "recommendation", label: "Recommendation" },
  { id: "final-response", label: "Final Response" },
];

const STATUS_LABELS: Record<LiveBoardStatus, string> = {
  online: "ONLINE",
  analyzing: "ANALYZING",
  ready: "READY",
};

const STATUS_VARIANTS: Record<LiveBoardStatus, "success" | "accent" | "muted"> = {
  online: "success",
  analyzing: "accent",
  ready: "success",
};

function phaseIndex(phase: OrchestratorPhase | null | undefined): number {
  if (!phase || phase === "idle") return -1;
  return PHASE_ORDER.indexOf(phase);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function getCeoStatus(
  brainStatus: ExecutiveBrainStatus,
  isProcessing: boolean,
): LiveBoardStatus {
  if (isProcessing || brainStatus === "building") return "analyzing";
  if (brainStatus === "ready") return "ready";
  return "online";
}

function getModuleStatus(
  moduleId: LiveBoardModuleId,
  activeModuleIds: Set<string>,
  brainStatus: ExecutiveBrainStatus,
  isProcessing: boolean,
  phase: OrchestratorPhase | null | undefined,
): LiveBoardStatus {
  const isActive = activeModuleIds.has(moduleId);

  if (!isActive) {
    return "online";
  }

  if (!isProcessing && brainStatus === "ready") {
    return "ready";
  }

  const currentPhase = phaseIndex(phase);
  if (currentPhase >= phaseIndex("building_consensus")) {
    return "ready";
  }

  if (isProcessing || brainStatus === "building") {
    return "analyzing";
  }

  return "online";
}

function getTimelineStepStatus(
  stepId: TimelineStepId,
  brainStatus: ExecutiveBrainStatus,
  isProcessing: boolean,
  phase: OrchestratorPhase | null | undefined,
): "pending" | "active" | "completed" {
  const stepPhaseMap: Record<TimelineStepId, number> = {
    context: 0,
    analysis: 1,
    reasoning: 2,
    consensus: 3,
    recommendation: 4,
    "final-response": 5,
  };

  const activeIndex = (() => {
    switch (phase) {
      case "building_context":
        return 0;
      case "selecting_executives":
        return 1;
      case "running_analysis":
        return 2;
      case "building_consensus":
        return 3;
      case "building_action_plan":
        return 4;
      case "complete":
        return 5;
      default:
        return isProcessing ? 0 : -1;
    }
  })();

  const stepIndex = stepPhaseMap[stepId];

  if (brainStatus === "ready" && !isProcessing) {
    return "completed";
  }

  if (activeIndex < 0) {
    return "pending";
  }

  if (stepIndex < activeIndex) return "completed";
  if (stepIndex === activeIndex) return "active";
  return "pending";
}

function LiveBoardSection({
  title,
  children,
  accent = false,
  live = false,
}: {
  title: string;
  children: ReactNode;
  accent?: boolean;
  live?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        accent
          ? "border-accent/25 bg-accent/5"
          : "border-border bg-white/[0.02]",
        live && "ring-1 ring-emerald-500/20",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.18em]",
            accent ? "text-accent" : "text-muted",
          )}
        >
          {title}
        </p>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function StatusRow({
  label,
  status,
  subtitle,
}: {
  label: string;
  status: LiveBoardStatus;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-black/10 px-3 py-2">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted">{subtitle}</p>}
      </div>
      <StatusBadge
        label={STATUS_LABELS[status]}
        variant={STATUS_VARIANTS[status]}
      />
    </div>
  );
}

function MetricTile({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-[10px] text-muted">{subtitle}</p>}
    </div>
  );
}

function HealthScoreTile({
  label,
  score,
  accentClass,
}: {
  label: string;
  score: number;
  accentClass: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        {score}
        <span className="text-xs text-muted">/100</span>
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/20">
        <div
          className={cn("h-full rounded-full transition-all duration-500", accentClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function EngineTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-foreground/90">
        {value}
      </p>
    </div>
  );
}

export function ExecutiveLiveBoard({
  brainStatus,
  isProcessing = false,
  orchestratorPhase = null,
  executiveCeo = null,
  executiveMonitoring = null,
  executiveForecast = null,
  executiveStrategy = null,
  executiveRecommendation = null,
  executiveConversation = null,
  analysisStartedAt = null,
  analysisCompletedAt = null,
  inboxActions = [],
  moduleAvailability = {},
}: ExecutiveLiveBoardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isProcessing || !analysisStartedAt) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => window.clearInterval(interval);
  }, [isProcessing, analysisStartedAt]);

  const recentInboxActions = useMemo(
    () => [...inboxActions].sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    ).slice(0, 5),
    [inboxActions],
  );

  const hasRecentInboxActivity = useMemo(() => {
    if (recentInboxActions.length === 0) return false;
    const latest = new Date(recentInboxActions[0].timestamp).getTime();
    return now - latest < 60_000;
  }, [recentInboxActions, now]);

  const activeModuleIds = useMemo(() => {
    if (executiveConversation) {
      const ids = new Set<string>();
      for (const participant of executiveConversation.participatingExecutives) {
        if (participant.consulted) {
          ids.add(participant.id);
        }
      }
      return ids;
    }

    if (isProcessing) {
      return new Set(
        MODULE_ORDER.filter((moduleId) => moduleAvailability[moduleId] !== false),
      );
    }

    return new Set<string>();
  }, [executiveConversation, isProcessing, moduleAvailability]);

  const ceoStatus = getCeoStatus(brainStatus, isProcessing);
  const topRecommendation = executiveRecommendation?.executiveRecommendations[0] ?? null;

  const analysisDurationMs =
    analysisStartedAt !== null
      ? (analysisCompletedAt ?? now) - analysisStartedAt
      : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          title="Executive Live Board"
          description="Command Center em tempo real"
        />
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge
            label={hasRecentInboxActivity ? "INBOX LIVE" : "ENGINES LIVE"}
            variant={hasRecentInboxActivity ? "success" : "accent"}
          />
          <p className="text-[10px] tabular-nums text-muted">
            {new Date(now).toLocaleTimeString("pt-BR")}
          </p>
        </div>
      </div>

      <LiveBoardSection title="Executive CEO" accent live={Boolean(executiveCeo)}>
        {executiveCeo ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <HealthScoreTile
                label="Health Score"
                score={executiveCeo.companyHealth.score}
                accentClass="bg-emerald-500"
              />
              <HealthScoreTile
                label="Executive Score"
                score={executiveCeo.executiveScore}
                accentClass="bg-accent"
              />
              <HealthScoreTile
                label="Growth Score"
                score={executiveCeo.growthScore}
                accentClass="bg-violet-500"
              />
              <HealthScoreTile
                label="Risk Score"
                score={executiveCeo.riskScore}
                accentClass="bg-amber-500"
              />
            </div>
            <EngineTextBlock
              label="Resumo executivo"
              value={truncate(executiveCeo.executiveSummary)}
            />
            <EngineTextBlock
              label="Maior risco"
              value={truncate(executiveCeo.executiveDecision)}
            />
            <EngineTextBlock
              label="Próxima ação"
              value={truncate(executiveCeo.executiveRecommendation)}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">CEO Digital indisponível.</p>
        )}
      </LiveBoardSection>

      <LiveBoardSection
        title="Executive Monitoring"
        live={Boolean(executiveMonitoring)}
      >
        {executiveMonitoring ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Progresso geral"
                value={`${executiveMonitoring.progress.overall}%`}
                subtitle={`${executiveMonitoring.progress.completedTasks}/${executiveMonitoring.progress.totalTasks} tarefas`}
              />
              <MetricTile
                label="Risco de atraso"
                value={`${executiveMonitoring.progress.delayRisk}%`}
                subtitle={`${executiveMonitoring.progress.overdueTasks} atrasada(s)`}
              />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${executiveMonitoring.progress.overall}%` }}
              />
            </div>
            {executiveMonitoring.indicators.slice(0, 3).map((indicator) => (
              <p key={indicator} className="text-[11px] text-muted">
                • {indicator}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Monitoramento indisponível.</p>
        )}
      </LiveBoardSection>

      <LiveBoardSection title="Executive Forecast" live={Boolean(executiveForecast)}>
        {executiveForecast ? (
          <div className="grid grid-cols-2 gap-2">
            <MetricTile
              label="Crescimento projetado"
              value={executiveForecast.expectedGrowth}
            />
            <MetricTile
              label="Prob. de sucesso"
              value={`${executiveForecast.successProbability}%`}
            />
            <MetricTile
              label="Confiança geral"
              value={`${executiveForecast.confidence.overall}%`}
              subtitle={truncate(executiveForecast.confidence.rationale, 80)}
            />
            <MetricTile
              label="Alerta futuro"
              value={truncate(executiveForecast.futureAlerts[0] ?? "Sem alertas", 60)}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">Forecast indisponível.</p>
        )}
      </LiveBoardSection>

      <LiveBoardSection title="Executive Strategy" live={Boolean(executiveStrategy)}>
        {executiveStrategy ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Score estratégico"
                value={`${executiveStrategy.executiveScore}/100`}
              />
              <MetricTile
                label="Confiança"
                value={`${executiveStrategy.confidenceScore}/100`}
              />
            </div>
            <EngineTextBlock
              label="Foco estratégico"
              value={truncate(
                executiveStrategy.topPriorities[0] ??
                  executiveStrategy.strategicVision,
              )}
            />
            <EngineTextBlock
              label="Estratégia executiva"
              value={truncate(executiveStrategy.executiveStrategy)}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">Estratégia indisponível.</p>
        )}
      </LiveBoardSection>

      <LiveBoardSection
        title="Executive Recommendation"
        live={Boolean(executiveRecommendation)}
      >
        {executiveRecommendation ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Confiança"
                value={`${executiveRecommendation.confidenceLevel}/100`}
              />
              <MetricTile
                label="ROI esperado"
                value={executiveRecommendation.expectedROI}
              />
            </div>
            <EngineTextBlock
              label="Resumo"
              value={truncate(executiveRecommendation.executiveRecommendationSummary)}
            />
            {topRecommendation && (
              <EngineTextBlock
                label="Recomendação principal"
                value={truncate(
                  `${topRecommendation.title}: ${topRecommendation.description}`,
                )}
              />
            )}
          </div>
        ) : (
          <p className="text-xs text-muted">Recomendações indisponíveis.</p>
        )}
      </LiveBoardSection>

      {recentInboxActions.length > 0 && (
        <LiveBoardSection title="Inbox Live Feed" accent live={hasRecentInboxActivity}>
          <ul className="flex flex-col gap-1.5">
            {recentInboxActions.map((action) => (
              <li
                key={action.id}
                className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
              >
                <span className="font-medium text-accent">
                  {INBOX_ACTION_LABELS[action.action]}
                </span>
                <span className="text-muted"> · </span>
                <span className="text-foreground/90">{action.itemTitle}</span>
                <p className="mt-0.5 text-[10px] text-muted">
                  {new Date(action.timestamp).toLocaleTimeString("pt-BR")} · {action.origin}
                </p>
              </li>
            ))}
          </ul>
        </LiveBoardSection>
      )}

      {(isProcessing || brainStatus === "building") && (
        <LiveBoardSection title="Executive Status" accent>
          <div className="flex flex-col gap-2">
            <StatusRow label="CEO" status={ceoStatus} subtitle="Samuel AI™ Digital CEO" />

            <div className="my-1 border-t border-border/50" />

            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Executive Modules
            </p>

            <div className="flex flex-col gap-1.5">
              {MODULE_ORDER.map((moduleId) => {
                const available = moduleAvailability[moduleId] ?? true;
                const status = getModuleStatus(
                  moduleId,
                  activeModuleIds,
                  brainStatus,
                  isProcessing,
                  orchestratorPhase,
                );

                return (
                  <StatusRow
                    key={moduleId}
                    label={MODULE_LABELS[moduleId]}
                    status={status}
                    subtitle={available ? undefined : "Aguardando dados"}
                  />
                );
              })}
            </div>

            {analysisDurationMs !== null && (
              <MetricTile
                label="Tempo da análise"
                value={formatDuration(analysisDurationMs)}
              />
            )}
          </div>
        </LiveBoardSection>
      )}

      {isProcessing && (
        <LiveBoardSection title="Pipeline Timeline" accent>
          <ol className="flex flex-col">
            {TIMELINE_STEPS.map((step, index) => {
              const stepStatus = getTimelineStepStatus(
                step.id,
                brainStatus,
                isProcessing,
                orchestratorPhase,
              );

              return (
                <li key={step.id} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2",
                      stepStatus === "completed" &&
                        "border-emerald-500/20 bg-emerald-500/5",
                      stepStatus === "active" && "border-accent/25 bg-accent/5",
                      stepStatus === "pending" && "border-border/60 bg-black/10",
                    )}
                  >
                    <p className="text-xs font-medium text-foreground">{step.label}</p>
                    <StatusBadge
                      label={
                        stepStatus === "completed"
                          ? "DONE"
                          : stepStatus === "active"
                            ? "LIVE"
                            : "WAIT"
                      }
                      variant={
                        stepStatus === "completed"
                          ? "success"
                          : stepStatus === "active"
                            ? "accent"
                            : "muted"
                      }
                    />
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="my-0.5 text-[10px] text-muted"
                    >
                      ↓
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </LiveBoardSection>
      )}
    </section>
  );
}
