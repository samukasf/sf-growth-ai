import { cn } from "@/utils/cn";

import type { ExecutiveTimelineStep } from "./executive-timeline.types";
import { TimelineStatus, TimelineStatusDot } from "./TimelineStatus";

type TimelineStepProps = {
  step: ExecutiveTimelineStep;
  isLast: boolean;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export function TimelineStep({ step, isLast }: TimelineStepProps) {
  const isActive = step.status === "Running";

  return (
    <li
      className={cn(
        "relative flex gap-3 pb-5 transition-opacity duration-500 last:pb-0",
        step.status === "Waiting" && "opacity-60",
        isActive && "opacity-100",
      )}
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px transition-colors duration-500",
            step.status === "Completed" ? "bg-emerald-500/40" : "bg-border",
          )}
        />
      )}

      <TimelineStatusDot status={step.status} />

      <div
        className={cn(
          "min-w-0 flex-1 rounded-lg border px-3 py-2.5 transition-all duration-500",
          isActive && "border-accent/25 bg-accent/5 shadow-[0_0_20px_rgba(59,130,246,0.08)]",
          step.status === "Completed" && "border-emerald-500/15 bg-emerald-500/5",
          step.status === "Warning" && "border-amber-500/20 bg-amber-500/5",
          step.status === "Error" && "border-rose-500/20 bg-rose-500/5",
          step.status === "Waiting" && "border-border/60 bg-black/10",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">
              <span className="mr-1.5 text-[10px] text-muted">{step.order}.</span>
              {step.title}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{step.description}</p>
          </div>
          <TimelineStatus status={step.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
          {step.timestamp && <span>Horário: {step.timestamp}</span>}
          {step.durationMs !== null && (
            <span>Tempo: {formatDuration(step.durationMs)}</span>
          )}
          {step.confidence !== null && <span>Confiança: {step.confidence}%</span>}
          <span>Responsável: {step.responsible}</span>
        </div>

        {step.detail && (
          <p className="mt-1.5 text-[10px] text-amber-400">{step.detail}</p>
        )}
      </div>
    </li>
  );
}
