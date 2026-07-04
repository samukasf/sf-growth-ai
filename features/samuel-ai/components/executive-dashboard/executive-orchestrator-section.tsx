import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

import type {
  ConsultedExecutive,
  ExecutiveConfidence,
  OrchestratorPhase,
  OrchestratorSnapshot,
} from "../../services/executive-orchestrator.types";
import { MOCK_EXECUTIVES } from "../../services/mock-executives";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveOrchestratorSectionProps = {
  snapshot: OrchestratorSnapshot | null;
  isProcessing: boolean;
};

const PHASE_ORDER: OrchestratorPhase[] = [
  "building_context",
  "selecting_executives",
  "running_analysis",
  "building_consensus",
  "building_action_plan",
  "complete",
];

function phaseIndex(phase: OrchestratorPhase): number {
  if (phase === "idle") return -1;
  return PHASE_ORDER.indexOf(phase);
}

const CONSULTATION_STATUS_LABELS: Record<
  ConsultedExecutive["status"],
  string
> = {
  pending: "Aguardando",
  consulting: "Consultando…",
  consulted: "Consultado",
};

export function ExecutiveOrchestratorSection({
  snapshot,
  isProcessing,
}: ExecutiveOrchestratorSectionProps) {
  if (!snapshot && !isProcessing) return null;

  const currentPhase = snapshot?.phase ?? "building_context";
  const currentIndex = phaseIndex(currentPhase);
  const samuel = MOCK_EXECUTIVES.samuel;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Orchestrator"
        description={`${samuel.name} coordena o Conselho Executivo`}
      />

      {(snapshot?.consultedExecutives.length ?? 0) > 0 ||
      currentIndex >= phaseIndex("selecting_executives") ? (
        <OrchestratorBlock
          title="Executivos Consultados"
          accent={currentIndex >= phaseIndex("selecting_executives")}
        >
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
            <StatusBadge label={samuel.role} variant="accent" />
            <div>
              <p className="text-xs font-medium text-foreground">{samuel.name}</p>
              <p className="text-[10px] text-muted">Coordenador · {samuel.domain}</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {(snapshot?.consultedExecutives ?? []).map((executive) => (
              <ConsultedExecutiveRow
                key={executive.id}
                executive={executive}
                showOpinion={currentIndex >= phaseIndex("running_analysis")}
              />
            ))}
          </ul>
        </OrchestratorBlock>
      ) : null}

      {snapshot?.analysis &&
        currentIndex >= phaseIndex("running_analysis") && (
          <OrchestratorBlock title="Executive Reasoning" accent>
            <p className="mb-3 text-xs text-muted">
              Foco: {snapshot.analysis.reasoning.currentFocus}
            </p>
            <ul className="flex flex-col gap-2">
              {snapshot.analysis.steps.map((step) => (
                <li
                  key={step.id}
                  className={cn(
                    "rounded-lg border px-3 py-2.5",
                    step.status === "completed" &&
                      "border-emerald-500/15 bg-emerald-500/5",
                    step.status === "in_progress" &&
                      "border-accent/25 bg-accent/5",
                    step.status === "pending" &&
                      "border-border bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-foreground">
                      {step.order}. {step.label}
                    </p>
                    {step.executive && (
                      <span className="text-[10px] text-muted">
                        {step.executive}
                      </span>
                    )}
                  </div>
                  {step.finding && (
                    <p className="mt-1 text-xs text-muted">{step.finding}</p>
                  )}
                </li>
              ))}
            </ul>
          </OrchestratorBlock>
        )}

      {snapshot?.consensus &&
        currentIndex >= phaseIndex("building_consensus") && (
          <OrchestratorBlock title="Executive Consensus" accent>
            <p className="text-sm leading-relaxed text-foreground/90">
              {snapshot.consensus}
            </p>
          </OrchestratorBlock>
        )}

      {snapshot?.actionPlan &&
        currentIndex >= phaseIndex("building_action_plan") && (
          <OrchestratorBlock title="Action Plan">
            <p className="mb-3 text-sm text-foreground/90">
              {snapshot.actionPlan.summary}
            </p>
            <ul className="flex flex-col gap-2">
              {snapshot.actionPlan.actions.map((action, index) => (
                <li
                  key={action.id}
                  className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5"
                >
                  <p className="text-xs font-medium text-foreground">
                    {index + 1}. {action.title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {action.impactDescription} · {action.timeframe}
                  </p>
                </li>
              ))}
            </ul>
          </OrchestratorBlock>
        )}

      {snapshot?.confidence && currentIndex >= phaseIndex("complete") && (
        <ExecutiveConfidenceBlock confidence={snapshot.confidence} />
      )}
    </section>
  );
}

function OrchestratorBlock({
  title,
  accent = false,
  children,
}: {
  title: string;
  accent?: boolean;
  children: ReactNode;
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
          "mb-3 text-[10px] font-semibold uppercase tracking-wider",
          accent ? "text-accent" : "text-muted",
        )}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function ConsultedExecutiveRow({
  executive,
  showOpinion,
}: {
  executive: ConsultedExecutive;
  showOpinion: boolean;
}) {
  const statusVariant =
    executive.status === "consulted"
      ? "success"
      : executive.status === "consulting"
        ? "accent"
        : "default";

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5",
        executive.status === "consulting" && "border-accent/25 bg-accent/5",
        executive.status === "consulted" && "border-emerald-500/15 bg-emerald-500/5",
        executive.status === "pending" && "border-border bg-white/[0.02]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-foreground">
            {executive.name}{" "}
            <span className="font-normal text-muted">({executive.role})</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted">{executive.reason}</p>
        </div>
        <StatusBadge
          label={CONSULTATION_STATUS_LABELS[executive.status]}
          variant={statusVariant}
        />
      </div>
      {showOpinion && executive.opinion && (
        <p className="mt-2 border-t border-border/50 pt-2 text-xs text-foreground/80">
          {executive.opinion}
        </p>
      )}
    </li>
  );
}

function ExecutiveConfidenceBlock({
  confidence,
}: {
  confidence: ExecutiveConfidence;
}) {
  const levelLabels: Record<ExecutiveConfidence["level"], string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };

  const levelColors: Record<ExecutiveConfidence["level"], string> = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-red-400",
  };

  const barColors: Record<ExecutiveConfidence["level"], string> = {
    high: "bg-emerald-400",
    medium: "bg-amber-400",
    low: "bg-red-400",
  };

  return (
    <OrchestratorBlock title="Executive Confidence">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={cn("text-2xl font-semibold tabular-nums", levelColors[confidence.level])}>
            {confidence.score}%
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
            Confiança {levelLabels[confidence.level]}
          </p>
        </div>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-all", barColors[confidence.level])}
              style={{ width: `${confidence.score}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {confidence.rationale}
      </p>
    </OrchestratorBlock>
  );
}
