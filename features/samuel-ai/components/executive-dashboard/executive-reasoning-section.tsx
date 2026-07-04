import { cn } from "@/utils/cn";

import type { ExecutiveReasoning, ReasoningStepStatus } from "../../executive-brain/types";
import { CheckIcon } from "@/components/ui/check-icon";
import { TimelineSteps } from "../shared/timeline-steps";
import { SectionHeader } from "../section-header";

type ExecutiveReasoningSectionProps = {
  reasoning: ExecutiveReasoning;
  showFullAnalysis?: boolean;
};

const CONSULTATION_STATUS_ICON: Record<ReasoningStepStatus, string> = {
  completed: "✓",
  in_progress: "◉",
  pending: "○",
};

const CONSULTATION_STATUS_STYLE: Record<ReasoningStepStatus, string> = {
  completed: "text-emerald-400",
  in_progress: "text-accent",
  pending: "text-zinc-600",
};

export function ExecutiveReasoningSection({
  reasoning,
  showFullAnalysis = true,
}: ExecutiveReasoningSectionProps) {
  const steps = reasoning.steps.map((step) => ({
    id: step.id,
    order: step.order,
    title: step.title,
    description: step.description,
    status: step.status,
    meta: step.specialist ? `Especialista: ${step.specialist}` : undefined,
  }));

  const hasConsultations = reasoning.consultations.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Reasoning"
        description="Fluxo de análise estratégica"
      />

      {hasConsultations && (
        <div className="rounded-lg border border-border bg-white/[0.02] p-3">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted">
            Consultando
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {reasoning.consultations.map((source) => (
              <li
                key={source.id}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  CONSULTATION_STATUS_STYLE[source.status],
                )}
              >
                <span aria-hidden="true" className="w-4 text-center font-mono">
                  {CONSULTATION_STATUS_ICON[source.status]}
                </span>
                <span
                  className={cn(
                    source.status === "completed" && "text-foreground",
                    source.status === "in_progress" && "font-medium text-accent",
                    source.status === "pending" && "text-muted",
                  )}
                >
                  {source.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reasoning.executiveConsensus && (
        <div className="rounded-lg border border-accent/25 bg-accent/5 px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <CheckIcon className="size-3.5 text-accent" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
              Consenso Executivo
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {reasoning.executiveConsensus}
          </p>
        </div>
      )}

      {showFullAnalysis && (
        <>
          <div className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Foco da análise
            </p>
            <p className="mt-1 text-sm text-foreground">{reasoning.currentFocus}</p>
          </div>

          <TimelineSteps steps={steps} />
        </>
      )}
    </section>
  );
}
