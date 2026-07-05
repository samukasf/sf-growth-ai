"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

import type { ExecutiveBrainStatus } from "../../executive-brain/types";
import type { ExecutiveConversation } from "../../services/executive-conversation-orchestrator.service";
import type { ExecutiveCEO } from "../../services/executive-ceo.service";
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
  | "meta"
  | "linkedin";

export type ExecutiveLiveBoardProps = {
  brainStatus: ExecutiveBrainStatus;
  isProcessing?: boolean;
  orchestratorPhase?: OrchestratorPhase | null;
  executiveCeo?: ExecutiveCEO | null;
  executiveConversation?: ExecutiveConversation | null;
  analysisStartedAt?: number | null;
  analysisCompletedAt?: number | null;
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

const STATUS_VARIANTS: Record<
  LiveBoardStatus,
  "success" | "accent" | "muted"
> = {
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
}: {
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        accent
          ? "border-accent/25 bg-accent/5"
          : "border-border bg-white/[0.02]",
      )}
    >
      <p
        className={cn(
          "mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]",
          accent ? "text-accent" : "text-muted",
        )}
      >
        {title}
      </p>
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
          className={cn("h-full rounded-full", accentClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ExecutiveLiveBoard({
  brainStatus,
  isProcessing = false,
  orchestratorPhase = null,
  executiveCeo = null,
  executiveConversation = null,
  analysisStartedAt = null,
  analysisCompletedAt = null,
  moduleAvailability = {},
}: ExecutiveLiveBoardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isProcessing || !analysisStartedAt) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => window.clearInterval(interval);
  }, [isProcessing, analysisStartedAt]);

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

  const consultedCount =
    executiveConversation?.participatingExecutives.filter(
      (participant) => participant.consulted,
    ).length ?? 0;

  const confidenceScore = executiveConversation?.confidenceScore ?? null;
  const executiveScore = executiveCeo?.executiveScore ?? null;

  const analysisDurationMs =
    analysisStartedAt !== null
      ? (analysisCompletedAt ?? now) - analysisStartedAt
      : null;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Live Board"
        description="Command Center em tempo real"
      />

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
        </div>
      </LiveBoardSection>

      <LiveBoardSection title="Executive Consensus">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Módulos consultados
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {consultedCount}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Tempo da análise
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {analysisDurationMs !== null
                ? formatDuration(analysisDurationMs)
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Confiança
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {confidenceScore !== null ? `${confidenceScore}/100` : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Score executivo
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {executiveScore !== null ? `${executiveScore}/100` : "—"}
            </p>
          </div>
        </div>
      </LiveBoardSection>

      <LiveBoardSection title="Company Health">
        {executiveCeo ? (
          <div className="grid grid-cols-2 gap-2">
            <HealthScoreTile
              label="Health Score"
              score={executiveCeo.companyHealth.score}
              accentClass="bg-emerald-500"
            />
            <HealthScoreTile
              label="Growth Score"
              score={executiveCeo.growthScore}
              accentClass="bg-accent"
            />
            <HealthScoreTile
              label="Risk Score"
              score={executiveCeo.riskScore}
              accentClass="bg-amber-500"
            />
            <HealthScoreTile
              label="Opportunity Score"
              score={executiveCeo.opportunityScore}
              accentClass="bg-violet-500"
            />
          </div>
        ) : (
          <p className="text-xs text-muted">Dados de saúde corporativa indisponíveis.</p>
        )}
      </LiveBoardSection>

      <LiveBoardSection title="Executive Timeline" accent>
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
                    stepStatus === "pending" &&
                      "border-border/60 bg-black/10",
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
    </section>
  );
}
